import { z } from "zod";
import { Screen } from "./screens.js";
import { EconomyConfig } from "./economy.js";
/**
 * The declarative, serialisable part of a game's shell configuration — which screens/systems are on
 * and how they behave. Separated from the runtime `ShellPorts` (functions) so the CMS and
 * manufacturing pipeline can author and validate it, and so it round-trips through the backend.
 * Everything defaults to a safe premium baseline; a game overrides only what differs.
 */
export const GameShellManifest = z.object({
    /** Screens this game enables. Omitted → the full default set. The launch flow is always included. */
    enabledScreens: z.array(Screen).optional(),
    features: z
        .object({
        onboarding: z.boolean().default(true),
        login: z.boolean().default(true),
        dailyRewards: z.boolean().default(true),
        weeklyRewards: z.boolean().default(true),
        achievements: z.boolean().default(true),
        challenges: z.boolean().default(true),
        leaderboard: z.boolean().default(false),
        shop: z.boolean().default(true),
        premium: z.boolean().default(true),
        ads: z.boolean().default(false),
        parents: z.boolean().default(true),
        cloudSync: z.boolean().default(true),
        offlineCache: z.boolean().default(true),
        notifications: z.boolean().default(true),
    })
        .default({}),
    /** Number of daily-reward tiers in the streak table (the shell renders the ladder). */
    dailyRewardDays: z.number().int().positive().default(7),
    /** How this game names/skins its currencies (server owns the amounts). Absent → neutral defaults. */
    economy: EconomyConfig.optional(),
});
/** Validate the declarative part of a shell config (the ports are runtime and validated by adapters). */
export function defineGameShell(manifest) {
    return GameShellManifest.parse(manifest);
}
//# sourceMappingURL=shell-config.js.map