import { z } from "zod";
import { defineContentPack } from "@etricks/contracts";
/**
 * The Quiz Engine's content contract.
 *
 * This is the shape AIOS must produce to fill a quiz pack. It is intentionally small:
 * a question, some choices, the right answer, and metadata the engine can select on.
 * Everything AIOS generates for any quiz-based game validates against this.
 */
export const Difficulty = z.enum(["easy", "medium", "hard"]);
export const QuizItem = z
    .object({
    /** Stable id, unique within the pack. Used for progress + dedup. */
    id: z.string().min(1),
    /** The question text. */
    prompt: z.string().min(1),
    /** 2–6 answer choices. */
    choices: z.array(z.string().min(1)).min(2).max(6),
    /** Index into `choices` of the correct answer. */
    correctIndex: z.number().int().nonnegative(),
    /** Optional teaching moment shown after answering. */
    explanation: z.string().optional(),
    difficulty: Difficulty.default("medium"),
    /** Topic tags for selection/merchandising ("history", "algebra"). */
    tags: z.array(z.string()).default([]),
})
    .refine((q) => q.correctIndex < q.choices.length, {
    message: "correctIndex must point at an existing choice",
    path: ["correctIndex"],
});
/** The payload carried inside a quiz ContentPack. */
export const QuizPayload = z.object({
    items: z.array(QuizItem).min(1),
});
/** The full, typed quiz ContentPack = envelope (contracts) + quiz payload. */
export const QuizPack = defineContentPack(QuizPayload);
//# sourceMappingURL=schema.js.map