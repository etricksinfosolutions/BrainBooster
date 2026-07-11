import { QuizPayload, type QuizPayload as QuizPayloadT } from "@etricks/quiz-engine";
import type { LanguageModel } from "./ports.js";
import { GenerationSpec, type GenerationReport } from "./spec.js";
import { buildRequest } from "./prompt.js";
import { gateBatch, parseCandidates } from "./quality.js";
import type { ContentFactory, GenerateOptions, GenerationResult } from "./factory.js";

/**
 * The quiz question factory — AIOS's first ContentFactory.
 *
 * The manufacturing loop: ask for a batch → parse → quality-gate → accumulate, feeding accepted
 * prompts back into the next prompt so the model doesn't repeat itself, until `count` accepted
 * items or the round cap. The returned payload is validated against the engine's contract, so
 * what comes out is indistinguishable from hand-authored content — the whole point.
 */

function padId(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(4, "0")}`;
}

export async function generateQuizQuestions(
  spec: GenerationSpec,
  model: LanguageModel,
  options: GenerateOptions = {},
): Promise<GenerationResult<QuizPayloadT>> {
  const s = GenerationSpec.parse(spec);
  const maxRounds = options.maxRounds ?? 10;
  const batchSize = s.batchSize ?? Math.min(s.count, 20);

  const seenPrompts = new Set<string>();
  const accepted: QuizPayloadT["items"] = [];
  const rejected: GenerationReport["rejected"] = [];
  let nextId = 1;
  let rounds = 0;

  while (accepted.length < s.count && rounds < maxRounds) {
    rounds++;
    const remaining = s.count - accepted.length;
    const ask = Math.min(batchSize, remaining);

    const request = buildRequest(
      s,
      ask,
      accepted.slice(-batchSize).map((i) => i.prompt),
    );

    let candidates: unknown[];
    try {
      candidates = parseCandidates(await model.complete(request));
    } catch {
      // Unparseable response: count it as a barren round and try again.
      continue;
    }

    const { accepted: gained, rejected: dropped } = gateBatch(
      candidates,
      seenPrompts,
      () => padId(s.idPrefix, nextId++),
    );
    rejected.push(...dropped);

    for (const item of gained) {
      if (accepted.length >= s.count) break;
      const tags = Array.from(new Set([...item.tags, ...s.tags]));
      accepted.push({ ...item, tags });
    }
  }

  const payload = QuizPayload.parse({ items: accepted });

  return {
    payload,
    report: {
      requested: s.count,
      accepted: accepted.length,
      rounds,
      rejected,
      shortfall: accepted.length < s.count,
    },
  };
}

/** The registered factory for (engine: "quiz", contentType: "questions"). */
export const quizQuestionFactory: ContentFactory<GenerationSpec, QuizPayloadT> = {
  engine: "quiz",
  contentType: "questions",
  generate: (spec, model, options) => generateQuizQuestions(spec, model, options),
};
