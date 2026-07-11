/**
 * Wrap a game's `GameSeed` into its `GameModule`. The definition is derived from the seed, so a
 * game authors one source of truth (its seed) and the module stays consistent.
 */
export function defineGameModule(seed) {
    return { definition: seed.definition, seed };
}
//# sourceMappingURL=game-module.js.map