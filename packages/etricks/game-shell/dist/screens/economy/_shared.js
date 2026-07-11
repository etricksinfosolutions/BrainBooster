import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEconomy, useShellState, useAccessibility, useNavigation, } from "../../runtime/context.js";
/**
 * Shared, game-NEUTRAL building blocks for the Economy screen group (Team Echo). Every value here is
 * either read from typed shell hooks or painted from the theme CSS custom properties the shell sets on
 * :root — no Brain-Booster literals, no hardcoded colours, no hardcoded currency names/amounts. The
 * authoritative wallet balances flow in from the economy port via state; the currency SKIN (labels +
 * icons) flows from `state.economySkin`. Screens compose these primitives so the group looks like one
 * coherent, accessible surface across tablet and phone.
 */
// --- tiny runtime narrowers for the ports' `unknown` payloads (ADR-0027 §5) -------------------------
/** Narrow an unknown value to a plain object, or null. */
export function asRecord(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v) ? v : null;
}
/** Narrow an unknown value to an array (empty array for anything else). */
export function asArray(v) {
    return Array.isArray(v) ? v : [];
}
/** A finite string, or null. */
export function asStr(v) {
    return typeof v === "string" ? v : null;
}
/** A finite number, or null (guards NaN/Infinity for safe arithmetic). */
export function asNum(v) {
    return typeof v === "number" && Number.isFinite(v) ? v : null;
}
/** A strict boolean-true check (unknown → boolean). */
export function isTrue(v) {
    return v === true;
}
// --- accessibility-derived style tokens -------------------------------------------------------------
/** Derived, accessibility-aware style tokens every economy screen shares. */
export function useUiTokens() {
    const a = useAccessibility();
    return {
        reducedMotion: a.reducedMotion,
        /** A transition string that collapses to "none" under reduced-motion. */
        transition: a.reducedMotion ? "none" : "transform .15s ease, box-shadow .15s ease, background .15s ease",
        /** Border width strengthens under high-contrast. */
        border: `${a.highContrast ? 2 : 1}px solid var(--line)`,
        strongBorder: `${a.highContrast ? 3 : 2}px solid var(--accent)`,
        /** Comfortable hit target; enlarges under big-buttons. */
        minTarget: a.bigButtons ? 64 : 48,
        pad: a.bigButtons ? 18 : 12,
        fontScale: a.bigButtons ? 1.12 : 1,
        highContrast: a.highContrast,
    };
}
// --- layout scaffold --------------------------------------------------------------------------------
/**
 * The shared screen frame: a sticky header with a back affordance (only when there is history) and a
 * scrollable body constrained to a comfortable reading width on tablets, full-bleed on phones.
 */
export function EconomyScreen({ title, subtitle, hud, children, }) {
    const nav = useNavigation();
    const t = useUiTokens();
    const canBack = nav.history.length > 0;
    return (_jsxs("div", { className: "es-screen", style: {
            minHeight: "100%",
            background: "var(--bg)",
            color: "var(--ink)",
            fontFamily: "var(--font)",
            display: "flex",
            flexDirection: "column",
        }, children: [_jsxs("header", { style: {
                    position: "sticky",
                    top: 0,
                    zIndex: 5,
                    background: "var(--surface)",
                    borderBottom: t.border,
                    padding: `${t.pad}px 16px`,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                }, children: [canBack && (_jsx("button", { type: "button", "aria-label": "Go back", onClick: () => nav.back(), style: {
                            minWidth: t.minTarget,
                            minHeight: t.minTarget,
                            borderRadius: "var(--radius)",
                            border: t.border,
                            background: "transparent",
                            color: "var(--ink)",
                            fontSize: 20,
                            cursor: "pointer",
                            transition: t.transition,
                        }, children: "←" })), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("h1", { style: {
                                    margin: 0,
                                    fontSize: `calc(1.35rem * ${t.fontScale})`,
                                    lineHeight: 1.15,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }, children: title }), subtitle ? (_jsx("p", { style: { margin: "2px 0 0", color: "var(--dim)", fontSize: ".9rem" }, children: subtitle })) : null] }), hud ? _jsx(WalletHud, { compact: true }) : null] }), _jsx("main", { style: {
                    flex: 1,
                    width: "100%",
                    maxWidth: 720,
                    margin: "0 auto",
                    padding: 16,
                    boxSizing: "border-box",
                }, children: children })] }));
}
// --- wallet HUD -------------------------------------------------------------------------------------
/**
 * Live balances from the authoritative wallet (state.economy) skinned by state.economySkin. Streak is
 * shown only when the game's economy config opts in. All amounts come from state — never hardcoded.
 */
export function WalletHud({ compact = false }) {
    const wallet = useEconomy();
    const skin = useShellState().economySkin;
    const t = useUiTokens();
    const Chip = ({ icon, label, value, }) => (_jsxs("span", { role: "status", "aria-label": `${value} ${label}`, title: label, style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: compact ? "4px 8px" : "6px 12px",
            borderRadius: "var(--radius)",
            border: t.border,
            background: "var(--bg)",
            color: "var(--ink)",
            fontSize: compact ? ".85rem" : `calc(1rem * ${t.fontScale})`,
            fontWeight: 700,
            whiteSpace: "nowrap",
        }, children: [_jsx("span", { "aria-hidden": "true", children: icon }), value.toLocaleString()] }));
    return (_jsxs("div", { role: "group", "aria-label": "Your balances", style: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "flex-end" }, children: [_jsx(Chip, { icon: skin.soft.icon, label: skin.soft.label, value: wallet.coins }), _jsx(Chip, { icon: skin.hard.icon, label: skin.hard.label, value: wallet.diamonds }), !compact && _jsx(Chip, { icon: skin.xp.icon, label: skin.xp.label, value: wallet.xp }), skin.showStreak && (_jsx(Chip, { icon: "🔥", label: "day streak", value: wallet.streakDays }))] }));
}
// --- primitives -------------------------------------------------------------------------------------
/** A themed surface card. */
export function Card({ children, style }) {
    const t = useUiTokens();
    return (_jsx("section", { style: {
            background: "var(--surface)",
            border: t.border,
            borderRadius: "var(--radius)",
            padding: t.pad + 4,
            ...style,
        }, children: children }));
}
/** A themed section heading. */
export function SectionTitle({ children }) {
    const t = useUiTokens();
    return (_jsx("h2", { style: { margin: "20px 0 10px", fontSize: `calc(1.05rem * ${t.fontScale})`, color: "var(--ink)" }, children: children }));
}
/** The primary call-to-action button, accessibility-aware and theme-painted. */
export function ActionButton({ children, onClick, disabled, variant = "primary", ariaLabel, full, }) {
    const t = useUiTokens();
    const primary = variant === "primary";
    return (_jsx("button", { type: "button", onClick: onClick, disabled: disabled, "aria-label": ariaLabel, style: {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: full ? "100%" : undefined,
            minHeight: t.minTarget,
            padding: `${t.pad}px ${t.pad + 8}px`,
            borderRadius: "var(--radius)",
            border: primary ? "none" : t.border,
            background: primary ? "var(--accent)" : "transparent",
            color: primary ? "var(--accent-ink)" : "var(--ink)",
            fontFamily: "var(--font)",
            fontSize: `calc(1rem * ${t.fontScale})`,
            fontWeight: 800,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.55 : 1,
            transition: t.transition,
        }, children: children }));
}
/**
 * A shared state block for the three data states every economy screen must render: LOADING (data still
 * hydrating from a port), EMPTY (port returned nothing), and ERROR (a port threw). Neutral copy only.
 */
export function StateBlock({ kind, message, onRetry, }) {
    const t = useUiTokens();
    const icon = kind === "loading" ? "⏳" : kind === "empty" ? "📭" : "⚠️";
    const color = kind === "error" ? "var(--bad)" : "var(--dim)";
    return (_jsxs("div", { role: kind === "error" ? "alert" : "status", "aria-busy": kind === "loading", style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            textAlign: "center",
            padding: "48px 16px",
            color,
        }, children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: 40 }, children: icon }), _jsx("p", { style: { margin: 0, fontSize: `calc(1rem * ${t.fontScale})` }, children: message }), onRetry && kind === "error" ? (_jsx(ActionButton, { variant: "ghost", onClick: onRetry, ariaLabel: "Try again", children: "Try again" })) : null] }));
}
/** Small helper: format a soft/hard/xp reward tri: only the parts that are present, using the skin. */
export function useRewardFormat() {
    const skin = useShellState().economySkin;
    return (reward) => {
        const parts = [];
        if (typeof reward.coins === "number" && reward.coins > 0)
            parts.push(`${skin.soft.icon} ${reward.coins}`);
        if (typeof reward.diamonds === "number" && reward.diamonds > 0)
            parts.push(`${skin.hard.icon} ${reward.diamonds}`);
        if (typeof reward.xp === "number" && reward.xp > 0)
            parts.push(`${skin.xp.icon} ${reward.xp}`);
        return parts.join("  ");
    };
}
//# sourceMappingURL=_shared.js.map