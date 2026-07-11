import type { GameTheme, ThemeMotion } from "@etricks/game-definition";

/**
 * The Theme engine (spine, Stage 1). A game supplies an optional `GameTheme` (declarative tokens);
 * the shell resolves it into a complete, concrete `ResolvedTheme` that every screen paints from.
 * Generalized from Brain Booster's per-world fallback approach (`apps/web/src/theme.ts`) but with
 * **no game-specific knowledge** — a game differs only by the tokens it passes in.
 *
 * Framework-neutral on purpose: this is the pure resolution layer. The React `ThemeProvider` that
 * exposes it to screens arrives with the screens (Phase 1 Stage 2+). Screens read CSS custom
 * properties derived from `themeVars()`, so re-theming a game never touches component code.
 */

/** Concrete, fully-populated theme tokens — no optionals; every screen can rely on all of them. */
export interface ResolvedTheme {
  bg: string;
  surface: string;
  ink: string;
  dim: string;
  accent: string;
  accentInk: string;
  ok: string;
  bad: string;
  line: string;
  cornerRadius: number;
  motion: ThemeMotion;
  fontFamily: string;
  artStyle: string | null;
  soundTheme: string | null;
}

/** Safe premium defaults — a game with no theme still looks finished (neutral, not Brain Booster). */
export const DEFAULT_THEME: ResolvedTheme = {
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
export function resolveTheme(theme?: GameTheme): ResolvedTheme {
  if (!theme) return { ...DEFAULT_THEME };
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
export function themeVars(t: ResolvedTheme): Record<string, string> {
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
