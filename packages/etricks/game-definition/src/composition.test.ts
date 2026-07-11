import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defineComposition,
  referencedPackIds,
  levelCount,
  GameComposition,
} from "./composition.js";
import { defineGame } from "./game-definition.js";

const COMPOSITION = {
  worlds: [
    {
      id: "basics",
      title: "The Basics",
      levels: [
        {
          id: "b-1",
          title: "Warm Up",
          activities: [
            { packId: "demo-activity-en", activityId: "q1" },
            { packId: "demo-activity-en", activityId: "q2", config: { timeLimitMs: 5000 } },
          ],
        },
        {
          id: "b-2",
          title: "Speed Round",
          requiredStars: 3,
          config: { scoring: { perCorrect: 200 } },
          activities: [{ packId: "demo-activity-en", activityId: "q3" }],
        },
      ],
    },
  ],
};

test("a composition validates and derives structure", () => {
  const c = defineComposition(COMPOSITION);
  assert.equal(levelCount(c), 2);
  assert.deepEqual(referencedPackIds(c), ["demo-activity-en"]);
  assert.equal(c.worlds[0]!.levels[1]!.requiredStars, 3);
});

test("a game may carry its composition inline", () => {
  const game = defineGame({
    definitionVersion: 1,
    id: "demo",
    title: "Demo",
    engines: ["activity"],
    locales: ["en"],
    progression: { mode: "levels", levels: 2 },
    content: [{ packId: "demo-activity-en", engine: "activity", version: "1.0.0" }],
    composition: COMPOSITION,
  });
  assert.equal(game.composition!.worlds.length, 1);
});

test("an empty composition (no worlds) is rejected", () => {
  assert.throws(() => GameComposition.parse({ worlds: [] }));
});
