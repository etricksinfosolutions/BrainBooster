import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useBranding, useAccessibility, useNavigation, useShellState, } from "../../runtime/context.js";
import { LaunchStage, MascotBadge, BrandArt, launchButtonStyle } from "./shared.js";
export function OnboardingScreen() {
    const branding = useBranding();
    const a11y = useAccessibility();
    const { navigate } = useNavigation();
    const seen = useShellState().session.onboardingSeen;
    const [index, setIndex] = useState(0);
    const finish = () => navigate("home");
    const mascotName = branding.mascot?.name ?? null;
    const guide = mascotName ? `${mascotName}, your guide,` : "Your guide";
    const slides = [
        {
            emoji: "👋",
            title: `Welcome to ${branding.displayName}!`,
            body: mascotName
                ? `${mascotName} is here to cheer you on every step of the way.`
                : "A world of play and learning is waiting for you.",
        },
        {
            emoji: "🗺️",
            title: "Play through worlds",
            body: `${guide} leads you level by level — each one a fresh challenge to master.`,
        },
        {
            emoji: "⭐",
            title: "Earn rewards",
            body: "Collect stars, keep your streak alive, and unlock new surprises as you grow.",
        },
    ];
    // Returning player: nothing to onboard — offer a single clear way onward.
    if (seen) {
        return (_jsxs(LaunchStage, { ariaLabel: "You're all set", reducedMotion: a11y.reducedMotion, children: [_jsx(MascotBadge, { mascot: branding.mascot, size: 120, reducedMotion: a11y.reducedMotion }), !branding.mascot ? (_jsx(BrandArt, { art: branding.logo, fallbackLabel: branding.displayName, size: 120, reducedMotion: a11y.reducedMotion })) : null, _jsx("h1", { style: { margin: 0, fontSize: "clamp(1.5rem, 5vw, 2rem)", color: "var(--ink)" }, children: "You're all set!" }), _jsx("p", { style: { margin: 0, color: "var(--dim)", maxWidth: 380, lineHeight: 1.5 }, children: "Jump back in and keep the adventure going." }), _jsx("button", { type: "button", onClick: finish, style: launchButtonStyle("primary", a11y, { fullWidth: true }), "aria-label": "Go to home", children: "Let's go" })] }));
    }
    const slide = slides[index];
    const isLast = index === slides.length - 1;
    return (_jsxs(LaunchStage, { ariaLabel: "Welcome", reducedMotion: a11y.reducedMotion, children: [_jsx("button", { type: "button", onClick: finish, style: {
                    position: "absolute",
                    top: "max(12px, env(safe-area-inset-top))",
                    right: 16,
                    background: "transparent",
                    border: "none",
                    color: "var(--dim)",
                    fontFamily: "var(--font)",
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    minHeight: a11y.bigButtons ? 48 : 40,
                    padding: "0 8px",
                }, "aria-label": "Skip introduction", children: "Skip" }), _jsx(MascotBadge, { mascot: branding.mascot, size: 132, reducedMotion: a11y.reducedMotion }), !branding.mascot ? (_jsx("span", { "aria-hidden": "true", style: { fontSize: "3.4rem" }, children: slide.emoji })) : null, _jsxs("div", { style: {
                    display: "grid",
                    gap: 12,
                    maxWidth: 420,
                    animation: a11y.reducedMotion ? undefined : "shell-launch-rise .35s ease both",
                }, children: [_jsx("h1", { style: { margin: 0, fontSize: "clamp(1.5rem, 5vw, 2rem)", color: "var(--ink)" }, children: slide.title }), _jsx("p", { style: { margin: 0, color: "var(--dim)", fontSize: "1.08rem", lineHeight: 1.5 }, children: slide.body })] }, index), _jsx("div", { role: "tablist", "aria-label": "Slide progress", style: { display: "flex", gap: 8 }, children: slides.map((s, i) => (_jsx("span", { role: "tab", "aria-selected": i === index, "aria-label": `Slide ${i + 1} of ${slides.length}`, style: {
                        width: i === index ? 22 : 10,
                        height: 10,
                        borderRadius: 999,
                        background: i === index ? "var(--accent)" : "var(--line)",
                        transition: a11y.reducedMotion ? "none" : "width .2s ease",
                    } }, s.title))) }), _jsxs("div", { style: { display: "flex", gap: 12, width: "min(420px, 80vw)" }, children: [index > 0 ? (_jsx("button", { type: "button", onClick: () => setIndex((i) => Math.max(0, i - 1)), style: launchButtonStyle("ghost", a11y, { fullWidth: true }), "aria-label": "Previous slide", children: "Back" })) : null, _jsx("button", { type: "button", onClick: () => (isLast ? finish() : setIndex((i) => i + 1)), style: launchButtonStyle("primary", a11y, { fullWidth: true }), "aria-label": isLast ? "Get started" : "Next slide", children: isLast ? "Get started" : "Next" })] })] }));
}
//# sourceMappingURL=OnboardingScreen.js.map