import { test } from "node:test";
import assert from "node:assert/strict";
import { Activity } from "./schema.js";
import { createActivitySession, gradeResponse } from "./engine.js";
import { resolveConfig, DEFAULT_CONFIG, effectiveTimeLimitMs } from "./config.js";
import { STRATEGIES } from "./registry.js";
import { ACTIVITY_TYPES } from "./types.js";

const MC = {
  id: "mc1",
  content: { type: "multiple-choice", prompt: "Capital of Japan?", choices: ["Kyoto", "Tokyo", "Osaka", "Nara"], correctIndex: 1 },
} as const;

test("the registry has exactly one strategy per catalogued activity type", () => {
  assert.equal(Object.keys(STRATEGIES).length, ACTIVITY_TYPES.length);
  for (const type of ACTIVITY_TYPES) assert.equal(STRATEGIES[type]!.type, type);
});

test("config resolves partial input against defaults", () => {
  const c = resolveConfig({ lives: 3, scoring: { perCorrect: 50 } });
  assert.equal(c.lives, 3);
  assert.equal(c.scoring.perCorrect, 50);
  assert.equal(c.scoring.perWrong, 0, "unspecified scoring falls back to default");
  assert.equal(c.shuffle, DEFAULT_CONFIG.shuffle);
});

test("sessions are deterministic: same seed → identical prepared layout", () => {
  const activity = Activity.parse(MC);
  const a = createActivitySession(activity, undefined, "u1:2026-07-07");
  const b = createActivitySession(activity, undefined, "u1:2026-07-07");
  assert.deepEqual(a.prepared, b.prepared);
  assert.equal(a.seed, b.seed);
});

test("different seeds generally produce different choice orderings (shuffle on)", () => {
  const activity = Activity.parse(MC);
  const layouts = new Set<string>();
  for (const seed of ["s1", "s2", "s3", "s4", "s5"]) {
    const s = createActivitySession(activity, undefined, seed);
    layouts.add(JSON.stringify((s.prepared as { choices: string[] }).choices));
  }
  assert.ok(layouts.size > 1, "shuffling should yield varied orderings across seeds");
});

test("shuffle:false presents choices exactly as authored", () => {
  const activity = Activity.parse({ ...MC, config: { shuffle: false } });
  const s = createActivitySession(activity, undefined, "any");
  assert.deepEqual((s.prepared as { choices: string[] }).choices, ["Kyoto", "Tokyo", "Osaka", "Nara"]);
  assert.equal((s.prepared as { correctIndex: number }).correctIndex, 1);
});

test("correct answer maps through the shuffle: grading uses the session's correctIndex", () => {
  const activity = Activity.parse(MC);
  const s = createActivitySession(activity, undefined, "seed-xyz");
  const correctIndex = (s.prepared as { correctIndex: number }).correctIndex;
  const good = gradeResponse(s, { choiceIndex: correctIndex });
  assert.equal(good.solved, true);
  const bad = gradeResponse(s, { choiceIndex: (correctIndex + 1) % 4 });
  assert.equal(bad.solved, false);
});

test("config override (level layered over activity) wins", () => {
  const activity = Activity.parse({ ...MC, config: { scoring: { perCorrect: 10 } } });
  const s = createActivitySession(activity, { scoring: { perCorrect: 999 } }, "seed");
  assert.equal(s.config.scoring.perCorrect, 999);
});

test("scoring: speed bonus is added only when solved and within the window", () => {
  const activity = Activity.parse({
    ...MC,
    config: { shuffle: false, scoring: { perCorrect: 100, speed: { maxBonus: 50, windowMs: 10_000 } } },
  });
  const s = createActivitySession(activity, undefined, "seed");
  const fast = gradeResponse(s, { choiceIndex: 1 }, 0);
  assert.equal(fast.score, 150, "instant correct answer earns the full bonus");
  const half = gradeResponse(s, { choiceIndex: 1 }, 5_000);
  assert.equal(half.score, 125, "bonus decays linearly");
  const wrong = gradeResponse(s, { choiceIndex: 0 }, 0);
  assert.equal(wrong.score, 0, "no bonus when not solved");
});

test("stars scale with accuracy across the universal path", () => {
  // A 4-blank fill-blank lets us hit 100% / 75% / 50% cleanly.
  const activity = Activity.parse({
    id: "fb",
    config: { shuffle: false },
    content: {
      type: "fill-blank",
      template: "{{}} {{}} {{}} {{}}",
      blanks: [{ answers: ["a"] }, { answers: ["b"] }, { answers: ["c"] }, { answers: ["d"] }],
    },
  });
  const s = createActivitySession(activity, undefined, "seed");
  assert.equal(gradeResponse(s, { values: ["a", "b", "c", "d"] }).stars, 3);
  assert.equal(gradeResponse(s, { values: ["a", "b", "c", "X"] }).stars, 2);
  assert.equal(gradeResponse(s, { values: ["a", "b", "X", "X"] }).stars, 1);
  assert.equal(gradeResponse(s, { values: ["X", "X", "X", "X"] }).stars, 0);
});

test("time limit: exceeding it marks the result timed out and unsolved", () => {
  const activity = Activity.parse({ ...MC, config: { shuffle: false, timeLimitMs: 5_000 } });
  const s = createActivitySession(activity, undefined, "seed");
  const late = gradeResponse(s, { choiceIndex: 1 }, 6_000);
  assert.equal(late.timedOut, true);
  assert.equal(late.solved, false, "a timed-out perfect answer is not solved");
  const intime = gradeResponse(s, { choiceIndex: 1 }, 4_000);
  assert.equal(intime.timedOut, false);
  assert.equal(intime.solved, true);
});

test("accessibility extraTimeFactor widens the effective time budget", () => {
  const c = resolveConfig({ timeLimitMs: 10_000, accessibility: { extraTimeFactor: 1.5 } });
  assert.equal(effectiveTimeLimitMs(c), 15_000);
});
