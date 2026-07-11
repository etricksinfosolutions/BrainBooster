import { type MemoryPayload as MemoryPayloadT } from "@etricks/memory-engine";
import type { LanguageModel } from "./ports.js";
import { MemorySpec } from "./memory-spec.js";
import type { ContentFactory, GenerateOptions, GenerationResult } from "./factory.js";
/**
 * The memory-pair factory — AIOS's second ContentFactory, and its first that manufactures
 * content with ASSET dependencies.
 *
 * Same manufacturing loop as quiz (ask → parse → gate → accumulate, feeding accepted labels
 * back so the model doesn't repeat itself) but the gate builds a `MemoryPair` — including a
 * stable image `AssetRef` AIOS derives from the concept slug — and validates it against the
 * memory engine's contract. Adding this factory was purely additive (ADR-0008): no existing
 * code changed to teach AIOS a new, non-text content type.
 */
export declare function generateMemoryPairs(spec: MemorySpec, model: LanguageModel, options?: GenerateOptions): Promise<GenerationResult<MemoryPayloadT>>;
/** The registered factory for (engine: "memory", contentType: "pairs"). */
export declare const memoryPairFactory: ContentFactory<MemorySpec, MemoryPayloadT>;
//# sourceMappingURL=memory-factory.d.ts.map