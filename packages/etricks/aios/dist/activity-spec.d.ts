import { z } from "zod";
/**
 * ActivitySpec — the manufacturing order for the Universal Activity Engine.
 *
 * One spec targets one activity type (multiple-choice, memory-match, word-search…) for one topic.
 * A game manufactures its content by handing AIOS a list of these — no code. Adding "Science Master"
 * is a handful of specs, exactly as adding a quiz game was one `GenerationSpec`. See ADR-0024.
 */
export declare const ActivitySpec: z.ZodObject<{
    /** Which game this content is for, e.g. "science-master". */
    gameId: z.ZodString;
    /** Which activity type to manufacture — dispatches to that type's content shape. */
    activityType: z.ZodEnum<["multiple-choice", "true-false", "fill-blank", "word-search", "memory-match", "sequence-ordering", "drag-drop-match", "flash-cards", "image-quiz", "audio-quiz", "typing-challenge", "sorting", "classification", "hotspot", "puzzle-grid"]>;
    /** Human topic the model writes to, e.g. "the water cycle", "world capitals". */
    topic: z.ZodString;
    /** Content locale (matches the pack's locale). */
    locale: z.ZodDefault<z.ZodString>;
    /** How many quality-passing activities to put in the finished pack. */
    count: z.ZodNumber;
    /** Seed tags applied to every generated activity ("science", "biology"). */
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Prefix for generated activity ids, e.g. "sm-cells" → "sm-cells-0001". */
    idPrefix: z.ZodString;
    /** Config baked onto every generated activity (time limit, lives, scoring…). Partial; engine resolves. */
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    /** How many items to request per model call. Defaults to min(count, 20). */
    batchSize: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    gameId: string;
    activityType: "multiple-choice" | "true-false" | "fill-blank" | "word-search" | "memory-match" | "sequence-ordering" | "drag-drop-match" | "flash-cards" | "image-quiz" | "audio-quiz" | "typing-challenge" | "sorting" | "classification" | "hotspot" | "puzzle-grid";
    topic: string;
    locale: string;
    count: number;
    tags: string[];
    idPrefix: string;
    config?: Record<string, unknown> | undefined;
    batchSize?: number | undefined;
}, {
    gameId: string;
    activityType: "multiple-choice" | "true-false" | "fill-blank" | "word-search" | "memory-match" | "sequence-ordering" | "drag-drop-match" | "flash-cards" | "image-quiz" | "audio-quiz" | "typing-challenge" | "sorting" | "classification" | "hotspot" | "puzzle-grid";
    topic: string;
    count: number;
    idPrefix: string;
    locale?: string | undefined;
    tags?: string[] | undefined;
    config?: Record<string, unknown> | undefined;
    batchSize?: number | undefined;
}>;
export type ActivitySpec = z.infer<typeof ActivitySpec>;
//# sourceMappingURL=activity-spec.d.ts.map