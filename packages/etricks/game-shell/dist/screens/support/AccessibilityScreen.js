import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAccessibility, useNavigation, useShellDispatch } from "../../runtime/context.js";
import { ActionRow, Card, RowDivider, ScreenShell, SectionTitle, TitleBar, ToggleRow, useUiPrefs, } from "./_ui.js";
const OPTIONS = [
    { key: "reducedMotion", icon: "🌀", label: "Reduce motion", hint: "Calmer screens with less animation and movement" },
    { key: "highContrast", icon: "◐", label: "High contrast", hint: "Stronger outlines and colours for easier reading" },
    { key: "bigButtons", icon: "🔘", label: "Big buttons", hint: "Larger targets and text for small hands" },
    { key: "colorBlind", icon: "🎨", label: "Colour-blind friendly", hint: "Adds shapes and patterns alongside colour" },
];
export function AccessibilityScreen() {
    const a11y = useAccessibility();
    const dispatch = useShellDispatch();
    const { navigate, canNavigate } = useNavigation();
    if (!a11y) {
        return (_jsxs(ScreenShell, { children: [_jsx(TitleBar, { title: "Accessibility", icon: "\u267F" }), _jsx(Card, { style: { padding: 20 }, children: _jsx("p", { style: { color: "var(--dim)", margin: 0 }, children: "Loading your preferences\u2026" }) })] }));
    }
    const toggle = (k) => {
        const next = {};
        next[k] = !a11y[k];
        dispatch({ type: "UPDATE_ACCESSIBILITY", patch: next });
    };
    return (_jsxs(ScreenShell, { children: [_jsx(TitleBar, { title: "Accessibility", icon: "\u267F" }), _jsx(PreviewPanel, {}), _jsx(SectionTitle, { children: "Preferences" }), _jsx(Card, { children: OPTIONS.map((opt, i) => (_jsxs("div", { children: [i > 0 && _jsx(RowDivider, {}), _jsx(ToggleRow, { icon: opt.icon, label: opt.label, hint: opt.hint, checked: a11y[opt.key], onToggle: () => toggle(opt.key) })] }, opt.key))) }), _jsx(Card, { children: _jsx(ActionRow, { icon: "\u2699\uFE0F", label: "Back to settings", onClick: () => navigate("settings"), disabled: !canNavigate("settings") }) })] }));
}
/** A small panel that visibly reflects the current preferences so changes preview live. */
function PreviewPanel() {
    const a11y = useAccessibility();
    const prefs = useUiPrefs();
    return (_jsxs(Card, { style: { padding: 16, gap: 12 }, children: [_jsx("span", { style: { color: "var(--dim)", fontSize: "0.85rem", fontWeight: 700 }, children: "Live preview" }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }, children: [_jsx("button", { type: "button", onClick: () => undefined, "aria-label": "Preview button", style: {
                            minHeight: prefs.controlMinHeight,
                            padding: prefs.controlPad,
                            borderRadius: "var(--radius)",
                            border: `${prefs.borderWidth}px solid var(--accent)`,
                            background: "var(--accent)",
                            color: "var(--accent-ink)",
                            fontWeight: 700,
                            fontSize: `calc(1rem * ${prefs.fontScale})`,
                            transition: prefs.transition,
                        }, children: "Sample button" }), _jsxs("span", { style: {
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            color: "var(--ok)",
                            fontWeight: 700,
                            fontSize: `calc(0.95rem * ${prefs.fontScale})`,
                        }, children: [a11y.colorBlind && _jsx("span", { "aria-hidden": "true", children: "\u2713" }), "Correct"] }), _jsxs("span", { style: {
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            color: "var(--bad)",
                            fontWeight: 700,
                            fontSize: `calc(0.95rem * ${prefs.fontScale})`,
                        }, children: [a11y.colorBlind && _jsx("span", { "aria-hidden": "true", children: "\u2715" }), "Try again"] }), _jsx("span", { "aria-hidden": "true", style: {
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            border: `3px solid ${prefs.borderColor}`,
                            borderTopColor: "var(--accent)",
                            animation: a11y.reducedMotion ? "none" : "spin 900ms linear infinite",
                        } })] }), _jsxs("p", { style: { margin: 0, color: "var(--dim)", fontSize: "0.85rem" }, children: ["Changes apply everywhere in ", "", _jsx("b", { style: { color: "var(--ink)" }, children: "real time" }), " \u2014 no restart needed."] }), _jsx("style", { children: "@keyframes spin { to { transform: rotate(360deg); } }" })] }));
}
//# sourceMappingURL=AccessibilityScreen.js.map