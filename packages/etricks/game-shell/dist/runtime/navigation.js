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
export const LEGAL_TRANSITIONS = {
    splash: ["loading"],
    loading: ["onboarding", "login", "home"],
    onboarding: ["login", "home"],
    login: ["home", "onboarding"],
    home: [
        "world-select",
        "level-select",
        "activity", // "continue playing" from the hub
        "profile",
        "avatar",
        "daily-rewards",
        "weekly-rewards",
        "achievements",
        "challenges",
        "leaderboard",
        "shop",
        "premium",
        "parents",
        "settings",
        "accessibility",
    ],
    "world-select": ["level-select", "home"],
    "level-select": ["activity", "world-select", "home"],
    activity: ["pause", "result", "victory", "failure", "home"],
    pause: ["activity", "settings", "home"],
    result: ["reward", "level-select", "home"],
    victory: ["reward", "home"],
    failure: ["result", "activity", "home"],
    reward: ["level-select", "achievements", "home"],
    "daily-rewards": ["home"],
    "weekly-rewards": ["home"],
    achievements: ["home"],
    challenges: ["activity", "home"],
    leaderboard: ["home"],
    shop: ["premium", "home"],
    premium: ["shop", "home"],
    parents: ["settings", "home"],
    settings: ["accessibility", "home"],
    accessibility: ["settings", "home"],
    profile: ["avatar", "settings", "home"],
    avatar: ["profile", "shop", "home"],
};
/** The screen a game boots into after the launch flow (see `screens.ts`). */
export const INITIAL_SCREEN = "splash";
/** Is moving `from → to` a legal transition? Pure; the single source of truth for both reducer and tests. */
export function canTransition(from, to) {
    return LEGAL_TRANSITIONS[from].includes(to);
}
/**
 * Where a completed boot should route: first-run players see onboarding (if enabled), returning
 * players with a session go straight home, otherwise the login gate. Pure and deterministic.
 */
export function routeAfterBoot(opts) {
    if (opts.hasSession)
        return "home";
    if (opts.onboardingEnabled && !opts.onboardingSeen)
        return "onboarding";
    if (opts.loginEnabled)
        return "login";
    return "home";
}
//# sourceMappingURL=navigation.js.map