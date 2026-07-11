import type { Screen } from "../screens.js";
/**
 * Navigation runtime (Wave 1b). The shell owns navigation as a **typed finite state machine** — no
 * React Router, no URL coupling, no per-game routing code. Every screen a game can be on is a node;
 * the edges below are the only legal moves. This is game-agnostic: a game enables/disables screens via
 * config, but the *shape* of the flow (you cannot open straight into an activity, you always return
 * home) is a platform invariant enforced here and covered by tests.
 */
/**
 * The legal forward edges from each screen. `home` is the hub every surface can return to. Note the
 * launch flow (`splash → loading → onboarding|login|home`) can never jump straight to `activity`
 * (ADR-0027 mandatory principle).
 */
export declare const LEGAL_TRANSITIONS: Readonly<Record<Screen, readonly Screen[]>>;
/** The screen a game boots into after the launch flow (see `screens.ts`). */
export declare const INITIAL_SCREEN: Screen;
/** Is moving `from → to` a legal transition? Pure; the single source of truth for both reducer and tests. */
export declare function canTransition(from: Screen, to: Screen): boolean;
/**
 * Where a completed boot should route: first-run players see onboarding (if enabled), returning
 * players with a session go straight home, otherwise the login gate. Pure and deterministic.
 */
export declare function routeAfterBoot(opts: {
    hasSession: boolean;
    onboardingEnabled: boolean;
    loginEnabled: boolean;
    onboardingSeen: boolean;
}): Screen;
//# sourceMappingURL=navigation.d.ts.map