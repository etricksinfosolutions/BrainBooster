import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigation, useAccessibility } from "../../runtime/context.js";
/**
 * ResultScreen ("result") — a neutral round summary (score + stars) that then routes onward. The
 * assignment's intent is "branch to victory or failure"; the navigation FSM (runtime/navigation.ts)
 * only permits result → reward | level-select | home, so we attempt the semantic target and fall back
 * to the nearest LEGAL destination via `canNavigate` — no dead buttons, and it upgrades automatically
 * if the FSM ever gains those edges. Nothing here is game-specific: score/stars/outcome are nav params.
 */
function readNumber(params, key) {
    const v = params[key];
    return typeof v === "number" && Number.isFinite(v) ? v : null;
}
export function ResultScreen() {
    const { params, navigate, canNavigate } = useNavigation();
    const a11y = useAccessibility();
    const stars = Math.max(0, Math.min(3, Math.round(readNumber(params, "stars") ?? 0)));
    const score = readNumber(params, "score");
    const outcomeParam = params["outcome"];
    const passedParam = params["passed"];
    const passed = typeof passedParam === "boolean"
        ? passedParam
        : outcomeParam === "victory"
            ? true
            : outcomeParam === "failure"
                ? false
                : stars > 0;
    // Attempt the semantic next screen; degrade to a legal transition if the FSM forbids it.
    const go = (preferred, fallback) => navigate(canNavigate(preferred) ? preferred : fallback);
    const button = (variant) => ({
        width: "100%",
        maxWidth: 340,
        padding: a11y.bigButtons ? "18px 26px" : "14px 24px",
        minHeight: a11y.bigButtons ? 56 : 48,
        fontFamily: "var(--font)",
        fontSize: a11y.bigButtons ? "1.15rem" : "1.02rem",
        fontWeight: 700,
        borderRadius: "var(--radius)",
        cursor: "pointer",
        transition: a11y.reducedMotion ? "none" : "filter .12s ease",
        border: variant === "primary" ? "none" : `${a11y.highContrast ? 2 : 1}px solid var(--line)`,
        background: variant === "primary" ? "var(--accent)" : "var(--surface)",
        color: variant === "primary" ? "var(--accent-ink)" : "var(--ink)",
    });
    return (_jsxs("div", { style: {
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            padding: "clamp(20px, 6vw, 40px)",
            background: "var(--bg)",
            color: "var(--ink)",
            fontFamily: "var(--font)",
            textAlign: "center",
            boxSizing: "border-box",
        }, children: [_jsx("p", { style: { margin: 0, color: "var(--dim)", fontWeight: 700, letterSpacing: ".04em" }, children: "Round complete" }), _jsx("h1", { style: { margin: 0, fontSize: "1.8rem", fontWeight: 800 }, children: passed ? "Nice work!" : "Round over" }), _jsx("div", { role: "img", "aria-label": `${stars} of 3 stars`, style: { display: "flex", gap: 10 }, children: [1, 2, 3].map((i) => (_jsx("span", { "aria-hidden": "true", style: {
                        fontSize: a11y.bigButtons ? "3rem" : "2.5rem",
                        color: i <= stars ? "var(--accent)" : "var(--line)",
                        filter: i <= stars ? "none" : "grayscale(1)",
                    }, children: "\u2605" }, i))) }), score != null ? (_jsxs("p", { style: { margin: 0, fontSize: "1.1rem" }, children: ["Score ", _jsx("strong", { children: score })] })) : null, _jsxs("div", { style: {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    marginTop: 8,
                }, children: [passed ? (_jsx("button", { type: "button", style: button("primary"), onClick: () => go("victory", "reward"), children: "Continue" })) : (_jsx("button", { type: "button", style: button("primary"), onClick: () => go("failure", "level-select"), children: "Try again" })), _jsx("button", { type: "button", style: button("ghost"), onClick: () => navigate("home"), children: "Home" })] })] }));
}
//# sourceMappingURL=ResultScreen.js.map