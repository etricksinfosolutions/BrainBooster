import { useCallback, useMemo, useRef, useState } from "react";
import {
  createActivitySession,
  gradeResponse,
  type Activity,
  type ActivitySession,
  type GradeResult,
  type PreparedChoice,
  type PreparedClassification,
} from "@etricks/activity-engine";
import { usePorts } from "../runtime/context.js";

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
export type PreparedView =
  | { kind: "choice"; type: "multiple-choice" | "image-quiz" | "audio-quiz"; prepared: PreparedChoice }
  | { kind: "true-false"; type: "true-false"; prepared: { statement: string; answer: boolean; explanation?: string } }
  | { kind: "classification"; type: "classification"; prepared: PreparedClassification }
  | { kind: "other"; type: string; prepared: unknown };

export interface PlayFeedback {
  grade: GradeResult;
  explanation?: string;
  chosenIndex?: number;
  correctIndex?: number;
}

function toView(session: ActivitySession): PreparedView {
  switch (session.type) {
    case "multiple-choice":
    case "image-quiz":
    case "audio-quiz":
      return { kind: "choice", type: session.type, prepared: session.prepared as PreparedChoice };
    case "true-false":
      return {
        kind: "true-false",
        type: "true-false",
        prepared: session.prepared as { statement: string; answer: boolean; explanation?: string },
      };
    case "classification":
      return { kind: "classification", type: "classification", prepared: session.prepared as PreparedClassification };
    default:
      return { kind: "other", type: session.type, prepared: session.prepared };
  }
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
  submit: (response: unknown, meta?: { chosenIndex?: number }) => void;
  next: () => void;
}

export function useActivityPlay(opts: {
  gameId: string;
  activities: Activity[];
  seed?: string;
  onFinished?: (summary: LevelSummary) => void;
}): UseActivityPlay {
  const { gameId, activities, seed = "shell", onFinished } = opts;
  const ports = usePorts();

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<PlayPhase>("playing");
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState<PlayFeedback | null>(null);
  const startedAt = useRef(0);

  const session = useMemo(() => {
    const activity = activities[index];
    if (!activity) return null;
    startedAt.current = Date.now();
    return createActivitySession(activity, undefined, `${seed}:${activity.id}`);
  }, [activities, index, seed]);

  const view = useMemo(() => (session ? toView(session) : null), [session]);

  const submit = useCallback(
    (response: unknown, meta?: { chosenIndex?: number }) => {
      if (!session || phase !== "playing") return;
      const elapsedMs = startedAt.current ? Date.now() - startedAt.current : undefined;
      const result = gradeResponse(session, response, elapsedMs);
      const correctIndex =
        session.type === "multiple-choice" || session.type === "image-quiz" || session.type === "audio-quiz"
          ? (session.prepared as PreparedChoice).correctIndex
          : undefined;
      const explanation = (session.prepared as { explanation?: string }).explanation ?? undefined;

      setScore((s) => s + result.score);
      setStars((s) => s + result.stars);
      setFeedback({ grade: result, chosenIndex: meta?.chosenIndex, correctIndex, explanation });
      setPhase("feedback");
      ports.analytics?.track(result.solved ? "activity_correct" : "activity_wrong", {
        game: gameId,
        type: session.type,
        index,
      });
    },
    [session, phase, ports, gameId, index],
  );

  const next = useCallback(() => {
    setFeedback(null);
    if (index + 1 >= activities.length) {
      setPhase("finished");
      ports.analytics?.track("level_completed", { game: gameId, score, stars });
      onFinished?.({ score, stars, maxStars: activities.length * 3, total: activities.length });
    } else {
      setPhase("playing");
      setIndex((i) => i + 1);
    }
  }, [index, activities.length, score, stars, ports, gameId, onFinished]);

  return { phase, index, total: activities.length, score, stars, session, view, feedback, submit, next };
}
