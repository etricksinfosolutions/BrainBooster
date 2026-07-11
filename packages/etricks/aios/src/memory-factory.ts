import {
  MemoryPair,
  MemoryPayload,
  type MemoryPayload as MemoryPayloadT,
} from "@etricks/memory-engine";
import type { LanguageModel } from "./ports.js";
import { MemorySpec, slugify } from "./memory-spec.js";
import type { GenerationReport, RejectedItem } from "./spec.js";
import { buildMemoryRequest } from "./memory-prompt.js";
import { normalizePrompt, parseCandidates } from "./quality.js";
import type { ContentFactory, GenerateOptions, GenerationResult } from "./factory.js";

/**
 * The memory-pair factory — AIOS's second ContentFactory, and its first that manufactures
 * content with ASSET dependencies.
 *
 * Same manufacturing loop as quiz (ask → parse → gate → accumulate, feeding accepted labels
 * back so the model doesn't repeat itself) but the gate builds a `MemoryPair` — including a
 * stable image `AssetRef` AIOS derives from the concept slug — and validates it against the
 * memory engine's contract. Adding this factory was purely additive (ADR-0008): no existing
 * code changed to teach AIOS a new, non-text content type.
 */

export async function generateMemoryPairs(
  spec: MemorySpec,
  model: LanguageModel,
  options: GenerateOptions = {},
): Promise<GenerationResult<MemoryPayloadT>> {
  const s = MemorySpec.parse(spec);
  const maxRounds = options.maxRounds ?? 10;
  const batchSize = s.batchSize ?? Math.min(s.count, 20);

  const seenLabels = new Set<string>();
  const accepted: MemoryPayloadT["pairs"] = [];
  const rejected: RejectedItem[] = [];
  let rounds = 0;

  while (accepted.length < s.count && rounds < maxRounds) {
    rounds++;
    const remaining = s.count - accepted.length;
    const ask = Math.min(batchSize, remaining);

    const request = buildMemoryRequest(
      s,
      ask,
      accepted.slice(-batchSize).map((p) => p.label),
    );

    let candidates: unknown[];
    try {
      candidates = parseCandidates(await model.complete(request));
    } catch {
      continue; // unparseable → barren round, try again
    }

    for (const candidate of candidates) {
      if (accepted.length >= s.count) break;
      const label = (candidate as { label?: unknown })?.label;
      if (typeof label !== "string" || label.trim() === "") {
        rejected.push({ reason: "invalid-shape" });
        continue;
      }

      const key = normalizePrompt(label);
      if (seenLabels.has(key)) {
        rejected.push({ reason: "duplicate-label", prompt: label });
        continue;
      }

      const slug = slugify(label);
      const raw = candidate as { difficulty?: unknown; tags?: unknown };
      const cand = {
        id: `${s.idPrefix}-${slug}`,
        label: label.trim(),
        face: {
          assetId: `${s.idPrefix}-${slug}`,
          kind: "image" as const,
          uri: `${s.assetBaseUri}/${slug}.${s.assetExt}`,
          alt: label.trim(),
        },
        difficulty: raw.difficulty,
        tags: Array.isArray(raw.tags) ? raw.tags : [],
      };

      const result = MemoryPair.safeParse(cand);
      if (!result.success) {
        rejected.push({ reason: "invalid-shape", prompt: label });
        continue;
      }

      seenLabels.add(key);
      const tags = Array.from(new Set([...result.data.tags, ...s.tags]));
      accepted.push({ ...result.data, tags });
    }
  }

  const payload = MemoryPayload.parse({ theme: s.theme, pairs: accepted });

  const report: GenerationReport = {
    requested: s.count,
    accepted: accepted.length,
    rounds,
    rejected,
    shortfall: accepted.length < s.count,
  };
  return { payload, report };
}

/** The registered factory for (engine: "memory", contentType: "pairs"). */
export const memoryPairFactory: ContentFactory<MemorySpec, MemoryPayloadT> = {
  engine: "memory",
  contentType: "pairs",
  generate: (spec, model, options) => generateMemoryPairs(spec, model, options),
};
