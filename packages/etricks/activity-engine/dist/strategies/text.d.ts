import { z } from "zod";
import type { ActivityStrategy } from "../types.js";
declare const Blank: z.ZodObject<{
    /** Accepted answers for this blank; the player's input must match one. */
    answers: z.ZodArray<z.ZodString, "many">;
    caseSensitive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    answers: string[];
    caseSensitive: boolean;
}, {
    answers: string[];
    caseSensitive?: boolean | undefined;
}>;
export declare const FillBlankContent: z.ZodObject<{
    type: z.ZodLiteral<"fill-blank">;
    /**
     * The sentence with `{{}}` marking each blank, e.g. "The capital of France is {{}}.".
     * The number of `{{}}` markers must equal `blanks.length`.
     */
    template: z.ZodString;
    blanks: z.ZodArray<z.ZodObject<{
        /** Accepted answers for this blank; the player's input must match one. */
        answers: z.ZodArray<z.ZodString, "many">;
        caseSensitive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        answers: string[];
        caseSensitive: boolean;
    }, {
        answers: string[];
        caseSensitive?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "fill-blank";
    template: string;
    blanks: {
        answers: string[];
        caseSensitive: boolean;
    }[];
}, {
    type: "fill-blank";
    template: string;
    blanks: {
        answers: string[];
        caseSensitive?: boolean | undefined;
    }[];
}>;
export type FillBlankContent = z.infer<typeof FillBlankContent>;
export interface FillBlankResponse {
    /** One typed value per blank, in order. */
    values: string[];
}
export declare const fillBlankStrategy: ActivityStrategy<FillBlankContent, {
    segments: string[];
    blanks: z.infer<typeof Blank>[];
}, FillBlankResponse>;
export declare const TypingChallengeContent: z.ZodObject<{
    type: z.ZodLiteral<"typing-challenge">;
    /** The exact text the player must reproduce. */
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "typing-challenge";
    text: string;
}, {
    type: "typing-challenge";
    text: string;
}>;
export type TypingChallengeContent = z.infer<typeof TypingChallengeContent>;
export interface TypingResponse {
    typed: string;
}
export declare const typingChallengeStrategy: ActivityStrategy<TypingChallengeContent, {
    text: string;
}, TypingResponse>;
export {};
//# sourceMappingURL=text.d.ts.map