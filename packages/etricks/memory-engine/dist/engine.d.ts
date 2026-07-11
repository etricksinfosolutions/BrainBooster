import type { AssetRef } from "@etricks/contracts";
import type { MemoryDifficulty, MemoryPayload } from "./schema.js";
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
export declare const DEFAULT_CONFIG: MemoryConfig;
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
/**
 * Build a playable board from a manufactured pack.
 *
 * Selects `pairCount` pairs (deterministically, filtered by config), expands each into two
 * cards, and shuffles all cards into board order — all from the seed, so the same
 * (pack, config, seed) always yields the same board.
 *
 * @param seed a string RNG source, e.g. `${userId}:${dateKey}` for a shared daily board.
 */
export declare function createBoard(payload: MemoryPayload, config: MemoryConfig, seed: string): MemoryBoard;
/** Whether two flipped cards form a pair. Distinct cards of the same pair match. */
export declare function isMatch(cardA: BoardCard, cardB: BoardCard): boolean;
/**
 * Evaluate a flip of two cards. Pure — returns the result; the caller owns board state
 * (which cards are face-up / cleared).
 */
export declare function evaluateFlip(board: MemoryBoard, cardA: BoardCard, cardB: BoardCard): MatchResult;
/** Convenience: total possible score for a board (every pair matched). */
export declare function maxScore(board: MemoryBoard): number;
//# sourceMappingURL=engine.d.ts.map