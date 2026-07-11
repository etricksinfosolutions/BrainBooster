import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useBranding, useAccessibility, useNavigation, usePorts, useShellDispatch, } from "../../runtime/context.js";
import { LaunchStage, MascotBadge, BrandArt, launchButtonStyle } from "./shared.js";
export function LoginScreen() {
    const branding = useBranding();
    const a11y = useAccessibility();
    const { navigate } = useNavigation();
    const dispatch = useShellDispatch();
    const auth = usePorts().auth;
    const [pending, setPending] = useState(null);
    const [error, setError] = useState(null);
    const busy = pending !== null;
    const succeed = (profile) => {
        dispatch({ type: "SET_PROFILE", profile });
        navigate("home");
    };
    const attempt = async (provider) => {
        if (!auth || busy)
            return;
        setError(null);
        setPending(provider);
        try {
            const profile = provider === "guest" ? await auth.signInGuest() : await auth.signIn(provider);
            succeed(profile);
        }
        catch {
            setError(provider === "guest"
                ? "Couldn't start a guest session. Please try again."
                : `${label(provider)} sign-in didn't work. Please try again.`);
            setPending(null);
        }
    };
    // No auth port wired: the game runs without sign-in — offer a clear way to continue.
    if (!auth) {
        return (_jsxs(LaunchStage, { ariaLabel: "Sign in unavailable", reducedMotion: a11y.reducedMotion, children: [_jsx(BrandArt, { art: branding.logo, fallbackLabel: branding.displayName, size: 132, reducedMotion: a11y.reducedMotion }), _jsx("h1", { style: { margin: 0, fontSize: "clamp(1.5rem, 5vw, 2rem)", color: "var(--ink)" }, children: branding.displayName }), _jsx("p", { style: { margin: 0, color: "var(--dim)", maxWidth: 380, lineHeight: 1.5 }, children: "Sign-in isn't set up for this game. You can jump straight in." }), _jsx("button", { type: "button", onClick: () => navigate("home"), style: launchButtonStyle("primary", a11y, { fullWidth: true }), "aria-label": "Continue to home", children: "Continue" })] }));
    }
    return (_jsxs(LaunchStage, { ariaLabel: `Sign in to ${branding.displayName}`, reducedMotion: a11y.reducedMotion, children: [_jsx(MascotBadge, { mascot: branding.mascot, size: 110, reducedMotion: a11y.reducedMotion }), !branding.mascot ? (_jsx(BrandArt, { art: branding.logo, fallbackLabel: branding.displayName, size: 110, reducedMotion: a11y.reducedMotion })) : null, _jsxs("div", { style: { display: "grid", gap: 6 }, children: [_jsx("h1", { style: { margin: 0, fontSize: "clamp(1.5rem, 5vw, 2rem)", color: "var(--ink)" }, children: branding.displayName }), _jsx("p", { style: { margin: 0, color: "var(--dim)" }, children: "Sign in to save your progress" })] }), error ? (_jsx("p", { role: "alert", style: {
                    margin: 0,
                    color: "var(--bad)",
                    background: "var(--surface)",
                    border: `${a11y.highContrast ? 2 : 1}px solid var(--bad)`,
                    borderRadius: "var(--radius)",
                    padding: "10px 14px",
                    maxWidth: 420,
                    fontSize: "0.95rem",
                }, children: error })) : null, _jsxs("div", { style: { display: "grid", gap: 12, width: "min(420px, 84vw)" }, children: [_jsx(SignInButton, { provider: "google", label: "Continue with Google", icon: "\uD83C\uDDEC", pending: pending, disabled: busy, a11y: a11y, onClick: () => void attempt("google"), tone: "ghost" }), _jsx(SignInButton, { provider: "apple", label: "Continue with Apple", icon: "\uD83C\uDF4E", pending: pending, disabled: busy, a11y: a11y, onClick: () => void attempt("apple"), tone: "ghost" }), _jsx(SignInButton, { provider: "guest", label: "Play as guest", icon: "\uD83D\uDC64", pending: pending, disabled: busy, a11y: a11y, onClick: () => void attempt("guest"), tone: "primary" })] }), _jsx("p", { style: { margin: 0, fontSize: "0.8rem", color: "var(--dim)", maxWidth: 360 }, children: "Guest progress stays on this device until you sign in." })] }));
}
function label(provider) {
    return provider === "google" ? "Google" : provider === "apple" ? "Apple" : "Guest";
}
function SignInButton({ provider, label: text, icon, pending, disabled, a11y, onClick, tone, }) {
    const isPending = pending === provider;
    return (_jsxs("button", { type: "button", onClick: onClick, disabled: disabled, "aria-busy": isPending, "aria-label": text, style: launchButtonStyle(tone, a11y, { fullWidth: true, disabled }), children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: "1.2rem" }, children: isPending ? "⏳" : icon }), isPending ? "Signing in…" : text] }));
}
//# sourceMappingURL=LoginScreen.js.map