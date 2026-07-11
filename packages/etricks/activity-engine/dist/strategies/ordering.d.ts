import { z } from "zod";
import type { ActivityStrategy } from "../types.js";
export declare const SequenceOrderingContent: z.ZodObject<{
    type: z.ZodLiteral<"sequence-ordering">;
    prompt: z.ZodOptional<z.ZodString>;
    /** Items in their CORRECT order. The engine scrambles them for presentation. */
    items: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    type: "sequence-ordering";
    items: string[];
    prompt?: string | undefined;
}, {
    type: "sequence-ordering";
    items: string[];
    prompt?: string | undefined;
}>;
export type SequenceOrderingContent = z.infer<typeof SequenceOrderingContent>;
export interface OrderingResponse {
    /** The presented indices, in the order the player arranged them. */
    order: number[];
}
/** Presented item i is `originalIndex[i]` in the authored (correct) list. */
export interface PreparedOrdering {
    prompt?: string;
    items: string[];
    originalIndex: number[];
}
export declare const sequenceOrderingStrategy: ActivityStrategy<SequenceOrderingContent, PreparedOrdering, OrderingResponse>;
export declare const SortingContent: z.ZodObject<{
    type: z.ZodLiteral<"sorting">;
    prompt: z.ZodOptional<z.ZodString>;
    /** Ascending sort by `value` is the correct order. Labels are what the player sees. */
    items: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        label: string;
    }, {
        value: number;
        label: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "sorting";
    items: {
        value: number;
        label: string;
    }[];
    prompt?: string | undefined;
}, {
    type: "sorting";
    items: {
        value: number;
        label: string;
    }[];
    prompt?: string | undefined;
}>;
export type SortingContent = z.infer<typeof SortingContent>;
export interface PreparedSorting {
    prompt?: string;
    items: {
        label: string;
        value: number;
    }[];
    /** goalOrder[slot] = presented index that belongs in this slot when sorted ascending. */
    goalOrder: number[];
}
export declare const sortingStrategy: ActivityStrategy<SortingContent, PreparedSorting, OrderingResponse>;
//# sourceMappingURL=ordering.d.ts.map