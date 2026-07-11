import type { MemorySpec } from "./memory-spec.js";
import type { LanguageModelRequest } from "./ports.js";
export declare function buildMemorySystemPrompt(spec: MemorySpec): string;
export declare function buildMemoryUserPrompt(spec: MemorySpec, batchSize: number, avoidLabels: readonly string[]): string;
export declare function buildMemoryRequest(spec: MemorySpec, batchSize: number, avoidLabels: readonly string[]): LanguageModelRequest;
//# sourceMappingURL=memory-prompt.d.ts.map