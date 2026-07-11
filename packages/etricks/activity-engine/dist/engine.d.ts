import { DEFAULT_CONFIG, type ResolvedConfig } from "./config.js";
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
export declare function createActivitySession(activity: Activity, configOverride?: Record<string, unknown>, seed?: string): ActivitySession;
/**
 * Grade a response against a session. Pure — returns the result; the caller owns session/progress
 * state (which feeds cloud-save + analytics). Scoring, stars and the solved verdict are computed
 * here for EVERY activity type, so a new activity type gets progression for free.
 *
 * @param elapsedMs  ms taken, for the optional speed bonus and time-limit check. Omit if untimed.
 */
export declare function gradeResponse(session: ActivitySession, response: unknown, elapsedMs?: number): GradeResult;
/** Convenience: the maximum raw score achievable for a session (all units correct, no bonus). */
export declare function maxScore(session: ActivitySession, totalUnits: number): number;
export { DEFAULT_CONFIG };
//# sourceMappingURL=engine.d.ts.map