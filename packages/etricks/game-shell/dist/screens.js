import { z } from "zod";
/**
 * The complete screen set every manufactured game ships (ADR-0027). This is the shared navigation
 * vocabulary: the shell owns each of these as a game-neutral, configurable implementation, and a game
 * enables/orders them via config. "No game opens directly into an activity" — the launch flow always
 * runs splash → loading → (onboarding/login) → home before any level.
 *
 * Phase 0 fixes the *names and flow contract*; Apollo/Pixar implement the screens in Phase 1–2. Adding
 * a screen is an entry here + an implementation — never a change to a game.
 */
export const SCREENS = [
    // Launch flow
    "splash",
    "loading",
    "onboarding",
    "login",
    // Hub
    "home",
    "profile",
    "avatar",
    // Navigation into play
    "world-select",
    "level-select",
    "activity", // delegates to @etricks/activity-engine
    // Post-activity
    "result",
    "victory",
    "failure",
    "pause",
    "reward",
    // Engagement / economy
    "daily-rewards",
    "weekly-rewards",
    "achievements",
    "challenges",
    "leaderboard",
    "shop",
    "premium",
    // Support surfaces
    "parents",
    "settings",
    "accessibility",
];
export const Screen = z.enum(SCREENS);
/** Screens that make up the mandatory launch flow — none may be skipped straight to `activity`. */
export const LAUNCH_FLOW = ["splash", "loading", "onboarding", "login", "home"];
/** The default screen a game boots into after the launch flow completes. */
export const HOME_SCREEN = "home";
//# sourceMappingURL=screens.js.map