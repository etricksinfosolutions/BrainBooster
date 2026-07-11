import { z } from "zod";
/**
 * The Universal Activity Engine's content contract.
 *
 * `ActivityContent` is the discriminated union of every activity type's authored content — the
 * exact shape AIOS must produce and the engine can play. An `Activity` pairs one content block
 * with its (optional) config; an `ActivityPayload` is the list carried inside an `activity`
 * ContentPack. This is what makes a game "configuration + content": the game ships a pack of these
 * and the engine does the rest. New activity types extend the union by adding their schema below,
 * mirroring the strategy registry.
 */
/** The `type` field discriminates which content shape (and strategy) applies. */
export declare const ActivityContent: z.ZodUnion<[z.ZodEffects<z.ZodObject<{
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
}>, z.ZodObject<{
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
}>, z.ZodObject<{
    type: z.ZodLiteral<"fill-blank">;
    template: z.ZodString;
    blanks: z.ZodArray<z.ZodObject<{
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
}>, z.ZodObject<{
    type: z.ZodLiteral<"word-search">;
    words: z.ZodArray<z.ZodString, "many">;
    size: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "word-search";
    words: string[];
    size?: number | undefined;
}, {
    type: "word-search";
    words: string[];
    size?: number | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"memory-match">;
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
}>, z.ZodObject<{
    type: z.ZodLiteral<"sequence-ordering">;
    prompt: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    type: "sequence-ordering";
    items: string[];
    prompt?: string | undefined;
}, {
    type: "sequence-ordering";
    items: string[];
    prompt?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"drag-drop-match">;
    prompt: z.ZodOptional<z.ZodString>;
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
}>, z.ZodObject<{
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
}>, z.ZodEffects<z.ZodObject<{
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
}>, z.ZodEffects<z.ZodObject<{
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
}>, z.ZodObject<{
    type: z.ZodLiteral<"typing-challenge">;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "typing-challenge";
    text: string;
}, {
    type: "typing-challenge";
    text: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"sorting">;
    prompt: z.ZodOptional<z.ZodString>;
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
}>, z.ZodObject<{
    type: z.ZodLiteral<"classification">;
    prompt: z.ZodOptional<z.ZodString>;
    categories: z.ZodArray<z.ZodString, "many">;
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
}>, z.ZodObject<{
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
}>, z.ZodObject<{
    type: z.ZodLiteral<"puzzle-grid">;
    prompt: z.ZodOptional<z.ZodString>;
    rows: z.ZodNumber;
    cols: z.ZodNumber;
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
}>]>;
export type ActivityContent = z.infer<typeof ActivityContent>;
/** One authored activity: a stable id, its content, and the config it plays under. */
export declare const Activity: z.ZodObject<{
    /** Stable id, unique within the pack — used for progress, analytics, and level references. */
    id: z.ZodString;
    /** Optional authoring metadata for selection/merchandising (topic, world, "boss"). */
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Partial config; unspecified fields fall back to DEFAULT_CONFIG at play time. */
    config: z.ZodOptional<z.ZodObject<{
        timeLimitMs: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        lives: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        hints: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        shuffle: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        difficulty: z.ZodOptional<z.ZodDefault<z.ZodEnum<["easy", "medium", "hard"]>>>;
        scoring: z.ZodOptional<z.ZodDefault<z.ZodObject<{
            perCorrect: z.ZodDefault<z.ZodNumber>;
            perWrong: z.ZodDefault<z.ZodNumber>;
            speed: z.ZodOptional<z.ZodObject<{
                maxBonus: z.ZodNumber;
                windowMs: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                maxBonus: number;
                windowMs: number;
            }, {
                maxBonus: number;
                windowMs: number;
            }>>;
        }, "strip", z.ZodTypeAny, {
            perCorrect: number;
            perWrong: number;
            speed?: {
                maxBonus: number;
                windowMs: number;
            } | undefined;
        }, {
            perCorrect?: number | undefined;
            perWrong?: number | undefined;
            speed?: {
                maxBonus: number;
                windowMs: number;
            } | undefined;
        }>>>;
        passThreshold: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        animations: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        accessibility: z.ZodOptional<z.ZodDefault<z.ZodObject<{
            reducedMotion: z.ZodDefault<z.ZodBoolean>;
            highContrast: z.ZodDefault<z.ZodBoolean>;
            captions: z.ZodDefault<z.ZodBoolean>;
            extraTimeFactor: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            reducedMotion: boolean;
            highContrast: boolean;
            captions: boolean;
            extraTimeFactor: number;
        }, {
            reducedMotion?: boolean | undefined;
            highContrast?: boolean | undefined;
            captions?: boolean | undefined;
            extraTimeFactor?: number | undefined;
        }>>>;
        locale: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        timeLimitMs?: number | undefined;
        lives?: number | undefined;
        hints?: number | undefined;
        shuffle?: boolean | undefined;
        difficulty?: "easy" | "medium" | "hard" | undefined;
        scoring?: {
            perCorrect: number;
            perWrong: number;
            speed?: {
                maxBonus: number;
                windowMs: number;
            } | undefined;
        } | undefined;
        passThreshold?: number | undefined;
        animations?: boolean | undefined;
        accessibility?: {
            reducedMotion: boolean;
            highContrast: boolean;
            captions: boolean;
            extraTimeFactor: number;
        } | undefined;
        locale?: string | undefined;
    }, {
        timeLimitMs?: number | undefined;
        lives?: number | undefined;
        hints?: number | undefined;
        shuffle?: boolean | undefined;
        difficulty?: "easy" | "medium" | "hard" | undefined;
        scoring?: {
            perCorrect?: number | undefined;
            perWrong?: number | undefined;
            speed?: {
                maxBonus: number;
                windowMs: number;
            } | undefined;
        } | undefined;
        passThreshold?: number | undefined;
        animations?: boolean | undefined;
        accessibility?: {
            reducedMotion?: boolean | undefined;
            highContrast?: boolean | undefined;
            captions?: boolean | undefined;
            extraTimeFactor?: number | undefined;
        } | undefined;
        locale?: string | undefined;
    }>>;
    content: z.ZodUnion<[z.ZodEffects<z.ZodObject<{
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
    }>, z.ZodObject<{
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
    }>, z.ZodObject<{
        type: z.ZodLiteral<"fill-blank">;
        template: z.ZodString;
        blanks: z.ZodArray<z.ZodObject<{
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
    }>, z.ZodObject<{
        type: z.ZodLiteral<"word-search">;
        words: z.ZodArray<z.ZodString, "many">;
        size: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "word-search";
        words: string[];
        size?: number | undefined;
    }, {
        type: "word-search";
        words: string[];
        size?: number | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"memory-match">;
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
    }>, z.ZodObject<{
        type: z.ZodLiteral<"sequence-ordering">;
        prompt: z.ZodOptional<z.ZodString>;
        items: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "sequence-ordering";
        items: string[];
        prompt?: string | undefined;
    }, {
        type: "sequence-ordering";
        items: string[];
        prompt?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"drag-drop-match">;
        prompt: z.ZodOptional<z.ZodString>;
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
    }>, z.ZodObject<{
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
    }>, z.ZodEffects<z.ZodObject<{
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
    }>, z.ZodEffects<z.ZodObject<{
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
    }>, z.ZodObject<{
        type: z.ZodLiteral<"typing-challenge">;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "typing-challenge";
        text: string;
    }, {
        type: "typing-challenge";
        text: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"sorting">;
        prompt: z.ZodOptional<z.ZodString>;
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
    }>, z.ZodObject<{
        type: z.ZodLiteral<"classification">;
        prompt: z.ZodOptional<z.ZodString>;
        categories: z.ZodArray<z.ZodString, "many">;
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
    }>, z.ZodObject<{
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
    }>, z.ZodObject<{
        type: z.ZodLiteral<"puzzle-grid">;
        prompt: z.ZodOptional<z.ZodString>;
        rows: z.ZodNumber;
        cols: z.ZodNumber;
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
    }>]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    tags: string[];
    content: {
        type: "multiple-choice";
        prompt: string;
        choices: string[];
        correctIndex: number;
        explanation?: string | undefined;
    } | {
        type: "true-false";
        statement: string;
        answer: boolean;
        explanation?: string | undefined;
    } | {
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
    } | {
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
    } | {
        type: "fill-blank";
        template: string;
        blanks: {
            answers: string[];
            caseSensitive: boolean;
        }[];
    } | {
        type: "typing-challenge";
        text: string;
    } | {
        type: "sequence-ordering";
        items: string[];
        prompt?: string | undefined;
    } | {
        type: "sorting";
        items: {
            value: number;
            label: string;
        }[];
        prompt?: string | undefined;
    } | {
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
    } | {
        type: "drag-drop-match";
        pairs: {
            left: string;
            right: string;
        }[];
        prompt?: string | undefined;
    } | {
        type: "classification";
        items: {
            label: string;
            category: string;
        }[];
        categories: string[];
        prompt?: string | undefined;
    } | {
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
    } | {
        type: "word-search";
        words: string[];
        size?: number | undefined;
    } | {
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
    } | {
        type: "puzzle-grid";
        rows: number;
        cols: number;
        tiles: string[];
        prompt?: string | undefined;
    };
    config?: {
        timeLimitMs?: number | undefined;
        lives?: number | undefined;
        hints?: number | undefined;
        shuffle?: boolean | undefined;
        difficulty?: "easy" | "medium" | "hard" | undefined;
        scoring?: {
            perCorrect: number;
            perWrong: number;
            speed?: {
                maxBonus: number;
                windowMs: number;
            } | undefined;
        } | undefined;
        passThreshold?: number | undefined;
        animations?: boolean | undefined;
        accessibility?: {
            reducedMotion: boolean;
            highContrast: boolean;
            captions: boolean;
            extraTimeFactor: number;
        } | undefined;
        locale?: string | undefined;
    } | undefined;
}, {
    id: string;
    content: {
        type: "multiple-choice";
        prompt: string;
        choices: string[];
        correctIndex: number;
        explanation?: string | undefined;
    } | {
        type: "true-false";
        statement: string;
        answer: boolean;
        explanation?: string | undefined;
    } | {
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
    } | {
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
    } | {
        type: "fill-blank";
        template: string;
        blanks: {
            answers: string[];
            caseSensitive?: boolean | undefined;
        }[];
    } | {
        type: "typing-challenge";
        text: string;
    } | {
        type: "sequence-ordering";
        items: string[];
        prompt?: string | undefined;
    } | {
        type: "sorting";
        items: {
            value: number;
            label: string;
        }[];
        prompt?: string | undefined;
    } | {
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
    } | {
        type: "drag-drop-match";
        pairs: {
            left: string;
            right: string;
        }[];
        prompt?: string | undefined;
    } | {
        type: "classification";
        items: {
            label: string;
            category: string;
        }[];
        categories: string[];
        prompt?: string | undefined;
    } | {
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
    } | {
        type: "word-search";
        words: string[];
        size?: number | undefined;
    } | {
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
    } | {
        type: "puzzle-grid";
        rows: number;
        cols: number;
        tiles: string[];
        prompt?: string | undefined;
    };
    tags?: string[] | undefined;
    config?: {
        timeLimitMs?: number | undefined;
        lives?: number | undefined;
        hints?: number | undefined;
        shuffle?: boolean | undefined;
        difficulty?: "easy" | "medium" | "hard" | undefined;
        scoring?: {
            perCorrect?: number | undefined;
            perWrong?: number | undefined;
            speed?: {
                maxBonus: number;
                windowMs: number;
            } | undefined;
        } | undefined;
        passThreshold?: number | undefined;
        animations?: boolean | undefined;
        accessibility?: {
            reducedMotion?: boolean | undefined;
            highContrast?: boolean | undefined;
            captions?: boolean | undefined;
            extraTimeFactor?: number | undefined;
        } | undefined;
        locale?: string | undefined;
    } | undefined;
}>;
export type Activity = z.infer<typeof Activity>;
/** The payload carried inside an `activity` ContentPack — a bank of playable activities. */
export declare const ActivityPayload: z.ZodObject<{
    activities: z.ZodArray<z.ZodObject<{
        /** Stable id, unique within the pack — used for progress, analytics, and level references. */
        id: z.ZodString;
        /** Optional authoring metadata for selection/merchandising (topic, world, "boss"). */
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        /** Partial config; unspecified fields fall back to DEFAULT_CONFIG at play time. */
        config: z.ZodOptional<z.ZodObject<{
            timeLimitMs: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            lives: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            hints: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
            shuffle: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            difficulty: z.ZodOptional<z.ZodDefault<z.ZodEnum<["easy", "medium", "hard"]>>>;
            scoring: z.ZodOptional<z.ZodDefault<z.ZodObject<{
                perCorrect: z.ZodDefault<z.ZodNumber>;
                perWrong: z.ZodDefault<z.ZodNumber>;
                speed: z.ZodOptional<z.ZodObject<{
                    maxBonus: z.ZodNumber;
                    windowMs: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    maxBonus: number;
                    windowMs: number;
                }, {
                    maxBonus: number;
                    windowMs: number;
                }>>;
            }, "strip", z.ZodTypeAny, {
                perCorrect: number;
                perWrong: number;
                speed?: {
                    maxBonus: number;
                    windowMs: number;
                } | undefined;
            }, {
                perCorrect?: number | undefined;
                perWrong?: number | undefined;
                speed?: {
                    maxBonus: number;
                    windowMs: number;
                } | undefined;
            }>>>;
            passThreshold: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
            animations: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            accessibility: z.ZodOptional<z.ZodDefault<z.ZodObject<{
                reducedMotion: z.ZodDefault<z.ZodBoolean>;
                highContrast: z.ZodDefault<z.ZodBoolean>;
                captions: z.ZodDefault<z.ZodBoolean>;
                extraTimeFactor: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                reducedMotion: boolean;
                highContrast: boolean;
                captions: boolean;
                extraTimeFactor: number;
            }, {
                reducedMotion?: boolean | undefined;
                highContrast?: boolean | undefined;
                captions?: boolean | undefined;
                extraTimeFactor?: number | undefined;
            }>>>;
            locale: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            timeLimitMs?: number | undefined;
            lives?: number | undefined;
            hints?: number | undefined;
            shuffle?: boolean | undefined;
            difficulty?: "easy" | "medium" | "hard" | undefined;
            scoring?: {
                perCorrect: number;
                perWrong: number;
                speed?: {
                    maxBonus: number;
                    windowMs: number;
                } | undefined;
            } | undefined;
            passThreshold?: number | undefined;
            animations?: boolean | undefined;
            accessibility?: {
                reducedMotion: boolean;
                highContrast: boolean;
                captions: boolean;
                extraTimeFactor: number;
            } | undefined;
            locale?: string | undefined;
        }, {
            timeLimitMs?: number | undefined;
            lives?: number | undefined;
            hints?: number | undefined;
            shuffle?: boolean | undefined;
            difficulty?: "easy" | "medium" | "hard" | undefined;
            scoring?: {
                perCorrect?: number | undefined;
                perWrong?: number | undefined;
                speed?: {
                    maxBonus: number;
                    windowMs: number;
                } | undefined;
            } | undefined;
            passThreshold?: number | undefined;
            animations?: boolean | undefined;
            accessibility?: {
                reducedMotion?: boolean | undefined;
                highContrast?: boolean | undefined;
                captions?: boolean | undefined;
                extraTimeFactor?: number | undefined;
            } | undefined;
            locale?: string | undefined;
        }>>;
        content: z.ZodUnion<[z.ZodEffects<z.ZodObject<{
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
        }>, z.ZodObject<{
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
        }>, z.ZodObject<{
            type: z.ZodLiteral<"fill-blank">;
            template: z.ZodString;
            blanks: z.ZodArray<z.ZodObject<{
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
        }>, z.ZodObject<{
            type: z.ZodLiteral<"word-search">;
            words: z.ZodArray<z.ZodString, "many">;
            size: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "word-search";
            words: string[];
            size?: number | undefined;
        }, {
            type: "word-search";
            words: string[];
            size?: number | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"memory-match">;
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
        }>, z.ZodObject<{
            type: z.ZodLiteral<"sequence-ordering">;
            prompt: z.ZodOptional<z.ZodString>;
            items: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            type: "sequence-ordering";
            items: string[];
            prompt?: string | undefined;
        }, {
            type: "sequence-ordering";
            items: string[];
            prompt?: string | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"drag-drop-match">;
            prompt: z.ZodOptional<z.ZodString>;
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
        }>, z.ZodObject<{
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
        }>, z.ZodEffects<z.ZodObject<{
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
        }>, z.ZodEffects<z.ZodObject<{
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
        }>, z.ZodObject<{
            type: z.ZodLiteral<"typing-challenge">;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "typing-challenge";
            text: string;
        }, {
            type: "typing-challenge";
            text: string;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"sorting">;
            prompt: z.ZodOptional<z.ZodString>;
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
        }>, z.ZodObject<{
            type: z.ZodLiteral<"classification">;
            prompt: z.ZodOptional<z.ZodString>;
            categories: z.ZodArray<z.ZodString, "many">;
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
        }>, z.ZodObject<{
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
        }>, z.ZodObject<{
            type: z.ZodLiteral<"puzzle-grid">;
            prompt: z.ZodOptional<z.ZodString>;
            rows: z.ZodNumber;
            cols: z.ZodNumber;
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
        }>]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        tags: string[];
        content: {
            type: "multiple-choice";
            prompt: string;
            choices: string[];
            correctIndex: number;
            explanation?: string | undefined;
        } | {
            type: "true-false";
            statement: string;
            answer: boolean;
            explanation?: string | undefined;
        } | {
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
        } | {
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
        } | {
            type: "fill-blank";
            template: string;
            blanks: {
                answers: string[];
                caseSensitive: boolean;
            }[];
        } | {
            type: "typing-challenge";
            text: string;
        } | {
            type: "sequence-ordering";
            items: string[];
            prompt?: string | undefined;
        } | {
            type: "sorting";
            items: {
                value: number;
                label: string;
            }[];
            prompt?: string | undefined;
        } | {
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
        } | {
            type: "drag-drop-match";
            pairs: {
                left: string;
                right: string;
            }[];
            prompt?: string | undefined;
        } | {
            type: "classification";
            items: {
                label: string;
                category: string;
            }[];
            categories: string[];
            prompt?: string | undefined;
        } | {
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
        } | {
            type: "word-search";
            words: string[];
            size?: number | undefined;
        } | {
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
        } | {
            type: "puzzle-grid";
            rows: number;
            cols: number;
            tiles: string[];
            prompt?: string | undefined;
        };
        config?: {
            timeLimitMs?: number | undefined;
            lives?: number | undefined;
            hints?: number | undefined;
            shuffle?: boolean | undefined;
            difficulty?: "easy" | "medium" | "hard" | undefined;
            scoring?: {
                perCorrect: number;
                perWrong: number;
                speed?: {
                    maxBonus: number;
                    windowMs: number;
                } | undefined;
            } | undefined;
            passThreshold?: number | undefined;
            animations?: boolean | undefined;
            accessibility?: {
                reducedMotion: boolean;
                highContrast: boolean;
                captions: boolean;
                extraTimeFactor: number;
            } | undefined;
            locale?: string | undefined;
        } | undefined;
    }, {
        id: string;
        content: {
            type: "multiple-choice";
            prompt: string;
            choices: string[];
            correctIndex: number;
            explanation?: string | undefined;
        } | {
            type: "true-false";
            statement: string;
            answer: boolean;
            explanation?: string | undefined;
        } | {
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
        } | {
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
        } | {
            type: "fill-blank";
            template: string;
            blanks: {
                answers: string[];
                caseSensitive?: boolean | undefined;
            }[];
        } | {
            type: "typing-challenge";
            text: string;
        } | {
            type: "sequence-ordering";
            items: string[];
            prompt?: string | undefined;
        } | {
            type: "sorting";
            items: {
                value: number;
                label: string;
            }[];
            prompt?: string | undefined;
        } | {
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
        } | {
            type: "drag-drop-match";
            pairs: {
                left: string;
                right: string;
            }[];
            prompt?: string | undefined;
        } | {
            type: "classification";
            items: {
                label: string;
                category: string;
            }[];
            categories: string[];
            prompt?: string | undefined;
        } | {
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
        } | {
            type: "word-search";
            words: string[];
            size?: number | undefined;
        } | {
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
        } | {
            type: "puzzle-grid";
            rows: number;
            cols: number;
            tiles: string[];
            prompt?: string | undefined;
        };
        tags?: string[] | undefined;
        config?: {
            timeLimitMs?: number | undefined;
            lives?: number | undefined;
            hints?: number | undefined;
            shuffle?: boolean | undefined;
            difficulty?: "easy" | "medium" | "hard" | undefined;
            scoring?: {
                perCorrect?: number | undefined;
                perWrong?: number | undefined;
                speed?: {
                    maxBonus: number;
                    windowMs: number;
                } | undefined;
            } | undefined;
            passThreshold?: number | undefined;
            animations?: boolean | undefined;
            accessibility?: {
                reducedMotion?: boolean | undefined;
                highContrast?: boolean | undefined;
                captions?: boolean | undefined;
                extraTimeFactor?: number | undefined;
            } | undefined;
            locale?: string | undefined;
        } | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    activities: {
        id: string;
        tags: string[];
        content: {
            type: "multiple-choice";
            prompt: string;
            choices: string[];
            correctIndex: number;
            explanation?: string | undefined;
        } | {
            type: "true-false";
            statement: string;
            answer: boolean;
            explanation?: string | undefined;
        } | {
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
        } | {
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
        } | {
            type: "fill-blank";
            template: string;
            blanks: {
                answers: string[];
                caseSensitive: boolean;
            }[];
        } | {
            type: "typing-challenge";
            text: string;
        } | {
            type: "sequence-ordering";
            items: string[];
            prompt?: string | undefined;
        } | {
            type: "sorting";
            items: {
                value: number;
                label: string;
            }[];
            prompt?: string | undefined;
        } | {
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
        } | {
            type: "drag-drop-match";
            pairs: {
                left: string;
                right: string;
            }[];
            prompt?: string | undefined;
        } | {
            type: "classification";
            items: {
                label: string;
                category: string;
            }[];
            categories: string[];
            prompt?: string | undefined;
        } | {
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
        } | {
            type: "word-search";
            words: string[];
            size?: number | undefined;
        } | {
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
        } | {
            type: "puzzle-grid";
            rows: number;
            cols: number;
            tiles: string[];
            prompt?: string | undefined;
        };
        config?: {
            timeLimitMs?: number | undefined;
            lives?: number | undefined;
            hints?: number | undefined;
            shuffle?: boolean | undefined;
            difficulty?: "easy" | "medium" | "hard" | undefined;
            scoring?: {
                perCorrect: number;
                perWrong: number;
                speed?: {
                    maxBonus: number;
                    windowMs: number;
                } | undefined;
            } | undefined;
            passThreshold?: number | undefined;
            animations?: boolean | undefined;
            accessibility?: {
                reducedMotion: boolean;
                highContrast: boolean;
                captions: boolean;
                extraTimeFactor: number;
            } | undefined;
            locale?: string | undefined;
        } | undefined;
    }[];
}, {
    activities: {
        id: string;
        content: {
            type: "multiple-choice";
            prompt: string;
            choices: string[];
            correctIndex: number;
            explanation?: string | undefined;
        } | {
            type: "true-false";
            statement: string;
            answer: boolean;
            explanation?: string | undefined;
        } | {
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
        } | {
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
        } | {
            type: "fill-blank";
            template: string;
            blanks: {
                answers: string[];
                caseSensitive?: boolean | undefined;
            }[];
        } | {
            type: "typing-challenge";
            text: string;
        } | {
            type: "sequence-ordering";
            items: string[];
            prompt?: string | undefined;
        } | {
            type: "sorting";
            items: {
                value: number;
                label: string;
            }[];
            prompt?: string | undefined;
        } | {
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
        } | {
            type: "drag-drop-match";
            pairs: {
                left: string;
                right: string;
            }[];
            prompt?: string | undefined;
        } | {
            type: "classification";
            items: {
                label: string;
                category: string;
            }[];
            categories: string[];
            prompt?: string | undefined;
        } | {
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
        } | {
            type: "word-search";
            words: string[];
            size?: number | undefined;
        } | {
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
        } | {
            type: "puzzle-grid";
            rows: number;
            cols: number;
            tiles: string[];
            prompt?: string | undefined;
        };
        tags?: string[] | undefined;
        config?: {
            timeLimitMs?: number | undefined;
            lives?: number | undefined;
            hints?: number | undefined;
            shuffle?: boolean | undefined;
            difficulty?: "easy" | "medium" | "hard" | undefined;
            scoring?: {
                perCorrect?: number | undefined;
                perWrong?: number | undefined;
                speed?: {
                    maxBonus: number;
                    windowMs: number;
                } | undefined;
            } | undefined;
            passThreshold?: number | undefined;
            animations?: boolean | undefined;
            accessibility?: {
                reducedMotion?: boolean | undefined;
                highContrast?: boolean | undefined;
                captions?: boolean | undefined;
                extraTimeFactor?: number | undefined;
            } | undefined;
            locale?: string | undefined;
        } | undefined;
    }[];
}>;
export type ActivityPayload = z.infer<typeof ActivityPayload>;
/** The full, typed activity ContentPack = envelope (contracts) + activity payload. */
export declare const ActivityPack: z.ZodObject<{
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
        activities: z.ZodArray<z.ZodObject<{
            /** Stable id, unique within the pack — used for progress, analytics, and level references. */
            id: z.ZodString;
            /** Optional authoring metadata for selection/merchandising (topic, world, "boss"). */
            tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            /** Partial config; unspecified fields fall back to DEFAULT_CONFIG at play time. */
            config: z.ZodOptional<z.ZodObject<{
                timeLimitMs: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
                lives: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
                hints: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
                shuffle: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
                difficulty: z.ZodOptional<z.ZodDefault<z.ZodEnum<["easy", "medium", "hard"]>>>;
                scoring: z.ZodOptional<z.ZodDefault<z.ZodObject<{
                    perCorrect: z.ZodDefault<z.ZodNumber>;
                    perWrong: z.ZodDefault<z.ZodNumber>;
                    speed: z.ZodOptional<z.ZodObject<{
                        maxBonus: z.ZodNumber;
                        windowMs: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        maxBonus: number;
                        windowMs: number;
                    }, {
                        maxBonus: number;
                        windowMs: number;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    perCorrect: number;
                    perWrong: number;
                    speed?: {
                        maxBonus: number;
                        windowMs: number;
                    } | undefined;
                }, {
                    perCorrect?: number | undefined;
                    perWrong?: number | undefined;
                    speed?: {
                        maxBonus: number;
                        windowMs: number;
                    } | undefined;
                }>>>;
                passThreshold: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
                animations: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
                accessibility: z.ZodOptional<z.ZodDefault<z.ZodObject<{
                    reducedMotion: z.ZodDefault<z.ZodBoolean>;
                    highContrast: z.ZodDefault<z.ZodBoolean>;
                    captions: z.ZodDefault<z.ZodBoolean>;
                    extraTimeFactor: z.ZodDefault<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    reducedMotion: boolean;
                    highContrast: boolean;
                    captions: boolean;
                    extraTimeFactor: number;
                }, {
                    reducedMotion?: boolean | undefined;
                    highContrast?: boolean | undefined;
                    captions?: boolean | undefined;
                    extraTimeFactor?: number | undefined;
                }>>>;
                locale: z.ZodOptional<z.ZodDefault<z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                timeLimitMs?: number | undefined;
                lives?: number | undefined;
                hints?: number | undefined;
                shuffle?: boolean | undefined;
                difficulty?: "easy" | "medium" | "hard" | undefined;
                scoring?: {
                    perCorrect: number;
                    perWrong: number;
                    speed?: {
                        maxBonus: number;
                        windowMs: number;
                    } | undefined;
                } | undefined;
                passThreshold?: number | undefined;
                animations?: boolean | undefined;
                accessibility?: {
                    reducedMotion: boolean;
                    highContrast: boolean;
                    captions: boolean;
                    extraTimeFactor: number;
                } | undefined;
                locale?: string | undefined;
            }, {
                timeLimitMs?: number | undefined;
                lives?: number | undefined;
                hints?: number | undefined;
                shuffle?: boolean | undefined;
                difficulty?: "easy" | "medium" | "hard" | undefined;
                scoring?: {
                    perCorrect?: number | undefined;
                    perWrong?: number | undefined;
                    speed?: {
                        maxBonus: number;
                        windowMs: number;
                    } | undefined;
                } | undefined;
                passThreshold?: number | undefined;
                animations?: boolean | undefined;
                accessibility?: {
                    reducedMotion?: boolean | undefined;
                    highContrast?: boolean | undefined;
                    captions?: boolean | undefined;
                    extraTimeFactor?: number | undefined;
                } | undefined;
                locale?: string | undefined;
            }>>;
            content: z.ZodUnion<[z.ZodEffects<z.ZodObject<{
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
            }>, z.ZodObject<{
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
            }>, z.ZodObject<{
                type: z.ZodLiteral<"fill-blank">;
                template: z.ZodString;
                blanks: z.ZodArray<z.ZodObject<{
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
            }>, z.ZodObject<{
                type: z.ZodLiteral<"word-search">;
                words: z.ZodArray<z.ZodString, "many">;
                size: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                type: "word-search";
                words: string[];
                size?: number | undefined;
            }, {
                type: "word-search";
                words: string[];
                size?: number | undefined;
            }>, z.ZodObject<{
                type: z.ZodLiteral<"memory-match">;
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
            }>, z.ZodObject<{
                type: z.ZodLiteral<"sequence-ordering">;
                prompt: z.ZodOptional<z.ZodString>;
                items: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                type: "sequence-ordering";
                items: string[];
                prompt?: string | undefined;
            }, {
                type: "sequence-ordering";
                items: string[];
                prompt?: string | undefined;
            }>, z.ZodObject<{
                type: z.ZodLiteral<"drag-drop-match">;
                prompt: z.ZodOptional<z.ZodString>;
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
            }>, z.ZodObject<{
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
            }>, z.ZodEffects<z.ZodObject<{
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
            }>, z.ZodEffects<z.ZodObject<{
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
            }>, z.ZodObject<{
                type: z.ZodLiteral<"typing-challenge">;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "typing-challenge";
                text: string;
            }, {
                type: "typing-challenge";
                text: string;
            }>, z.ZodObject<{
                type: z.ZodLiteral<"sorting">;
                prompt: z.ZodOptional<z.ZodString>;
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
            }>, z.ZodObject<{
                type: z.ZodLiteral<"classification">;
                prompt: z.ZodOptional<z.ZodString>;
                categories: z.ZodArray<z.ZodString, "many">;
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
            }>, z.ZodObject<{
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
            }>, z.ZodObject<{
                type: z.ZodLiteral<"puzzle-grid">;
                prompt: z.ZodOptional<z.ZodString>;
                rows: z.ZodNumber;
                cols: z.ZodNumber;
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
            }>]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            tags: string[];
            content: {
                type: "multiple-choice";
                prompt: string;
                choices: string[];
                correctIndex: number;
                explanation?: string | undefined;
            } | {
                type: "true-false";
                statement: string;
                answer: boolean;
                explanation?: string | undefined;
            } | {
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
            } | {
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
            } | {
                type: "fill-blank";
                template: string;
                blanks: {
                    answers: string[];
                    caseSensitive: boolean;
                }[];
            } | {
                type: "typing-challenge";
                text: string;
            } | {
                type: "sequence-ordering";
                items: string[];
                prompt?: string | undefined;
            } | {
                type: "sorting";
                items: {
                    value: number;
                    label: string;
                }[];
                prompt?: string | undefined;
            } | {
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
            } | {
                type: "drag-drop-match";
                pairs: {
                    left: string;
                    right: string;
                }[];
                prompt?: string | undefined;
            } | {
                type: "classification";
                items: {
                    label: string;
                    category: string;
                }[];
                categories: string[];
                prompt?: string | undefined;
            } | {
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
            } | {
                type: "word-search";
                words: string[];
                size?: number | undefined;
            } | {
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
            } | {
                type: "puzzle-grid";
                rows: number;
                cols: number;
                tiles: string[];
                prompt?: string | undefined;
            };
            config?: {
                timeLimitMs?: number | undefined;
                lives?: number | undefined;
                hints?: number | undefined;
                shuffle?: boolean | undefined;
                difficulty?: "easy" | "medium" | "hard" | undefined;
                scoring?: {
                    perCorrect: number;
                    perWrong: number;
                    speed?: {
                        maxBonus: number;
                        windowMs: number;
                    } | undefined;
                } | undefined;
                passThreshold?: number | undefined;
                animations?: boolean | undefined;
                accessibility?: {
                    reducedMotion: boolean;
                    highContrast: boolean;
                    captions: boolean;
                    extraTimeFactor: number;
                } | undefined;
                locale?: string | undefined;
            } | undefined;
        }, {
            id: string;
            content: {
                type: "multiple-choice";
                prompt: string;
                choices: string[];
                correctIndex: number;
                explanation?: string | undefined;
            } | {
                type: "true-false";
                statement: string;
                answer: boolean;
                explanation?: string | undefined;
            } | {
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
            } | {
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
            } | {
                type: "fill-blank";
                template: string;
                blanks: {
                    answers: string[];
                    caseSensitive?: boolean | undefined;
                }[];
            } | {
                type: "typing-challenge";
                text: string;
            } | {
                type: "sequence-ordering";
                items: string[];
                prompt?: string | undefined;
            } | {
                type: "sorting";
                items: {
                    value: number;
                    label: string;
                }[];
                prompt?: string | undefined;
            } | {
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
            } | {
                type: "drag-drop-match";
                pairs: {
                    left: string;
                    right: string;
                }[];
                prompt?: string | undefined;
            } | {
                type: "classification";
                items: {
                    label: string;
                    category: string;
                }[];
                categories: string[];
                prompt?: string | undefined;
            } | {
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
            } | {
                type: "word-search";
                words: string[];
                size?: number | undefined;
            } | {
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
            } | {
                type: "puzzle-grid";
                rows: number;
                cols: number;
                tiles: string[];
                prompt?: string | undefined;
            };
            tags?: string[] | undefined;
            config?: {
                timeLimitMs?: number | undefined;
                lives?: number | undefined;
                hints?: number | undefined;
                shuffle?: boolean | undefined;
                difficulty?: "easy" | "medium" | "hard" | undefined;
                scoring?: {
                    perCorrect?: number | undefined;
                    perWrong?: number | undefined;
                    speed?: {
                        maxBonus: number;
                        windowMs: number;
                    } | undefined;
                } | undefined;
                passThreshold?: number | undefined;
                animations?: boolean | undefined;
                accessibility?: {
                    reducedMotion?: boolean | undefined;
                    highContrast?: boolean | undefined;
                    captions?: boolean | undefined;
                    extraTimeFactor?: number | undefined;
                } | undefined;
                locale?: string | undefined;
            } | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        activities: {
            id: string;
            tags: string[];
            content: {
                type: "multiple-choice";
                prompt: string;
                choices: string[];
                correctIndex: number;
                explanation?: string | undefined;
            } | {
                type: "true-false";
                statement: string;
                answer: boolean;
                explanation?: string | undefined;
            } | {
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
            } | {
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
            } | {
                type: "fill-blank";
                template: string;
                blanks: {
                    answers: string[];
                    caseSensitive: boolean;
                }[];
            } | {
                type: "typing-challenge";
                text: string;
            } | {
                type: "sequence-ordering";
                items: string[];
                prompt?: string | undefined;
            } | {
                type: "sorting";
                items: {
                    value: number;
                    label: string;
                }[];
                prompt?: string | undefined;
            } | {
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
            } | {
                type: "drag-drop-match";
                pairs: {
                    left: string;
                    right: string;
                }[];
                prompt?: string | undefined;
            } | {
                type: "classification";
                items: {
                    label: string;
                    category: string;
                }[];
                categories: string[];
                prompt?: string | undefined;
            } | {
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
            } | {
                type: "word-search";
                words: string[];
                size?: number | undefined;
            } | {
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
            } | {
                type: "puzzle-grid";
                rows: number;
                cols: number;
                tiles: string[];
                prompt?: string | undefined;
            };
            config?: {
                timeLimitMs?: number | undefined;
                lives?: number | undefined;
                hints?: number | undefined;
                shuffle?: boolean | undefined;
                difficulty?: "easy" | "medium" | "hard" | undefined;
                scoring?: {
                    perCorrect: number;
                    perWrong: number;
                    speed?: {
                        maxBonus: number;
                        windowMs: number;
                    } | undefined;
                } | undefined;
                passThreshold?: number | undefined;
                animations?: boolean | undefined;
                accessibility?: {
                    reducedMotion: boolean;
                    highContrast: boolean;
                    captions: boolean;
                    extraTimeFactor: number;
                } | undefined;
                locale?: string | undefined;
            } | undefined;
        }[];
    }, {
        activities: {
            id: string;
            content: {
                type: "multiple-choice";
                prompt: string;
                choices: string[];
                correctIndex: number;
                explanation?: string | undefined;
            } | {
                type: "true-false";
                statement: string;
                answer: boolean;
                explanation?: string | undefined;
            } | {
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
            } | {
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
            } | {
                type: "fill-blank";
                template: string;
                blanks: {
                    answers: string[];
                    caseSensitive?: boolean | undefined;
                }[];
            } | {
                type: "typing-challenge";
                text: string;
            } | {
                type: "sequence-ordering";
                items: string[];
                prompt?: string | undefined;
            } | {
                type: "sorting";
                items: {
                    value: number;
                    label: string;
                }[];
                prompt?: string | undefined;
            } | {
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
            } | {
                type: "drag-drop-match";
                pairs: {
                    left: string;
                    right: string;
                }[];
                prompt?: string | undefined;
            } | {
                type: "classification";
                items: {
                    label: string;
                    category: string;
                }[];
                categories: string[];
                prompt?: string | undefined;
            } | {
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
            } | {
                type: "word-search";
                words: string[];
                size?: number | undefined;
            } | {
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
            } | {
                type: "puzzle-grid";
                rows: number;
                cols: number;
                tiles: string[];
                prompt?: string | undefined;
            };
            tags?: string[] | undefined;
            config?: {
                timeLimitMs?: number | undefined;
                lives?: number | undefined;
                hints?: number | undefined;
                shuffle?: boolean | undefined;
                difficulty?: "easy" | "medium" | "hard" | undefined;
                scoring?: {
                    perCorrect?: number | undefined;
                    perWrong?: number | undefined;
                    speed?: {
                        maxBonus: number;
                        windowMs: number;
                    } | undefined;
                } | undefined;
                passThreshold?: number | undefined;
                animations?: boolean | undefined;
                accessibility?: {
                    reducedMotion?: boolean | undefined;
                    highContrast?: boolean | undefined;
                    captions?: boolean | undefined;
                    extraTimeFactor?: number | undefined;
                } | undefined;
                locale?: string | undefined;
            } | undefined;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    locale: string;
    tags: string[];
    packId: string;
    gameId: string;
    engine: "quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation" | "activity";
    version: string;
    schemaVersion: number;
    checksum: string;
    sizeBytes: number;
    publishedAt: string;
    payload: {
        activities: {
            id: string;
            tags: string[];
            content: {
                type: "multiple-choice";
                prompt: string;
                choices: string[];
                correctIndex: number;
                explanation?: string | undefined;
            } | {
                type: "true-false";
                statement: string;
                answer: boolean;
                explanation?: string | undefined;
            } | {
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
            } | {
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
            } | {
                type: "fill-blank";
                template: string;
                blanks: {
                    answers: string[];
                    caseSensitive: boolean;
                }[];
            } | {
                type: "typing-challenge";
                text: string;
            } | {
                type: "sequence-ordering";
                items: string[];
                prompt?: string | undefined;
            } | {
                type: "sorting";
                items: {
                    value: number;
                    label: string;
                }[];
                prompt?: string | undefined;
            } | {
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
            } | {
                type: "drag-drop-match";
                pairs: {
                    left: string;
                    right: string;
                }[];
                prompt?: string | undefined;
            } | {
                type: "classification";
                items: {
                    label: string;
                    category: string;
                }[];
                categories: string[];
                prompt?: string | undefined;
            } | {
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
            } | {
                type: "word-search";
                words: string[];
                size?: number | undefined;
            } | {
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
            } | {
                type: "puzzle-grid";
                rows: number;
                cols: number;
                tiles: string[];
                prompt?: string | undefined;
            };
            config?: {
                timeLimitMs?: number | undefined;
                lives?: number | undefined;
                hints?: number | undefined;
                shuffle?: boolean | undefined;
                difficulty?: "easy" | "medium" | "hard" | undefined;
                scoring?: {
                    perCorrect: number;
                    perWrong: number;
                    speed?: {
                        maxBonus: number;
                        windowMs: number;
                    } | undefined;
                } | undefined;
                passThreshold?: number | undefined;
                animations?: boolean | undefined;
                accessibility?: {
                    reducedMotion: boolean;
                    highContrast: boolean;
                    captions: boolean;
                    extraTimeFactor: number;
                } | undefined;
                locale?: string | undefined;
            } | undefined;
        }[];
    };
}, {
    locale: string;
    packId: string;
    gameId: string;
    engine: "quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation" | "activity";
    version: string;
    schemaVersion: number;
    checksum: string;
    sizeBytes: number;
    publishedAt: string;
    payload: {
        activities: {
            id: string;
            content: {
                type: "multiple-choice";
                prompt: string;
                choices: string[];
                correctIndex: number;
                explanation?: string | undefined;
            } | {
                type: "true-false";
                statement: string;
                answer: boolean;
                explanation?: string | undefined;
            } | {
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
            } | {
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
            } | {
                type: "fill-blank";
                template: string;
                blanks: {
                    answers: string[];
                    caseSensitive?: boolean | undefined;
                }[];
            } | {
                type: "typing-challenge";
                text: string;
            } | {
                type: "sequence-ordering";
                items: string[];
                prompt?: string | undefined;
            } | {
                type: "sorting";
                items: {
                    value: number;
                    label: string;
                }[];
                prompt?: string | undefined;
            } | {
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
            } | {
                type: "drag-drop-match";
                pairs: {
                    left: string;
                    right: string;
                }[];
                prompt?: string | undefined;
            } | {
                type: "classification";
                items: {
                    label: string;
                    category: string;
                }[];
                categories: string[];
                prompt?: string | undefined;
            } | {
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
            } | {
                type: "word-search";
                words: string[];
                size?: number | undefined;
            } | {
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
            } | {
                type: "puzzle-grid";
                rows: number;
                cols: number;
                tiles: string[];
                prompt?: string | undefined;
            };
            tags?: string[] | undefined;
            config?: {
                timeLimitMs?: number | undefined;
                lives?: number | undefined;
                hints?: number | undefined;
                shuffle?: boolean | undefined;
                difficulty?: "easy" | "medium" | "hard" | undefined;
                scoring?: {
                    perCorrect?: number | undefined;
                    perWrong?: number | undefined;
                    speed?: {
                        maxBonus: number;
                        windowMs: number;
                    } | undefined;
                } | undefined;
                passThreshold?: number | undefined;
                animations?: boolean | undefined;
                accessibility?: {
                    reducedMotion?: boolean | undefined;
                    highContrast?: boolean | undefined;
                    captions?: boolean | undefined;
                    extraTimeFactor?: number | undefined;
                } | undefined;
                locale?: string | undefined;
            } | undefined;
        }[];
    };
    tags?: string[] | undefined;
}>;
export type ActivityPack = z.infer<typeof ActivityPack>;
/**
 * The set of activity `type` literals the content union covers — derived from the strategy
 * registry so it can never drift from what the engine can actually play.
 */
export declare const SUPPORTED_ACTIVITY_TYPES: ("multiple-choice" | "true-false" | "fill-blank" | "word-search" | "memory-match" | "sequence-ordering" | "drag-drop-match" | "flash-cards" | "image-quiz" | "audio-quiz" | "typing-challenge" | "sorting" | "classification" | "hotspot" | "puzzle-grid")[];
//# sourceMappingURL=schema.d.ts.map