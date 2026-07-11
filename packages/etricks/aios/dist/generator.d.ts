import type { QuizPayload } from "@etricks/quiz-engine";
import type { LanguageModel } from "./ports.js";
import type { GenerationSpec } from "./spec.js";
import { normalizePrompt } from "./quality.js";
import { generateContent, type GenerateOptions, type GenerationResult } from "./factory.js";
/**
 * The manufacturing facade referenced across the platform as `AIOS`.
 *
 * `generateContent` is the primary, engine-agnostic API — it dispatches to the content factory
 * registered for (engine, contentType). `generateQuestions` is a typed quiz convenience that
 * returns a `QuizPayload`-typed result. Adding memory boards, stories, or images is a new
 * factory, not a new method (see ADR-0008).
 */
/** Typed quiz convenience. Prefer `generateContent` for the general, multi-engine API. */
export declare function generateQuestions(spec: GenerationSpec, model: LanguageModel, options?: GenerateOptions): Promise<GenerationResult<QuizPayload>>;
export declare const AIOS: {
    readonly generateContent: typeof generateContent;
    readonly generateQuestions: typeof generateQuestions;
    readonly normalizePrompt: typeof normalizePrompt;
};
//# sourceMappingURL=generator.d.ts.map