import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigation, useEconomy, useProfile, usePorts, useShellDispatch, useAccessibility, } from "../../runtime/context.js";
import { avatarGlyph, levelForXp } from "./common.js";
/**
 * ProfileScreen — the player's own summary and account controls.
 *
 * Player identity comes from `useProfile()` (server-authoritative), the level is derived from live XP,
 * and sign-out goes through the injected `auth` port. Fully de-branded: no currency/mascot/studio
 * literals, all styling via theme CSS variables. Renders an EMPTY state when there is no profile.
 */
export function ProfileScreen() {
    const { navigate } = useNavigation();
    const profile = useProfile();
    const wallet = useEconomy();
    const ports = usePorts();
    const dispatch = useShellDispatch();
    const a11y = useAccessibility();
    const [editing, setEditing] = useState(false);
    const [draftName, setDraftName] = useState("");
    const [signingOut, setSigningOut] = useState(false);
    const cardBorder = a11y.highContrast ? "2px solid var(--ink)" : "1px solid var(--line)";
    const tapMin = a11y.bigButtons ? 64 : 48;
    const motion = a11y.reducedMotion ? "none" : "background .14s ease";
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
        padding: "clamp(14px, 3vw, 22px)",
    };
    const buttonStyle = {
        minHeight: tapMin,
        padding: "0 18px",
        borderRadius: "var(--radius)",
        border: cardBorder,
        background: "var(--surface)",
        color: "var(--ink)",
        fontWeight: 700,
        fontFamily: "inherit",
        cursor: "pointer",
        transition: motion,
    };
    const primaryButtonStyle = {
        ...buttonStyle,
        background: "var(--accent)",
        color: "var(--accent-ink)",
        border: "none",
    };
    const header = (title) => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [_jsx("button", { type: "button", onClick: () => navigate("home"), "aria-label": "Back to home", style: { ...buttonStyle, padding: 0, width: tapMin, minWidth: tapMin }, children: "\u2039" }), _jsx("h1", { style: { margin: 0, fontSize: "clamp(1.2rem, 4vw, 1.5rem)" }, children: title })] }));
    // ---- EMPTY state: no profile (guest / signed out) -------------------------------------------
    if (!profile) {
        return (_jsxs("div", { style: screenStyle, children: [header("Profile"), _jsxs("div", { style: { ...cardStyle, textAlign: "center" }, children: [_jsx("p", { "aria-hidden": "true", style: { fontSize: "2.4rem", margin: 0 }, children: "\uD83D\uDC64" }), _jsx("h2", { style: { margin: "8px 0 4px", fontSize: "1.2rem" }, children: "You're not signed in" }), _jsx("p", { style: { color: "var(--dim)", margin: "0 0 16px" }, children: "Sign in to save your progress and sync across devices." }), _jsx("button", { type: "button", style: primaryButtonStyle, onClick: () => navigate("home"), children: "Back to home" })] })] }));
    }
    const level = levelForXp(wallet.xp);
    const startEdit = () => {
        setDraftName(profile.displayName);
        setEditing(true);
    };
    const saveName = () => {
        const name = draftName.trim();
        if (name.length > 0 && name !== profile.displayName) {
            dispatch({ type: "SET_PROFILE", profile: { ...profile, displayName: name } });
        }
        setEditing(false);
    };
    const signOut = async () => {
        if (signingOut)
            return;
        setSigningOut(true);
        try {
            await ports.auth?.signOut();
            dispatch({ type: "SET_PROFILE", profile: null });
            navigate("home");
        }
        finally {
            setSigningOut(false);
        }
    };
    return (_jsxs("div", { style: screenStyle, children: [header("Profile"), _jsxs("section", { style: { ...cardStyle, display: "flex", alignItems: "center", gap: 16 }, children: [_jsx("span", { role: "img", "aria-label": `Avatar for ${profile.displayName}`, style: {
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 72,
                            height: 72,
                            borderRadius: "50%",
                            background: "var(--bg)",
                            border: cardBorder,
                            fontSize: "2.4rem",
                            flex: "0 0 auto",
                        }, children: avatarGlyph(profile.avatarId) }), _jsxs("div", { style: { minWidth: 0, flex: 1 }, children: [editing ? (_jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [_jsx("input", { value: draftName, onChange: (e) => setDraftName(e.target.value), "aria-label": "Display name", maxLength: 40, style: {
                                            flex: 1,
                                            minWidth: 0,
                                            padding: "8px 10px",
                                            borderRadius: 10,
                                            border: cardBorder,
                                            background: "var(--bg)",
                                            color: "var(--ink)",
                                            fontFamily: "inherit",
                                            fontSize: "1rem",
                                        }, onKeyDown: (e) => {
                                            if (e.key === "Enter")
                                                saveName();
                                            if (e.key === "Escape")
                                                setEditing(false);
                                        } }), _jsx("button", { type: "button", style: primaryButtonStyle, onClick: saveName, "aria-label": "Save name", children: "Save" })] })) : (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [_jsx("h2", { style: {
                                            margin: 0,
                                            fontSize: "1.4rem",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }, children: profile.displayName }), profile.premium ? (_jsx("span", { style: {
                                            fontSize: "0.75rem",
                                            fontWeight: 800,
                                            padding: "3px 10px",
                                            borderRadius: 999,
                                            background: "var(--accent)",
                                            color: "var(--accent-ink)",
                                        }, "aria-label": "Premium member", children: "\u2728 Premium" })) : null, _jsx("button", { type: "button", onClick: startEdit, "aria-label": "Edit name", style: {
                                            ...buttonStyle,
                                            minHeight: 0,
                                            padding: "4px 10px",
                                            fontSize: "0.8rem",
                                        }, children: "\u270F\uFE0F Edit" })] })), _jsxs("p", { style: { margin: "6px 0 0", color: "var(--dim)" }, children: ["Level ", level, " \u00B7 ", wallet.xp.toLocaleString(), " XP"] })] })] }), _jsxs("section", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [_jsxs("button", { type: "button", style: { ...buttonStyle, textAlign: "left", display: "flex", alignItems: "center", gap: 10 }, onClick: () => navigate("avatar"), children: [_jsx("span", { "aria-hidden": "true", children: "\uD83C\uDFAD" }), " Change avatar", _jsx("span", { "aria-hidden": "true", style: { marginLeft: "auto", color: "var(--dim)" }, children: "\u203A" })] }), _jsxs("button", { type: "button", style: { ...buttonStyle, textAlign: "left", display: "flex", alignItems: "center", gap: 10 }, onClick: () => navigate("settings"), children: [_jsx("span", { "aria-hidden": "true", children: "\u2699\uFE0F" }), " Settings", _jsx("span", { "aria-hidden": "true", style: { marginLeft: "auto", color: "var(--dim)" }, children: "\u203A" })] }), ports.auth ? (_jsx("button", { type: "button", style: { ...buttonStyle, color: "var(--bad)", textAlign: "left" }, onClick: () => void signOut(), disabled: signingOut, "aria-busy": signingOut, children: signingOut ? "Signing out…" : "Sign out" })) : null] })] }));
}
//# sourceMappingURL=ProfileScreen.js.map