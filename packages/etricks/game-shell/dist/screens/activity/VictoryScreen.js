import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { useNavigation, useBranding, useShellState, useAccessibility, } from "../../runtime/context.js";
/**
 * VictoryScreen ("victory") — a celebration: confetti (gated by reduced-motion), stars, and the rewards
 * earned this round labelled by the game's economy skin. Ported from the reference app's reward celebration
 * but game-neutral: the mascot only shows if branding provides one, currency names come from the skin,
 * and every earned amount arrives via nav params (the server owns the numbers — never invented here).
 */
function readNumber(params, key) {
    const v = params[key];
    return typeof v === "number" && Number.isFinite(v) ? v : null;
}
/** Self-contained confetti — injects its own keyframes and renders nothing under reduced motion. */
function Confetti({ enabled }) {
    const palette = ["var(--accent)", "var(--ok)", "var(--bad)", "var(--accent-ink)"];
    const pieces = useMemo(() => Array.from({ length: 44 }, (_, i) => ({
        left: (i * 97) % 100,
        delay: (i % 10) * 0.14,
        dur: 2.4 + (i % 7) * 0.28,
        size: 7 + (i % 5) * 2,
        color: palette[i % palette.length] ?? "var(--accent)",
    })), 
    // palette is a stable literal — pieces only ever need to be built once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
    if (!enabled)
        return null;
    return (_jsxs("div", { "aria-hidden": "true", style: { position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }, children: [_jsx("style", { children: "@keyframes gs-confetti-fall{0%{transform:translateY(-12%) rotate(0);opacity:1}" +
                    "100%{transform:translateY(115vh) rotate(720deg);opacity:.85}}" }), pieces.map((p, i) => (_jsx("span", { style: {
                    position: "absolute",
                    top: "-12%",
                    left: `${p.left}%`,
                    width: p.size,
                    height: p.size * 0.6,
                    background: p.color,
                    borderRadius: 2,
                    animation: `gs-confetti-fall ${p.dur}s linear ${p.delay}s infinite`,
                } }, i)))] }));
}
export function VictoryScreen() {
    const { params, navigate, canNavigate } = useNavigation();
    const branding = useBranding();
    const skin = useShellState().economySkin;
    const a11y = useAccessibility();
    const stars = Math.max(0, Math.min(3, Math.round(readNumber(params, "stars") ?? 0)));
    const earned = [
        { icon: skin.soft.icon, label: skin.soft.label, amount: readNumber(params, "coins") },
        { icon: skin.hard.icon, label: skin.hard.label, amount: readNumber(params, "diamonds") },
        { icon: skin.xp.icon, label: skin.xp.label, amount: readNumber(params, "xp") },
    ].filter((r) => r.amount != null && r.amount > 0);
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
            position: "relative",
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: "clamp(20px, 6vw, 40px)",
            background: "var(--bg)",
            color: "var(--ink)",
            fontFamily: "var(--font)",
            textAlign: "center",
            boxSizing: "border-box",
            overflow: "hidden",
        }, children: [_jsx(Confetti, { enabled: !a11y.reducedMotion }), branding.mascot ? (_jsx("div", { "aria-hidden": "true", style: { fontSize: "3rem" }, children: "\uD83C\uDF89" })) : (_jsx("div", { "aria-hidden": "true", style: { fontSize: "3rem" }, children: "\uD83C\uDFC6" })), _jsx("h1", { style: { margin: 0, fontSize: "2rem", fontWeight: 800, position: "relative" }, children: "Level complete!" }), branding.mascot ? (_jsxs("p", { style: { margin: 0, color: "var(--dim)" }, children: [branding.mascot.name, " is so proud of you!"] })) : null, _jsx("div", { role: "img", "aria-label": `${stars} of 3 stars`, style: { display: "flex", gap: 12 }, children: [1, 2, 3].map((i) => (_jsx("span", { "aria-hidden": "true", style: {
                        fontSize: a11y.bigButtons ? "3.2rem" : "2.8rem",
                        color: i <= stars ? "var(--accent)" : "var(--line)",
                        transition: a11y.reducedMotion ? "none" : "transform .2s ease",
                        transform: i <= stars ? "scale(1)" : "scale(0.85)",
                    }, children: "\u2605" }, i))) }), earned.length > 0 ? (_jsx("div", { style: {
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    position: "relative",
                }, children: earned.map((r) => (_jsxs("span", { "aria-label": `Earned ${r.amount} ${r.label}`, style: {
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 14px",
                        borderRadius: 999,
                        background: "var(--surface)",
                        border: `${a11y.highContrast ? 2 : 1}px solid var(--line)`,
                        fontWeight: 800,
                    }, children: [_jsx("span", { "aria-hidden": "true", children: r.icon }), " +", r.amount] }, r.label))) })) : null, _jsxs("div", { style: {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    marginTop: 8,
                    position: "relative",
                }, children: [_jsx("button", { type: "button", style: button("primary"), onClick: () => navigate("reward"), children: "Continue" }), _jsx("button", { type: "button", style: button("ghost"), onClick: () => go("world-select", "home"), children: "Back to map" })] })] }));
}
//# sourceMappingURL=VictoryScreen.js.map