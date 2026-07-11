/** Safe premium defaults — a game with no theme still looks finished (neutral, not Brain Booster). */
export const DEFAULT_THEME = {
    bg: "#f2f0fa",
    surface: "#ffffff",
    ink: "#2b2350",
    dim: "#6f639a",
    accent: "#7a5cc8",
    accentInk: "#ffffff",
    ok: "#2fa981",
    bad: "#e5484d",
    line: "#e7e2f6",
    cornerRadius: 20,
    motion: "playful",
    fontFamily: '"Baloo 2", ui-rounded, "Nunito", "Segoe UI", system-ui, sans-serif',
    artStyle: null,
    soundTheme: null,
};
/** Resolve a declarative `GameTheme` (or nothing) into concrete tokens, layering over the defaults. */
export function resolveTheme(theme) {
    if (!theme)
        return { ...DEFAULT_THEME };
    const p = theme.palette;
    return {
        bg: p.bg,
        surface: p.surface,
        ink: p.ink,
        dim: p.dim,
        accent: p.accent,
        accentInk: p.accentInk,
        ok: p.ok ?? DEFAULT_THEME.ok,
        bad: p.bad ?? DEFAULT_THEME.bad,
        line: p.line ?? DEFAULT_THEME.line,
        cornerRadius: theme.cornerRadius ?? DEFAULT_THEME.cornerRadius,
        motion: theme.motion ?? DEFAULT_THEME.motion,
        fontFamily: theme.fontFamily ?? DEFAULT_THEME.fontFamily,
        artStyle: theme.artStyle ?? null,
        soundTheme: theme.soundTheme ?? null,
    };
}
/**
 * Flatten a resolved theme into CSS custom properties (`--bg`, `--accent`, …) the shell sets on its
 * root element. Screens reference `var(--accent)` etc., so a game re-themes purely through this map —
 * the exact mechanism Brain Booster's world engine already uses, now game-agnostic.
 */
export function themeVars(t) {
    return {
        "--bg": t.bg,
        "--surface": t.surface,
        "--ink": t.ink,
        "--dim": t.dim,
        "--accent": t.accent,
        "--accent-ink": t.accentInk,
        "--ok": t.ok,
        "--bad": t.bad,
        "--line": t.line,
        "--radius": `${t.cornerRadius}px`,
        "--font": t.fontFamily,
    };
}
//# sourceMappingURL=theme.js.map