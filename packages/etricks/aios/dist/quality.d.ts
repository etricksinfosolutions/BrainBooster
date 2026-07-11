import { type QuizItem as QuizItemT } from "@etricks/quiz-engine";
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
export declare function normalizePrompt(prompt: string): string;
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
export declare function parseCandidates(raw: string): unknown[];
/**
 * Validate and de-duplicate a batch of candidates against everything accepted so far.
 *
 * @param candidates raw parsed objects from the model
 * @param seenPrompts normalised prompts already in the pack (mutated: accepted ones added)
 * @param assignId    produces the next stable id for an accepted item
 */
export declare function gateBatch(candidates: readonly unknown[], seenPrompts: Set<string>, assignId: () => string): GateResult;
//# sourceMappingURL=quality.d.ts.map