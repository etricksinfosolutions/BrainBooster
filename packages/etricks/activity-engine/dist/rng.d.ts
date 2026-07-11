/**
 * Deterministic RNG (mulberry32). The engine NEVER calls Math.random.
 *
 * Every activity type's `prepare` step (shuffling choices, scrambling a puzzle, laying out a
 * word-search grid) draws from this injected RNG, so a session built from (content, config, seed)
 * is perfectly reproducible — for offline replay, analytics attribution, and tests. The caller
 * owns the seed (e.g. `${userId}:${dateKey}` for a stable daily challenge). Identical to the
 * quiz-engine's RNG by design: every engine on the platform shuffles the same way.
 */
export type Rng = () => number;
export declare function mulberry32(seed: number): Rng;
/** Turn any string (e.g. "user-42:2026-07-06") into a 32-bit seed. */
export declare function seedFromString(input: string): number;
/** Fisher–Yates shuffle using the injected RNG. Returns a new array. */
export declare function shuffle<T>(items: readonly T[], rng: Rng): T[];
//# sourceMappingURL=rng.d.ts.map