import { z } from "zod";
/**
 * ActivityConfig — the ONE configuration surface every activity type obeys.
 *
 * This is the heart of "one engine, many games". The same activity type (multiple-choice, say)
 * behaves differently in a relaxed kids' game and a timed adult trivia mode purely by changing
 * this object — no code. A game supplies a config per activity (or per level); the engine resolves
 * it against `DEFAULT_CONFIG` and every strategy reads the resolved values. Nothing here is
 * type-specific: time, lives, hints, scoring, difficulty, randomization, animation, accessibility
 * and localization apply uniformly, which is exactly why adding a game is configuration.
 */
/** How a response converts to points. Shared by every activity type. */
export declare const ActivityScoring: z.ZodObject<{
    /** Points per correctly-answered unit (a choice, a blank, a matched pair, a placed tile). */
    perCorrect: z.ZodDefault<z.ZodNumber>;
    /** Points per wrong unit — usually 0, negative to penalise guessing. */
    perWrong: z.ZodDefault<z.ZodNumber>;
    /**
     * Optional speed bonus applied once, when the activity is solved: up to `maxBonus` points
     * decaying linearly to 0 over `windowMs`. Requires the caller to pass `elapsedMs` when grading.
     */
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
}>;
export type ActivityScoring = z.infer<typeof ActivityScoring>;
export declare const Difficulty: z.ZodEnum<["easy", "medium", "hard"]>;
export type Difficulty = z.infer<typeof Difficulty>;
/** Accessibility flags the engine surfaces to renderers; scoring never depends on them. */
export declare const AccessibilityConfig: z.ZodObject<{
    reducedMotion: z.ZodDefault<z.ZodBoolean>;
    highContrast: z.ZodDefault<z.ZodBoolean>;
    captions: z.ZodDefault<z.ZodBoolean>;
    /** Extra time multiplier for players who need it (1 = none). Applied to `timeLimitMs`. */
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
}>;
export type AccessibilityConfig = z.infer<typeof AccessibilityConfig>;
export declare const ActivityConfig: z.ZodObject<{
    /** Per-session time budget in ms. Omitted/undefined = untimed. */
    timeLimitMs: z.ZodOptional<z.ZodNumber>;
    /** Wrong-answer budget. Omitted = unlimited. The engine tracks; the app enforces game-over. */
    lives: z.ZodOptional<z.ZodNumber>;
    /** How many hints the player may spend. 0 = none. */
    hints: z.ZodDefault<z.ZodNumber>;
    /** Randomise order/choices/layout. When false the content is presented as authored. */
    shuffle: z.ZodDefault<z.ZodBoolean>;
    /** Authoring difficulty label — steers selection/merchandising, never grading. */
    difficulty: z.ZodDefault<z.ZodEnum<["easy", "medium", "hard"]>>;
    scoring: z.ZodDefault<z.ZodObject<{
        /** Points per correctly-answered unit (a choice, a blank, a matched pair, a placed tile). */
        perCorrect: z.ZodDefault<z.ZodNumber>;
        /** Points per wrong unit — usually 0, negative to penalise guessing. */
        perWrong: z.ZodDefault<z.ZodNumber>;
        /**
         * Optional speed bonus applied once, when the activity is solved: up to `maxBonus` points
         * decaying linearly to 0 over `windowMs`. Requires the caller to pass `elapsedMs` when grading.
         */
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
    }>>;
    /**
     * Fraction of units (0..1) that must be correct to count the activity "solved" (⭐ earned).
     * 1 = perfection required; lower suits typing/word-search where partial credit is the norm.
     */
    passThreshold: z.ZodDefault<z.ZodNumber>;
    /** Cosmetic — whether renderers should play transition animations. */
    animations: z.ZodDefault<z.ZodBoolean>;
    accessibility: z.ZodDefault<z.ZodObject<{
        reducedMotion: z.ZodDefault<z.ZodBoolean>;
        highContrast: z.ZodDefault<z.ZodBoolean>;
        captions: z.ZodDefault<z.ZodBoolean>;
        /** Extra time multiplier for players who need it (1 = none). Applied to `timeLimitMs`. */
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
    }>>;
    /** Content locale for this activity; localisation ships as sibling packs, this selects one. */
    locale: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    hints: number;
    shuffle: boolean;
    difficulty: "easy" | "medium" | "hard";
    scoring: {
        perCorrect: number;
        perWrong: number;
        speed?: {
            maxBonus: number;
            windowMs: number;
        } | undefined;
    };
    passThreshold: number;
    animations: boolean;
    accessibility: {
        reducedMotion: boolean;
        highContrast: boolean;
        captions: boolean;
        extraTimeFactor: number;
    };
    locale: string;
    timeLimitMs?: number | undefined;
    lives?: number | undefined;
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
}>;
export type ActivityConfig = z.infer<typeof ActivityConfig>;
/** Every field present — what strategies actually read. */
export type ResolvedConfig = ActivityConfig;
export declare const DEFAULT_CONFIG: ResolvedConfig;
/**
 * Resolve an authored (partial) config against the defaults into a fully-populated config.
 * Accepts `undefined` so an activity may omit config entirely and still play.
 */
export declare function resolveConfig(config?: unknown): ResolvedConfig;
/** The effective time budget after applying the accessibility multiplier (undefined = untimed). */
export declare function effectiveTimeLimitMs(config: ResolvedConfig): number | undefined;
//# sourceMappingURL=config.d.ts.map