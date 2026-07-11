import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigation, useBranding, useEconomy, useProfile, useShellState, useAccessibility, } from "../../runtime/context.js";
import { avatarGlyph, levelForXp } from "./common.js";
/**
 * HomeScreen — the hub every manufactured game returns to (ADR-0027).
 *
 * Ported from the reference web app's hub screen, then fully de-branded: the
 * title comes from `useBranding().displayName`, the currency HUD is skinned from
 * `useShellState().economySkin` with live `useEconomy()` balances, the mascot is the resolved mascot
 * (hidden when a game has none), and every colour/font is a theme CSS variable. Nothing here names a
 * currency, mascot, studio or brand colour.
 */
export function HomeScreen() {
    const { navigate } = useNavigation();
    const branding = useBranding();
    const wallet = useEconomy();
    const profile = useProfile();
    const state = useShellState();
    const a11y = useAccessibility();
    const skin = state.economySkin;
    const { session, error, progress } = state;
    // ---- shared style tokens (theme-driven, accessibility-aware) --------------------------------
    const motion = a11y.reducedMotion ? "none" : "transform .14s ease, box-shadow .14s ease";
    const cardBorder = a11y.highContrast ? "2px solid var(--ink)" : "1px solid var(--line)";
    const tapMin = a11y.bigButtons ? 72 : 56;
    const screenStyle = {
        minHeight: "100%",
        boxSizing: "border-box",
        padding: "clamp(12px, 3vw, 24px)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: "var(--font)",
    };
    const cardStyle = {
        background: "var(--surface)",
        border: cardBorder,
        borderRadius: "var(--radius)",
        padding: "clamp(12px, 3vw, 20px)",
        color: "inherit",
        textAlign: "left",
        width: "100%",
        cursor: "pointer",
        transition: motion,
        font: "inherit",
    };
    // ---- ERROR state ----------------------------------------------------------------------------
    if (error) {
        return (_jsx("div", { style: screenStyle, role: "alert", children: _jsxs("div", { style: { ...cardStyle, cursor: "default", textAlign: "center" }, children: [_jsx("p", { style: { fontSize: "1.4rem", margin: 0 }, children: "\u26A0\uFE0F" }), _jsx("h1", { style: { fontSize: "1.2rem", margin: "8px 0 4px" }, children: "Something went wrong" }), _jsx("p", { style: { color: "var(--dim)", margin: 0 }, children: error.message })] }) }));
    }
    // ---- LOADING state (boot not finished, no profile yet) --------------------------------------
    if (!profile && session.status !== "ready") {
        return (_jsxs("div", { style: screenStyle, "aria-busy": "true", "aria-label": "Loading home", children: [_jsx("div", { style: { ...cardStyle, cursor: "default", height: 96, opacity: 0.6 }, "aria-hidden": "true" }), _jsx("div", { style: { ...cardStyle, cursor: "default", height: 128, opacity: 0.5 }, "aria-hidden": "true" }), _jsx("div", { style: { ...cardStyle, cursor: "default", height: 80, opacity: 0.4 }, "aria-hidden": "true" })] }));
    }
    const playerName = profile?.displayName ?? "there";
    const level = levelForXp(wallet.xp);
    const mascot = branding.mascot;
    const hasCheckpoint = progress.lastCheckpoint !== null;
    // ---- currency HUD chip -----------------------------------------------------------------------
    const chip = (icon, value, label) => (_jsxs("span", { style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 999,
            background: "var(--bg)",
            border: cardBorder,
            fontWeight: 700,
            fontSize: "0.95rem",
            whiteSpace: "nowrap",
        }, role: "status", "aria-label": `${value} ${label}`, title: label, children: [_jsx("span", { "aria-hidden": "true", children: icon }), value.toLocaleString()] }));
    const quickAction = (label, icon, to) => (_jsxs("button", { type: "button", onClick: () => navigate(to), style: {
            ...cardStyle,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            textAlign: "center",
            minHeight: tapMin + 24,
        }, "aria-label": label, children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: "1.9rem", lineHeight: 1 }, children: icon }), _jsx("span", { style: { fontWeight: 700, fontSize: "0.95rem" }, children: label })] }));
    return (_jsxs("div", { style: screenStyle, children: [_jsxs("header", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }, children: [_jsxs("div", { style: { minWidth: 0 }, children: [_jsx("h1", { style: {
                                            margin: 0,
                                            fontSize: "clamp(1.2rem, 4vw, 1.6rem)",
                                            color: "var(--accent)",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }, children: branding.displayName }), branding.tagline ? (_jsx("p", { style: { margin: "2px 0 0", color: "var(--dim)", fontSize: "0.85rem" }, children: branding.tagline })) : null] }), _jsxs("button", { type: "button", onClick: () => navigate("profile"), "aria-label": `Open profile for ${playerName}, level ${level}`, style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "6px 10px 6px 6px",
                                    borderRadius: 999,
                                    background: "var(--surface)",
                                    border: cardBorder,
                                    cursor: "pointer",
                                    color: "inherit",
                                    font: "inherit",
                                    minHeight: tapMin,
                                }, children: [_jsx("span", { "aria-hidden": "true", style: {
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: 40,
                                            height: 40,
                                            borderRadius: "50%",
                                            background: "var(--bg)",
                                            fontSize: "1.5rem",
                                        }, children: avatarGlyph(profile?.avatarId) }), _jsxs("span", { style: { display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2 }, children: [_jsx("span", { style: { fontWeight: 800, fontSize: "0.9rem", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: playerName }), _jsxs("span", { style: { fontSize: "0.75rem", color: "var(--dim)" }, children: ["Level ", level, profile?.premium ? " · ✨" : ""] })] })] })] }), _jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 }, role: "group", "aria-label": "Your balances", children: [chip(skin.soft.icon, wallet.coins, skin.soft.label), chip(skin.hard.icon, wallet.diamonds, skin.hard.label), chip(skin.xp.icon, wallet.xp, skin.xp.label)] })] }), _jsxs("section", { style: { display: "flex", alignItems: "center", gap: 14 }, "aria-label": "Welcome", children: [mascot ? (mascot.art?.uri ? (_jsx("img", { src: mascot.art.uri, alt: mascot.art.alt ?? mascot.name, width: 72, height: 72, draggable: false, style: { borderRadius: "50%", objectFit: "cover", flex: "0 0 auto" } })) : (_jsx("span", { role: "img", "aria-label": mascot.name, style: {
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 72,
                            height: 72,
                            borderRadius: "50%",
                            background: "var(--surface)",
                            border: cardBorder,
                            fontSize: "1.6rem",
                            fontWeight: 800,
                            color: "var(--accent)",
                            flex: "0 0 auto",
                        }, children: mascot.name.slice(0, 1).toUpperCase() }))) : null, _jsxs("div", { children: [_jsxs("p", { style: { margin: 0, color: "var(--dim)", fontSize: "0.95rem" }, children: ["Hi, ", playerName, "! \uD83D\uDC4B"] }), _jsx("h2", { style: { margin: "2px 0 0", fontSize: "clamp(1.3rem, 5vw, 1.8rem)" }, children: "Ready to play?" })] })] }), _jsxs("button", { type: "button", onClick: () => navigate("world-select"), style: {
                    ...cardStyle,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    background: "var(--accent)",
                    color: "var(--accent-ink)",
                    border: "none",
                    minHeight: tapMin + 24,
                }, "aria-label": hasCheckpoint ? "Continue playing where you left off" : "Start playing", children: [_jsx("span", { style: { fontSize: "0.85rem", opacity: 0.9, fontWeight: 700 }, children: hasCheckpoint ? "▶ Continue playing" : "▶ Start playing" }), _jsx("span", { style: { fontSize: "1.2rem", fontWeight: 800 }, children: hasCheckpoint && progress.lastCheckpoint
                            ? `${progress.lastCheckpoint.worldId} · ${progress.lastCheckpoint.levelId}`
                            : "Pick a world" })] }), skin.showStreak ? (_jsxs("button", { type: "button", onClick: () => navigate("daily-rewards"), style: { ...cardStyle, display: "flex", alignItems: "center", gap: 12, minHeight: tapMin }, "aria-label": `Daily rewards. Current streak ${wallet.streakDays} ${wallet.streakDays === 1 ? "day" : "days"}`, children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: "2rem", lineHeight: 1 }, children: "\uD83D\uDD25" }), _jsxs("span", { style: { display: "flex", flexDirection: "column" }, children: [_jsxs("span", { style: { fontWeight: 800 }, children: [wallet.streakDays, " day", wallet.streakDays === 1 ? "" : "s", " streak"] }), _jsx("span", { style: { fontSize: "0.85rem", color: "var(--dim)" }, children: "Play daily to claim your reward" })] }), _jsx("span", { "aria-hidden": "true", style: { marginLeft: "auto", color: "var(--dim)" }, children: "\u203A" })] })) : null, _jsxs("nav", { "aria-label": "Quick actions", style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }, children: [quickAction("Shop", "🛍️", "shop"), quickAction("Achievements", "🏅", "achievements"), quickAction("Settings", "⚙️", "settings")] })] }));
}
//# sourceMappingURL=HomeScreen.js.map