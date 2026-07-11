import { test } from "node:test";
import assert from "node:assert/strict";
import { ActivityPayload, createActivitySession, gradeResponse } from "@etricks/activity-engine";
import { generateContent } from "./factory.js";
import { generateActivities } from "./activity-factory.js";
import "./index.js"; // registers the activity factories

/** A deterministic model that serves a fixed bank as the {items:[...]} envelope AIOS expects. */
function bankModel(bank: unknown[]) {
  let cursor = 0;
  return {
    async complete(): Promise<string> {
      const chunk = bank.slice(cursor);
      cursor += chunk.length;
      return JSON.stringify({ items: chunk });
    },
  };
}

const MC_BANK = [
  { type: "multiple-choice", prompt: "H2O is?", choices: ["Water", "Salt", "Air"], correctIndex: 0 },
  { type: "multiple-choice", prompt: "Sun is a?", choices: ["Planet", "Star", "Moon"], correctIndex: 1 },
  // a duplicate prompt (should be gated) and a malformed one (should be gated)
  { type: "multiple-choice", prompt: "H2O is?", choices: ["Water", "Salt"], correctIndex: 0 },
  { type: "multiple-choice", prompt: "bad", choices: ["only-one"], correctIndex: 0 },
];

test("the activity factory manufactures a validated, playable pack", async () => {
  const { payload, report } = await generateActivities(
    {
      gameId: "science-master",
      activityType: "multiple-choice",
      topic: "basic science",
      count: 2,
      idPrefix: "sm-sci",
      tags: ["science"],
      config: { shuffle: false },
    },
    bankModel(MC_BANK),
  );

  assert.doesNotThrow(() => ActivityPayload.parse(payload));
  assert.equal(payload.activities.length, 2);
  assert.equal(report.accepted, 2);
  assert.equal(payload.activities[0]!.id, "sm-sci-0001");
  assert.deepEqual(payload.activities[0]!.tags, ["science"]);

  // The manufactured activity plays through the real engine.
  const session = createActivitySession(payload.activities[0]!, undefined, "seed");
  const result = gradeResponse(session, { choiceIndex: 0 });
  assert.equal(result.solved, true);
});

test("generateContent dispatches to the registered per-type factory", async () => {
  const { payload } = await generateContent(
    { engine: "activity", contentType: "true-false", spec: {
      gameId: "g", activityType: "true-false", topic: "t", count: 1, idPrefix: "tf",
    } },
    bankModel([{ type: "true-false", statement: "Fire is cold.", answer: false }]),
  );
  const parsed = ActivityPayload.parse(payload);
  assert.equal(parsed.activities[0]!.content.type, "true-false");
});

test("a mis-routed spec (wrong type for the factory) fails loudly", async () => {
  await assert.rejects(() =>
    generateContent(
      { engine: "activity", contentType: "sorting", spec: {
        gameId: "g", activityType: "true-false", topic: "t", count: 1, idPrefix: "x",
      } },
      bankModel([]),
    ),
  );
});
