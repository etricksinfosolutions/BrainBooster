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
export declare const DEFAULT_THEME: ResolvedTheme;
/** Resolve a declarative `GameTheme` (or nothing) into concrete tokens, layering over the defaults. */
export declare function resolveTheme(theme?: GameTheme): ResolvedTheme;
/**
 * Flatten a resolved theme into CSS custom properties (`--bg`, `--accent`, …) the shell sets on its
 * root element. Screens reference `var(--accent)` etc., so a game re-themes purely through this map —
 * the exact mechanism Brain Booster's world engine already uses, now game-agnostic.
 */
export declare function themeVars(t: ResolvedTheme): Record<string, string>;
//# sourceMappingURL=theme.d.ts.map