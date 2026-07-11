import type { EngineId } from "@etricks/contracts";
import { type GenerateContentRequest } from "./factory.js";
import type { LanguageModel } from "./ports.js";
import type { GenerationReport } from "./spec.js";
/**
 * Generation Jobs — the manufacturing pipeline's unit of work.
 *
 * Today `generateContent()` runs and its `GenerationReport` is discarded. A `GenerationJob`
 * makes that run a first-class, recorded artifact: what was requested, generated, rejected, and
 * published, plus status and timing. This is not a new architectural layer — it is a thin
 * orchestration over the SAME `generateContent` + quality gate that already exist, so every pack
 * the platform ships carries a queryable record of how it was made. See ADR-0017.
 *
 * Deliberately NOT built here (no consumer yet): a job queue, background workers, cron, a human
 * review step, or persistence. A job runs synchronously and is recorded in memory. `published`
 * equals `generated` today (auto-publish); a human review gate slots in between generate and
 * publish when there is a reviewer — that is why they are separate fields.
 */
export type JobStatus = "published" | "shortfall" | "failed";
export interface GenerationJob {
    /** Stable job id (e.g. "job-brain-booster-quiz-gk-en"). */
    id: string;
    gameId: string;
    engine: EngineId;
    contentType: string;
    packId: string;
    locale: string;
    /** How many quality-passing items were asked for (echoed by the factory). */
    requested: number;
    /** How many passed the quality gate (accepted). */
    generated: number;
    /** How many candidates the gate dropped. */
    rejected: number;
    /** How many were published. Equals `generated` today (auto-publish; review gate is future). */
    published: number;
    status: JobStatus;
    /** Model calls made during the run. */
    rounds: number;
    startedAt: string;
    finishedAt: string;
    /** The full accounting from AIOS (undefined when the job failed before running). */
    report?: GenerationReport;
    /** Present only when status === "failed". */
    error?: string;
}
/** Identity for a job — the run derives the rest (counts, status) from the AIOS report. */
export interface JobMeta {
    id: string;
    gameId: string;
    packId: string;
    locale: string;
}
export interface JobResult {
    job: GenerationJob;
    /** The manufactured payload, or `undefined` when the job failed. */
    payload: unknown;
}
export interface JobRunOptions {
    /** Injectable clock for deterministic tests; defaults to the wall clock. */
    now?: () => string;
}
/**
 * Run one manufacturing job: dispatch to AIOS, then record the outcome as a `GenerationJob`.
 * Never throws — a generation failure is captured as a `failed` job so the pipeline records it
 * rather than losing it. Callers inspect `payload`/`status` to decide what to do.
 */
export declare function runGenerationJob(request: GenerateContentRequest, model: LanguageModel, meta: JobMeta, options?: JobRunOptions): Promise<JobResult>;
/** Aggregate throughput across a batch of jobs — the manufacturing dashboard in one object. */
export interface JobMetrics {
    jobs: number;
    requested: number;
    generated: number;
    rejected: number;
    published: number;
    shortfalls: number;
    failures: number;
    /** published / requested, 0..1 (0 when nothing was requested). The headline throughput number. */
    fillRate: number;
}
export declare function summarizeJobs(jobs: readonly GenerationJob[]): JobMetrics;
//# sourceMappingURL=job.d.ts.map