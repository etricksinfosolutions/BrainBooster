import { z } from "zod";
import { Difficulty } from "@etricks/quiz-engine";

/**
 * GenerationSpec — the manufacturing order.
 *
 * This is what a human (or an automated merchandising job) hands to AIOS to produce a
 * quiz pack. Adding a second quiz-based game — Finance Master, a language quiz — is a new
 * spec, not new code. That is the platform thesis in one type.
 */
export const GenerationSpec = z.object({
  /** Which game this content is for, e.g. "brain-booster". */
  gameId: z.string().min(1),
  /** Human topic the model writes to, e.g. "general knowledge", "personal finance". */
  topic: z.string().min(1),
  /** Content locale (matches the pack's locale). */
  locale: z.string().min(1).default("en"),
  /** How many quality-passing questions we want in the finished pack. */
  count: z.number().int().positive(),
  /**
   * Optional difficulty weighting, e.g. { easy: 3, medium: 5, hard: 2 }. Steers the
   * prompt; the quality gate does not reject on difficulty (the engine selects on it).
   */
  difficultyMix: z.record(Difficulty, z.number().nonnegative()).optional(),
  /** Seed tags applied to every generated item ("science", "history"). */
  tags: z.array(z.string()).default([]),
  /** Prefix for generated item ids, e.g. "bb-gk" → "bb-gk-0001". */
  idPrefix: z.string().min(1),
  /** How many items to request per model call. Defaults to min(count, 20). */
  batchSize: z.number().int().positive().optional(),
});
export type GenerationSpec = z.infer<typeof GenerationSpec>;

/**
 * Why a single generated item was rejected by the quality gate. Shared across factories:
 * quiz reasons + the memory factory's label dedup. New factories add reasons here so every
 * manufacturing run reports rejections in one shape.
 */
export type RejectionReason =
  | "invalid-shape"
  | "duplicate-prompt"
  | "duplicate-choices"
  | "answer-out-of-range"
  | "duplicate-label";

export interface RejectedItem {
  reason: RejectionReason;
  /** The prompt text (if we could read it) — for human review of what got dropped. */
  prompt?: string;
}

/** A full accounting of one manufacturing run — never silently drop coverage. */
export interface GenerationReport {
  requested: number;
  accepted: number;
  /** Model calls made to reach `accepted` (or give up). */
  rounds: number;
  rejected: RejectedItem[];
  /** True if we hit the round cap before reaching `requested`. */
  shortfall: boolean;
}
