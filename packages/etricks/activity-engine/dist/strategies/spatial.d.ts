import { z } from "zod";
import type { ActivityStrategy } from "../types.js";
/**
 * The spatial family: word-search (find words on a letter grid), hotspot (tap the right regions of
 * an image) and puzzle-grid (arrange scrambled tiles into their solved positions). Each has a real,
 * deterministic layout step and grades one unit per target word / region / tile.
 */
export declare const WordSearchContent: z.ZodObject<{
    type: z.ZodLiteral<"word-search">;
    words: z.ZodArray<z.ZodString, "many">;
    /** Optional grid side. Defaults to fit the longest word with a little slack. */
    size: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "word-search";
    words: string[];
    size?: number | undefined;
}, {
    type: "word-search";
    words: string[];
    size?: number | undefined;
}>;
export type WordSearchContent = z.infer<typeof WordSearchContent>;
export interface WordPlacement {
    word: string;
    row: number;
    col: number;
    dir: "across" | "down";
}
export interface PreparedWordSearch {
    size: number;
    grid: string[][];
    placements: WordPlacement[];
    words: string[];
}
export interface WordSearchResponse {
    /** Words the player located. Only those actually in the puzzle count. */
    found: string[];
}
export declare const wordSearchStrategy: ActivityStrategy<WordSearchContent, PreparedWordSearch, WordSearchResponse>;
declare const Region: z.ZodObject<{
    label: z.ZodString;
    /** Normalised 0..1 bounding box on the image. */
    x: z.ZodNumber;
    y: z.ZodNumber;
    w: z.ZodNumber;
    h: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
}, {
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
}>;
export declare const HotspotContent: z.ZodObject<{
    type: z.ZodLiteral<"hotspot">;
    image: z.ZodObject<{
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
    prompt: z.ZodString;
    targets: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        /** Normalised 0..1 bounding box on the image. */
        x: z.ZodNumber;
        y: z.ZodNumber;
        w: z.ZodNumber;
        h: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        label: string;
        x: number;
        y: number;
        w: number;
        h: number;
    }, {
        label: string;
        x: number;
        y: number;
        w: number;
        h: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "hotspot";
    prompt: string;
    image: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    };
    targets: {
        label: string;
        x: number;
        y: number;
        w: number;
        h: number;
    }[];
}, {
    type: "hotspot";
    prompt: string;
    image: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    };
    targets: {
        label: string;
        x: number;
        y: number;
        w: number;
        h: number;
    }[];
}>;
export type HotspotContent = z.infer<typeof HotspotContent>;
export interface HotspotResponse {
    /** Normalised 0..1 points the player tapped. */
    points: {
        x: number;
        y: number;
    }[];
}
export declare const hotspotStrategy: ActivityStrategy<HotspotContent, {
    image: HotspotContent["image"];
    prompt: string;
    targets: z.infer<typeof Region>[];
}, HotspotResponse>;
export declare const PuzzleGridContent: z.ZodObject<{
    type: z.ZodLiteral<"puzzle-grid">;
    prompt: z.ZodOptional<z.ZodString>;
    rows: z.ZodNumber;
    cols: z.ZodNumber;
    /** Tiles in SOLVED order (length must equal rows×cols). Labels or image-slice ids. */
    tiles: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    type: "puzzle-grid";
    rows: number;
    cols: number;
    tiles: string[];
    prompt?: string | undefined;
}, {
    type: "puzzle-grid";
    rows: number;
    cols: number;
    tiles: string[];
    prompt?: string | undefined;
}>;
export type PuzzleGridContent = z.infer<typeof PuzzleGridContent>;
export interface PreparedPuzzleGrid {
    rows: number;
    cols: number;
    prompt?: string;
    /** Tiles in scrambled presentation order. */
    tiles: string[];
    /** originalIndex[presentedSlot] = the tile's solved position. */
    originalIndex: number[];
}
export interface PuzzleGridResponse {
    /** Presented tile indices in the order the player laid them into the grid. */
    arrangement: number[];
}
export declare const puzzleGridStrategy: ActivityStrategy<PuzzleGridContent, PreparedPuzzleGrid, PuzzleGridResponse>;
export {};
//# sourceMappingURL=spatial.d.ts.map