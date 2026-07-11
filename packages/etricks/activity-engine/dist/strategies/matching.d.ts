import { z } from "zod";
import type { ActivityStrategy } from "../types.js";
/**
 * The matching family: memory-match (flip cards to find pairs), drag-drop-match (connect left↔right)
 * and classification (drop items into categories). All three grade a mapping the player produces —
 * one unit per pair/item correctly associated.
 */
/** A card face is either text or an image asset — the same shape the memory engine established. */
declare const Face: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
}>]>;
export declare const MemoryMatchContent: z.ZodObject<{
    type: z.ZodLiteral<"memory-match">;
    /** Each pair yields two cards the player must find. `a`/`b` may be text or images. */
    pairs: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        a: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
        }>]>;
        b: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
        }>]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        a: string | {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
        b: string | {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
    }, {
        id: string;
        a: string | {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
        b: string | {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "memory-match";
    pairs: {
        id: string;
        a: string | {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
        b: string | {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
    }[];
}, {
    type: "memory-match";
    pairs: {
        id: string;
        a: string | {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
        b: string | {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
    }[];
}>;
export type MemoryMatchContent = z.infer<typeof MemoryMatchContent>;
export interface MemoryCard {
    /** Stable card id, unique in the board. */
    cardId: string;
    /** The pair this card belongs to — its twin shares the same `pairId`. */
    pairId: string;
    face: z.infer<typeof Face>;
}
export interface MemoryResponse {
    /** Pair ids the player successfully matched. */
    matched: string[];
}
export declare const memoryMatchStrategy: ActivityStrategy<MemoryMatchContent, {
    cards: MemoryCard[];
    pairCount: number;
}, MemoryResponse>;
export declare const DragDropMatchContent: z.ZodObject<{
    type: z.ZodLiteral<"drag-drop-match">;
    prompt: z.ZodOptional<z.ZodString>;
    /** Correct associations. Lefts are shown in order; rights are shuffled for the player. */
    pairs: z.ZodArray<z.ZodObject<{
        left: z.ZodString;
        right: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        left: string;
        right: string;
    }, {
        left: string;
        right: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "drag-drop-match";
    pairs: {
        left: string;
        right: string;
    }[];
    prompt?: string | undefined;
}, {
    type: "drag-drop-match";
    pairs: {
        left: string;
        right: string;
    }[];
    prompt?: string | undefined;
}>;
export type DragDropMatchContent = z.infer<typeof DragDropMatchContent>;
export interface DragDropResponse {
    /** For each left (in order), the index of the presented right the player connected to it. */
    mapping: number[];
}
export interface PreparedDragDrop {
    prompt?: string;
    lefts: string[];
    rights: string[];
    /** correctRight[leftIndex] = index into presented `rights` that is the right answer. */
    correctRight: number[];
}
export declare const dragDropMatchStrategy: ActivityStrategy<DragDropMatchContent, PreparedDragDrop, DragDropResponse>;
export declare const ClassificationContent: z.ZodObject<{
    type: z.ZodLiteral<"classification">;
    prompt: z.ZodOptional<z.ZodString>;
    categories: z.ZodArray<z.ZodString, "many">;
    /** Each item belongs in exactly one category (by name; must appear in `categories`). */
    items: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        category: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        label: string;
        category: string;
    }, {
        label: string;
        category: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "classification";
    items: {
        label: string;
        category: string;
    }[];
    categories: string[];
    prompt?: string | undefined;
}, {
    type: "classification";
    items: {
        label: string;
        category: string;
    }[];
    categories: string[];
    prompt?: string | undefined;
}>;
export type ClassificationContent = z.infer<typeof ClassificationContent>;
export interface ClassificationResponse {
    /** For each presented item (in order), the index into `categories` the player chose. */
    assignments: number[];
}
export interface PreparedClassification {
    prompt?: string;
    categories: string[];
    items: {
        label: string;
        correctCategory: number;
    }[];
}
export declare const classificationStrategy: ActivityStrategy<ClassificationContent, PreparedClassification, ClassificationResponse>;
export {};
//# sourceMappingURL=matching.d.ts.map