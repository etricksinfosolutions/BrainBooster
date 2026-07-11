import { DEFAULT_CONFIG, effectiveTimeLimitMs, resolveConfig } from "./config.js";
import { mulberry32, seedFromString } from "./rng.js";
import { getStrategy } from "./registry.js";
/**
 * Build a playable session from a manufactured activity.
 *
 * @param activity        one activity from a pack's payload.
 * @param configOverride  level/world config layered over the activity's own (both partial).
 * @param seed            stable RNG source, e.g. `${userId}:${activityId}:${dateKey}`.
 */
export function createActivitySession(activity, configOverride, seed = "seed") {
    const merged = { ...(activity.config ?? {}), ...(configOverride ?? {}) };
    const config = resolveConfig(merged);
    const seedNum = seedFromString(`${activity.id}:${seed}`);
    const rng = mulberry32(seedNum);
    const strategy = getStrategy(activity.content.type);
    const prepared = strategy.prepare(activity.content, config, rng);
    return { activityId: activity.id, type: activity.content.type, config, prepared, seed: seedNum };
}
function starsFor(accuracy) {
    if (accuracy >= 1)
        return 3;
    if (accuracy >= 0.75)
        return 2;
    if (accuracy >= 0.5)
        return 1;
    return 0;
}
/**
 * Grade a response against a session. Pure — returns the result; the caller owns session/progress
 * state (which feeds cloud-save + analytics). Scoring, stars and the solved verdict are computed
 * here for EVERY activity type, so a new activity type gets progression for free.
 *
 * @param elapsedMs  ms taken, for the optional speed bonus and time-limit check. Omit if untimed.
 */
export function gradeResponse(session, response, elapsedMs) {
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
export function maxScore(session, totalUnits) {
    return totalUnits * session.config.scoring.perCorrect;
}
export { DEFAULT_CONFIG };
//# sourceMappingURL=engine.js.map