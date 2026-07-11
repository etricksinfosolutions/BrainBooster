import { z } from "zod";

/**
 * ActivityConfig — the ONE configuration surface every activity type obeys.
 *
 * This is the heart of "one engine, many games". The same activity type (multiple-choice, say)
 * behaves differently in a relaxed kids' game and a timed adult trivia mode purely by changing
 * this object — no code. A game supplies a config per activity (or per level); the engine resolves
 * it against `DEFAULT_CONFIG` and every strategy reads the resolved values. Nothing here is
 * type-specific: time, lives, hints, scoring, difficulty, randomization, animation, accessibility
 * and localization apply uniformly, which is exactly why adding a game is configuration.
 */

/** How a response converts to points. Shared by every activity type. */
export const ActivityScoring = z.object({
  /** Points per correctly-answered unit (a choice, a blank, a matched pair, a placed tile). */
  perCorrect: z.number().default(100),
  /** Points per wrong unit — usually 0, negative to penalise guessing. */
  perWrong: z.number().default(0),
  /**
   * Optional speed bonus applied once, when the activity is solved: up to `maxBonus` points
   * decaying linearly to 0 over `windowMs`. Requires the caller to pass `elapsedMs` when grading.
   */
  speed: z.object({ maxBonus: z.number(), windowMs: z.number().positive() }).optional(),
});
export type ActivityScoring = z.infer<typeof ActivityScoring>;

export const Difficulty = z.enum(["easy", "medium", "hard"]);
export type Difficulty = z.infer<typeof Difficulty>;

/** Accessibility flags the engine surfaces to renderers; scoring never depends on them. */
export const AccessibilityConfig = z.object({
  reducedMotion: z.boolean().default(false),
  highContrast: z.boolean().default(false),
  captions: z.boolean().default(false),
  /** Extra time multiplier for players who need it (1 = none). Applied to `timeLimitMs`. */
  extraTimeFactor: z.number().positive().default(1),
});
export type AccessibilityConfig = z.infer<typeof AccessibilityConfig>;

export const ActivityConfig = z.object({
  /** Per-session time budget in ms. Omitted/undefined = untimed. */
  timeLimitMs: z.number().positive().optional(),
  /** Wrong-answer budget. Omitted = unlimited. The engine tracks; the app enforces game-over. */
  lives: z.number().int().positive().optional(),
  /** How many hints the player may spend. 0 = none. */
  hints: z.number().int().nonnegative().default(0),
  /** Randomise order/choices/layout. When false the content is presented as authored. */
  shuffle: z.boolean().default(true),
  /** Authoring difficulty label — steers selection/merchandising, never grading. */
  difficulty: Difficulty.default("medium"),
  scoring: ActivityScoring.default({}),
  /**
   * Fraction of units (0..1) that must be correct to count the activity "solved" (⭐ earned).
   * 1 = perfection required; lower suits typing/word-search where partial credit is the norm.
   */
  passThreshold: z.number().min(0).max(1).default(1),
  /** Cosmetic — whether renderers should play transition animations. */
  animations: z.boolean().default(true),
  accessibility: AccessibilityConfig.default({}),
  /** Content locale for this activity; localisation ships as sibling packs, this selects one. */
  locale: z.string().min(2).default("en"),
});
export type ActivityConfig = z.infer<typeof ActivityConfig>;

/** Every field present — what strategies actually read. */
export type ResolvedConfig = ActivityConfig;

export const DEFAULT_CONFIG: ResolvedConfig = ActivityConfig.parse({});

/**
 * Resolve an authored (partial) config against the defaults into a fully-populated config.
 * Accepts `undefined` so an activity may omit config entirely and still play.
 */
export function resolveConfig(config?: unknown): ResolvedConfig {
  return ActivityConfig.parse(config ?? {});
}

/** The effective time budget after applying the accessibility multiplier (undefined = untimed). */
export function effectiveTimeLimitMs(config: ResolvedConfig): number | undefined {
  if (config.timeLimitMs === undefined) return undefined;
  return Math.round(config.timeLimitMs * config.accessibility.extraTimeFactor);
}
