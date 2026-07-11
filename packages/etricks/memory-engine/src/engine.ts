import type { AssetRef } from "@etricks/contracts";
import { mulberry32, seedFromString, shuffle, type Rng } from "./rng.js";
import type { MemoryDifficulty, MemoryPair, MemoryPayload } from "./schema.js";

/**
 * The Memory Engine runtime — pure, deterministic, framework-free (ADR-0004, ADR-0007).
 *
 * Same contract as the quiz engine — (pack, config, seed) → reproducible session — but a
 * completely different gameplay shape: it selects pairs, DUPLICATES each into two cards, and
 * shuffles them onto a board. That difference is the point: it proves a heterogeneous engine
 * plugs into the same platform (delivery, contracts, AIOS) as the quiz engine. No I/O, no
 * clock — the caller owns the seed, so every board is replayable and testable.
 */

export interface MemoryScoringRules {
  /** Points for a successful match. */
  match: number;
  /** Points for a mismatch (usually 0, negative to penalise blind flipping). */
  mismatch: number;
}

export interface MemoryConfig {
  /** How many PAIRS this board contains (the board holds 2× this many cards). */
  pairCount: number;
  /** Restrict to these difficulties. Empty/undefined = any. */
  difficulties?: MemoryDifficulty[];
  /** Restrict to pairs carrying at least one of these tags. Empty = any. */
  tags?: string[];
  scoring: MemoryScoringRules;
}

export const DEFAULT_CONFIG: MemoryConfig = {
  pairCount: 6,
  scoring: { match: 100, mismatch: 0 },
};

/** One card on the board. Two cards share a `pairId` — matching them clears the pair. */
export interface BoardCard {
  /** Unique per card within the board. */
  cardId: string;
  /** The pair this card belongs to; its twin has the same value. */
  pairId: string;
  label: string;
  face: AssetRef;
  difficulty: MemoryDifficulty;
  /** 0-based slot in board order. */
  position: number;
}

export interface MemoryBoard {
  seed: number;
  theme: string;
  /** 2 × pairCount cards, already shuffled into board order. */
  cards: BoardCard[];
  scoring: MemoryScoringRules;
}

export interface MatchResult {
  matched: boolean;
  awarded: number;
  pairId: string;
}

function matchesFilters(pair: MemoryPair, config: MemoryConfig): boolean {
  if (config.difficulties?.length && !config.difficulties.includes(pair.difficulty)) {
    return false;
  }
  if (config.tags?.length && !pair.tags.some((t) => config.tags!.includes(t))) {
    return false;
  }
  return true;
}

/**
 * Build a playable board from a manufactured pack.
 *
 * Selects `pairCount` pairs (deterministically, filtered by config), expands each into two
 * cards, and shuffles all cards into board order — all from the seed, so the same
 * (pack, config, seed) always yields the same board.
 *
 * @param seed a string RNG source, e.g. `${userId}:${dateKey}` for a shared daily board.
 */
export function createBoard(
  payload: MemoryPayload,
  config: MemoryConfig,
  seed: string,
): MemoryBoard {
  const seedNum = seedFromString(seed);
  const rng: Rng = mulberry32(seedNum);

  const pool = payload.pairs.filter((p) => matchesFilters(p, config));
  const chosen = shuffle(pool, rng).slice(0, config.pairCount);

  // Expand each pair into two cards, then shuffle the whole deck into board positions.
  const deck = chosen.flatMap((pair, i) =>
    [0, 1].map((copy) => ({
      cardId: `${pair.id}#${copy}`,
      pairId: pair.id,
      label: pair.label,
      face: pair.face,
      difficulty: pair.difficulty,
      // placeholder; position is assigned after the shuffle below
      position: i * 2 + copy,
    })),
  );

  const cards = shuffle(deck, rng).map((card, position) => ({ ...card, position }));

  return { seed: seedNum, theme: payload.theme, cards, scoring: config.scoring };
}

/** Whether two flipped cards form a pair. Distinct cards of the same pair match. */
export function isMatch(cardA: BoardCard, cardB: BoardCard): boolean {
  return cardA.cardId !== cardB.cardId && cardA.pairId === cardB.pairId;
}

/**
 * Evaluate a flip of two cards. Pure — returns the result; the caller owns board state
 * (which cards are face-up / cleared).
 */
export function evaluateFlip(
  board: MemoryBoard,
  cardA: BoardCard,
  cardB: BoardCard,
): MatchResult {
  const matched = isMatch(cardA, cardB);
  const awarded = matched ? board.scoring.match : board.scoring.mismatch;
  return { matched, awarded, pairId: cardA.pairId };
}

/** Convenience: total possible score for a board (every pair matched). */
export function maxScore(board: MemoryBoard): number {
  return (board.cards.length / 2) * board.scoring.match;
}
