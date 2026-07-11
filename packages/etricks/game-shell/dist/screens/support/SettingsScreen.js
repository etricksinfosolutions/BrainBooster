import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useBranding, useNavigation, usePorts, useProfile, useSettings, useShell, useShellDispatch, } from "../../runtime/context.js";
import { ActionRow, Card, PrimaryButton, RowDivider, ScreenShell, SectionTitle, SliderRow, TitleBar, ToggleRow, useUiPrefs, } from "./_ui.js";
/** Human-facing endonyms for common locale codes; unknown codes fall back to their uppercased tag. */
const LOCALE_LABELS = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    pt: "Português",
    it: "Italiano",
    nl: "Nederlands",
    hi: "हिन्दी",
    bn: "বাংলা",
    ta: "தமிழ்",
    te: "తెలుగు",
    mr: "मराठी",
    ar: "العربية",
    zh: "中文",
    ja: "日本語",
    ko: "한국어",
    ru: "Русский",
    tr: "Türkçe",
    id: "Bahasa Indonesia",
    vi: "Tiếng Việt",
};
function localeLabel(code) {
    const base = code.split(/[-_]/)[0] ?? code;
    return LOCALE_LABELS[base] ?? code.toUpperCase();
}
export function SettingsScreen() {
    const { identity } = useShell();
    const settings = useSettings();
    const branding = useBranding();
    const ports = usePorts();
    const dispatch = useShellDispatch();
    const { navigate, canNavigate } = useNavigation();
    const prefs = useUiPrefs();
    // Boot hydration may not have populated the settings slice yet.
    if (!settings) {
        return (_jsxs(ScreenShell, { children: [_jsx(TitleBar, { title: "Settings", icon: "\u2699\uFE0F" }), _jsx(Card, { style: { padding: 20 }, children: _jsx("p", { style: { color: "var(--dim)", margin: 0 }, children: "Loading your preferences\u2026" }) })] }));
    }
    const patch = (p) => dispatch({ type: "UPDATE_SETTINGS", patch: p });
    const toggle = (k) => {
        const next = {};
        next[k] = !settings[k];
        patch(next);
    };
    const locales = identity.definition.locales;
    return (_jsxs(ScreenShell, { children: [_jsx(TitleBar, { title: "Settings", icon: "\u2699\uFE0F" }), _jsx(AccountSection, {}), _jsx(SectionTitle, { children: "Audio" }), _jsxs(Card, { children: [_jsx(ToggleRow, { icon: "\uD83C\uDFB5", label: "Music", hint: "Background themes as you play", checked: settings.music, onToggle: () => toggle("music") }), _jsx(SliderRow, { icon: "\uD83C\uDF9A\uFE0F", label: "Music volume", value: settings.musicVolume, disabled: !settings.music, onChange: (v) => patch({ musicVolume: v }) }), _jsx(RowDivider, {}), _jsx(ToggleRow, { icon: "\uD83D\uDD0A", label: "Sound effects", hint: "Taps, answers and celebrations", checked: settings.sound, onToggle: () => toggle("sound") }), _jsx(SliderRow, { icon: "\uD83C\uDF9A\uFE0F", label: "Effects volume", value: settings.sfxVolume, disabled: !settings.sound, onChange: (v) => patch({ sfxVolume: v }) })] }), _jsx(SectionTitle, { children: "Experience" }), _jsxs(Card, { children: [_jsx(ToggleRow, { icon: "\uD83D\uDDE3\uFE0F", label: "Voice", hint: "Read questions and hints out loud", checked: settings.voice, onToggle: () => toggle("voice") }), _jsx(RowDivider, {}), _jsx(ToggleRow, { icon: "\uD83D\uDD14", label: "Notifications", hint: "Daily reminders and streak nudges", checked: settings.notifications, onToggle: () => {
                            if (!settings.notifications)
                                void ports.notifications?.request();
                            toggle("notifications");
                        } })] }), _jsx(SectionTitle, { children: "Language" }), _jsx(Card, { style: { padding: 10 }, children: locales.length <= 1 ? (_jsxs("p", { style: { margin: 6, color: "var(--dim)", fontSize: "0.9rem" }, children: [localeLabel(locales[0] ?? settings.language), " is the only language available."] })) : (_jsx("div", { style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                        gap: 8,
                    }, children: locales.map((code) => {
                        const active = settings.language === code;
                        return (_jsx("button", { type: "button", "aria-pressed": active, onClick: () => patch({ language: code }), style: {
                                minHeight: prefs.controlMinHeight,
                                padding: prefs.controlPad,
                                borderRadius: "var(--radius)",
                                border: `${active ? 2 : prefs.borderWidth}px solid ${active ? "var(--accent)" : prefs.borderColor}`,
                                background: active ? "var(--accent)" : "var(--surface)",
                                color: active ? "var(--accent-ink)" : "var(--ink)",
                                fontWeight: active ? 700 : 500,
                                cursor: "pointer",
                                transition: prefs.transition,
                            }, children: localeLabel(code) }, code));
                    }) })) }), _jsx(SectionTitle, { children: "More" }), _jsxs(Card, { children: [_jsx(ActionRow, { icon: "\u267F", label: "Accessibility", hint: "Motion, contrast, button size and colour", onClick: () => navigate("accessibility"), disabled: !canNavigate("accessibility") }), _jsx(RowDivider, {}), _jsx(ActionRow, { icon: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", label: "For grown-ups", hint: "Parent & guardian area", onClick: () => navigate("parents"), disabled: !canNavigate("parents") })] }), _jsx(SectionTitle, { children: "Support" }), _jsxs(Card, { style: { padding: 12, gap: 10 }, children: [_jsx(PrimaryButton, { onClick: () => ports.analytics?.track("support_contact_open", { from: "settings" }), children: "\u2709\uFE0F Contact support" }), _jsxs("p", { style: { margin: 0, color: "var(--dim)", fontSize: "0.85rem", textAlign: "center" }, children: ["Questions about ", branding.displayName, "? We are happy to help."] })] }), _jsx(AboutCard, {})] }));
}
/**
 * The etricksEmpire ID account card — the cross-game player identity (à la "Supercell ID"). Signing in
 * backs a child's progress to the cloud so it's never lost and follows them across devices. Purely
 * port-driven: it calls the `AuthPort` and reflects the resolved `profile` — the same section works in
 * every manufactured game, branded generically. Providers unavailable offline surface a friendly error.
 */
function AccountSection() {
    const profile = useProfile();
    const ports = usePorts();
    const dispatch = useShellDispatch();
    const [busy, setBusy] = useState(null);
    const [error, setError] = useState(null);
    const run = (key, fn) => {
        setBusy(key);
        setError(null);
        void fn()
            .catch((e) => setError(e instanceof Error ? e.message : "Something went wrong. Please try again."))
            .finally(() => setBusy(null));
    };
    const signIn = (provider) => run(provider, async () => {
        if (!ports.auth)
            throw new Error("Sign-in isn’t available right now.");
        const p = provider === "guest" ? await ports.auth.signInGuest() : await ports.auth.signIn(provider);
        dispatch({ type: "SET_PROFILE", profile: p });
    });
    const signOut = () => run("signout", async () => {
        await ports.auth?.signOut();
        dispatch({ type: "SET_PROFILE", profile: null });
    });
    const providerBtn = (key, label, glyph) => (_jsxs("button", { type: "button", disabled: busy != null, onClick: () => signIn(key), style: {
            flex: 1,
            minWidth: 130,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "11px 14px",
            borderRadius: "var(--radius)",
            border: "1px solid var(--line)",
            background: "var(--surface)",
            color: "var(--ink)",
            fontWeight: 700,
            cursor: busy ? "default" : "pointer",
            opacity: busy && busy !== key ? 0.6 : 1,
            font: "inherit",
        }, children: [_jsx("span", { "aria-hidden": "true", children: glyph }), " ", busy === key ? "Signing in…" : label] }));
    return (_jsxs(_Fragment, { children: [_jsx(SectionTitle, { children: "etricksEmpire ID" }), _jsxs(Card, { style: { padding: 16, gap: 12 }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: 26 }, children: "\uD83D\uDC51" }), _jsxs("div", { children: [_jsx("strong", { style: { color: "var(--ink)" }, children: profile ? `Signed in as ${profile.displayName}` : "Save your game to the cloud" }), _jsx("div", { style: { color: "var(--dim)", fontSize: ".9rem" }, children: profile
                                            ? "Your progress is backed up — it follows you to any device and is never lost."
                                            : "Create your etricksEmpire ID so your progress is never forgotten, on any device." })] })] }), _jsxs("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" }, children: [providerBtn("google", "Continue with Google", "🅶"), providerBtn("apple", "Continue with Apple", "")] }), profile ? (_jsx("button", { type: "button", disabled: busy != null, onClick: signOut, style: {
                            alignSelf: "flex-start",
                            padding: "8px 16px",
                            borderRadius: "var(--radius)",
                            border: "1px solid var(--line)",
                            background: "transparent",
                            color: "var(--dim)",
                            fontWeight: 700,
                            cursor: "pointer",
                            font: "inherit",
                        }, children: busy === "signout" ? "Signing out…" : "Sign out" })) : (_jsx("button", { type: "button", disabled: busy != null, onClick: () => signIn("guest"), style: {
                            alignSelf: "flex-start",
                            padding: "8px 4px",
                            border: "none",
                            background: "transparent",
                            color: "var(--accent)",
                            fontWeight: 700,
                            cursor: "pointer",
                            font: "inherit",
                        }, children: busy === "guest" ? "Setting up…" : "Continue as guest for now" })), error ? (_jsxs("p", { role: "alert", style: { margin: 0, color: "var(--bad)", fontSize: ".9rem" }, children: ["\u26A0\uFE0F ", error] })) : null] })] }));
}
/** A compact About card that shows only resolved brand identity (name, tagline, mascot, icon). */
function AboutCard() {
    const branding = useBranding();
    const mascot = branding.mascot;
    return (_jsxs(Card, { style: { alignItems: "center", textAlign: "center", padding: 18, gap: 6, marginTop: 8 }, children: [branding.appIcon?.uri ? (_jsx("img", { src: branding.appIcon.uri, alt: branding.appIcon.alt ?? `${branding.displayName} icon`, style: { width: 64, height: 64, borderRadius: 16, objectFit: "cover" } })) : mascot?.art?.uri ? (_jsx("img", { src: mascot.art.uri, alt: mascot.art.alt ?? mascot.name, style: { width: 64, height: 64, objectFit: "contain" } })) : (_jsx("span", { "aria-hidden": "true", style: { fontSize: 40 }, children: "\uD83C\uDFAE" })), _jsx("strong", { style: { color: "var(--ink)", fontSize: "1.05rem" }, children: branding.displayName }), branding.tagline && _jsx("small", { style: { color: "var(--dim)" }, children: branding.tagline }), mascot?.name && (_jsxs("small", { style: { color: "var(--dim)" }, children: ["Your guide: ", mascot.name] }))] }));
}
//# sourceMappingURL=SettingsScreen.js.map