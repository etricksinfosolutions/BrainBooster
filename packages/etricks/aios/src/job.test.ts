import { test } from "node:test";
import assert from "node:assert/strict";
import "./index.js"; // registers the built-in content factories (quiz, memory) as a side-effect
import { runGenerationJob, summarizeJobs, type GenerationJob } from "./job.js";
import type { LanguageModel } from "./ports.js";
import type { GenerateContentRequest } from "./factory.js";

/** A model that always returns the same fixed bank (like the offline model). */
function bankModel(items: unknown[]): LanguageModel {
  return { async complete() { return JSON.stringify({ items }); } };
}

const QUIZ_ITEMS = [
  { prompt: "1+1?", choices: ["1", "2", "3", "4"], correctIndex: 1, difficulty: "easy", tags: [] },
  { prompt: "2+2?", choices: ["3", "4", "5", "6"], correctIndex: 1, difficulty: "easy", tags: [] },
  { prompt: "3+3?", choices: ["5", "6", "7", "8"], correctIndex: 1, difficulty: "easy", tags: [] },
];

const clock = () => "2026-07-06T00:00:00.000Z";
const req = (count: number): GenerateContentRequest => ({
  engine: "quiz",
  contentType: "questions",
  spec: { gameId: "g", topic: "math", locale: "en", count, tags: [], idPrefix: "m" },
});

test("a job that reaches the requested count is published", async () => {
  const { job, payload } = await runGenerationJob(
    req(3), bankModel(QUIZ_ITEMS),
    { id: "job-1", gameId: "g", packId: "p1", locale: "en" }, { now: clock },
  );
  assert.equal(job.status, "published");
  assert.equal(job.requested, 3);
  assert.equal(job.generated, 3);
  assert.equal(job.published, 3);
  assert.equal(job.startedAt, "2026-07-06T00:00:00.000Z");
  assert.ok(payload);
});

test("a job that runs out of source material is a SHORTFALL, not a silent truncation", async () => {
  // Ask for 500 from a 3-item bank — the pipeline must report the gap.
  const { job } = await runGenerationJob(
    req(500), bankModel(QUIZ_ITEMS),
    { id: "job-2", gameId: "g", packId: "p2", locale: "en" }, { now: clock },
  );
  assert.equal(job.status, "shortfall");
  assert.equal(job.requested, 500);
  assert.equal(job.generated, 3); // only 3 unique items exist
  assert.ok(job.rejected > 0); // duplicates dropped by the quality gate across rounds
});

test("a job with no registered factory is RECORDED as failed, never thrown", async () => {
  const bad: GenerateContentRequest = { engine: "puzzle", contentType: "nope", spec: {} };
  const { job, payload } = await runGenerationJob(
    bad, bankModel([]),
    { id: "job-3", gameId: "g", packId: "p3", locale: "en" }, { now: clock },
  );
  assert.equal(job.status, "failed");
  assert.ok(job.error && job.error.length > 0);
  assert.equal(payload, undefined);
});

test("summarizeJobs aggregates throughput and fillRate", () => {
  const jobs = [
    { requested: 3, generated: 3, published: 3, rejected: 0, status: "published" },
    { requested: 500, generated: 3, published: 3, rejected: 40, status: "shortfall" },
    { requested: 0, generated: 0, published: 0, rejected: 0, status: "failed" },
  ] as GenerationJob[];
  const m = summarizeJobs(jobs);
  assert.equal(m.jobs, 3);
  assert.equal(m.requested, 503);
  assert.equal(m.published, 6);
  assert.equal(m.shortfalls, 1);
  assert.equal(m.failures, 1);
  assert.ok(m.fillRate > 0 && m.fillRate < 1);
});
