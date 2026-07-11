import type { LanguageModel, LanguageModelRequest } from "./ports.js";

/**
 * The production LanguageModel: Claude.
 *
 * Following the platform's injected-ports discipline, AIOS does not take a hard dependency
 * on `@anthropic-ai/sdk`. The app (or a manufacturing job) constructs the real Anthropic
 * client and passes it in; this adapter only needs the tiny `messages.create` surface,
 * described structurally below. That keeps this package buildable and testable offline
 * while the production path uses the real SDK verbatim:
 *
 *   import Anthropic from "@anthropic-ai/sdk";
 *   const model = makeClaudeLanguageModel(new Anthropic());
 *   const { payload } = await AIOS.generateQuestions(spec, model);
 */

/** Minimal structural view of the Anthropic Messages API we depend on. */
export interface AnthropicMessagesClient {
  messages: {
    create(params: {
      model: string;
      max_tokens: number;
      system?: string;
      thinking?: { type: "adaptive" | "disabled" };
      messages: { role: "user" | "assistant"; content: string }[];
    }): Promise<{ content: { type: string; text?: string }[] }>;
  };
}

export interface ClaudeModelOptions {
  /** Defaults to the current flagship, claude-opus-4-8. */
  model?: string;
  /** Streaming isn't needed here; a generous cap for a JSON batch. */
  maxTokens?: number;
}

/**
 * Wrap an Anthropic client as a LanguageModel. Uses adaptive thinking — the manufacturing
 * task benefits from the model reasoning about factual accuracy and answer plausibility
 * before emitting the batch.
 */
export function makeClaudeLanguageModel(
  client: AnthropicMessagesClient,
  options: ClaudeModelOptions = {},
): LanguageModel {
  const model = options.model ?? "claude-opus-4-8";
  const maxTokens = options.maxTokens ?? 8192;

  return {
    async complete(request: LanguageModelRequest): Promise<string> {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system: request.system,
        thinking: { type: "adaptive" },
        messages: [{ role: "user", content: request.user }],
      });
      return response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text ?? "")
        .join("");
    },
  };
}
