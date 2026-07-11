import { z } from "zod";
import type { GameDefinition } from "@etricks/game-definition";
import type { Activity } from "@etricks/activity-engine";
import type { ShellPorts } from "./ports.js";
/**
 * The declarative, serialisable part of a game's shell configuration — which screens/systems are on
 * and how they behave. Separated from the runtime `ShellPorts` (functions) so the CMS and
 * manufacturing pipeline can author and validate it, and so it round-trips through the backend.
 * Everything defaults to a safe premium baseline; a game overrides only what differs.
 */
export declare const GameShellManifest: z.ZodObject<{
    /** Screens this game enables. Omitted → the full default set. The launch flow is always included. */
    enabledScreens: z.ZodOptional<z.ZodArray<z.ZodEnum<["splash", "loading", "onboarding", "login", "home", "profile", "avatar", "world-select", "level-select", "activity", "result", "victory", "failure", "pause", "reward", "daily-rewards", "weekly-rewards", "achievements", "challenges", "leaderboard", "shop", "premium", "parents", "settings", "accessibility"]>, "many">>;
    features: z.ZodDefault<z.ZodObject<{
        onboarding: z.ZodDefault<z.ZodBoolean>;
        login: z.ZodDefault<z.ZodBoolean>;
        dailyRewards: z.ZodDefault<z.ZodBoolean>;
        weeklyRewards: z.ZodDefault<z.ZodBoolean>;
        achievements: z.ZodDefault<z.ZodBoolean>;
        challenges: z.ZodDefault<z.ZodBoolean>;
        leaderboard: z.ZodDefault<z.ZodBoolean>;
        shop: z.ZodDefault<z.ZodBoolean>;
        premium: z.ZodDefault<z.ZodBoolean>;
        ads: z.ZodDefault<z.ZodBoolean>;
        parents: z.ZodDefault<z.ZodBoolean>;
        cloudSync: z.ZodDefault<z.ZodBoolean>;
        offlineCache: z.ZodDefault<z.ZodBoolean>;
        notifications: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        onboarding: boolean;
        login: boolean;
        achievements: boolean;
        challenges: boolean;
        leaderboard: boolean;
        shop: boolean;
        premium: boolean;
        parents: boolean;
        dailyRewards: boolean;
        weeklyRewards: boolean;
        ads: boolean;
        cloudSync: boolean;
        offlineCache: boolean;
        notifications: boolean;
    }, {
        onboarding?: boolean | undefined;
        login?: boolean | undefined;
        achievements?: boolean | undefined;
        challenges?: boolean | undefined;
        leaderboard?: boolean | undefined;
        shop?: boolean | undefined;
        premium?: boolean | undefined;
        parents?: boolean | undefined;
        dailyRewards?: boolean | undefined;
        weeklyRewards?: boolean | undefined;
        ads?: boolean | undefined;
        cloudSync?: boolean | undefined;
        offlineCache?: boolean | undefined;
        notifications?: boolean | undefined;
    }>>;
    /** Number of daily-reward tiers in the streak table (the shell renders the ladder). */
    dailyRewardDays: z.ZodDefault<z.ZodNumber>;
    /** How this game names/skins its currencies (server owns the amounts). Absent → neutral defaults. */
    economy: z.ZodOptional<z.ZodObject<{
        soft: z.ZodOptional<z.ZodObject<{
            label: z.ZodString;
            icon: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            label: string;
            icon: string;
        }, {
            label: string;
            icon: string;
        }>>;
        hard: z.ZodOptional<z.ZodObject<{
            label: z.ZodString;
            icon: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            label: string;
            icon: string;
        }, {
            label: string;
            icon: string;
        }>>;
        xp: z.ZodOptional<z.ZodObject<{
            label: z.ZodString;
            icon: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            label: string;
            icon: string;
        }, {
            label: string;
            icon: string;
        }>>;
        showStreak: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        showStreak: boolean;
        soft?: {
            label: string;
            icon: string;
        } | undefined;
        hard?: {
            label: string;
            icon: string;
        } | undefined;
        xp?: {
            label: string;
            icon: string;
        } | undefined;
    }, {
        soft?: {
            label: string;
            icon: string;
        } | undefined;
        hard?: {
            label: string;
            icon: string;
        } | undefined;
        xp?: {
            label: string;
            icon: string;
        } | undefined;
        showStreak?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    features: {
        onboarding: boolean;
        login: boolean;
        achievements: boolean;
        challenges: boolean;
        leaderboard: boolean;
        shop: boolean;
        premium: boolean;
        parents: boolean;
        dailyRewards: boolean;
        weeklyRewards: boolean;
        ads: boolean;
        cloudSync: boolean;
        offlineCache: boolean;
        notifications: boolean;
    };
    dailyRewardDays: number;
    enabledScreens?: ("splash" | "loading" | "onboarding" | "login" | "home" | "profile" | "avatar" | "world-select" | "level-select" | "activity" | "result" | "victory" | "failure" | "pause" | "reward" | "daily-rewards" | "weekly-rewards" | "achievements" | "challenges" | "leaderboard" | "shop" | "premium" | "parents" | "settings" | "accessibility")[] | undefined;
    economy?: {
        showStreak: boolean;
        soft?: {
            label: string;
            icon: string;
        } | undefined;
        hard?: {
            label: string;
            icon: string;
        } | undefined;
        xp?: {
            label: string;
            icon: string;
        } | undefined;
    } | undefined;
}, {
    enabledScreens?: ("splash" | "loading" | "onboarding" | "login" | "home" | "profile" | "avatar" | "world-select" | "level-select" | "activity" | "result" | "victory" | "failure" | "pause" | "reward" | "daily-rewards" | "weekly-rewards" | "achievements" | "challenges" | "leaderboard" | "shop" | "premium" | "parents" | "settings" | "accessibility")[] | undefined;
    features?: {
        onboarding?: boolean | undefined;
        login?: boolean | undefined;
        achievements?: boolean | undefined;
        challenges?: boolean | undefined;
        leaderboard?: boolean | undefined;
        shop?: boolean | undefined;
        premium?: boolean | undefined;
        parents?: boolean | undefined;
        dailyRewards?: boolean | undefined;
        weeklyRewards?: boolean | undefined;
        ads?: boolean | undefined;
        cloudSync?: boolean | undefined;
        offlineCache?: boolean | undefined;
        notifications?: boolean | undefined;
    } | undefined;
    dailyRewardDays?: number | undefined;
    economy?: {
        soft?: {
            label: string;
            icon: string;
        } | undefined;
        hard?: {
            label: string;
            icon: string;
        } | undefined;
        xp?: {
            label: string;
            icon: string;
        } | undefined;
        showStreak?: boolean | undefined;
    } | undefined;
}>;
export type GameShellManifest = z.infer<typeof GameShellManifest>;
/**
 * GameShellConfig — everything `mountGame` needs to run one complete game: its definition (identity +
 * theme + branding + composition, from @etricks/game-definition), the declarative shell manifest, and
 * the injected runtime ports. A game's whole app is this object handed to the shell — no code.
 */
/**
 * A level a player can actually play: metadata + the concrete `Activity[]` the Universal Activity
 * Engine runs. `activities` are plain serialisable data (engine content is JSON), so a whole game's
 * playable content can be handed to the shell as config and carried through navigation unchanged.
 */
export interface PlayableLevel {
    id: string;
    title: string;
    locked?: boolean;
    completed?: boolean;
    stars?: number;
    requiredStars?: number;
    /** Per-level engine config override (e.g. timeLimitMs, scoring) — passed to createActivitySession. */
    configOverride?: Record<string, unknown>;
    activities: Activity[];
}
export interface PlayableWorld {
    id: string;
    title: string;
    icon?: string;
    accent?: string;
    blurb?: string;
    locked?: boolean;
    levels: PlayableLevel[];
}
/**
 * The game's playable adventure, supplied by the app (resolved from its composition + content packs,
 * online or offline). The shell's adventure screens read this when navigation params carry no worlds,
 * so a game becomes navigable + playable purely by handing the shell its content — no screen code.
 */
export interface ShellContent {
    worlds: PlayableWorld[];
}
export interface GameShellConfig {
    definition: GameDefinition;
    shell?: GameShellManifest;
    ports?: ShellPorts;
    /** Playable content (worlds → levels → activities). Optional: a game without it still navigates. */
    content?: ShellContent;
}
/** Validate the declarative part of a shell config (the ports are runtime and validated by adapters). */
export declare function defineGameShell(manifest: unknown): GameShellManifest;
//# sourceMappingURL=shell-config.d.ts.map