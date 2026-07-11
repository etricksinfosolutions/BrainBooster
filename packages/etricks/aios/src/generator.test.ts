import { test } from "node:test";
import assert from "node:assert/strict";
import { QuizPayload } from "@etricks/quiz-engine";
// Import the package entry so built-in factories are registered (side effect in index.ts).
import { AIOS, generateQuestions, generateContent } from "./index.js";
import { makeClaudeLanguageModel, type AnthropicMessagesClient } from "./claude.js";
import { parseCandidates, normalizePrompt } from "./quality.js";
import type { GenerationSpec } from "./spec.js";
import type { LanguageModel } from "./ports.js";

/** A scripted model: returns each queued raw response in order, then repeats the last. */
function scriptedModel(responses: string[]): LanguageModel {
  let i = 0;
  return {
    async complete() {
      const r = responses[Math.min(i, responses.length - 1)]!;
      i++;
      return r;
    },
  };
}

function item(prompt: string, correctIndex = 0) {
  return {
    prompt,
    choices: ["A-" + prompt, "B-" + prompt, "C-" + prompt, "D-" + prompt],
    correctIndex,
    explanation: "Because.",
    difficulty: "easy" as const,
    tags: ["seed"],
  };
}

function batch(prompts: string[]): string {
  return JSON.stringify({ items: prompts.map((p) => item(p)) });
}

const baseSpec: GenerationSpec = {
  gameId: "brain-booster",
  topic: "general knowledge",
  locale: "en",
  count: 3,
  tags: ["general-knowledge"],
  idPrefix: "bb-gk",
  batchSize: 3,
} as unknown as GenerationSpec;

test("manufactures a valid QuizPayload that meets the requested count", async () => {
  const model = scriptedModel([batch(["Q1", "Q2", "Q3"])]);
  const { payload, report } = await generateQuestions(baseSpec, model);

  // The output validates against the ENGINE's contract — same as hand-authored seed.
  assert.doesNotThrow(() => QuizPayload.parse(payload));
  assert.equal(payload.items.length, 3);
  assert.equal(report.accepted, 3);
  assert.equal(report.rounds, 1);
  assert.equal(report.shortfall, false);
});

test("assigns stable, prefixed ids and merges spec tags", async () => {
  const model = scriptedModel([batch(["Q1", "Q2", "Q3"])]);
  const { payload } = await generateQuestions(baseSpec, model);

  assert.deepEqual(
    payload.items.map((i) => i.id),
    ["bb-gk-0001", "bb-gk-0002", "bb-gk-0003"],
  );
  // Model-supplied "seed" tag plus the spec's "general-knowledge", de-duplicated.
  assert.deepEqual([...payload.items[0]!.tags].sort(), [
    "general-knowledge",
    "seed",
  ]);
});

test("de-duplicates repeated prompts across batches and keeps asking", async () => {
  const model = scriptedModel([
    batch(["Q1", "Q2"]),
    batch(["Q2", "Q3"]), // Q2 is a repeat — must be dropped, Q3 accepted
  ]);
  const { payload, report } = await generateQuestions(baseSpec, model);

  assert.equal(payload.items.length, 3);
  assert.deepEqual(payload.items.map((i) => i.prompt), ["Q1", "Q2", "Q3"]);
  assert.equal(report.rounds, 2);
  assert.ok(report.rejected.some((r) => r.reason === "duplicate-prompt"));
});

test("rejects malformed and low-quality items with attributed reasons", async () => {
  const dupChoices = {
    prompt: "Bad choices",
    choices: ["same", "same", "x", "y"],
    correctIndex: 0,
    difficulty: "easy",
    tags: [],
  };
  const badShape = { prompt: "No choices at all" };
  const model = scriptedModel([
    JSON.stringify({ items: [dupChoices, badShape, item("Good1"), item("Good2"), item("Good3")] }),
  ]);

  const { payload, report } = await generateQuestions(baseSpec, model);
  assert.equal(payload.items.length, 3);
  assert.ok(report.rejected.some((r) => r.reason === "duplicate-choices"));
  assert.ok(report.rejected.some((r) => r.reason === "invalid-shape"));
});

test("reports a shortfall when the round cap is hit before reaching count", async () => {
  // Model can only ever produce one unique question, then repeats it forever.
  const model = scriptedModel([batch(["OnlyOne"])]);
  const { payload, report } = await generateQuestions(baseSpec, model, {
    maxRounds: 4,
  });

  assert.equal(payload.items.length, 1);
  assert.equal(report.rounds, 4);
  assert.equal(report.shortfall, true);
});

test("survives an unparseable model response by retrying the round", async () => {
  const model = scriptedModel([
    "sorry, I can't do that", // garbage — barren round
    batch(["Q1", "Q2", "Q3"]),
  ]);
  const { payload, report } = await generateQuestions(baseSpec, model);
  assert.equal(payload.items.length, 3);
  assert.equal(report.rounds, 2);
});

test("parseCandidates tolerates code fences and bare arrays", () => {
  assert.equal(parseCandidates("```json\n{\"items\":[]}\n```").length, 0);
  assert.equal(parseCandidates("[{\"prompt\":\"x\"}]").length, 1);
  assert.equal(parseCandidates("{\"nope\":1}").length, 0);
});

test("normalizePrompt collapses case, whitespace, and trailing punctuation", () => {
  assert.equal(
    normalizePrompt("  What  is   2+2?  "),
    normalizePrompt("what is 2+2"),
  );
});

test("Claude adapter concatenates text blocks and wires adaptive thinking", async () => {
  const calls: unknown[] = [];
  const fakeClient: AnthropicMessagesClient = {
    messages: {
      async create(params) {
        calls.push(params);
        return {
          content: [
            { type: "thinking", text: "" },
            { type: "text", text: '{"items":' },
            { type: "text", text: "[]}" },
          ],
        };
      },
    },
  };

  const model = makeClaudeLanguageModel(fakeClient);
  const out = await model.complete({ system: "sys", user: "usr" });

  assert.equal(out, '{"items":[]}');
  const sent = calls[0] as { model: string; thinking: { type: string } };
  assert.equal(sent.model, "claude-opus-4-8");
  assert.equal(sent.thinking.type, "adaptive");
});

test("AIOS namespace exposes generateContent and generateQuestions", () => {
  assert.equal(typeof AIOS.generateContent, "function");
  assert.equal(typeof AIOS.generateQuestions, "function");
});

test("generateContent dispatches to the registered quiz factory", async () => {
  const model = scriptedModel([batch(["Q1", "Q2", "Q3"])]);
  const { payload, report } = await generateContent(
    { engine: "quiz", contentType: "questions", spec: baseSpec },
    model,
  );
  const items = (payload as { items: { id: string }[] }).items;
  assert.equal(items.length, 3);
  assert.equal(report.accepted, 3);
  assert.ok(items.every((i) => /^bb-gk-\d{4}$/.test(i.id)));
});

test("generateContent throws for an unregistered (engine, contentType)", async () => {
  const model = scriptedModel([batch(["Q1"])]);
  await assert.rejects(
    () => generateContent({ engine: "story", contentType: "story", spec: {} }, model),
    /no content factory registered/i,
  );
});
