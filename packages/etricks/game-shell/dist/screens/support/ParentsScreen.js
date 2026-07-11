import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useBranding, useEconomy, useNavigation, usePorts, useProfile, useShellState, } from "../../runtime/context.js";
import { ActionRow, Card, PrimaryButton, RowDivider, ScreenShell, SectionTitle, TitleBar, useUiPrefs, } from "./_ui.js";
/**
 * ParentsScreen ("parents") — the parent/guardian area behind a simple parental gate. Neutral and
 * brand-driven: every piece of copy that would name a product reads from resolved branding, and the
 * only player data shown is the non-sensitive economy summary the shell already holds (no extra PII).
 * A screen-time card renders an honest EMPTY state because detailed reporting is a server surface the
 * shell does not yet own. Privacy / help / about are informational; the support action pings analytics.
 */
export function ParentsScreen() {
    const [unlocked, setUnlocked] = useState(false);
    if (!unlocked)
        return _jsx(ParentalGate, { onUnlock: () => setUnlocked(true) });
    return _jsx(ParentsDashboard, {});
}
/** A lightweight parental gate: a multiplication an adult answers instantly, a child likely cannot. */
function ParentalGate({ onUnlock }) {
    const prefs = useUiPrefs();
    // Stable per mount so the question does not change while typing.
    const { a, b } = useMemo(() => ({ a: 6 + Math.floor(Math.random() * 6), b: 3 + Math.floor(Math.random() * 6) }), []);
    const [entry, setEntry] = useState("");
    const [error, setError] = useState(false);
    const submit = () => {
        if (Number(entry) === a * b)
            onUnlock();
        else {
            setError(true);
            setEntry("");
        }
    };
    return (_jsxs(ScreenShell, { children: [_jsx(TitleBar, { title: "For grown-ups", icon: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67" }), _jsxs(Card, { style: { padding: 20, gap: 14, alignItems: "center", textAlign: "center" }, children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: 40 }, children: "\uD83D\uDD12" }), _jsx("strong", { style: { color: "var(--ink)", fontSize: "1.05rem" }, children: "Parental check" }), _jsxs("p", { style: { margin: 0, color: "var(--dim)" }, children: ["Ask a grown-up: what is ", _jsxs("b", { style: { color: "var(--ink)" }, children: [a, " \u00D7 ", b] }), "?"] }), _jsxs("div", { style: { display: "flex", gap: 10, width: "100%", maxWidth: 320 }, children: [_jsx("input", { inputMode: "numeric", pattern: "[0-9]*", value: entry, "aria-label": "Answer to the parental check", "aria-invalid": error, onChange: (e) => {
                                    setEntry(e.target.value);
                                    setError(false);
                                }, onKeyDown: (e) => {
                                    if (e.key === "Enter")
                                        submit();
                                }, style: {
                                    flex: 1,
                                    minHeight: prefs.controlMinHeight,
                                    padding: prefs.controlPad,
                                    borderRadius: "var(--radius)",
                                    border: `${error ? 2 : prefs.borderWidth}px solid ${error ? "var(--bad)" : prefs.borderColor}`,
                                    background: "var(--bg)",
                                    color: "var(--ink)",
                                    fontSize: "1.1rem",
                                    textAlign: "center",
                                } }), _jsx(PrimaryButton, { onClick: submit, children: "Open" })] }), error && (_jsx("small", { role: "alert", style: { color: "var(--bad)" }, children: "Not quite \u2014 please try again." }))] })] }));
}
function ParentsDashboard() {
    const branding = useBranding();
    const economy = useEconomy();
    const economySkin = useShellState().economySkin;
    const profile = useProfile();
    const ports = usePorts();
    const { navigate, canNavigate } = useNavigation();
    const stats = [
        { icon: economySkin.soft.icon, value: economy?.coins ?? 0, label: economySkin.soft.label, show: true },
        { icon: economySkin.xp.icon, value: economy?.xp ?? 0, label: economySkin.xp.label, show: true },
        {
            icon: "🔥",
            value: economy?.streakDays ?? 0,
            label: "Day streak",
            show: economySkin.showStreak,
        },
    ].filter((s) => s.show);
    return (_jsxs(ScreenShell, { children: [_jsx(TitleBar, { title: "For grown-ups", icon: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67" }), profile && (_jsxs(Card, { style: { padding: 14 }, children: [_jsx("span", { style: { color: "var(--dim)", fontSize: "0.85rem" }, children: "Player" }), _jsx("strong", { style: { color: "var(--ink)", fontSize: "1.05rem" }, children: profile.displayName })] })), _jsx(SectionTitle, { children: "Progress" }), _jsx(Card, { style: { padding: 12 }, children: _jsx("div", { style: {
                        display: "grid",
                        gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
                        gap: 8,
                        textAlign: "center",
                    }, children: stats.map((s) => (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 2, padding: 6 }, children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: 22 }, children: s.icon }), _jsx("strong", { style: { color: "var(--ink)", fontSize: "1.3rem" }, children: s.value }), _jsx("small", { style: { color: "var(--dim)" }, children: s.label })] }, s.label))) }) }), _jsx(SectionTitle, { children: "Screen time" }), _jsxs(Card, { style: { padding: 18, alignItems: "center", textAlign: "center", gap: 8 }, children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: 32 }, children: "\u23F3" }), _jsxs("p", { style: { margin: 0, color: "var(--dim)" }, children: ["Weekly screen-time reports for ", branding.displayName, " appear here as your child plays."] })] }), _jsx(SectionTitle, { children: "Privacy & safety" }), _jsxs(Card, { children: [_jsx(ActionRow, { icon: "\uD83D\uDEE1\uFE0F", label: "Privacy policy", hint: `How ${branding.displayName} handles your family's data`, marker: "\u2197", onClick: () => ports.analytics?.track("privacy_open", { from: "parents" }) }), _jsx(RowDivider, {}), _jsx(ActionRow, { icon: "\u2753", label: "Help centre", hint: "Guides and answers to common questions", marker: "\u2197", onClick: () => ports.analytics?.track("help_open", { from: "parents" }) }), _jsx(RowDivider, {}), _jsx(ActionRow, { icon: "\u2699\uFE0F", label: "App settings", hint: "Sound, language and accessibility", onClick: () => navigate("settings"), disabled: !canNavigate("settings") })] }), _jsx(SectionTitle, { children: "Support" }), _jsxs(Card, { style: { padding: 12, gap: 10 }, children: [_jsx(PrimaryButton, { onClick: () => ports.analytics?.track("support_contact_open", { from: "parents" }), children: "\u2709\uFE0F Contact support" }), _jsxs("p", { style: { margin: 0, color: "var(--dim)", fontSize: "0.85rem", textAlign: "center" }, children: ["Our team is here to help with anything about ", branding.displayName, "."] })] }), _jsxs(Card, { style: { alignItems: "center", textAlign: "center", padding: 18, gap: 6, marginTop: 8 }, children: [branding.appIcon?.uri ? (_jsx("img", { src: branding.appIcon.uri, alt: branding.appIcon.alt ?? `${branding.displayName} icon`, style: { width: 56, height: 56, borderRadius: 14, objectFit: "cover" } })) : (_jsx("span", { "aria-hidden": "true", style: { fontSize: 36 }, children: "\uD83C\uDFAE" })), _jsx("strong", { style: { color: "var(--ink)" }, children: branding.displayName }), branding.tagline && _jsx("small", { style: { color: "var(--dim)" }, children: branding.tagline })] })] }));
}
//# sourceMappingURL=ParentsScreen.js.map