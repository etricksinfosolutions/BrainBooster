import { DEFAULT_CONFIG, effectiveTimeLimitMs, resolveConfig, type ResolvedConfig } from "./config.js";
import { mulberry32, seedFromString } from "./rng.js";
import { getStrategy } from "./registry.js";
import type { Activity } from "./schema.js";
import type { ActivityType } from "./types.js";

/**
 * The Universal Activity Engine runtime — pure, deterministic, framework-free.
 *
 * A game feeds one manufactured `Activity` (content + config) and a seed; the engine dispatches to
 * the right strategy to build a reproducible session, then grades responses through ONE universal
 * scoring path so every activity type earns points, stars, and a solved verdict identically. No
 * I/O, no clock, no React — the caller supplies the seed and any elapsed timing, which is what
 * makes sessions replayable and testable and lets progress/analytics/cloud-save treat all
 * activities alike.
 */

/** A prepared, reproducible activity ready to render and grade. */
export interface ActivitySession {
  activityId: string;
  type: ActivityType;
  config: ResolvedConfig;
  /** Strategy-specific presentation data (shuffled choices, laid-out grid, scrambled tiles…). */
  prepared: unknown;
  seed: number;
}

/** The universal result of grading a response — the same shape for every activity type. */
export interface GradeResult {
  /** Passed `config.passThreshold` (and was not timed out) — a ⭐ is earned. */
  solved: boolean;
  correctUnits: number;
  totalUnits: number;
  /** correctUnits / totalUnits, in 0..1. */
  accuracy: number;
  /** Points from universal scoring (per-correct/per-wrong + optional speed bonus). */
  score: number;
  /** 0–3 stars derived from accuracy — drives progression/merchandising everywhere. */
  stars: 0 | 1 | 2 | 3;
  /** True when a time limit was set and `elapsedMs` exceeded it. */
  timedOut: boolean;
  /** Strategy-provided extras (per-blank correctness, which targets were hit, …). */
  detail?: Record<string, unknown>;
}

/**
 * Build a playable session from a manufactured activity.
 *
 * @param activity        one activity from a pack's payload.
 * @param configOverride  level/world config layered over the activity's own (both partial).
 * @param seed            stable RNG source, e.g. `${userId}:${activityId}:${dateKey}`.
 */
export function createActivitySession(
  activity: Activity,
  configOverride?: Record<string, unknown>,
  seed = "seed",
): ActivitySession {
  const merged = { ...(activity.config ?? {}), ...(configOverride ?? {}) };
  const config = resolveConfig(merged);
  const seedNum = seedFromString(`${activity.id}:${seed}`);
  const rng = mulberry32(seedNum);
  const strategy = getStrategy(activity.content.type);
  const prepared = strategy.prepare(activity.content, config, rng);
  return { activityId: activity.id, type: activity.content.type, config, prepared, seed: seedNum };
}

function starsFor(accuracy: number): 0 | 1 | 2 | 3 {
  if (accuracy >= 1) return 3;
  if (accuracy >= 0.75) return 2;
  if (accuracy >= 0.5) return 1;
  return 0;
}

/**
 * Grade a response against a session. Pure — returns the result; the caller owns session/progress
 * state (which feeds cloud-save + analytics). Scoring, stars and the solved verdict are computed
 * here for EVERY activity type, so a new activity type gets progression for free.
 *
 * @param elapsedMs  ms taken, for the optional speed bonus and time-limit check. Omit if untimed.
 */
export function gradeResponse(
  session: ActivitySession,
  response: unknown,
  elapsedMs?: number,
): GradeResult {
  const strategy = getStrategy(session.type);
  const { correctUnits, totalUnits, detail } = strategy.grade(session.prepared, response);
  const accuracy = totalUnits > 0 ? correctUnits / totalUnits : 0;

  const limit = effectiveTimeLimitMs(session.config);
  const timedOut = limit !== undefined && typeof elapsedMs === "number" && elapsedMs > limit;
  const solved = !timedOut && accuracy >= session.config.passThreshold;

  const { scoring } = session.config;
  let score = correctUnits * scoring.perCorrect + (totalUnits - correctUnits) * scoring.perWrong;
  if (solved && scoring.speed && typeof elapsedMs === "number") {
    const { maxBonus, windowMs } = scoring.speed;
    const remaining = Math.max(0, windowMs - Math.max(0, elapsedMs));
    score += Math.round((remaining / windowMs) * maxBonus);
  }

  return {
    solved,
    correctUnits,
    totalUnits,
    accuracy,
    score,
    stars: starsFor(accuracy),
    timedOut,
    detail,
  };
}

/** Convenience: the maximum raw score achievable for a session (all units correct, no bonus). */
export function maxScore(session: ActivitySession, totalUnits: number): number {
  return totalUnits * session.config.scoring.perCorrect;
}

export { DEFAULT_CONFIG };
