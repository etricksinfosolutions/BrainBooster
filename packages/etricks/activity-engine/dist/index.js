/**
 * @etricks/activity-engine — the Universal Activity Engine.
 *
 * ONE engine, MANY activity types. Humans built this once; AIOS manufactures the content packs;
 * every game (Brain Booster, Finance/Science/History/Geography/Vocabulary Master…) composes it by
 * configuration. A game is Worlds → Levels → Activities → Content Packs → Assets, and no
 * activity-specific business logic lives in any game module — it lives here, once, per activity
 * type, behind a uniform strategy contract. See ADR-0024.
 */
export * from "./config.js";
export * from "./types.js";
export * from "./schema.js";
export * from "./registry.js";
export * from "./engine.js";
export { mulberry32, seedFromString, shuffle } from "./rng.js";
// Per-type content/response types, for games and renderers that want them statically.
export * from "./strategies/choice.js";
export * from "./strategies/text.js";
export * from "./strategies/ordering.js";
export * from "./strategies/matching.js";
export * from "./strategies/study.js";
export * from "./strategies/spatial.js";
//# sourceMappingURL=index.js.map