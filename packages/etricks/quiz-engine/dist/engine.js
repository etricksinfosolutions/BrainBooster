import { mulberry32, seedFromString, shuffle } from "./rng.js";
export const DEFAULT_CONFIG = {
    questionCount: 10,
    shuffleChoices: true,
    scoring: { correct: 100, wrong: 0, speed: { maxBonus: 50, windowMs: 10_000 } },
};
function matchesFilters(item, config) {
    if (config.difficulties?.length && !config.difficulties.includes(item.difficulty)) {
        return false;
    }
    if (config.tags?.length && !item.tags.some((t) => config.tags.includes(t))) {
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
export function createSession(payload, config, seed) {
    const seedNum = seedFromString(seed);
    const rng = mulberry32(seedNum);
    const pool = payload.items.filter((i) => matchesFilters(i, config));
    const ordered = shuffle(pool, rng).slice(0, config.questionCount);
    const questions = ordered.map((item) => {
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
        const indices = shuffle(item.choices.map((_, idx) => idx), rng);
        const choices = indices.map((idx) => item.choices[idx]);
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
export function answer(session, question, chosenIndex, elapsedMs) {
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
export function maxScore(session) {
    return session.questions.length * session.scoring.correct;
}
//# sourceMappingURL=engine.js.map