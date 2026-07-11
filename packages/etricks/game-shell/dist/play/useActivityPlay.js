import { useCallback, useMemo, useRef, useState } from "react";
import { createActivitySession, gradeResponse, } from "@etricks/activity-engine";
import { usePorts } from "../runtime/context.js";
function toView(session) {
    switch (session.type) {
        case "multiple-choice":
        case "image-quiz":
        case "audio-quiz":
            return { kind: "choice", type: session.type, prepared: session.prepared };
        case "true-false":
            return {
                kind: "true-false",
                type: "true-false",
                prepared: session.prepared,
            };
        case "classification":
            return { kind: "classification", type: "classification", prepared: session.prepared };
        default:
            return { kind: "other", type: session.type, prepared: session.prepared };
    }
}
export function useActivityPlay(opts) {
    const { gameId, activities, seed = "shell", onFinished } = opts;
    const ports = usePorts();
    const [index, setIndex] = useState(0);
    const [phase, setPhase] = useState("playing");
    const [score, setScore] = useState(0);
    const [stars, setStars] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const startedAt = useRef(0);
    const session = useMemo(() => {
        const activity = activities[index];
        if (!activity)
            return null;
        startedAt.current = Date.now();
        return createActivitySession(activity, undefined, `${seed}:${activity.id}`);
    }, [activities, index, seed]);
    const view = useMemo(() => (session ? toView(session) : null), [session]);
    const submit = useCallback((response, meta) => {
        if (!session || phase !== "playing")
            return;
        const elapsedMs = startedAt.current ? Date.now() - startedAt.current : undefined;
        const result = gradeResponse(session, response, elapsedMs);
        const correctIndex = session.type === "multiple-choice" || session.type === "image-quiz" || session.type === "audio-quiz"
            ? session.prepared.correctIndex
            : undefined;
        const explanation = session.prepared.explanation ?? undefined;
        setScore((s) => s + result.score);
        setStars((s) => s + result.stars);
        setFeedback({ grade: result, chosenIndex: meta?.chosenIndex, correctIndex, explanation });
        setPhase("feedback");
        ports.analytics?.track(result.solved ? "activity_correct" : "activity_wrong", {
            game: gameId,
            type: session.type,
            index,
        });
    }, [session, phase, ports, gameId, index]);
    const next = useCallback(() => {
        setFeedback(null);
        if (index + 1 >= activities.length) {
            setPhase("finished");
            ports.analytics?.track("level_completed", { game: gameId, score, stars });
            onFinished?.({ score, stars, maxStars: activities.length * 3, total: activities.length });
        }
        else {
            setPhase("playing");
            setIndex((i) => i + 1);
        }
    }, [index, activities.length, score, stars, ports, gameId, onFinished]);
    return { phase, index, total: activities.length, score, stars, session, view, feedback, submit, next };
}
//# sourceMappingURL=useActivityPlay.js.map