import type { ActivitySpec } from "./activity-spec.js";
import type { LanguageModelRequest } from "./ports.js";
export declare function buildActivitySystemPrompt(spec: ActivitySpec): string;
export declare function buildActivityUserPrompt(spec: ActivitySpec, batchSize: number, avoid: readonly string[]): string;
export declare function buildActivityRequest(spec: ActivitySpec, batchSize: number, avoid: readonly string[]): LanguageModelRequest;
//# sourceMappingURL=activity-prompt.d.ts.map