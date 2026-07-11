import type { GenerationSpec } from "./spec.js";
import type { LanguageModelRequest } from "./ports.js";
export declare function buildSystemPrompt(spec: GenerationSpec): string;
export declare function buildUserPrompt(spec: GenerationSpec, batchSize: number, avoidPrompts: readonly string[]): LanguageModelRequest["user"];
export declare function buildRequest(spec: GenerationSpec, batchSize: number, avoidPrompts: readonly string[]): LanguageModelRequest;
//# sourceMappingURL=prompt.d.ts.map