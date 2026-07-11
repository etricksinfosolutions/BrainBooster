import { QuizItem, type QuizItem as QuizItemT } from "@etricks/quiz-engine";
import type { RejectedItem } from "./spec.js";

/**
 * The quality gate — the difference between "called an LLM" and "manufactured content".
 *
 * A raw model batch is untrusted: it can miss the schema, duplicate a question we already
 * have, ship duplicate answer choices, or point correctIndex at nothing. This gate is pure
 * and deterministic so it's fully testable without a model, and every rejection is recorded
 * (see GenerationReport) rather than silently dropped.
 */

/** Normalise a prompt for dedup: lowercase, collapse whitespace, strip trailing punctuation. */
export function normalizePrompt(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[?.!]+$/g, "")
    .trim();
}

export interface GateResult {
  accepted: QuizItemT[];
  rejected: RejectedItem[];
}

/**
 * Parse the model's raw text into an array of candidate items.
 *
 * Tolerant of the common model deviations (a code fence, a bare array instead of the
 * {items:[...]} envelope) but nothing more — malformed JSON throws, and the caller counts
 * that as a barren round rather than crashing the run.
 */
export function parseCandidates(raw: string): unknown[] {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const parsed: unknown = JSON.parse(stripped);
  if (Array.isArray(parsed)) return parsed;
  if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray((parsed as { items?: unknown }).items)
  ) {
    return (parsed as { items: unknown[] }).items;
  }
  return [];
}

/**
 * Validate and de-duplicate a batch of candidates against everything accepted so far.
 *
 * @param candidates raw parsed objects from the model
 * @param seenPrompts normalised prompts already in the pack (mutated: accepted ones added)
 * @param assignId    produces the next stable id for an accepted item
 */
export function gateBatch(
  candidates: readonly unknown[],
  seenPrompts: Set<string>,
  assignId: () => string,
): GateResult {
  const accepted: QuizItemT[] = [];
  const rejected: RejectedItem[] = [];

  for (const candidate of candidates) {
    // The model isn't asked for an id; we own id assignment for stability + dedup.
    const withId =
      candidate && typeof candidate === "object"
        ? { id: assignId(), ...(candidate as Record<string, unknown>) }
        : candidate;

    const result = QuizItem.safeParse(withId);
    if (!result.success) {
      const rawPrompt = (candidate as { prompt?: unknown })?.prompt;
      rejected.push({
        reason: "invalid-shape",
        prompt: typeof rawPrompt === "string" ? rawPrompt : undefined,
      });
      continue;
    }
    const item = result.data;

    const key = normalizePrompt(item.prompt);
    if (seenPrompts.has(key)) {
      rejected.push({ reason: "duplicate-prompt", prompt: item.prompt });
      continue;
    }

    const distinctChoices = new Set(item.choices.map((c) => c.trim().toLowerCase()));
    if (distinctChoices.size !== item.choices.length) {
      rejected.push({ reason: "duplicate-choices", prompt: item.prompt });
      continue;
    }

    // QuizItem's refine already guards correctIndex, but keep an explicit gate so the
    // report can attribute the reason precisely rather than lumping it into invalid-shape.
    if (item.correctIndex >= item.choices.length) {
      rejected.push({ reason: "answer-out-of-range", prompt: item.prompt });
      continue;
    }

    seenPrompts.add(key);
    accepted.push(item);
  }

  return { accepted, rejected };
}
