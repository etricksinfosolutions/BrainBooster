import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useActivityPlay } from "./useActivityPlay.js";
import { ChoiceView, TrueFalseView, ClassificationView, PlaceholderView } from "./views.js";
/**
 * ActivityPlayer — the game-neutral React player mounted inside the shell's ActivityScreen. It drives
 * a level's `Activity[]` through the Universal Activity Engine (via `useActivityPlay`), renders the
 * right DOM view per type, shows correct/incorrect feedback + explanation, and reports the level
 * summary to `onComplete` when finished. No game-specific logic — the same player runs every game.
 */
export function ActivityPlayer(props) {
    const play = useActivityPlay({
        gameId: props.gameId,
        activities: props.activities,
        seed: props.seed,
        onFinished: props.onComplete,
    });
    const [lastValue, setLastValue] = useState(undefined);
    const answered = play.phase === "feedback";
    const solved = play.feedback?.grade.solved ?? false;
    const wrap = {
        width: "100%",
        maxWidth: 560,
        display: "flex",
        flexDirection: "column",
        gap: 18,
    };
    return (_jsxs("div", { style: wrap, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [_jsx("div", { role: "progressbar", "aria-valuemin": 0, "aria-valuemax": play.total, "aria-valuenow": play.index + 1, "aria-label": "Activity progress", style: { flex: 1, height: 8, borderRadius: 999, background: "var(--line)", overflow: "hidden" }, children: _jsx("div", { style: {
                                height: "100%",
                                width: `${((play.index + (answered ? 1 : 0)) / Math.max(1, play.total)) * 100}%`,
                                background: "var(--accent)",
                                borderRadius: 999,
                            } }) }), _jsxs("span", { style: { color: "var(--dim)", fontSize: ".85rem", whiteSpace: "nowrap" }, children: [play.index + 1, "/", play.total] })] }), play.view?.kind === "choice" ? (_jsx(ChoiceView, { prepared: play.view.prepared, answered: answered, chosenIndex: play.feedback?.chosenIndex, onChoose: (i) => play.submit({ choiceIndex: i }, { chosenIndex: i }) })) : play.view?.kind === "true-false" ? (_jsx(TrueFalseView, { prepared: play.view.prepared, answered: answered, chosenValue: lastValue, onAnswer: (v) => {
                    setLastValue(v);
                    play.submit({ value: v });
                } })) : play.view?.kind === "classification" ? (_jsx(ClassificationView, { prepared: play.view.prepared, answered: answered, onSubmit: (assignments) => play.submit({ assignments }) })) : play.view ? (_jsx(PlaceholderView, { type: play.view.type, onSkip: () => play.submit({}) })) : null, answered ? (_jsxs("div", { role: "status", style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    padding: "14px 16px",
                    borderRadius: "var(--radius)",
                    border: `1px solid ${solved ? "var(--ok)" : "var(--bad)"}`,
                    background: solved
                        ? "color-mix(in srgb, var(--ok) 12%, var(--surface))"
                        : "color-mix(in srgb, var(--bad) 12%, var(--surface))",
                }, children: [_jsxs("strong", { style: { color: solved ? "var(--ok)" : "var(--bad)" }, children: [solved ? "Correct!" : "Not quite", play.feedback ? ` · +${play.feedback.grade.score}` : ""] }), play.feedback?.explanation ? (_jsx("p", { style: { margin: 0, color: "var(--ink)", fontSize: ".95rem" }, children: play.feedback.explanation })) : null, _jsx("button", { type: "button", onClick: () => {
                            setLastValue(undefined);
                            play.next();
                        }, style: {
                            alignSelf: "flex-end",
                            padding: "10px 22px",
                            borderRadius: "var(--radius)",
                            border: "none",
                            background: "var(--accent)",
                            color: "var(--accent-ink)",
                            fontWeight: 800,
                            cursor: "pointer",
                            font: "inherit",
                        }, children: play.index + 1 >= play.total ? "Finish" : "Next" })] })) : null] }));
}
//# sourceMappingURL=ActivityPlayer.js.map