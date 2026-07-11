import { type Activity, type ActivitySession, type GradeResult, type PreparedChoice, type PreparedClassification } from "@etricks/activity-engine";
/**
 * The shell's game-neutral play controller — the thin bridge between a level's activities and the
 * Universal Activity Engine. It owns no game rules: it builds a deterministic session per activity,
 * forwards the player's response to `gradeResponse`, and aggregates stars/score across the level.
 * Analytics is emitted through the injected `AnalyticsPort` (never a hard dependency), so the same
 * controller works for every manufactured game. Ported from the mobile `useActivityPlay`, DOM-neutral.
 */
export type PlayPhase = "playing" | "feedback" | "finished";
export interface LevelSummary {
    score: number;
    stars: number;
    maxStars: number;
    total: number;
}
/** A per-type view of the prepared activity the renderer can switch on. */
export type PreparedView = {
    kind: "choice";
    type: "multiple-choice" | "image-quiz" | "audio-quiz";
    prepared: PreparedChoice;
} | {
    kind: "true-false";
    type: "true-false";
    prepared: {
        statement: string;
        answer: boolean;
        explanation?: string;
    };
} | {
    kind: "classification";
    type: "classification";
    prepared: PreparedClassification;
} | {
    kind: "other";
    type: string;
    prepared: unknown;
};
export interface PlayFeedback {
    grade: GradeResult;
    explanation?: string;
    chosenIndex?: number;
    correctIndex?: number;
}
export interface UseActivityPlay {
    phase: PlayPhase;
    index: number;
    total: number;
    score: number;
    stars: number;
    session: ActivitySession | null;
    view: PreparedView | null;
    feedback: PlayFeedback | null;
    /** Submit a response for the current activity (view builds the per-type response shape). */
    submit: (response: unknown, meta?: {
        chosenIndex?: number;
    }) => void;
    next: () => void;
}
export declare function useActivityPlay(opts: {
    gameId: string;
    activities: Activity[];
    seed?: string;
    onFinished?: (summary: LevelSummary) => void;
}): UseActivityPlay;
//# sourceMappingURL=useActivityPlay.d.ts.map