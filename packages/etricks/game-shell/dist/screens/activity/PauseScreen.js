import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigation, useBranding, useAccessibility } from "../../runtime/context.js";
/**
 * PauseScreen ("pause") — a modal overlay over the paused activity: Resume (back to the activity),
 * Restart (remount the activity), Settings, and Quit to home. Ported from the reference app's modal
 * pattern, generalised (no brand copy). Motion is disabled when the player asks for reduced motion.
 */
export function PauseScreen() {
    const { back, navigate } = useNavigation();
    const branding = useBranding();
    const a11y = useAccessibility();
    const button = (variant) => ({
        width: "100%",
        padding: a11y.bigButtons ? "18px 24px" : "14px 22px",
        minHeight: a11y.bigButtons ? 56 : 48,
        fontFamily: "var(--font)",
        fontSize: a11y.bigButtons ? "1.15rem" : "1.02rem",
        fontWeight: 700,
        borderRadius: "var(--radius)",
        cursor: "pointer",
        transition: a11y.reducedMotion ? "none" : "filter .12s ease",
        border: variant === "primary"
            ? "none"
            : `${a11y.highContrast ? 2 : 1}px solid ${variant === "danger" ? "var(--bad)" : "var(--line)"}`,
        background: variant === "primary" ? "var(--accent)" : "var(--surface)",
        color: variant === "primary" ? "var(--accent-ink)" : variant === "danger" ? "var(--bad)" : "var(--ink)",
    });
    return (_jsx("div", { role: "dialog", "aria-modal": "true", "aria-label": "Paused", style: {
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(16px, 5vw, 32px)",
            background: "color-mix(in srgb, var(--ink) 55%, transparent)",
            fontFamily: "var(--font)",
            boxSizing: "border-box",
            zIndex: 50,
            animation: a11y.reducedMotion ? "none" : undefined,
        }, onClick: () => back(), children: _jsxs("div", { onClick: (e) => e.stopPropagation(), style: {
                width: "100%",
                maxWidth: 380,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                padding: "clamp(20px, 5vw, 32px)",
                borderRadius: "var(--radius)",
                background: "var(--bg)",
                color: "var(--ink)",
                border: `${a11y.highContrast ? 2 : 1}px solid var(--line)`,
                boxShadow: a11y.highContrast ? "none" : "0 20px 60px rgba(0,0,0,.28)",
                boxSizing: "border-box",
                textAlign: "center",
            }, children: [_jsx("h1", { style: { margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 800 }, children: "Paused" }), _jsxs("p", { style: { margin: "0 0 8px", color: "var(--dim)", fontSize: "0.95rem" }, children: ["Take a breath \u2014 ", branding.displayName, " will be right here."] }), _jsx("button", { type: "button", style: button("primary"), onClick: () => back(), "aria-label": "Resume", children: "Resume" }), _jsx("button", { type: "button", style: button("ghost"), onClick: () => navigate("activity"), "aria-label": "Restart level", children: "Restart" }), _jsx("button", { type: "button", style: button("ghost"), onClick: () => navigate("settings"), "aria-label": "Open settings", children: "Settings" }), _jsx("button", { type: "button", style: button("danger"), onClick: () => navigate("home"), "aria-label": "Quit to home", children: "Quit to home" })] }) }));
}
//# sourceMappingURL=PauseScreen.js.map