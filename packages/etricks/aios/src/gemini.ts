import type { LanguageModel, LanguageModelRequest } from "./ports.js";

/**
 * The Google Gemini LanguageModel adapter.
 *
 * Same injected-ports discipline as `claude.ts`/`openai.ts`: AIOS takes no hard dependency on the
 * `@google/generative-ai` SDK. The app builds the real client and passes it in; this adapter needs
 * only the tiny `generateContent` surface, described structurally below. Adding Gemini is this file
 * + a registry entry — no manufacturing-logic change (ADR-0008/0016).
 *
 *   import { GoogleGenerativeAI } from "@google/generative-ai";
 *   const client = new GoogleGenerativeAI(key).getGenerativeModel({ model: "gemini-1.5-pro" });
 *   const model = makeGeminiLanguageModel(client);
 */

/** Minimal structural view of the Gemini GenerativeModel API we depend on. */
export interface GeminiGenerativeModel {
  generateContent(params: {
    systemInstruction?: string;
    contents: { role: "user" | "model"; parts: { text: string }[] }[];
    generationConfig?: { maxOutputTokens?: number; temperature?: number };
  }): Promise<{ response: { text(): string } }>;
}

export interface GeminiModelOptions {
  maxTokens?: number;
  temperature?: number;
}

export function makeGeminiLanguageModel(
  client: GeminiGenerativeModel,
  options: GeminiModelOptions = {},
): LanguageModel {
  const maxOutputTokens = options.maxTokens ?? 4096;
  const temperature = options.temperature ?? 0.7;

  return {
    async complete(request: LanguageModelRequest): Promise<string> {
      const res = await client.generateContent({
        systemInstruction: request.system,
        contents: [{ role: "user", parts: [{ text: request.user }] }],
        generationConfig: { maxOutputTokens, temperature },
      });
      return res.response.text();
    },
  };
}
