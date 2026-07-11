import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAccessibility } from "../runtime/context.js";
/**
 * DOM view components for the activity types Science Master (and most quiz games) use: single-select
 * choice (multiple-choice / image-quiz / audio-quiz), true/false, and classification. Every colour is
 * a theme CSS variable; nothing is game-specific. Types the engine hasn't a view for yet fall back to
 * a neutral placeholder so the player still advances. Views only build the engine's response shape and
 * call `onSubmit` — grading lives in the engine.
 */
function optionStyle(a11y, state) {
    const bg = state === "correct" ? "color-mix(in srgb, var(--ok) 18%, var(--surface))"
        : state === "wrong" ? "color-mix(in srgb, var(--bad) 18%, var(--surface))"
            : "var(--surface)";
    const border = state === "correct" ? "var(--ok)" : state === "wrong" ? "var(--bad)" : "var(--line)";
    return {
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        textAlign: "left",
        padding: a11y.bigButtons ? "16px 18px" : "13px 16px",
        borderRadius: "var(--radius)",
        border: `${a11y.highContrast ? 2 : 1}px solid ${border}`,
        background: bg,
        color: "var(--ink)",
        fontWeight: 600,
        fontSize: "1rem",
        cursor: state === "muted" ? "default" : "pointer",
        opacity: state === "muted" ? 0.6 : 1,
        font: "inherit",
    };
}
const promptStyle = {
    margin: "0 0 4px",
    fontSize: "clamp(1.1rem, 3.6vw, 1.4rem)",
    fontWeight: 800,
    color: "var(--ink)",
    textAlign: "center",
    lineHeight: 1.25,
};
// --- Single-select choice ----------------------------------------------------------------------
export function ChoiceView(props) {
    const a11y = useAccessibility();
    const { prepared, answered, chosenIndex } = props;
    return (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 14, width: "100%" }, children: [_jsx("h2", { style: promptStyle, children: prepared.prompt }), _jsx("div", { role: "listbox", "aria-label": "Answer choices", style: { display: "flex", flexDirection: "column", gap: 10 }, children: prepared.choices.map((choice, i) => {
                    const state = !answered
                        ? "idle"
                        : i === prepared.correctIndex
                            ? "correct"
                            : i === chosenIndex
                                ? "wrong"
                                : "muted";
                    return (_jsxs("button", { type: "button", role: "option", "aria-selected": chosenIndex === i, disabled: answered, onClick: () => props.onChoose(i), style: optionStyle(a11y, state), children: [_jsx("span", { "aria-hidden": "true", style: { fontWeight: 800, color: "var(--dim)" }, children: String.fromCharCode(65 + i) }), _jsx("span", { children: choice })] }, i));
                }) })] }));
}
// --- True / False ------------------------------------------------------------------------------
export function TrueFalseView(props) {
    const a11y = useAccessibility();
    const { prepared, answered, chosenValue } = props;
    const btn = (value, label, glyph) => {
        const state = !answered
            ? "idle"
            : value === prepared.answer
                ? "correct"
                : chosenValue === value
                    ? "wrong"
                    : "muted";
        return (_jsxs("button", { type: "button", disabled: answered, onClick: () => props.onAnswer(value), "aria-label": label, style: { ...optionStyle(a11y, state), justifyContent: "center", fontSize: "1.1rem", fontWeight: 800 }, children: [_jsx("span", { "aria-hidden": "true", children: glyph }), " ", label] }));
    };
    return (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16, width: "100%" }, children: [_jsx("h2", { style: promptStyle, children: prepared.statement }), _jsxs("div", { style: { display: "flex", gap: 12 }, children: [btn(true, "True", "✓"), btn(false, "False", "✗")] })] }));
}
// --- Classification (assign each item to a category) --------------------------------------------
export function ClassificationView(props) {
    const a11y = useAccessibility();
    const { prepared, answered } = props;
    const [assignments, setAssignments] = useState(() => prepared.items.map(() => -1));
    const allAssigned = assignments.every((a) => a >= 0);
    const setItem = (itemIdx, catIdx) => {
        if (answered)
            return;
        setAssignments((prev) => prev.map((v, i) => (i === itemIdx ? catIdx : v)));
    };
    return (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 14, width: "100%" }, children: [_jsx("h2", { style: promptStyle, children: "Sort each item into the right group" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: prepared.items.map((item, i) => {
                    const chosen = assignments[i] ?? -1;
                    const correct = answered && chosen === item.correctCategory;
                    const wrong = answered && chosen >= 0 && chosen !== item.correctCategory;
                    return (_jsxs("div", { style: {
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            padding: "12px 14px",
                            borderRadius: "var(--radius)",
                            border: `${a11y.highContrast ? 2 : 1}px solid ${correct ? "var(--ok)" : wrong ? "var(--bad)" : "var(--line)"}`,
                            background: "var(--surface)",
                        }, children: [_jsx("strong", { style: { color: "var(--ink)" }, children: item.label }), _jsx("div", { role: "group", "aria-label": `Group for ${item.label}`, style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: prepared.categories.map((cat, ci) => (_jsx("button", { type: "button", disabled: answered, "aria-pressed": chosen === ci, onClick: () => setItem(i, ci), style: {
                                        padding: a11y.bigButtons ? "10px 14px" : "7px 12px",
                                        borderRadius: 999,
                                        border: `${a11y.highContrast ? 2 : 1}px solid ${chosen === ci ? "var(--accent)" : "var(--line)"}`,
                                        background: chosen === ci ? "var(--accent)" : "var(--surface)",
                                        color: chosen === ci ? "var(--accent-ink)" : "var(--ink)",
                                        fontWeight: 700,
                                        cursor: answered ? "default" : "pointer",
                                        font: "inherit",
                                    }, children: cat }, ci))) })] }, i));
                }) }), !answered ? (_jsx("button", { type: "button", disabled: !allAssigned, onClick: () => props.onSubmit(assignments), style: {
                    alignSelf: "center",
                    padding: "12px 26px",
                    borderRadius: "var(--radius)",
                    border: "none",
                    background: allAssigned ? "var(--accent)" : "var(--line)",
                    color: allAssigned ? "var(--accent-ink)" : "var(--dim)",
                    fontWeight: 800,
                    cursor: allAssigned ? "pointer" : "not-allowed",
                    font: "inherit",
                }, children: "Check" })) : null] }));
}
// --- Fallback for not-yet-rendered types -------------------------------------------------------
export function PlaceholderView(props) {
    return (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12, alignItems: "center", textAlign: "center" }, children: [_jsx("div", { "aria-hidden": "true", style: { fontSize: "2.2rem" }, children: "\uD83E\uDDE9" }), _jsxs("p", { style: { margin: 0, color: "var(--dim)" }, children: ["This activity type (", _jsx("code", { children: props.type }), ") isn\u2019t interactive yet."] }), _jsx("button", { type: "button", onClick: props.onSkip, style: {
                    padding: "10px 20px",
                    borderRadius: "var(--radius)",
                    border: "none",
                    background: "var(--accent)",
                    color: "var(--accent-ink)",
                    fontWeight: 700,
                    cursor: "pointer",
                    font: "inherit",
                }, children: "Continue" })] }));
}
//# sourceMappingURL=views.js.map