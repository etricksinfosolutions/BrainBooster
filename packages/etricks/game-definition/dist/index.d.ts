/**
 * @etricks/game-definition — the composition contract between the factory and every game.
 *
 * A game is a composition of reusable engines + versioned content packs + rules, authored as a
 * `GameDefinition`. AIOS manufactures the packs it references; the runtime downloads them; the
 * definition says what to assemble. See docs/game-definition.md and ADR-0009.
 */
export * from "./composition.js";
export * from "./game-identity.js";
export * from "./game-definition.js";
export * from "./game-seed.js";
export * from "./game-module.js";
//# sourceMappingURL=index.d.ts.map