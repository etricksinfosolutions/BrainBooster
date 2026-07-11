import { z } from "zod";
import { MemoryDifficulty } from "@etricks/memory-engine";
/**
 * MemorySpec — the manufacturing order for a memory pack.
 *
 * Analogous to GenerationSpec (quiz) but for the memory engine: a human (or a merchandising
 * job) hands AIOS a theme and how many pairs to make. The model proposes the concepts; AIOS
 * owns the ids and the asset refs, deriving each card face from the concept slug + a base uri.
 * That keeps content pointing at stable, registry-ready `assetId`s (ADR-0011) rather than
 * whatever the model invents.
 */
export const MemorySpec = z.object({
    /** Which game this content is for, e.g. "brain-booster". */
    gameId: z.string().min(1),
    /** The pack theme the model draws concepts from, e.g. "Animals", "Fruits". */
    theme: z.string().min(1),
    /** Content locale (matches the pack's locale). */
    locale: z.string().min(1).default("en"),
    /** How many quality-passing PAIRS we want in the finished pack (min 2 for a board). */
    count: z.number().int().min(2),
    /** Optional difficulty weighting, e.g. { easy: 4, medium: 4, hard: 2 }. Steers the prompt. */
    difficultyMix: z.record(MemoryDifficulty, z.number().nonnegative()).optional(),
    /** Seed tags applied to every generated pair ("animals"). */
    tags: z.array(z.string()).default([]),
    /** Prefix for generated pair ids + asset ids, e.g. "bb-mem-animals". */
    idPrefix: z.string().min(1),
    /**
     * Base location card-face images resolve to TODAY: `${assetBaseUri}/${slug}.png`. When the
     * Asset Registry lands it derives the uri from the assetId instead (ADR-0011).
     */
    assetBaseUri: z.string().min(1),
    /** Image file extension the assets use. Defaults to "png". */
    assetExt: z.string().min(1).default("png"),
    /** How many pairs to request per model call. Defaults to min(count, 20). */
    batchSize: z.number().int().positive().optional(),
});
/** Turn a concept label ("Red Panda") into a url-safe slug ("red-panda"). */
export function slugify(label) {
    return label
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
//# sourceMappingURL=memory-spec.js.map