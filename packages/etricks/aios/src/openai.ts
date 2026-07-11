import type { LanguageModel, LanguageModelRequest } from "./ports.js";

/**
 * The OpenAI (GPT) LanguageModel adapter.
 *
 * Same injected-ports discipline as `claude.ts`: AIOS takes no hard dependency on the `openai`
 * SDK. The app constructs the real client and passes it in; this adapter needs only the tiny
 * `chat.completions.create` surface, described structurally below. Adding GPT as a provider is
 * this file + a registry entry — no manufacturing-logic change (ADR-0008/0016).
 *
 *   import OpenAI from "openai";
 *   const model = makeOpenAILanguageModel(new OpenAI());
 */

/** Minimal structural view of the OpenAI Chat Completions API we depend on. */
export interface OpenAIChatClient {
  chat: {
    completions: {
      create(params: {
        model: string;
        max_tokens?: number;
        temperature?: number;
        messages: { role: "system" | "user" | "assistant"; content: string }[];
      }): Promise<{ choices: { message: { content: string | null } }[] }>;
    };
  };
}

export interface OpenAIModelOptions {
  /** Defaults to a capable general model. */
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export function makeOpenAILanguageModel(
  client: OpenAIChatClient,
  options: OpenAIModelOptions = {},
): LanguageModel {
  const model = options.model ?? "gpt-4o";
  const maxTokens = options.maxTokens ?? 4096;
  const temperature = options.temperature ?? 0.7;

  return {
    async complete(request: LanguageModelRequest): Promise<string> {
      const res = await client.chat.completions.create({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [
          { role: "system", content: request.system },
          { role: "user", content: request.user },
        ],
      });
      return res.choices.map((c) => c.message.content ?? "").join("");
    },
  };
}
