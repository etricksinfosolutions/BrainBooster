import { z } from "zod";
import type { ActivityStrategy } from "../types.js";
export declare const FlashCardsContent: z.ZodObject<{
    type: z.ZodLiteral<"flash-cards">;
    cards: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        front: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
        back: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
        front: string | {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
        back: string | {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
    }, {
        id: string;
        front: string | {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
        back: string | {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "flash-cards";
    cards: {
        id: string;
        front: string | {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
        back: string | {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
    }[];
}, {
    type: "flash-cards";
    cards: {
        id: string;
        front: string | {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
        back: string | {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        };
    }[];
}>;
export type FlashCardsContent = z.infer<typeof FlashCardsContent>;
export interface FlashCardsResponse {
    /** Card ids the player marked as "known". */
    known: string[];
}
export declare const flashCardsStrategy: ActivityStrategy<FlashCardsContent, {
    cards: FlashCardsContent["cards"];
}, FlashCardsResponse>;
//# sourceMappingURL=study.d.ts.map