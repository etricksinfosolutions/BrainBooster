/**
 * Deterministic RNG (mulberry32). The engine NEVER calls Math.random — see ADR-0007.
 *
 * Intentionally a copy of the quiz engine's RNG rather than a shared import: engines depend
 * only on `@etricks/contracts`, never on each other. This primitive is ~15 lines; duplicating
 * it keeps the dependency arrow clean and each engine self-contained.
 */
export type Rng = () => number;
export declare function mulberry32(seed: number): Rng;
/** Turn any string (e.g. "user-42:2026-07-06") into a 32-bit seed. */
export declare function seedFromString(input: string): number;
/** Fisher–Yates shuffle using the injected RNG. Returns a new array. */
export declare function shuffle<T>(items: readonly T[], rng: Rng): T[];
//# sourceMappingURL=rng.d.ts.map