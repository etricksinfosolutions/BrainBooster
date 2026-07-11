import { z } from "zod";
import { AssetRef } from "@etricks/contracts";
import type { ActivityStrategy } from "../types.js";
/** Prepared form for every single-select activity — choices possibly shuffled, correct tracked. */
export interface PreparedChoice {
    prompt: string;
    choices: string[];
    correctIndex: number;
    explanation?: string;
    /** Present for image-quiz. */
    image?: z.infer<typeof AssetRef>;
    /** Present for audio-quiz. */
    audio?: z.infer<typeof AssetRef>;
}
export interface ChoiceResponse {
    choiceIndex: number;
}
export declare const MultipleChoiceContent: z.ZodEffects<z.ZodObject<{
    type: z.ZodLiteral<"multiple-choice">;
    prompt: z.ZodString;
    choices: z.ZodArray<z.ZodString, "many">;
    correctIndex: z.ZodNumber;
    explanation: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "multiple-choice";
    prompt: string;
    choices: string[];
    correctIndex: number;
    explanation?: string | undefined;
}, {
    type: "multiple-choice";
    prompt: string;
    choices: string[];
    correctIndex: number;
    explanation?: string | undefined;
}>, {
    type: "multiple-choice";
    prompt: string;
    choices: string[];
    correctIndex: number;
    explanation?: string | undefined;
}, {
    type: "multiple-choice";
    prompt: string;
    choices: string[];
    correctIndex: number;
    explanation?: string | undefined;
}>;
export type MultipleChoiceContent = z.infer<typeof MultipleChoiceContent>;
export declare const multipleChoiceStrategy: ActivityStrategy<MultipleChoiceContent, PreparedChoice, ChoiceResponse>;
export declare const TrueFalseContent: z.ZodObject<{
    type: z.ZodLiteral<"true-false">;
    statement: z.ZodString;
    answer: z.ZodBoolean;
    explanation: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "true-false";
    statement: string;
    answer: boolean;
    explanation?: string | undefined;
}, {
    type: "true-false";
    statement: string;
    answer: boolean;
    explanation?: string | undefined;
}>;
export type TrueFalseContent = z.infer<typeof TrueFalseContent>;
export interface TrueFalseResponse {
    value: boolean;
}
export declare const trueFalseStrategy: ActivityStrategy<TrueFalseContent, {
    statement: string;
    answer: boolean;
    explanation?: string;
}, TrueFalseResponse>;
export declare const ImageQuizContent: z.ZodEffects<z.ZodObject<{
    type: z.ZodLiteral<"image-quiz">;
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
    prompt: z.ZodOptional<z.ZodString>;
    choices: z.ZodArray<z.ZodString, "many">;
    correctIndex: z.ZodNumber;
    explanation: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "image-quiz";
    choices: string[];
    correctIndex: number;
    image: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    };
    prompt?: string | undefined;
    explanation?: string | undefined;
}, {
    type: "image-quiz";
    choices: string[];
    correctIndex: number;
    image: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    };
    prompt?: string | undefined;
    explanation?: string | undefined;
}>, {
    type: "image-quiz";
    choices: string[];
    correctIndex: number;
    image: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    };
    prompt?: string | undefined;
    explanation?: string | undefined;
}, {
    type: "image-quiz";
    choices: string[];
    correctIndex: number;
    image: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    };
    prompt?: string | undefined;
    explanation?: string | undefined;
}>;
export type ImageQuizContent = z.infer<typeof ImageQuizContent>;
export declare const imageQuizStrategy: ActivityStrategy<ImageQuizContent, PreparedChoice, ChoiceResponse>;
export declare const AudioQuizContent: z.ZodEffects<z.ZodObject<{
    type: z.ZodLiteral<"audio-quiz">;
    audio: z.ZodObject<{
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
    prompt: z.ZodOptional<z.ZodString>;
    choices: z.ZodArray<z.ZodString, "many">;
    correctIndex: z.ZodNumber;
    explanation: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "audio-quiz";
    choices: string[];
    correctIndex: number;
    audio: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    };
    prompt?: string | undefined;
    explanation?: string | undefined;
}, {
    type: "audio-quiz";
    choices: string[];
    correctIndex: number;
    audio: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    };
    prompt?: string | undefined;
    explanation?: string | undefined;
}>, {
    type: "audio-quiz";
    choices: string[];
    correctIndex: number;
    audio: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    };
    prompt?: string | undefined;
    explanation?: string | undefined;
}, {
    type: "audio-quiz";
    choices: string[];
    correctIndex: number;
    audio: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    };
    prompt?: string | undefined;
    explanation?: string | undefined;
}>;
export type AudioQuizContent = z.infer<typeof AudioQuizContent>;
export declare const audioQuizStrategy: ActivityStrategy<AudioQuizContent, PreparedChoice, ChoiceResponse>;
//# sourceMappingURL=choice.d.ts.map