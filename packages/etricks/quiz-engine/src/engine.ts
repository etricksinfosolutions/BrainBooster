import { mulberry32, seedFromString, shuffle, type Rng } from "./rng.js";
import type { Difficulty, QuizItem, QuizPayload } from "./schema.js";

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
  speed?: { maxBonus: number; windowMs: number };
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

export const DEFAULT_CONFIG: QuizConfig = {
  questionCount: 10,
  shuffleChoices: true,
  scoring: { correct: 100, wrong: 0, speed: { maxBonus: 50, windowMs: 10_000 } },
};

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

function matchesFilters(item: QuizItem, config: QuizConfig): boolean {
  if (config.difficulties?.length && !config.difficulties.includes(item.difficulty)) {
    return false;
  }
  if (config.tags?.length && !item.tags.some((t) => config.tags!.includes(t))) {
    return false;
  }
  return true;
}

/**
 * Build a playable session from a manufactured pack.
 *
 * @param seed  a string (stable RNG source). Use e.g. `${userId}:${dateKey}` for a
 *              daily challenge every player can be scored on identically.
 */
export function createSession(
  payload: QuizPayload,
  config: QuizConfig,
  seed: string,
): QuizSession {
  const seedNum = seedFromString(seed);
  const rng: Rng = mulberry32(seedNum);

  const pool = payload.items.filter((i) => matchesFilters(i, config));
  const ordered = shuffle(pool, rng).slice(0, config.questionCount);

  const questions: SessionQuestion[] = ordered.map((item) => {
    if (!config.shuffleChoices) {
      return {
        id: item.id,
        prompt: item.prompt,
        choices: item.choices.slice(),
        correctIndex: item.correctIndex,
        explanation: item.explanation,
        difficulty: item.difficulty,
      };
    }
    // Shuffle choices while tracking where the correct answer lands.
    const indices = shuffle(
      item.choices.map((_, idx) => idx),
      rng,
    );
    const choices = indices.map((idx) => item.choices[idx]!);
    const correctIndex = indices.indexOf(item.correctIndex);
    return {
      id: item.id,
      prompt: item.prompt,
      choices,
      correctIndex,
      explanation: item.explanation,
      difficulty: item.difficulty,
    };
  });

  return { seed: seedNum, questions, scoring: config.scoring };
}

/**
 * Score a single answer. Pure — returns the result; the caller owns session state.
 *
 * @param elapsedMs  ms taken to answer, for the optional speed bonus. Omit if untimed.
 */
export function answer(
  session: QuizSession,
  question: SessionQuestion,
  chosenIndex: number,
  elapsedMs?: number,
): AnswerResult {
  const correct = chosenIndex === question.correctIndex;
  const { scoring } = session;
  let awarded = correct ? scoring.correct : scoring.wrong;

  if (correct && scoring.speed && typeof elapsedMs === "number") {
    const { maxBonus, windowMs } = scoring.speed;
    const remaining = Math.max(0, windowMs - Math.max(0, elapsedMs));
    awarded += Math.round((remaining / windowMs) * maxBonus);
  }

  return { correct, awarded, correctIndex: question.correctIndex };
}

/** Convenience: total possible score for a session (correct answers, no speed bonus). */
export function maxScore(session: QuizSession): number {
  return session.questions.length * session.scoring.correct;
}
