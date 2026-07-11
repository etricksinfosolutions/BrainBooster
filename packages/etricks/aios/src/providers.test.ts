import { test } from "node:test";
import assert from "node:assert/strict";
import { makeOpenAILanguageModel } from "./openai.js";
import { makeGeminiLanguageModel } from "./gemini.js";

test("OpenAI adapter maps a LanguageModel request onto chat.completions and joins choices", async () => {
  let captured: unknown;
  const model = makeOpenAILanguageModel({
    chat: {
      completions: {
        async create(params) {
          captured = params;
          return { choices: [{ message: { content: '{"items":[]}' } }] };
        },
      },
    },
  });
  const out = await model.complete({ system: "SYS", user: "USER" });
  assert.equal(out, '{"items":[]}');
  const p = captured as { messages: { role: string; content: string }[]; model: string };
  assert.equal(p.model, "gpt-4o");
  assert.deepEqual(p.messages, [
    { role: "system", content: "SYS" },
    { role: "user", content: "USER" },
  ]);
});

test("Gemini adapter passes system instruction + user content and returns response text", async () => {
  let captured: unknown;
  const model = makeGeminiLanguageModel({
    async generateContent(params) {
      captured = params;
      return { response: { text: () => "hello" } };
    },
  });
  const out = await model.complete({ system: "SYS", user: "USER" });
  assert.equal(out, "hello");
  const p = captured as { systemInstruction: string; contents: { parts: { text: string }[] }[] };
  assert.equal(p.systemInstruction, "SYS");
  assert.equal(p.contents[0].parts[0].text, "USER");
});
