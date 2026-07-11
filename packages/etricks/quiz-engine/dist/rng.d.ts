/**
 * Deterministic RNG (mulberry32). The engine NEVER calls Math.random.
 *
 * Why: a session created from (pack, config, seed) must be perfectly reproducible —
 * for offline replay, for analytics attribution, and for tests. The caller owns the
 * seed (e.g. derived from userId+date for a stable "daily challenge").
 */
export type Rng = () => number;
export declare function mulberry32(seed: number): Rng;
/** Turn any string (e.g. "user-42:2026-07-06") into a 32-bit seed. */
export declare function seedFromString(input: string): number;
/** Fisher–Yates shuffle using the injected RNG. Returns a new array. */
export declare function shuffle<T>(items: readonly T[], rng: Rng): T[];
//# sourceMappingURL=rng.d.ts.map