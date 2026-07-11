import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MemoryPayload,
  MemoryPack,
  createBoard,
  evaluateFlip,
  isMatch,
  maxScore,
  type MemoryConfig,
} from "./index.js";

function pair(id: string, label: string, tags: string[] = []) {
  return {
    id,
    label,
    face: { assetId: `animal-${id}`, kind: "image" as const, uri: `/assets/${id}.png`, alt: label },
    difficulty: "medium" as const,
    tags,
  };
}

const payload = MemoryPayload.parse({
  theme: "Animals",
  pairs: [
    pair("lion", "Lion", ["safari"]),
    pair("tiger", "Tiger", ["safari"]),
    pair("bear", "Bear", ["forest"]),
    pair("wolf", "Wolf", ["forest"]),
  ],
});

const config: MemoryConfig = {
  pairCount: 3,
  scoring: { match: 100, mismatch: 0 },
};

test("MemoryPayload validates and a card face must be an image", () => {
  assert.equal(payload.pairs.length, 4);
  assert.throws(() =>
    MemoryPayload.parse({
      theme: "Bad",
      pairs: [
        { ...pair("a", "A"), face: { assetId: "a", kind: "audio", uri: "/a.mp3" } },
        pair("b", "B"),
      ],
    }),
  );
});

test("a memory pack composes the contract envelope + payload", () => {
  const pack = MemoryPack.parse({
    packId: "brain-booster-memory-animals-en",
    gameId: "brain-booster",
    engine: "memory",
    version: "1.0.0",
    locale: "en",
    schemaVersion: 1,
    checksum: "a".repeat(64),
    sizeBytes: 123,
    publishedAt: "2026-07-06T00:00:00.000Z",
    tags: ["animals"],
    payload,
  });
  assert.equal(pack.engine, "memory");
  assert.equal(pack.payload.theme, "Animals");
});

test("createBoard expands pairs into a shuffled board of 2× cards", () => {
  const board = createBoard(payload, config, "user-1:2026-07-06");
  assert.equal(board.cards.length, config.pairCount * 2);
  assert.equal(board.theme, "Animals");
  // positions are 0..n-1, contiguous and unique
  const positions = board.cards.map((c) => c.position).sort((a, b) => a - b);
  assert.deepEqual(positions, [0, 1, 2, 3, 4, 5]);
  // every pairId appears exactly twice
  const counts = new Map<string, number>();
  for (const c of board.cards) counts.set(c.pairId, (counts.get(c.pairId) ?? 0) + 1);
  for (const n of counts.values()) assert.equal(n, 2);
});

test("board generation is deterministic for the same seed and differs across seeds", () => {
  const a = createBoard(payload, config, "seed-A");
  const b = createBoard(payload, config, "seed-A");
  const c = createBoard(payload, config, "seed-B");
  const order = (board: ReturnType<typeof createBoard>) => board.cards.map((x) => x.cardId);
  assert.deepEqual(order(a), order(b));
  assert.notDeepEqual(order(a), order(c));
});

test("config filters the pair pool by tag", () => {
  const forest = createBoard(payload, { ...config, pairCount: 2, tags: ["forest"] }, "s");
  const labels = new Set(forest.cards.map((c) => c.label));
  assert.deepEqual([...labels].sort(), ["Bear", "Wolf"]);
});

test("isMatch pairs twin cards but not a card with itself", () => {
  const board = createBoard(payload, config, "s");
  const byPair = new Map<string, typeof board.cards>();
  for (const c of board.cards) byPair.set(c.pairId, [...(byPair.get(c.pairId) ?? []), c]);
  const [twinA, twinB] = [...byPair.values()][0]!;
  assert.ok(isMatch(twinA!, twinB!));
  assert.ok(!isMatch(twinA!, twinA!));
});

test("evaluateFlip awards on match and maxScore totals all pairs", () => {
  const board = createBoard(payload, config, "s");
  const [a] = board.cards;
  const twin = board.cards.find((c) => c.pairId === a!.pairId && c.cardId !== a!.cardId)!;
  const hit = evaluateFlip(board, a!, twin);
  assert.equal(hit.matched, true);
  assert.equal(hit.awarded, 100);
  const miss = evaluateFlip(board, a!, board.cards.find((c) => c.pairId !== a!.pairId)!);
  assert.equal(miss.matched, false);
  assert.equal(miss.awarded, 0);
  assert.equal(maxScore(board), 300);
});
