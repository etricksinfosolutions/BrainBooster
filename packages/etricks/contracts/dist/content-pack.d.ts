import { z } from "zod";
/**
 * CONTRACT #1 — ContentPack.
 *
 * A ContentPack is the atomic unit the platform manufactures and ships. Humans build
 * engines; AIOS fills packs; the CDN serves them; the app downloads and caches them.
 *
 * The envelope below is engine-agnostic. Each engine (quiz, memory, story...) owns the
 * shape of `payload` and composes its own concrete pack schema via `defineContentPack`.
 * This keeps the dependency arrow pointing one way: engines depend on contracts, never
 * the reverse.
 */
/**
 * The list of engines the platform ships. New engines are added here deliberately.
 *
 * `"activity"` is the Universal Activity Engine (ADR-0024): a single engine whose pack payload is a
 * discriminated union of ~15 configurable activity types (multiple-choice, memory-match, word-search,
 * …). It is the throughput engine — new games compose it by content + config, not code. The older
 * single-purpose ids (`quiz`, `memory`) remain for the reference game; new games use `activity`.
 */
export declare const EngineId: z.ZodEnum<["quiz", "memory", "puzzle", "board", "story", "language", "simulation", "activity"]>;
export type EngineId = z.infer<typeof EngineId>;
/**
 * ContentPackMeta — everything about a pack EXCEPT its payload.
 *
 * The app fetches meta first (small, cheap) to decide whether it already has the
 * content cached. Only on a miss does it download the full pack + verify `checksum`.
 */
export declare const ContentPackMeta: z.ZodObject<{
    /** Globally unique pack id, e.g. "brain-booster.quiz.general-knowledge.en". */
    packId: z.ZodString;
    /** Which game this pack belongs to. */
    gameId: z.ZodString;
    /** Which engine can interpret this pack's payload. */
    engine: z.ZodEnum<["quiz", "memory", "puzzle", "board", "story", "language", "simulation", "activity"]>;
    /** Semver of the pack CONTENT (bump when content changes, independent of the app). */
    version: z.ZodString;
    /** Content locale. One pack = one locale; localisation ships as sibling packs. */
    locale: z.ZodString;
    /** Schema version of the payload shape, so old apps can reject packs they can't read. */
    schemaVersion: z.ZodNumber;
    /** SHA-256 of the serialized payload — the app verifies this after download. */
    checksum: z.ZodString;
    /** Approximate uncompressed payload size in bytes, for download-budget decisions. */
    sizeBytes: z.ZodNumber;
    /** When this pack was published. */
    publishedAt: z.ZodString;
    /** Free-form, engine-agnostic tags for merchandising ("daily", "hard", "kids"). */
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    version: string;
    engine: "activity" | "language" | "quiz" | "memory" | "puzzle" | "board" | "story" | "simulation";
    gameId: string;
    publishedAt: string;
    locale: string;
    tags: string[];
    packId: string;
    schemaVersion: number;
    checksum: string;
    sizeBytes: number;
}, {
    version: string;
    engine: "activity" | "language" | "quiz" | "memory" | "puzzle" | "board" | "story" | "simulation";
    gameId: string;
    publishedAt: string;
    locale: string;
    packId: string;
    schemaVersion: number;
    checksum: string;
    sizeBytes: number;
    tags?: string[] | undefined;
}>;
export type ContentPackMeta = z.infer<typeof ContentPackMeta>;
/**
 * Compose a full, typed ContentPack schema for a given engine payload.
 *
 * @example
 *   export const QuizPack = defineContentPack(QuizPayload);
 *   type QuizPack = z.infer<typeof QuizPack>;
 */
export declare function defineContentPack<T extends z.ZodTypeAny>(payload: T): z.ZodObject<{
    /** Globally unique pack id, e.g. "brain-booster.quiz.general-knowledge.en". */
    packId: z.ZodString;
    /** Which game this pack belongs to. */
    gameId: z.ZodString;
    /** Which engine can interpret this pack's payload. */
    engine: z.ZodEnum<["quiz", "memory", "puzzle", "board", "story", "language", "simulation", "activity"]>;
    /** Semver of the pack CONTENT (bump when content changes, independent of the app). */
    version: z.ZodString;
    /** Content locale. One pack = one locale; localisation ships as sibling packs. */
    locale: z.ZodString;
    /** Schema version of the payload shape, so old apps can reject packs they can't read. */
    schemaVersion: z.ZodNumber;
    /** SHA-256 of the serialized payload — the app verifies this after download. */
    checksum: z.ZodString;
    /** Approximate uncompressed payload size in bytes, for download-budget decisions. */
    sizeBytes: z.ZodNumber;
    /** When this pack was published. */
    publishedAt: z.ZodString;
    /** Free-form, engine-agnostic tags for merchandising ("daily", "hard", "kids"). */
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
} & {
    payload: T;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    /** Globally unique pack id, e.g. "brain-booster.quiz.general-knowledge.en". */
    packId: z.ZodString;
    /** Which game this pack belongs to. */
    gameId: z.ZodString;
    /** Which engine can interpret this pack's payload. */
    engine: z.ZodEnum<["quiz", "memory", "puzzle", "board", "story", "language", "simulation", "activity"]>;
    /** Semver of the pack CONTENT (bump when content changes, independent of the app). */
    version: z.ZodString;
    /** Content locale. One pack = one locale; localisation ships as sibling packs. */
    locale: z.ZodString;
    /** Schema version of the payload shape, so old apps can reject packs they can't read. */
    schemaVersion: z.ZodNumber;
    /** SHA-256 of the serialized payload — the app verifies this after download. */
    checksum: z.ZodString;
    /** Approximate uncompressed payload size in bytes, for download-budget decisions. */
    sizeBytes: z.ZodNumber;
    /** When this pack was published. */
    publishedAt: z.ZodString;
    /** Free-form, engine-agnostic tags for merchandising ("daily", "hard", "kids"). */
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
} & {
    payload: T;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    /** Globally unique pack id, e.g. "brain-booster.quiz.general-knowledge.en". */
    packId: z.ZodString;
    /** Which game this pack belongs to. */
    gameId: z.ZodString;
    /** Which engine can interpret this pack's payload. */
    engine: z.ZodEnum<["quiz", "memory", "puzzle", "board", "story", "language", "simulation", "activity"]>;
    /** Semver of the pack CONTENT (bump when content changes, independent of the app). */
    version: z.ZodString;
    /** Content locale. One pack = one locale; localisation ships as sibling packs. */
    locale: z.ZodString;
    /** Schema version of the payload shape, so old apps can reject packs they can't read. */
    schemaVersion: z.ZodNumber;
    /** SHA-256 of the serialized payload — the app verifies this after download. */
    checksum: z.ZodString;
    /** Approximate uncompressed payload size in bytes, for download-budget decisions. */
    sizeBytes: z.ZodNumber;
    /** When this pack was published. */
    publishedAt: z.ZodString;
    /** Free-form, engine-agnostic tags for merchandising ("daily", "hard", "kids"). */
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
} & {
    payload: T;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
/** Generic pack with an unvalidated payload — useful for meta-only tooling / storage. */
export declare const AnyContentPack: z.ZodObject<{
    /** Globally unique pack id, e.g. "brain-booster.quiz.general-knowledge.en". */
    packId: z.ZodString;
    /** Which game this pack belongs to. */
    gameId: z.ZodString;
    /** Which engine can interpret this pack's payload. */
    engine: z.ZodEnum<["quiz", "memory", "puzzle", "board", "story", "language", "simulation", "activity"]>;
    /** Semver of the pack CONTENT (bump when content changes, independent of the app). */
    version: z.ZodString;
    /** Content locale. One pack = one locale; localisation ships as sibling packs. */
    locale: z.ZodString;
    /** Schema version of the payload shape, so old apps can reject packs they can't read. */
    schemaVersion: z.ZodNumber;
    /** SHA-256 of the serialized payload — the app verifies this after download. */
    checksum: z.ZodString;
    /** Approximate uncompressed payload size in bytes, for download-budget decisions. */
    sizeBytes: z.ZodNumber;
    /** When this pack was published. */
    publishedAt: z.ZodString;
    /** Free-form, engine-agnostic tags for merchandising ("daily", "hard", "kids"). */
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
} & {
    payload: z.ZodUnknown;
}, "strip", z.ZodTypeAny, {
    version: string;
    engine: "activity" | "language" | "quiz" | "memory" | "puzzle" | "board" | "story" | "simulation";
    gameId: string;
    publishedAt: string;
    locale: string;
    tags: string[];
    packId: string;
    schemaVersion: number;
    checksum: string;
    sizeBytes: number;
    payload?: unknown;
}, {
    version: string;
    engine: "activity" | "language" | "quiz" | "memory" | "puzzle" | "board" | "story" | "simulation";
    gameId: string;
    publishedAt: string;
    locale: string;
    packId: string;
    schemaVersion: number;
    checksum: string;
    sizeBytes: number;
    payload?: unknown;
    tags?: string[] | undefined;
}>;
export type AnyContentPack = z.infer<typeof AnyContentPack>;
//# sourceMappingURL=content-pack.d.ts.map