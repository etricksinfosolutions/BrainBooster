import { z } from "zod";
/**
 * MemorySpec — the manufacturing order for a memory pack.
 *
 * Analogous to GenerationSpec (quiz) but for the memory engine: a human (or a merchandising
 * job) hands AIOS a theme and how many pairs to make. The model proposes the concepts; AIOS
 * owns the ids and the asset refs, deriving each card face from the concept slug + a base uri.
 * That keeps content pointing at stable, registry-ready `assetId`s (ADR-0011) rather than
 * whatever the model invents.
 */
export declare const MemorySpec: z.ZodObject<{
    /** Which game this content is for, e.g. "brain-booster". */
    gameId: z.ZodString;
    /** The pack theme the model draws concepts from, e.g. "Animals", "Fruits". */
    theme: z.ZodString;
    /** Content locale (matches the pack's locale). */
    locale: z.ZodDefault<z.ZodString>;
    /** How many quality-passing PAIRS we want in the finished pack (min 2 for a board). */
    count: z.ZodNumber;
    /** Optional difficulty weighting, e.g. { easy: 4, medium: 4, hard: 2 }. Steers the prompt. */
    difficultyMix: z.ZodOptional<z.ZodRecord<z.ZodEnum<["easy", "medium", "hard"]>, z.ZodNumber>>;
    /** Seed tags applied to every generated pair ("animals"). */
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Prefix for generated pair ids + asset ids, e.g. "bb-mem-animals". */
    idPrefix: z.ZodString;
    /**
     * Base location card-face images resolve to TODAY: `${assetBaseUri}/${slug}.png`. When the
     * Asset Registry lands it derives the uri from the assetId instead (ADR-0011).
     */
    assetBaseUri: z.ZodString;
    /** Image file extension the assets use. Defaults to "png". */
    assetExt: z.ZodDefault<z.ZodString>;
    /** How many pairs to request per model call. Defaults to min(count, 20). */
    batchSize: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    gameId: string;
    locale: string;
    count: number;
    tags: string[];
    idPrefix: string;
    theme: string;
    assetBaseUri: string;
    assetExt: string;
    batchSize?: number | undefined;
    difficultyMix?: Partial<Record<"easy" | "medium" | "hard", number>> | undefined;
}, {
    gameId: string;
    count: number;
    idPrefix: string;
    theme: string;
    assetBaseUri: string;
    locale?: string | undefined;
    tags?: string[] | undefined;
    batchSize?: number | undefined;
    difficultyMix?: Partial<Record<"easy" | "medium" | "hard", number>> | undefined;
    assetExt?: string | undefined;
}>;
export type MemorySpec = z.infer<typeof MemorySpec>;
/** Turn a concept label ("Red Panda") into a url-safe slug ("red-panda"). */
export declare function slugify(label: string): string;
//# sourceMappingURL=memory-spec.d.ts.map