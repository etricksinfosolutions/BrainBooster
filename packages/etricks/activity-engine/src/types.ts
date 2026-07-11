import type { z } from "zod";
import type { ResolvedConfig } from "./config.js";
import type { Rng } from "./rng.js";

/**
 * The activity catalogue — every playable kind the Universal Activity Engine can run.
 *
 * This is the single source of truth for "which activities exist". Each value is backed by exactly
 * one {@link ActivityStrategy}. Adding a kind is: implement a strategy, register it — the engine,
 * the content union, and the scoring pipeline pick it up with no other change. "Audio Quiz" is
 * shipped and gradable today (future-ready = the asset pipeline for audio, not the mechanic).
 */
export const ACTIVITY_TYPES = [
  "multiple-choice",
  "true-false",
  "fill-blank",
  "word-search",
  "memory-match",
  "sequence-ordering",
  "drag-drop-match",
  "flash-cards",
  "image-quiz",
  "audio-quiz",
  "typing-challenge",
  "sorting",
  "classification",
  "hotspot",
  "puzzle-grid",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/**
 * What a strategy reports after grading a response, in engine-neutral units.
 *
 * A "unit" is the smallest independently-correct thing in the activity: one choice, one blank,
 * one matched pair, one correctly-placed tile. The engine turns (correctUnits, totalUnits) into a
 * score, accuracy, stars and a solved/failed verdict using the universal config — so scoring lives
 * in ONE place and every activity type is scored identically.
 */
export interface StrategyGrade {
  correctUnits: number;
  totalUnits: number;
  /** Optional per-unit correctness / extra info a renderer may show (e.g. which blanks were wrong). */
  detail?: Record<string, unknown>;
}

/**
 * An ActivityStrategy is the reusable mechanic for one activity type: how to turn authored content
 * into a session-ready `prepared` form (applying randomisation deterministically) and how to grade
 * a player's `response`. It is pure and framework-free — no I/O, no clock, no React. The strategy
 * knows nothing about scoring, lives, or stars; those are the engine's universal concern.
 */
export interface ActivityStrategy<Content = unknown, Prepared = unknown, Response = unknown> {
  readonly type: ActivityType;
  /**
   * Zod schema for this type's authored content — composed into the ActivityContent union.
   * Typed as `ZodTypeAny` (not `ZodType<Content>`) because schemas carrying `.default()`/`.refine()`
   * have distinct input/output types; the concrete union in schema.ts preserves full typing.
   */
  readonly contentSchema: z.ZodTypeAny;
  /** Build the session-ready presentation from authored content, applying config + RNG. */
  prepare(content: Content, config: ResolvedConfig, rng: Rng): Prepared;
  /** Grade a response against the prepared activity. Pure; returns engine-neutral units. */
  grade(prepared: Prepared, response: Response): StrategyGrade;
}
