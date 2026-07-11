import type { GameDefinition } from "./game-definition.js";
import type { GameSeed } from "./game-seed.js";
/**
 * GameModule — the game plugin envelope.
 *
 * A `GameModule` is *everything a game contributes to the platform*, as one object the backend
 * registers. Today that is its identity (`definition`) and how the platform manufactures and
 * publishes its content (`seed`) — so it is currently a thin wrapper around `GameSeed`.
 *
 * Why introduce it now, when it wraps only a seed? Because the **shape** is the long-term
 * extension point (see ADR-0015). As games grow real capabilities, each attaches here as its own
 * field — added the day it has a real consumer, with its real type, never before:
 *
 *   - `assets?`        — the game's asset contribution (when the assets package lands)
 *   - `achievements?`  — achievement definitions
 *   - `localization?`  — locale bundles for long-form content (Story activity)
 *   - `events?`        — scheduled/seasonal events
 *   - `migrations?`    — save/content migrations across versions
 *   - `admin?`         — CMS/admin extensions
 *
 * The backend iterates `GameModule[]` and reads only the fields it understands, so adding a
 * capability never forces a backend change for games that don't use it. This is the plugin
 * model's growth path — a superset of `GameSeed`, not a replacement. Nothing above is built yet;
 * they are documented here only to fix the extension point.
 *
 * Versioning note (future, not built): a published game is versioned today via its manifest and
 * `definitionVersion`. When the Parent App must pin/download a specific game version, a
 * `moduleVersion` (and per-capability versions) attach here — this envelope is where that lives.
 */
export interface GameModule {
    /** The game's identity. Same value as `seed.definition`; surfaced so discovery need not unpack the seed. */
    definition: GameDefinition;
    /** How the platform manufactures + publishes this game's content today. */
    seed: GameSeed;
}
/**
 * Wrap a game's `GameSeed` into its `GameModule`. The definition is derived from the seed, so a
 * game authors one source of truth (its seed) and the module stays consistent.
 */
export declare function defineGameModule(seed: GameSeed): GameModule;
//# sourceMappingURL=game-module.d.ts.map