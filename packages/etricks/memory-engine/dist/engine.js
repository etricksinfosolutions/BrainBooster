import { mulberry32, seedFromString, shuffle } from "./rng.js";
export const DEFAULT_CONFIG = {
    pairCount: 6,
    scoring: { match: 100, mismatch: 0 },
};
function matchesFilters(pair, config) {
    if (config.difficulties?.length && !config.difficulties.includes(pair.difficulty)) {
        return false;
    }
    if (config.tags?.length && !pair.tags.some((t) => config.tags.includes(t))) {
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
export function createBoard(payload, config, seed) {
    const seedNum = seedFromString(seed);
    const rng = mulberry32(seedNum);
    const pool = payload.pairs.filter((p) => matchesFilters(p, config));
    const chosen = shuffle(pool, rng).slice(0, config.pairCount);
    // Expand each pair into two cards, then shuffle the whole deck into board positions.
    const deck = chosen.flatMap((pair, i) => [0, 1].map((copy) => ({
        cardId: `${pair.id}#${copy}`,
        pairId: pair.id,
        label: pair.label,
        face: pair.face,
        difficulty: pair.difficulty,
        // placeholder; position is assigned after the shuffle below
        position: i * 2 + copy,
    })));
    const cards = shuffle(deck, rng).map((card, position) => ({ ...card, position }));
    return { seed: seedNum, theme: payload.theme, cards, scoring: config.scoring };
}
/** Whether two flipped cards form a pair. Distinct cards of the same pair match. */
export function isMatch(cardA, cardB) {
    return cardA.cardId !== cardB.cardId && cardA.pairId === cardB.pairId;
}
/**
 * Evaluate a flip of two cards. Pure — returns the result; the caller owns board state
 * (which cards are face-up / cleared).
 */
export function evaluateFlip(board, cardA, cardB) {
    const matched = isMatch(cardA, cardB);
    const awarded = matched ? board.scoring.match : board.scoring.mismatch;
    return { matched, awarded, pairId: cardA.pairId };
}
/** Convenience: total possible score for a board (every pair matched). */
export function maxScore(board) {
    return (board.cards.length / 2) * board.scoring.match;
}
//# sourceMappingURL=engine.js.map