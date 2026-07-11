import { z } from "zod";
/**
 * The Memory Engine's content contract — the platform's first NON-TEXT payload.
 *
 * A quiz item is text-in / text-out. A memory pair is a themed concept with an **image
 * dependency**: the whole reason this engine exists is to prove AIOS can manufacture content
 * that references assets, and that `defineContentPack` carries a payload shaped nothing like a
 * quiz. The pack ships the *pairs*; the engine lays them onto a board at play time.
 */
export declare const MemoryDifficulty: z.ZodEnum<["easy", "medium", "hard"]>;
export type MemoryDifficulty = z.infer<typeof MemoryDifficulty>;
/**
 * One matchable concept. On the board it becomes TWO identical cards the player must pair.
 * `face` is an image AssetRef — resolvable today, registry-resolved later (see ADR-0011).
 */
export declare const MemoryPair: z.ZodEffects<z.ZodObject<{
    /** Stable id, unique within the pack. Used for progress + dedup + board pairing. */
    id: z.ZodString;
    /** Human label for the concept ("Lion"). Shown for accessibility / non-image modes. */
    label: z.ZodString;
    /** The image shown on the card face — the asset this content depends on. */
    face: z.ZodObject<{
        assetId: z.ZodString;
        kind: z.ZodEnum<["image", "audio", "video", "font", "lottie"]>;
        uri: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    }, {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    }>;
    difficulty: z.ZodDefault<z.ZodEnum<["easy", "medium", "hard"]>>;
    /** Theme/selection tags ("animals", "safari"). */
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    label: string;
    face: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    };
    difficulty: "easy" | "medium" | "hard";
    tags: string[];
}, {
    id: string;
    label: string;
    face: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    };
    difficulty?: "easy" | "medium" | "hard" | undefined;
    tags?: string[] | undefined;
}>, {
    id: string;
    label: string;
    face: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    };
    difficulty: "easy" | "medium" | "hard";
    tags: string[];
}, {
    id: string;
    label: string;
    face: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    };
    difficulty?: "easy" | "medium" | "hard" | undefined;
    tags?: string[] | undefined;
}>;
export type MemoryPair = z.infer<typeof MemoryPair>;
/** The payload carried inside a memory ContentPack. */
export declare const MemoryPayload: z.ZodObject<{
    /** The pack's theme ("Animals", "Fruits", "Countries"). */
    theme: z.ZodString;
    /** At least two pairs — a board needs something to match. */
    pairs: z.ZodArray<z.ZodEffects<z.ZodObject<{
        /** Stable id, unique within the pack. Used for progress + dedup + board pairing. */
        id: z.ZodString;
        /** Human label for the concept ("Lion"). Shown for accessibility / non-image modes. */
        label: z.ZodString;
        /** The image shown on the card face — the asset this content depends on. */
        face: z.ZodObject<{
            assetId: z.ZodString;
            kind: z.ZodEnum<["image", "audio", "video", "font", "lottie"]>;
            uri: z.ZodString;
            alt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        }, {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        }>;
        difficulty: z.ZodDefault<z.ZodEnum<["easy", "medium", "hard"]>>;
        /** Theme/selection tags ("animals", "safari"). */
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        label: string;
        face: {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
        difficulty: "easy" | "medium" | "hard";
        tags: string[];
    }, {
        id: string;
        label: string;
        face: {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
        difficulty?: "easy" | "medium" | "hard" | undefined;
        tags?: string[] | undefined;
    }>, {
        id: string;
        label: string;
        face: {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
        difficulty: "easy" | "medium" | "hard";
        tags: string[];
    }, {
        id: string;
        label: string;
        face: {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
        difficulty?: "easy" | "medium" | "hard" | undefined;
        tags?: string[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    theme: string;
    pairs: {
        id: string;
        label: string;
        face: {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
        difficulty: "easy" | "medium" | "hard";
        tags: string[];
    }[];
}, {
    theme: string;
    pairs: {
        id: string;
        label: string;
        face: {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
        difficulty?: "easy" | "medium" | "hard" | undefined;
        tags?: string[] | undefined;
    }[];
}>;
export type MemoryPayload = z.infer<typeof MemoryPayload>;
/** The full, typed memory ContentPack = envelope (contracts) + memory payload. */
export declare const MemoryPack: z.ZodObject<{
    packId: z.ZodString;
    gameId: z.ZodString;
    engine: z.ZodEnum<["quiz", "memory", "puzzle", "board", "story", "language", "simulation", "activity"]>;
    version: z.ZodString;
    locale: z.ZodString;
    schemaVersion: z.ZodNumber;
    checksum: z.ZodString;
    sizeBytes: z.ZodNumber;
    publishedAt: z.ZodString;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
} & {
    payload: z.ZodObject<{
        /** The pack's theme ("Animals", "Fruits", "Countries"). */
        theme: z.ZodString;
        /** At least two pairs — a board needs something to match. */
        pairs: z.ZodArray<z.ZodEffects<z.ZodObject<{
            /** Stable id, unique within the pack. Used for progress + dedup + board pairing. */
            id: z.ZodString;
            /** Human label for the concept ("Lion"). Shown for accessibility / non-image modes. */
            label: z.ZodString;
            /** The image shown on the card face — the asset this content depends on. */
            face: z.ZodObject<{
                assetId: z.ZodString;
                kind: z.ZodEnum<["image", "audio", "video", "font", "lottie"]>;
                uri: z.ZodString;
                alt: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                assetId: string;
                kind: "image" | "audio" | "video" | "font" | "lottie";
                uri: string;
                alt?: string | undefined;
            }, {
                assetId: string;
                kind: "image" | "audio" | "video" | "font" | "lottie";
                uri: string;
                alt?: string | undefined;
            }>;
            difficulty: z.ZodDefault<z.ZodEnum<["easy", "medium", "hard"]>>;
            /** Theme/selection tags ("animals", "safari"). */
            tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            label: string;
            face: {
                assetId: string;
                kind: "image" | "audio" | "video" | "font" | "lottie";
                uri: string;
                alt?: string | undefined;
            };
            difficulty: "easy" | "medium" | "hard";
            tags: string[];
        }, {
            id: string;
            label: string;
            face: {
                assetId: string;
                kind: "image" | "audio" | "video" | "font" | "lottie";
                uri: string;
                alt?: string | undefined;
            };
            difficulty?: "easy" | "medium" | "hard" | undefined;
            tags?: string[] | undefined;
        }>, {
            id: string;
            label: string;
            face: {
                assetId: string;
                kind: "image" | "audio" | "video" | "font" | "lottie";
                uri: string;
                alt?: string | undefined;
            };
            difficulty: "easy" | "medium" | "hard";
            tags: string[];
        }, {
            id: string;
            label: string;
            face: {
                assetId: string;
                kind: "image" | "audio" | "video" | "font" | "lottie";
                uri: string;
                alt?: string | undefined;
            };
            difficulty?: "easy" | "medium" | "hard" | undefined;
            tags?: string[] | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        theme: string;
        pairs: {
            id: string;
            label: string;
            face: {
                assetId: string;
                kind: "image" | "audio" | "video" | "font" | "lottie";
                uri: string;
                alt?: string | undefined;
            };
            difficulty: "easy" | "medium" | "hard";
            tags: string[];
        }[];
    }, {
        theme: string;
        pairs: {
            id: string;
            label: string;
            face: {
                assetId: string;
                kind: "image" | "audio" | "video" | "font" | "lottie";
                uri: string;
                alt?: string | undefined;
            };
            difficulty?: "easy" | "medium" | "hard" | undefined;
            tags?: string[] | undefined;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    tags: string[];
    packId: string;
    gameId: string;
    engine: "quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation" | "activity";
    version: string;
    locale: string;
    schemaVersion: number;
    checksum: string;
    sizeBytes: number;
    publishedAt: string;
    payload: {
        theme: string;
        pairs: {
            id: string;
            label: string;
            face: {
                assetId: string;
                kind: "image" | "audio" | "video" | "font" | "lottie";
                uri: string;
                alt?: string | undefined;
            };
            difficulty: "easy" | "medium" | "hard";
            tags: string[];
        }[];
    };
}, {
    packId: string;
    gameId: string;
    engine: "quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation" | "activity";
    version: string;
    locale: string;
    schemaVersion: number;
    checksum: string;
    sizeBytes: number;
    publishedAt: string;
    payload: {
        theme: string;
        pairs: {
            id: string;
            label: string;
            face: {
                assetId: string;
                kind: "image" | "audio" | "video" | "font" | "lottie";
                uri: string;
                alt?: string | undefined;
            };
            difficulty?: "easy" | "medium" | "hard" | undefined;
            tags?: string[] | undefined;
        }[];
    };
    tags?: string[] | undefined;
}>;
export type MemoryPack = z.infer<typeof MemoryPack>;
//# sourceMappingURL=schema.d.ts.map