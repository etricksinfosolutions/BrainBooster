import {
  Activity,
  ActivityPayload,
  getStrategy,
  type ActivityPayload as ActivityPayloadT,
  type ActivityType,
} from "@etricks/activity-engine";
import type { LanguageModel } from "./ports.js";
import { ActivitySpec } from "./activity-spec.js";
import { buildActivityRequest } from "./activity-prompt.js";
import type { GenerationReport, RejectedItem } from "./spec.js";
import { normalizePrompt, parseCandidates } from "./quality.js";
import type { ContentFactory, GenerateOptions, GenerationResult } from "./factory.js";

/**
 * The Universal Activity factory — one manufacturing loop for all 15 activity types.
 *
 * Same shape as the quiz/memory factories (ask → parse → gate → accumulate, feeding accepted
 * signatures back so the model doesn't repeat itself) but the gate validates each candidate against
 * the target type's content schema (via the engine's strategy registry) and wraps it in an
 * `Activity` with a stable id, the spec's tags, and the spec's config. Because the schema comes from
 * the engine, generated content is immediately playable — no manual transform (ADR-0024). One
 * factory is registered per activity type, so `generateContent({ engine:"activity", contentType:
 * "<type>" })` dispatches naturally.
 */

/** A human-readable signature per content shape, used for dedup across a run. */
function signatureOf(content: Record<string, unknown>): string {
  const text =
    (content.prompt as string) ??
    (content.statement as string) ??
    (content.template as string) ??
    (content.text as string) ??
    JSON.stringify(
      content.words ?? content.pairs ?? content.items ?? content.cards ?? content.targets ?? content,
    );
  return normalizePrompt(String(text));
}

export async function generateActivities(
  spec: ActivitySpec,
  model: LanguageModel,
  options: GenerateOptions = {},
): Promise<GenerationResult<ActivityPayloadT>> {
  const s = ActivitySpec.parse(spec);
  const strategy = getStrategy(s.activityType); // throws early on an unknown type
  const maxRounds = options.maxRounds ?? 10;
  const batchSize = s.batchSize ?? Math.min(s.count, 20);

  const seen = new Set<string>();
  const accepted: ActivityPayloadT["activities"] = [];
  const rejected: RejectedItem[] = [];
  let nextId = 1;
  let rounds = 0;

  while (accepted.length < s.count && rounds < maxRounds) {
    rounds++;
    const ask = Math.min(batchSize, s.count - accepted.length);
    const request = buildActivityRequest(
      s,
      ask,
      accepted.slice(-batchSize).map((a) => signatureOf(a.content as Record<string, unknown>)),
    );
    let candidates: unknown[];
    try {
      candidates = parseCandidates(await model.complete(request));
    } catch {
      continue; // unparseable → barren round, try again
    }

    for (const candidate of candidates) {
      if (accepted.length >= s.count) break;
      if (!candidate || typeof candidate !== "object") {
        rejected.push({ reason: "invalid-shape" });
        continue;
      }
      const content = candidate as Record<string, unknown>;

      // The candidate must declare the type we're manufacturing and pass that type's schema.
      if (content.type !== s.activityType) {
        rejected.push({ reason: "invalid-shape" });
        continue;
      }
      const parsed = strategy.contentSchema.safeParse(content);
      if (!parsed.success) {
        rejected.push({ reason: "invalid-shape", prompt: content.prompt as string | undefined });
        continue;
      }

      const key = signatureOf(content);
      if (seen.has(key)) {
        rejected.push({ reason: "duplicate-prompt", prompt: content.prompt as string | undefined });
        continue;
      }
      seen.add(key);

      const activity = Activity.parse({
        id: `${s.idPrefix}-${String(nextId++).padStart(4, "0")}`,
        tags: s.tags,
        config: s.config,
        content: parsed.data,
      });
      accepted.push(activity);
    }
  }

  const payload = ActivityPayload.parse({ activities: accepted });
  const report: GenerationReport = {
    requested: s.count,
    accepted: accepted.length,
    rounds,
    rejected,
    shortfall: accepted.length < s.count,
  };
  return { payload, report };
}

/**
 * One registered factory per activity type: (engine: "activity", contentType: "<type>").
 * Registering all of them keeps `generateContent` purely additive — a game asks for the type it
 * wants and the registry already has it.
 */
export function activityFactoryFor(type: ActivityType): ContentFactory<ActivitySpec, ActivityPayloadT> {
  return {
    engine: "activity",
    contentType: type,
    generate: (spec, model, options) => {
      // Guard: the factory's type must match the spec's, so a mis-routed request fails loudly.
      const s = ActivitySpec.parse(spec);
      if (s.activityType !== type) {
        throw new Error(
          `AIOS activity factory "${type}" received a spec for "${s.activityType}"`,
        );
      }
      return generateActivities(s, model, options);
    },
  };
}
