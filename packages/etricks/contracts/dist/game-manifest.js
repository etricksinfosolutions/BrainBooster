import { z } from "zod";
import { EngineId } from "./content-pack.js";
import { IsoDateTime, Locale, Semver, Slug } from "./primitives.js";
/**
 * CONTRACT #2 — GameManifest.
 *
 * The manifest is what the app fetches on launch. It answers, for one game:
 *   - can this app version even run me? (minAppVersion)
 *   - which engines do I need loaded?
 *   - which content packs are current, and where do I get them?
 *   - what can the player buy? (per-game products)
 *   - am I live, in maintenance, or gated by country?
 *
 * A new game reaching players is, in the ideal state, a new manifest + its packs.
 * No app store release required.
 */
/** A monetisable product. Subscriptions and billing are per-game, by design. */
export const Product = z.object({
    productId: Slug,
    kind: z.enum(["subscription", "one-time", "consumable"]),
    /** Store SKU as registered in Play/App Store. Platform verifies receipts against this. */
    storeSku: z.string().min(1),
    /** Human title, localised elsewhere; this is the default/fallback. */
    title: z.string().min(1),
});
/** A pointer telling the app which pack version is current and where to fetch it. */
export const PackRef = z.object({
    packId: Slug,
    engine: EngineId,
    version: Semver,
    locale: Locale,
    /** Absolute URL (CDN) to the pack meta document. The app fetches meta, then payload. */
    url: z.string().url(),
});
export const GameStatus = z.enum(["live", "maintenance", "coming-soon", "retired"]);
export const GameManifest = z.object({
    /** Manifest schema version — lets the app reject manifests it's too old to parse. */
    manifestVersion: z.number().int().positive(),
    gameId: Slug,
    title: z.string().min(1),
    /** Which engines the app must have compiled in to run this game. */
    engines: z.array(EngineId).min(1),
    /** Minimum app (binary) version that may run this game. Below this → force update. */
    minAppVersion: Semver,
    status: GameStatus,
    /** Locales this game currently ships content for. */
    locales: z.array(Locale).min(1),
    /** ISO country codes where the game is available. Empty = everywhere. */
    countries: z.array(z.string().regex(/^[A-Z]{2}$/)).default([]),
    /** Current content packs. The app diffs these against its cache to decide downloads. */
    packs: z.array(PackRef),
    /** Everything the player can buy in this game. */
    products: z.array(Product).default([]),
    /** When this manifest was published. Also serves as a cheap cache key. */
    publishedAt: IsoDateTime,
});
/**
 * The platform-level registry: the list of games the app may show, each summarised.
 * The app fetches this once, then fetches individual GameManifests on demand.
 */
export const GameRegistryEntry = z.object({
    gameId: Slug,
    title: z.string().min(1),
    status: GameStatus,
    minAppVersion: Semver,
    /** URL to this game's full GameManifest. */
    manifestUrl: z.string().url(),
});
export const GameRegistry = z.object({
    registryVersion: z.number().int().positive(),
    games: z.array(GameRegistryEntry),
    publishedAt: IsoDateTime,
});
//# sourceMappingURL=game-manifest.js.map