import { z } from "zod";
import type { GameDefinition } from "@etricks/game-definition";
import type { Activity } from "@etricks/activity-engine";
import { Screen } from "./screens.js";
import { EconomyConfig } from "./economy.js";
import type { ShellPorts } from "./ports.js";

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
})
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
export function defineGameShell(manifest: unknown): GameShellManifest {
  return GameShellManifest.parse(manifest);
}
