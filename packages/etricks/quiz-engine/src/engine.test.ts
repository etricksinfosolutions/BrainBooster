import assert from "node:assert/strict";
import { test } from "node:test";
import { QuizPayload } from "./schema.js";
import {
  DEFAULT_CONFIG,
  answer,
  createSession,
  maxScore,
  type QuizConfig,
} from "./engine.js";

const payload = QuizPayload.parse({
  items: [
    { id: "q1", prompt: "2+2?", choices: ["3", "4", "5"], correctIndex: 1, difficulty: "easy", tags: ["math"] },
    { id: "q2", prompt: "Capital of France?", choices: ["Paris", "Rome"], correctIndex: 0, difficulty: "medium", tags: ["geo"] },
    { id: "q3", prompt: "H2O is?", choices: ["Water", "Gold", "Salt"], correctIndex: 0, difficulty: "hard", tags: ["science"] },
    { id: "q4", prompt: "Sky colour?", choices: ["Blue", "Green"], correctIndex: 0, difficulty: "easy", tags: ["nature"] },
  ],
});

test("createSession is deterministic for the same seed", () => {
  const a = createSession(payload, DEFAULT_CONFIG, "user-1:2026-07-06");
  const b = createSession(payload, DEFAULT_CONFIG, "user-1:2026-07-06");
  assert.deepEqual(a.questions.map((q) => q.id), b.questions.map((q) => q.id));
  assert.deepEqual(a.questions[0]!.choices, b.questions[0]!.choices);
});

test("different seeds generally produce different order", () => {
  const a = createSession(payload, DEFAULT_CONFIG, "seedA");
  const b = createSession(payload, DEFAULT_CONFIG, "seedB");
  // Not a hard guarantee, but with 4 items these two seeds differ.
  assert.notDeepEqual(a.questions.map((q) => q.id), b.questions.map((q) => q.id));
});

test("shuffled choices keep correctIndex pointing at the right answer", () => {
  const session = createSession(payload, DEFAULT_CONFIG, "check-correct");
  for (const q of session.questions) {
    const original = payload.items.find((i) => i.id === q.id)!;
    assert.equal(q.choices[q.correctIndex], original.choices[original.correctIndex]);
  }
});

test("difficulty filter restricts the pool", () => {
  const config: QuizConfig = { ...DEFAULT_CONFIG, difficulties: ["easy"], questionCount: 10 };
  const session = createSession(payload, config, "easy-only");
  assert.equal(session.questions.length, 2);
  assert.ok(session.questions.every((q) => q.difficulty === "easy"));
});

test("tag filter restricts the pool", () => {
  const config: QuizConfig = { ...DEFAULT_CONFIG, tags: ["science"], questionCount: 10 };
  const session = createSession(payload, config, "sci");
  assert.deepEqual(session.questions.map((q) => q.id), ["q3"]);
});

test("questionCount caps the session length", () => {
  const config: QuizConfig = { ...DEFAULT_CONFIG, questionCount: 2 };
  const session = createSession(payload, config, "cap");
  assert.equal(session.questions.length, 2);
});

test("scoring: correct answer awards base points, wrong awards none", () => {
  const config: QuizConfig = { ...DEFAULT_CONFIG, shuffleChoices: false };
  const session = createSession(payload, config, "score");
  const q = session.questions[0]!;
  const right = answer(session, q, q.correctIndex);
  assert.equal(right.correct, true);
  assert.equal(right.awarded, 100);
  const wrongIdx = q.correctIndex === 0 ? 1 : 0;
  const wrong = answer(session, q, wrongIdx);
  assert.equal(wrong.correct, false);
  assert.equal(wrong.awarded, 0);
});

test("speed bonus decays with elapsed time", () => {
  const session = createSession(payload, DEFAULT_CONFIG, "speed");
  const q = session.questions[0]!;
  const instant = answer(session, q, q.correctIndex, 0);
  const slow = answer(session, q, q.correctIndex, 10_000);
  assert.equal(instant.awarded, 150); // 100 + full 50 bonus
  assert.equal(slow.awarded, 100); // bonus fully decayed
});

test("maxScore reflects question count and base points", () => {
  const session = createSession(payload, DEFAULT_CONFIG, "max");
  assert.equal(maxScore(session), session.questions.length * 100);
});
