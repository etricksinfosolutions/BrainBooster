import { z } from "zod";
/**
 * GenerationSpec — the manufacturing order.
 *
 * This is what a human (or an automated merchandising job) hands to AIOS to produce a
 * quiz pack. Adding a second quiz-based game — Finance Master, a language quiz — is a new
 * spec, not new code. That is the platform thesis in one type.
 */
export declare const GenerationSpec: z.ZodObject<{
    /** Which game this content is for, e.g. "brain-booster". */
    gameId: z.ZodString;
    /** Human topic the model writes to, e.g. "general knowledge", "personal finance". */
    topic: z.ZodString;
    /** Content locale (matches the pack's locale). */
    locale: z.ZodDefault<z.ZodString>;
    /** How many quality-passing questions we want in the finished pack. */
    count: z.ZodNumber;
    /**
     * Optional difficulty weighting, e.g. { easy: 3, medium: 5, hard: 2 }. Steers the
     * prompt; the quality gate does not reject on difficulty (the engine selects on it).
     */
    difficultyMix: z.ZodOptional<z.ZodRecord<z.ZodEnum<["easy", "medium", "hard"]>, z.ZodNumber>>;
    /** Seed tags applied to every generated item ("science", "history"). */
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Prefix for generated item ids, e.g. "bb-gk" → "bb-gk-0001". */
    idPrefix: z.ZodString;
    /** How many items to request per model call. Defaults to min(count, 20). */
    batchSize: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    gameId: string;
    topic: string;
    locale: string;
    count: number;
    tags: string[];
    idPrefix: string;
    batchSize?: number | undefined;
    difficultyMix?: Partial<Record<"easy" | "medium" | "hard", number>> | undefined;
}, {
    gameId: string;
    topic: string;
    count: number;
    idPrefix: string;
    locale?: string | undefined;
    tags?: string[] | undefined;
    batchSize?: number | undefined;
    difficultyMix?: Partial<Record<"easy" | "medium" | "hard", number>> | undefined;
}>;
export type GenerationSpec = z.infer<typeof GenerationSpec>;
/**
 * Why a single generated item was rejected by the quality gate. Shared across factories:
 * quiz reasons + the memory factory's label dedup. New factories add reasons here so every
 * manufacturing run reports rejections in one shape.
 */
export type RejectionReason = "invalid-shape" | "duplicate-prompt" | "duplicate-choices" | "answer-out-of-range" | "duplicate-label";
export interface RejectedItem {
    reason: RejectionReason;
    /** The prompt text (if we could read it) — for human review of what got dropped. */
    prompt?: string;
}
/** A full accounting of one manufacturing run — never silently drop coverage. */
export interface GenerationReport {
    requested: number;
    accepted: number;
    /** Model calls made to reach `accepted` (or give up). */
    rounds: number;
    rejected: RejectedItem[];
    /** True if we hit the round cap before reaching `requested`. */
    shortfall: boolean;
}
//# sourceMappingURL=spec.d.ts.map