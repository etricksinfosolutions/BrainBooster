import type { Difficulty, QuizPayload } from "./schema.js";
/**
 * The Quiz Engine runtime — pure, deterministic, framework-free.
 *
 * A game (Brain Booster, Finance Master's trivia mode, a language quiz...) configures
 * the engine and feeds it a manufactured pack. The engine handles selection, ordering,
 * choice-shuffling, scoring and progression. No I/O, no React, no clock — the caller
 * supplies the seed and any timing. That makes every session reproducible and testable.
 */
export interface ScoringRules {
    /** Points for a correct answer. */
    correct: number;
    /** Points for a wrong answer (usually 0, negative to penalise guessing). */
    wrong: number;
    /**
     * Optional speed bonus: up to `maxBonus` points, decaying linearly to 0 over
     * `windowMs`. Requires the caller to pass elapsedMs when answering.
     */
    speed?: {
        maxBonus: number;
        windowMs: number;
    };
}
export interface QuizConfig {
    /** How many questions this session should contain. */
    questionCount: number;
    /** Restrict to these difficulties. Empty/undefined = any. */
    difficulties?: Difficulty[];
    /** Restrict to items carrying at least one of these tags. Empty = any. */
    tags?: string[];
    /** Shuffle the order of choices within each question. */
    shuffleChoices: boolean;
    scoring: ScoringRules;
}
export declare const DEFAULT_CONFIG: QuizConfig;
/** A question as presented to the player (choices already shuffled per session). */
export interface SessionQuestion {
    id: string;
    prompt: string;
    choices: string[];
    /** Index of the correct answer *within this session's shuffled choices*. */
    correctIndex: number;
    explanation?: string;
    difficulty: Difficulty;
}
export interface QuizSession {
    seed: number;
    questions: SessionQuestion[];
    scoring: ScoringRules;
}
export interface AnswerResult {
    correct: boolean;
    awarded: number;
    correctIndex: number;
}
/**
 * Build a playable session from a manufactured pack.
 *
 * @param seed  a string (stable RNG source). Use e.g. `${userId}:${dateKey}` for a
 *              daily challenge every player can be scored on identically.
 */
export declare function createSession(payload: QuizPayload, config: QuizConfig, seed: string): QuizSession;
/**
 * Score a single answer. Pure — returns the result; the caller owns session state.
 *
 * @param elapsedMs  ms taken to answer, for the optional speed bonus. Omit if untimed.
 */
export declare function answer(session: QuizSession, question: SessionQuestion, chosenIndex: number, elapsedMs?: number): AnswerResult;
/** Convenience: total possible score for a session (correct answers, no speed bonus). */
export declare function maxScore(session: QuizSession): number;
//# sourceMappingURL=engine.d.ts.map