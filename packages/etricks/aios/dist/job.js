import { generateContent } from "./factory.js";
/**
 * Run one manufacturing job: dispatch to AIOS, then record the outcome as a `GenerationJob`.
 * Never throws — a generation failure is captured as a `failed` job so the pipeline records it
 * rather than losing it. Callers inspect `payload`/`status` to decide what to do.
 */
export async function runGenerationJob(request, model, meta, options = {}) {
    const now = options.now ?? (() => new Date().toISOString());
    const startedAt = now();
    const base = {
        id: meta.id,
        gameId: meta.gameId,
        engine: request.engine,
        contentType: request.contentType,
        packId: meta.packId,
        locale: meta.locale,
    };
    try {
        const { payload, report } = await generateContent(request, model);
        const generated = report.accepted;
        const job = {
            ...base,
            requested: report.requested,
            generated,
            rejected: report.rejected.length,
            published: generated, // auto-publish today; see ADR-0017
            status: report.shortfall ? "shortfall" : "published",
            rounds: report.rounds,
            startedAt,
            finishedAt: now(),
            report,
        };
        return { job, payload };
    }
    catch (err) {
        const job = {
            ...base,
            requested: 0,
            generated: 0,
            rejected: 0,
            published: 0,
            status: "failed",
            rounds: 0,
            startedAt,
            finishedAt: now(),
            error: err instanceof Error ? err.message : String(err),
        };
        return { job, payload: undefined };
    }
}
export function summarizeJobs(jobs) {
    const acc = jobs.reduce((a, j) => ({
        requested: a.requested + j.requested,
        generated: a.generated + j.generated,
        rejected: a.rejected + j.rejected,
        published: a.published + j.published,
        shortfalls: a.shortfalls + (j.status === "shortfall" ? 1 : 0),
        failures: a.failures + (j.status === "failed" ? 1 : 0),
    }), { requested: 0, generated: 0, rejected: 0, published: 0, shortfalls: 0, failures: 0 });
    return {
        jobs: jobs.length,
        ...acc,
        fillRate: acc.requested === 0 ? 0 : acc.published / acc.requested,
    };
}
//# sourceMappingURL=job.js.map