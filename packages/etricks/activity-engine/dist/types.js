/**
 * The activity catalogue — every playable kind the Universal Activity Engine can run.
 *
 * This is the single source of truth for "which activities exist". Each value is backed by exactly
 * one {@link ActivityStrategy}. Adding a kind is: implement a strategy, register it — the engine,
 * the content union, and the scoring pipeline pick it up with no other change. "Audio Quiz" is
 * shipped and gradable today (future-ready = the asset pipeline for audio, not the mechanic).
 */
export const ACTIVITY_TYPES = [
    "multiple-choice",
    "true-false",
    "fill-blank",
    "word-search",
    "memory-match",
    "sequence-ordering",
    "drag-drop-match",
    "flash-cards",
    "image-quiz",
    "audio-quiz",
    "typing-challenge",
    "sorting",
    "classification",
    "hotspot",
    "puzzle-grid",
];
//# sourceMappingURL=types.js.map