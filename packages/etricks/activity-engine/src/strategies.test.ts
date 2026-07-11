import { test } from "node:test";
import assert from "node:assert/strict";
import { Activity, ActivityContent } from "./schema.js";
import { createActivitySession, gradeResponse } from "./engine.js";
import { ACTIVITY_TYPES } from "./types.js";

/**
 * One correct + one wrong response through every activity type, played with `shuffle: false` so the
 * authored order is preserved and the expected response is unambiguous. This proves every strategy
 * grades through the single universal scoring path — perfect accuracy solves, a wrong answer does
 * not — with no per-type special-casing at the call site.
 */

const NO_SHUFFLE = { shuffle: false } as const;

/** Build a session for an activity content block, validating it against the union first. */
function play(content: unknown) {
  const activity = Activity.parse({ id: "a1", content, config: NO_SHUFFLE });
  return createActivitySession(activity, undefined, "fixed-seed");
}

const CASES: {
  content: unknown;
  correct: unknown;
  wrong: unknown;
  units: number;
}[] = [
  {
    content: { type: "multiple-choice", prompt: "2+2?", choices: ["3", "4", "5"], correctIndex: 1 },
    correct: { choiceIndex: 1 },
    wrong: { choiceIndex: 0 },
    units: 1,
  },
  {
    content: { type: "true-false", statement: "The sky is blue.", answer: true },
    correct: { value: true },
    wrong: { value: false },
    units: 1,
  },
  {
    content: {
      type: "fill-blank",
      template: "The capital of France is {{}} and it sits on the {{}}.",
      blanks: [{ answers: ["Paris"] }, { answers: ["Seine"] }],
    },
    correct: { values: ["paris", "  seine "] },
    wrong: { values: ["Paris", "Thames"] },
    units: 2,
  },
  {
    content: { type: "word-search", words: ["cat", "dog"], size: 6 },
    correct: { found: ["cat", "dog"] },
    wrong: { found: ["cat", "fish"] },
    units: 2,
  },
  {
    content: {
      type: "memory-match",
      pairs: [
        { id: "p1", a: "sun", b: "moon" },
        { id: "p2", a: "hot", b: "cold" },
      ],
    },
    correct: { matched: ["p1", "p2"] },
    wrong: { matched: ["p1", "nope"] },
    units: 2,
  },
  {
    content: { type: "sequence-ordering", items: ["one", "two", "three"] },
    correct: { order: [0, 1, 2] },
    wrong: { order: [2, 1, 0] },
    units: 3,
  },
  {
    content: {
      type: "drag-drop-match",
      pairs: [
        { left: "France", right: "Paris" },
        { left: "Japan", right: "Tokyo" },
      ],
    },
    correct: { mapping: [0, 1] },
    wrong: { mapping: [1, 0] },
    units: 2,
  },
  {
    content: {
      type: "flash-cards",
      cards: [
        { id: "c1", front: "hola", back: "hello" },
        { id: "c2", front: "adios", back: "bye" },
      ],
    },
    correct: { known: ["c1", "c2"] },
    wrong: { known: ["c1"] },
    units: 2,
  },
  {
    content: {
      type: "image-quiz",
      image: { assetId: "flag-fr", kind: "image", uri: "fr.png", alt: "flag" },
      choices: ["Spain", "France", "Italy"],
      correctIndex: 1,
    },
    correct: { choiceIndex: 1 },
    wrong: { choiceIndex: 2 },
    units: 1,
  },
  {
    content: {
      type: "audio-quiz",
      audio: { assetId: "note-c", kind: "audio", uri: "c.mp3", alt: "a note" },
      choices: ["C", "D", "E"],
      correctIndex: 0,
    },
    correct: { choiceIndex: 0 },
    wrong: { choiceIndex: 1 },
    units: 1,
  },
  {
    content: { type: "typing-challenge", text: "hello" },
    correct: { typed: "hello" },
    wrong: { typed: "xxxxx" },
    units: 5,
  },
  {
    content: {
      type: "sorting",
      items: [
        { label: "1955", value: 1955 },
        { label: "1969", value: 1969 },
        { label: "1989", value: 1989 },
      ],
    },
    correct: { order: [0, 1, 2] },
    wrong: { order: [2, 1, 0] },
    units: 3,
  },
  {
    content: {
      type: "classification",
      categories: ["mammal", "bird"],
      items: [
        { label: "dog", category: "mammal" },
        { label: "eagle", category: "bird" },
      ],
    },
    correct: { assignments: [0, 1] },
    wrong: { assignments: [1, 0] },
    units: 2,
  },
  {
    content: {
      type: "hotspot",
      image: { assetId: "map", kind: "image", uri: "map.png" },
      prompt: "Tap the top-left and bottom-right",
      targets: [
        { label: "tl", x: 0, y: 0, w: 0.2, h: 0.2 },
        { label: "br", x: 0.8, y: 0.8, w: 0.2, h: 0.2 },
      ],
    },
    correct: { points: [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.9 }] },
    wrong: { points: [{ x: 0.1, y: 0.1 }, { x: 0.5, y: 0.5 }] },
    units: 2,
  },
  {
    content: {
      type: "puzzle-grid",
      rows: 2,
      cols: 2,
      tiles: ["a", "b", "c", "d"],
    },
    correct: { arrangement: [0, 1, 2, 3] },
    wrong: { arrangement: [3, 2, 1, 0] },
    units: 4,
  },
];

test("every activity type is exercised by the case table", () => {
  const covered = new Set(CASES.map((c) => (c.content as { type: string }).type));
  for (const type of ACTIVITY_TYPES) {
    assert.ok(covered.has(type), `missing test case for activity type "${type}"`);
  }
  assert.equal(CASES.length, ACTIVITY_TYPES.length);
});

for (const c of CASES) {
  const type = (c.content as { type: string }).type;
  test(`${type}: a fully-correct response solves with 3 stars`, () => {
    const session = play(c.content);
    const result = gradeResponse(session, c.correct);
    assert.equal(result.correctUnits, c.units, "all units correct");
    assert.equal(result.totalUnits, c.units);
    assert.equal(result.accuracy, 1);
    assert.equal(result.solved, true);
    assert.equal(result.stars, 3);
    assert.equal(result.score, c.units * 100, "default scoring is 100/correct");
  });

  test(`${type}: a wrong response does not reach perfect accuracy`, () => {
    const session = play(c.content);
    const result = gradeResponse(session, c.wrong);
    assert.ok(result.accuracy < 1, "wrong response is not fully correct");
    assert.ok(result.correctUnits < c.units);
  });
}

test("ActivityContent rejects an unknown activity type", () => {
  assert.throws(() => ActivityContent.parse({ type: "not-a-real-type", foo: 1 }));
});

test("ActivityContent rejects structurally-invalid content (correctIndex out of range)", () => {
  assert.throws(() =>
    ActivityContent.parse({ type: "multiple-choice", prompt: "?", choices: ["a", "b"], correctIndex: 5 }),
  );
});
