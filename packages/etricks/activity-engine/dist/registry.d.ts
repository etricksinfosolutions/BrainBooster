import { type ActivityStrategy, type ActivityType } from "./types.js";
/**
 * The strategy registry — the ONE place activity types are wired to their mechanics.
 *
 * Every strategy the engine knows about is listed here once. `STRATEGIES` is keyed by type so the
 * engine dispatches in O(1); the content union (schema.ts) and the AIOS factories iterate the same
 * list. Adding an activity type is: write a strategy, add it to `ALL_STRATEGIES`. Nothing else in
 * the engine changes — that is what "one engine, many activities" buys.
 */
export declare const ALL_STRATEGIES: ActivityStrategy[];
export declare const STRATEGIES: Record<ActivityType, ActivityStrategy>;
/** Look up the strategy for an activity type. Throws on an unknown type. */
export declare function getStrategy(type: string): ActivityStrategy;
//# sourceMappingURL=registry.d.ts.map