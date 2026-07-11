import { test } from "node:test";
import assert from "node:assert/strict";
import { defineGame } from "./game-definition.js";

test("monetization and progression defaults apply", () => {
  const g = defineGame({
    definitionVersion: 1,
    id: "minimal",
    title: "Minimal",
    engines: ["quiz"],
    locales: ["en"],
    progression: { mode: "endless" },
  });
  // Monetization is fully defaulted; content defaults to empty.
  assert.deepEqual(g.monetization, {
    subscription: false,
    oneTimePurchase: false,
    ads: "none",
  });
  assert.deepEqual(g.content, []);
});

test("rejects a content slot whose engine is not declared in engines[]", () => {
  assert.throws(() =>
    defineGame({
      definitionVersion: 1,
      id: "mismatch",
      title: "Mismatch",
      engines: ["quiz"],
      locales: ["en"],
      progression: { mode: "endless" },
      content: [{ packId: "some-memory-pack", engine: "memory", version: "1.0.0" }],
    }),
  );
});

test("rejects an unknown engine id", () => {
  assert.throws(() =>
    defineGame({
      definitionVersion: 1,
      id: "bad-engine",
      title: "Bad",
      engines: ["not-a-real-engine"],
      locales: ["en"],
      progression: { mode: "endless" },
    }),
  );
});
