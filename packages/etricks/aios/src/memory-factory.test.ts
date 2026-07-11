import { test } from "node:test";
import assert from "node:assert/strict";
import { MemoryPayload } from "@etricks/memory-engine";
// Import the package entry so built-in factories are registered (side effect in index.ts).
import { generateContent, generateMemoryPairs } from "./index.js";
import type { MemorySpec } from "./memory-spec.js";
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

function batch(labels: string[]): string {
  return JSON.stringify({
    items: labels.map((label) => ({ label, difficulty: "easy", tags: ["seed"] })),
  });
}

const baseSpec: MemorySpec = {
  gameId: "brain-booster",
  theme: "Animals",
  locale: "en",
  count: 3,
  tags: ["animals"],
  idPrefix: "bb-mem-animals",
  assetBaseUri: "/assets/memory/animals",
  assetExt: "png",
  batchSize: 3,
} as unknown as MemorySpec;

test("manufactures a valid MemoryPayload with the requested pair count", async () => {
  const model = scriptedModel([batch(["Lion", "Tiger", "Bear"])]);
  const { payload, report } = await generateMemoryPairs(baseSpec, model);

  assert.doesNotThrow(() => MemoryPayload.parse(payload));
  assert.equal(payload.theme, "Animals");
  assert.equal(payload.pairs.length, 3);
  assert.equal(report.accepted, 3);
  assert.equal(report.shortfall, false);
});

test("derives stable image AssetRefs from the concept slug + base uri", async () => {
  const model = scriptedModel([batch(["Red Panda", "Tiger", "Bear"])]);
  const { payload } = await generateMemoryPairs(baseSpec, model);

  const panda = payload.pairs[0]!;
  assert.equal(panda.id, "bb-mem-animals-red-panda");
  assert.equal(panda.face.kind, "image");
  assert.equal(panda.face.assetId, "bb-mem-animals-red-panda");
  assert.equal(panda.face.uri, "/assets/memory/animals/red-panda.png");
  assert.equal(panda.face.alt, "Red Panda");
  // spec tag merged with model-supplied tag, de-duplicated
  assert.deepEqual([...panda.tags].sort(), ["animals", "seed"]);
});

test("de-duplicates repeated labels across batches and keeps asking", async () => {
  const model = scriptedModel([
    batch(["Lion", "Tiger"]),
    batch(["Tiger", "Bear"]), // Tiger repeats — dropped, Bear accepted
  ]);
  const { payload, report } = await generateMemoryPairs(baseSpec, model);

  assert.equal(payload.pairs.length, 3);
  assert.deepEqual(payload.pairs.map((p) => p.label), ["Lion", "Tiger", "Bear"]);
  assert.ok(report.rejected.some((r) => r.reason === "duplicate-label"));
});

test("rejects items with no usable label", async () => {
  const model = scriptedModel([
    JSON.stringify({
      items: [{ difficulty: "easy" }, { label: "" }, { label: "Lion" }, { label: "Tiger" }],
    }),
  ]);
  const { payload, report } = await generateMemoryPairs(
    { ...baseSpec, count: 2 } as MemorySpec,
    model,
  );
  assert.equal(payload.pairs.length, 2);
  assert.ok(report.rejected.some((r) => r.reason === "invalid-shape"));
});

test("generateContent dispatches to the registered memory factory", async () => {
  const model = scriptedModel([batch(["Lion", "Tiger", "Bear"])]);
  const { payload } = await generateContent(
    { engine: "memory", contentType: "pairs", spec: baseSpec },
    model,
  );
  const pairs = (payload as { pairs: { face: { kind: string } }[] }).pairs;
  assert.equal(pairs.length, 3);
  assert.ok(pairs.every((p) => p.face.kind === "image"));
});
