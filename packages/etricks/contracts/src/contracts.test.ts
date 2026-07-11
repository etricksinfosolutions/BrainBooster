import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { GameManifest } from "./game-manifest.js";
import { defineContentPack } from "./content-pack.js";

test("GameManifest accepts a well-formed manifest", () => {
  const manifest = GameManifest.parse({
    manifestVersion: 1,
    gameId: "brain-booster",
    title: "Brain Booster",
    engines: ["quiz"],
    minAppVersion: "1.0.0",
    status: "live",
    locales: ["en"],
    packs: [
      {
        packId: "brain-booster-quiz-gk-en",
        engine: "quiz",
        version: "1.0.0",
        locale: "en",
        url: "https://cdn.etricks.example/packs/brain-booster-quiz-gk-en.json",
      },
    ],
    products: [],
    publishedAt: "2026-01-01T00:00:00.000Z",
  });
  assert.equal(manifest.gameId, "brain-booster");
  assert.equal(manifest.countries.length, 0); // default applied
});

test("GameManifest rejects a bad semver", () => {
  assert.throws(() =>
    GameManifest.parse({
      manifestVersion: 1,
      gameId: "brain-booster",
      title: "Brain Booster",
      engines: ["quiz"],
      minAppVersion: "1.0", // invalid
      status: "live",
      locales: ["en"],
      packs: [],
      publishedAt: "2026-01-01T00:00:00.000Z",
    }),
  );
});

test("defineContentPack validates the engine payload", () => {
  const TinyPack = defineContentPack(z.object({ n: z.number() }));
  const base = {
    packId: "p",
    gameId: "g",
    engine: "quiz" as const,
    version: "1.0.0",
    locale: "en",
    schemaVersion: 1,
    checksum: "a".repeat(64),
    sizeBytes: 10,
    publishedAt: "2026-01-01T00:00:00.000Z",
    tags: [],
  };
  assert.ok(TinyPack.parse({ ...base, payload: { n: 5 } }));
  assert.throws(() => TinyPack.parse({ ...base, payload: { n: "no" } }));
});
