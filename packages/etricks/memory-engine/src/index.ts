/**
 * @etricks/memory-engine — the platform's second reusable game system.
 *
 * Humans built this engine once. AIOS manufactures its themed image-pair packs. Any number of
 * games compose it (a kids' animal-match, a flags-of-the-world trainer, Brain Booster's memory
 * mode) — same engine, different config + different packs. It exists to prove the engine +
 * content abstraction holds for NON-TEXT content with asset dependencies, not just quizzes.
 */
export * from "./schema.js";
export * from "./engine.js";
export { mulberry32, seedFromString, shuffle, type Rng } from "./rng.js";
