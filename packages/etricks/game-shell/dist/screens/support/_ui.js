import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAccessibility, useNavigation } from "../../runtime/context.js";
/**
 * Shared, game-neutral presentation primitives for the Support surfaces (settings / accessibility /
 * parents). Every primitive paints exclusively from the shell's CSS custom properties (`var(--bg)`,
 * `var(--surface)`, …) so a game re-skins them for free, and each one honours the live accessibility
 * slice (`bigButtons`, `highContrast`, `reducedMotion`). Nothing here hardcodes a brand colour, font,
 * or name. These are internal to the group (prefixed `_`) — not screens, not part of the registry.
 */
/** Derived styling knobs from the live accessibility preferences — read once per component. */
export function useUiPrefs() {
    const a11y = useAccessibility();
    return {
        ...a11y,
        /** High contrast: thicker, ink-coloured outlines instead of the subtle line token. */
        borderWidth: a11y.highContrast ? 2 : 1,
        borderColor: a11y.highContrast ? "var(--ink)" : "var(--line)",
        /** Big buttons: enlarge hit targets and type for small hands. */
        controlMinHeight: a11y.bigButtons ? 64 : 52,
        controlPad: a11y.bigButtons ? "16px 18px" : "12px 14px",
        fontScale: a11y.bigButtons ? 1.12 : 1,
        /** Reduced motion: transitions become instant everywhere. */
        transition: a11y.reducedMotion ? "none" : "all 140ms ease",
    };
}
/** Full-screen, scrollable page frame: themed background, safe padding, phone→tablet responsive. */
export function ScreenShell({ children }) {
    const style = {
        boxSizing: "border-box",
        minHeight: "100%",
        width: "100%",
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: "var(--font)",
        padding: "16px clamp(12px, 4vw, 28px) 48px",
        overflowY: "auto",
    };
    return (_jsx("div", { style: style, children: _jsx("div", { style: { maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }, children: children }) }));
}
/** A title row with a Back affordance wired to the shell's typed navigation history. */
export function TitleBar({ title, icon }) {
    const { back, history } = useNavigation();
    const prefs = useUiPrefs();
    const canBack = history.length > 0;
    return (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, paddingBlock: 4 }, children: [canBack && (_jsx("button", { type: "button", onClick: back, "aria-label": "Go back", style: {
                    flex: "0 0 auto",
                    minWidth: prefs.controlMinHeight,
                    minHeight: prefs.controlMinHeight,
                    borderRadius: "var(--radius)",
                    border: `${prefs.borderWidth}px solid ${prefs.borderColor}`,
                    background: "var(--surface)",
                    color: "var(--ink)",
                    fontSize: 22,
                    cursor: "pointer",
                    transition: prefs.transition,
                }, children: "\u2039" })), _jsxs("h1", { style: {
                    margin: 0,
                    fontSize: `calc(1.4rem * ${prefs.fontScale})`,
                    fontWeight: 800,
                    color: "var(--ink)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                }, children: [icon && (_jsx("span", { "aria-hidden": "true", style: { fontSize: "1.1em" }, children: icon })), title] })] }));
}
/** A labelled group heading that separates sections within a screen. */
export function SectionTitle({ children }) {
    return (_jsx("h2", { style: {
            margin: "10px 0 2px",
            fontSize: "0.95rem",
            fontWeight: 700,
            letterSpacing: "0.02em",
            color: "var(--dim)",
            textTransform: "uppercase",
        }, children: children }));
}
/** A rounded surface card the sections sit inside. */
export function Card({ children, style }) {
    const prefs = useUiPrefs();
    return (_jsx("div", { style: {
            background: "var(--surface)",
            border: `${prefs.borderWidth}px solid ${prefs.borderColor}`,
            borderRadius: "var(--radius)",
            padding: 6,
            display: "flex",
            flexDirection: "column",
            ...style,
        }, children: children }));
}
function Labels({ icon, label, hint }) {
    const prefs = useUiPrefs();
    return (_jsxs("span", { style: { display: "flex", flexDirection: "column", gap: 2, textAlign: "left", minWidth: 0 }, children: [_jsxs("strong", { style: { fontSize: `calc(1rem * ${prefs.fontScale})`, color: "var(--ink)" }, children: [icon && (_jsx("span", { "aria-hidden": "true", style: { marginRight: 8 }, children: icon })), label] }), hint && _jsx("small", { style: { color: "var(--dim)", lineHeight: 1.3 }, children: hint })] }));
}
/** An accessible on/off switch row (role="switch"). Fully controlled by the caller. */
export function ToggleRow({ checked, onToggle, label, hint, icon, disabled, }) {
    const prefs = useUiPrefs();
    return (_jsxs("button", { type: "button", role: "switch", "aria-checked": checked, "aria-label": label, disabled: disabled, onClick: onToggle, style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            width: "100%",
            minHeight: prefs.controlMinHeight,
            padding: prefs.controlPad,
            border: "none",
            background: "transparent",
            borderRadius: "var(--radius)",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
            transition: prefs.transition,
        }, children: [_jsx(Labels, { icon: icon, label: label, hint: hint }), _jsx("span", { "aria-hidden": "true", style: {
                    flex: "0 0 auto",
                    width: 52,
                    height: 30,
                    borderRadius: 999,
                    background: checked ? "var(--accent)" : "var(--line)",
                    border: `${prefs.borderWidth}px solid ${checked ? "var(--accent)" : prefs.borderColor}`,
                    position: "relative",
                    transition: prefs.transition,
                }, children: _jsx("span", { style: {
                        position: "absolute",
                        top: 2,
                        left: checked ? 24 : 2,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "var(--surface)",
                        boxShadow: prefs.highContrast ? "none" : "0 1px 2px rgba(0,0,0,0.25)",
                        transition: prefs.transition,
                    } }) })] }));
}
/** A 0–1 valued slider row rendered as a percentage. Disabled state dims the row. */
export function SliderRow({ label, icon, value, onChange, disabled, }) {
    const prefs = useUiPrefs();
    const pct = Math.round(clamp01(value) * 100);
    return (_jsxs("div", { style: {
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: prefs.controlPad,
            opacity: disabled ? 0.5 : 1,
        }, children: [_jsxs("span", { style: { flex: "0 0 auto", color: "var(--ink)", fontSize: `calc(0.95rem * ${prefs.fontScale})` }, children: [icon && (_jsx("span", { "aria-hidden": "true", style: { marginRight: 6 }, children: icon })), label] }), _jsx("input", { type: "range", min: 0, max: 100, value: pct, disabled: disabled, "aria-label": label, onChange: (e) => onChange(Number(e.target.value) / 100), style: { flex: 1, accentColor: "var(--accent)", cursor: disabled ? "not-allowed" : "pointer" } }), _jsx("b", { style: { flex: "0 0 auto", minWidth: 34, textAlign: "right", color: "var(--dim)" }, children: pct })] }));
}
/** A tappable row that navigates or triggers an action, with a trailing chevron/marker. */
export function ActionRow({ label, hint, icon, onClick, disabled, marker = "›", }) {
    const prefs = useUiPrefs();
    return (_jsxs("button", { type: "button", onClick: onClick, disabled: disabled, "aria-label": label, style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            width: "100%",
            minHeight: prefs.controlMinHeight,
            padding: prefs.controlPad,
            border: "none",
            background: "transparent",
            borderRadius: "var(--radius)",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
            transition: prefs.transition,
        }, children: [_jsx(Labels, { icon: icon, label: label, hint: hint }), _jsx("span", { "aria-hidden": "true", style: { flex: "0 0 auto", color: "var(--dim)", fontSize: 20 }, children: marker })] }));
}
/** A thin divider between rows inside a card. */
export function RowDivider() {
    const prefs = useUiPrefs();
    return _jsx("div", { "aria-hidden": "true", style: { height: prefs.borderWidth, background: prefs.borderColor, opacity: 0.6 } });
}
/** A primary call-to-action button using the accent token. */
export function PrimaryButton({ children, onClick, disabled, }) {
    const prefs = useUiPrefs();
    return (_jsx("button", { type: "button", onClick: onClick, disabled: disabled, style: {
            minHeight: prefs.controlMinHeight,
            padding: prefs.controlPad,
            borderRadius: "var(--radius)",
            border: `${prefs.borderWidth}px solid var(--accent)`,
            background: "var(--accent)",
            color: "var(--accent-ink)",
            fontWeight: 700,
            fontSize: `calc(1rem * ${prefs.fontScale})`,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
            transition: prefs.transition,
        }, children: children }));
}
export function clamp01(n) {
    if (Number.isNaN(n))
        return 0;
    return Math.min(1, Math.max(0, n));
}
//# sourceMappingURL=_ui.js.map