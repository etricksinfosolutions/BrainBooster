import type { EngineId } from "@etricks/contracts";
import type { LanguageModel } from "./ports.js";
import type { GenerationReport } from "./spec.js";

/**
 * The content-factory registry — how AIOS stays "generateContent(), not generateQuestions()".
 *
 * AIOS manufactures assets, not just questions: quiz questions today; memory boards, stories,
 * puzzles, images, audio, localizations tomorrow. Each (engine, contentType) pair is produced
 * by a ContentFactory. `generateContent` dispatches to the registered factory, so adding a new
 * asset type is purely additive — implement a factory, register it, no breaking changes.
 * See ADR-0008.
 */

export interface GenerateOptions {
  /**
   * Safety cap on model calls. A run stops early once the target is met; this bounds cost when
   * the model keeps returning duplicates or junk. Default is factory-specific (quiz: 10).
   */
  maxRounds?: number;
}

export interface GenerationResult<Payload = unknown> {
  /** A validated, engine-specific content payload (e.g. a QuizPayload). */
  payload: Payload;
  report: GenerationReport;
}

/** Manufactures one (engine, contentType) shape from a spec, using an injected model. */
export interface ContentFactory<Spec = unknown, Payload = unknown> {
  readonly engine: EngineId;
  /** e.g. "questions", "boards", "story", "image". */
  readonly contentType: string;
  generate(
    spec: Spec,
    model: LanguageModel,
    options: GenerateOptions,
  ): Promise<GenerationResult<Payload>>;
}

const registry = new Map<string, ContentFactory>();
const keyOf = (engine: string, contentType: string) => `${engine}:${contentType}`;

/** Register a built-in or custom content factory. Idempotent per (engine, contentType). */
export function registerContentFactory(factory: ContentFactory): void {
  registry.set(keyOf(factory.engine, factory.contentType), factory);
}

export function getContentFactory(
  engine: string,
  contentType: string,
): ContentFactory | undefined {
  return registry.get(keyOf(engine, contentType));
}

export interface GenerateContentRequest {
  engine: EngineId;
  contentType: string;
  /** Engine-specific manufacturing spec; the factory validates it. */
  spec: unknown;
}

/**
 * The primary AIOS entry point. Dispatches to the factory registered for
 * (request.engine, request.contentType) and returns its validated payload + report.
 */
export async function generateContent(
  request: GenerateContentRequest,
  model: LanguageModel,
  options: GenerateOptions = {},
): Promise<GenerationResult> {
  const factory = getContentFactory(request.engine, request.contentType);
  if (!factory) {
    throw new Error(
      `AIOS: no content factory registered for engine "${request.engine}", ` +
        `contentType "${request.contentType}". Register one with registerContentFactory().`,
    );
  }
  return factory.generate(request.spec, model, options);
}
