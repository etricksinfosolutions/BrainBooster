import type { GenerateContentRequest } from "@etricks/aios";
import type { EngineId, GameStatus, Product } from "@etricks/contracts";
import type { GameDefinition } from "./game-definition.js";
/**
 * GameSeed — the plugin contract a game implements so the platform can *manufacture and publish*
 * it without knowing anything game-specific.
 *
 * A game owns its definition, its manifest metadata, and — for each content slot — how to make
 * the pack: the AIOS request plus the offline bank the deterministic model serves (see
 * ADR-0008). The backend loops over the registered `GameSeed`s generically (see
 * `games.registry.ts`); it never names a game. Engine → pack-schema mapping is the backend's
 * (legitimate) engine knowledge, not game knowledge. See ADR-0014.
 *
 * Dependency direction: a game imports this from the platform. The platform never imports a game.
 */
/** How to manufacture one content pack for a game, plus the metadata to wrap it in. */
export interface PackSeed {
    /** Stable pack id — the app caches by this; changing it breaks save compatibility. */
    packId: string;
    engine: EngineId;
    version: string;
    locale: string;
    tags: string[];
    /** ISO timestamp stamped into the published pack + manifest entry. */
    publishedAt: string;
    /** The AIOS manufacturing request (engine, contentType, spec). */
    request: GenerateContentRequest;
    /**
     * The offline bank the deterministic model serves when manufacturing this pack (no API key /
     * network at boot). In production the model is swapped for Claude and this is unused.
     */
    bank: readonly unknown[];
}
/** Everything the platform needs to publish a game: its definition, manifest metadata, packs. */
export interface GameSeed {
    definition: GameDefinition;
    status: GameStatus;
    minAppVersion: string;
    /** Monetisable products (subscriptions/SKUs) — per game, by design. */
    products: Product[];
    /** ISO timestamp for the manifest + registry entry. */
    publishedAt: string;
    packs: PackSeed[];
}
//# sourceMappingURL=game-seed.d.ts.map