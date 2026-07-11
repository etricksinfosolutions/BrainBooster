import { z } from "zod";
/**
 * The Quiz Engine's content contract.
 *
 * This is the shape AIOS must produce to fill a quiz pack. It is intentionally small:
 * a question, some choices, the right answer, and metadata the engine can select on.
 * Everything AIOS generates for any quiz-based game validates against this.
 */
export declare const Difficulty: z.ZodEnum<["easy", "medium", "hard"]>;
export type Difficulty = z.infer<typeof Difficulty>;
export declare const QuizItem: z.ZodEffects<z.ZodObject<{
    /** Stable id, unique within the pack. Used for progress + dedup. */
    id: z.ZodString;
    /** The question text. */
    prompt: z.ZodString;
    /** 2–6 answer choices. */
    choices: z.ZodArray<z.ZodString, "many">;
    /** Index into `choices` of the correct answer. */
    correctIndex: z.ZodNumber;
    /** Optional teaching moment shown after answering. */
    explanation: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodDefault<z.ZodEnum<["easy", "medium", "hard"]>>;
    /** Topic tags for selection/merchandising ("history", "algebra"). */
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    prompt: string;
    choices: string[];
    correctIndex: number;
    difficulty: "easy" | "medium" | "hard";
    tags: string[];
    explanation?: string | undefined;
}, {
    id: string;
    prompt: string;
    choices: string[];
    correctIndex: number;
    explanation?: string | undefined;
    difficulty?: "easy" | "medium" | "hard" | undefined;
    tags?: string[] | undefined;
}>, {
    id: string;
    prompt: string;
    choices: string[];
    correctIndex: number;
    difficulty: "easy" | "medium" | "hard";
    tags: string[];
    explanation?: string | undefined;
}, {
    id: string;
    prompt: string;
    choices: string[];
    correctIndex: number;
    explanation?: string | undefined;
    difficulty?: "easy" | "medium" | "hard" | undefined;
    tags?: string[] | undefined;
}>;
export type QuizItem = z.infer<typeof QuizItem>;
/** The payload carried inside a quiz ContentPack. */
export declare const QuizPayload: z.ZodObject<{
    items: z.ZodArray<z.ZodEffects<z.ZodObject<{
        /** Stable id, unique within the pack. Used for progress + dedup. */
        id: z.ZodString;
        /** The question text. */
        prompt: z.ZodString;
        /** 2–6 answer choices. */
        choices: z.ZodArray<z.ZodString, "many">;
        /** Index into `choices` of the correct answer. */
        correctIndex: z.ZodNumber;
        /** Optional teaching moment shown after answering. */
        explanation: z.ZodOptional<z.ZodString>;
        difficulty: z.ZodDefault<z.ZodEnum<["easy", "medium", "hard"]>>;
        /** Topic tags for selection/merchandising ("history", "algebra"). */
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        prompt: string;
        choices: string[];
        correctIndex: number;
        difficulty: "easy" | "medium" | "hard";
        tags: string[];
        explanation?: string | undefined;
    }, {
        id: string;
        prompt: string;
        choices: string[];
        correctIndex: number;
        explanation?: string | undefined;
        difficulty?: "easy" | "medium" | "hard" | undefined;
        tags?: string[] | undefined;
    }>, {
        id: string;
        prompt: string;
        choices: string[];
        correctIndex: number;
        difficulty: "easy" | "medium" | "hard";
        tags: string[];
        explanation?: string | undefined;
    }, {
        id: string;
        prompt: string;
        choices: string[];
        correctIndex: number;
        explanation?: string | undefined;
        difficulty?: "easy" | "medium" | "hard" | undefined;
        tags?: string[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        id: string;
        prompt: string;
        choices: string[];
        correctIndex: number;
        difficulty: "easy" | "medium" | "hard";
        tags: string[];
        explanation?: string | undefined;
    }[];
}, {
    items: {
        id: string;
        prompt: string;
        choices: string[];
        correctIndex: number;
        explanation?: string | undefined;
        difficulty?: "easy" | "medium" | "hard" | undefined;
        tags?: string[] | undefined;
    }[];
}>;
export type QuizPayload = z.infer<typeof QuizPayload>;
/** The full, typed quiz ContentPack = envelope (contracts) + quiz payload. */
export declare const QuizPack: z.ZodObject<{
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
        items: z.ZodArray<z.ZodEffects<z.ZodObject<{
            /** Stable id, unique within the pack. Used for progress + dedup. */
            id: z.ZodString;
            /** The question text. */
            prompt: z.ZodString;
            /** 2–6 answer choices. */
            choices: z.ZodArray<z.ZodString, "many">;
            /** Index into `choices` of the correct answer. */
            correctIndex: z.ZodNumber;
            /** Optional teaching moment shown after answering. */
            explanation: z.ZodOptional<z.ZodString>;
            difficulty: z.ZodDefault<z.ZodEnum<["easy", "medium", "hard"]>>;
            /** Topic tags for selection/merchandising ("history", "algebra"). */
            tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            prompt: string;
            choices: string[];
            correctIndex: number;
            difficulty: "easy" | "medium" | "hard";
            tags: string[];
            explanation?: string | undefined;
        }, {
            id: string;
            prompt: string;
            choices: string[];
            correctIndex: number;
            explanation?: string | undefined;
            difficulty?: "easy" | "medium" | "hard" | undefined;
            tags?: string[] | undefined;
        }>, {
            id: string;
            prompt: string;
            choices: string[];
            correctIndex: number;
            difficulty: "easy" | "medium" | "hard";
            tags: string[];
            explanation?: string | undefined;
        }, {
            id: string;
            prompt: string;
            choices: string[];
            correctIndex: number;
            explanation?: string | undefined;
            difficulty?: "easy" | "medium" | "hard" | undefined;
            tags?: string[] | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        items: {
            id: string;
            prompt: string;
            choices: string[];
            correctIndex: number;
            difficulty: "easy" | "medium" | "hard";
            tags: string[];
            explanation?: string | undefined;
        }[];
    }, {
        items: {
            id: string;
            prompt: string;
            choices: string[];
            correctIndex: number;
            explanation?: string | undefined;
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
        items: {
            id: string;
            prompt: string;
            choices: string[];
            correctIndex: number;
            difficulty: "easy" | "medium" | "hard";
            tags: string[];
            explanation?: string | undefined;
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
        items: {
            id: string;
            prompt: string;
            choices: string[];
            correctIndex: number;
            explanation?: string | undefined;
            difficulty?: "easy" | "medium" | "hard" | undefined;
            tags?: string[] | undefined;
        }[];
    };
    tags?: string[] | undefined;
}>;
export type QuizPack = z.infer<typeof QuizPack>;
//# sourceMappingURL=schema.d.ts.map