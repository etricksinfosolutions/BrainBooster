/**
 * @etricks/aios — the content manufacturing team.
 *
 * Humans build engines; AIOS fills their packs. Given a manufacturing spec and a language
 * model, `AIOS.generateContent({ engine, contentType, spec }, model)` dispatches to the
 * registered content factory and returns a validated, de-duplicated, quality-gated payload +
 * report. New asset types (memory boards, stories, images) are new factories, not new methods.
 *
 * Importing this package registers the built-in factories (quiz questions today).
 */
export * from "./ports.js";
export * from "./spec.js";
export * from "./quality.js";
export * from "./prompt.js";
export * from "./factory.js";
export * from "./quiz-factory.js";
export * from "./memory-spec.js";
export * from "./memory-prompt.js";
export * from "./memory-factory.js";
export * from "./activity-spec.js";
export * from "./activity-prompt.js";
export * from "./activity-factory.js";
export * from "./generator.js";
export * from "./job.js";
export * from "./claude.js";
export * from "./openai.js";
export * from "./gemini.js";
//# sourceMappingURL=index.d.ts.map