import { ACTIVITY_TYPES } from "./types.js";
import { multipleChoiceStrategy, trueFalseStrategy, imageQuizStrategy, audioQuizStrategy, } from "./strategies/choice.js";
import { fillBlankStrategy, typingChallengeStrategy } from "./strategies/text.js";
import { sequenceOrderingStrategy, sortingStrategy } from "./strategies/ordering.js";
import { memoryMatchStrategy, dragDropMatchStrategy, classificationStrategy, } from "./strategies/matching.js";
import { flashCardsStrategy } from "./strategies/study.js";
import { wordSearchStrategy, hotspotStrategy, puzzleGridStrategy } from "./strategies/spatial.js";
/**
 * The strategy registry — the ONE place activity types are wired to their mechanics.
 *
 * Every strategy the engine knows about is listed here once. `STRATEGIES` is keyed by type so the
 * engine dispatches in O(1); the content union (schema.ts) and the AIOS factories iterate the same
 * list. Adding an activity type is: write a strategy, add it to `ALL_STRATEGIES`. Nothing else in
 * the engine changes — that is what "one engine, many activities" buys.
 */
export const ALL_STRATEGIES = [
    multipleChoiceStrategy,
    trueFalseStrategy,
    fillBlankStrategy,
    wordSearchStrategy,
    memoryMatchStrategy,
    sequenceOrderingStrategy,
    dragDropMatchStrategy,
    flashCardsStrategy,
    imageQuizStrategy,
    audioQuizStrategy,
    typingChallengeStrategy,
    sortingStrategy,
    classificationStrategy,
    hotspotStrategy,
    puzzleGridStrategy,
];
export const STRATEGIES = (() => {
    const map = Object.fromEntries(ALL_STRATEGIES.map((s) => [s.type, s]));
    // Fail loudly at module load if the catalogue and the registry ever drift apart.
    for (const type of ACTIVITY_TYPES) {
        if (!map[type])
            throw new Error(`activity-engine: no strategy registered for "${type}"`);
    }
    if (ALL_STRATEGIES.length !== ACTIVITY_TYPES.length) {
        throw new Error("activity-engine: strategy count does not match the activity catalogue");
    }
    return map;
})();
/** Look up the strategy for an activity type. Throws on an unknown type. */
export function getStrategy(type) {
    const strategy = STRATEGIES[type];
    if (!strategy)
        throw new Error(`activity-engine: unknown activity type "${type}"`);
    return strategy;
}
//# sourceMappingURL=registry.js.map