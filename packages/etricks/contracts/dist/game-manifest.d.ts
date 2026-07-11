import { z } from "zod";
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
export declare const Product: z.ZodObject<{
    productId: z.ZodString;
    kind: z.ZodEnum<["subscription", "one-time", "consumable"]>;
    /** Store SKU as registered in Play/App Store. Platform verifies receipts against this. */
    storeSku: z.ZodString;
    /** Human title, localised elsewhere; this is the default/fallback. */
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    kind: "subscription" | "one-time" | "consumable";
    productId: string;
    storeSku: string;
    title: string;
}, {
    kind: "subscription" | "one-time" | "consumable";
    productId: string;
    storeSku: string;
    title: string;
}>;
export type Product = z.infer<typeof Product>;
/** A pointer telling the app which pack version is current and where to fetch it. */
export declare const PackRef: z.ZodObject<{
    packId: z.ZodString;
    engine: z.ZodEnum<["quiz", "memory", "puzzle", "board", "story", "language", "simulation", "activity"]>;
    version: z.ZodString;
    locale: z.ZodString;
    /** Absolute URL (CDN) to the pack meta document. The app fetches meta, then payload. */
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    version: string;
    engine: "activity" | "language" | "quiz" | "memory" | "puzzle" | "board" | "story" | "simulation";
    locale: string;
    packId: string;
    url: string;
}, {
    version: string;
    engine: "activity" | "language" | "quiz" | "memory" | "puzzle" | "board" | "story" | "simulation";
    locale: string;
    packId: string;
    url: string;
}>;
export type PackRef = z.infer<typeof PackRef>;
export declare const GameStatus: z.ZodEnum<["live", "maintenance", "coming-soon", "retired"]>;
export type GameStatus = z.infer<typeof GameStatus>;
export declare const GameManifest: z.ZodObject<{
    /** Manifest schema version — lets the app reject manifests it's too old to parse. */
    manifestVersion: z.ZodNumber;
    gameId: z.ZodString;
    title: z.ZodString;
    /** Which engines the app must have compiled in to run this game. */
    engines: z.ZodArray<z.ZodEnum<["quiz", "memory", "puzzle", "board", "story", "language", "simulation", "activity"]>, "many">;
    /** Minimum app (binary) version that may run this game. Below this → force update. */
    minAppVersion: z.ZodString;
    status: z.ZodEnum<["live", "maintenance", "coming-soon", "retired"]>;
    /** Locales this game currently ships content for. */
    locales: z.ZodArray<z.ZodString, "many">;
    /** ISO country codes where the game is available. Empty = everywhere. */
    countries: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Current content packs. The app diffs these against its cache to decide downloads. */
    packs: z.ZodArray<z.ZodObject<{
        packId: z.ZodString;
        engine: z.ZodEnum<["quiz", "memory", "puzzle", "board", "story", "language", "simulation", "activity"]>;
        version: z.ZodString;
        locale: z.ZodString;
        /** Absolute URL (CDN) to the pack meta document. The app fetches meta, then payload. */
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        version: string;
        engine: "activity" | "language" | "quiz" | "memory" | "puzzle" | "board" | "story" | "simulation";
        locale: string;
        packId: string;
        url: string;
    }, {
        version: string;
        engine: "activity" | "language" | "quiz" | "memory" | "puzzle" | "board" | "story" | "simulation";
        locale: string;
        packId: string;
        url: string;
    }>, "many">;
    /** Everything the player can buy in this game. */
    products: z.ZodDefault<z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        kind: z.ZodEnum<["subscription", "one-time", "consumable"]>;
        /** Store SKU as registered in Play/App Store. Platform verifies receipts against this. */
        storeSku: z.ZodString;
        /** Human title, localised elsewhere; this is the default/fallback. */
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        kind: "subscription" | "one-time" | "consumable";
        productId: string;
        storeSku: string;
        title: string;
    }, {
        kind: "subscription" | "one-time" | "consumable";
        productId: string;
        storeSku: string;
        title: string;
    }>, "many">>;
    /** When this manifest was published. Also serves as a cheap cache key. */
    publishedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "live" | "maintenance" | "coming-soon" | "retired";
    gameId: string;
    publishedAt: string;
    title: string;
    manifestVersion: number;
    engines: ("activity" | "language" | "quiz" | "memory" | "puzzle" | "board" | "story" | "simulation")[];
    minAppVersion: string;
    locales: string[];
    countries: string[];
    packs: {
        version: string;
        engine: "activity" | "language" | "quiz" | "memory" | "puzzle" | "board" | "story" | "simulation";
        locale: string;
        packId: string;
        url: string;
    }[];
    products: {
        kind: "subscription" | "one-time" | "consumable";
        productId: string;
        storeSku: string;
        title: string;
    }[];
}, {
    status: "live" | "maintenance" | "coming-soon" | "retired";
    gameId: string;
    publishedAt: string;
    title: string;
    manifestVersion: number;
    engines: ("activity" | "language" | "quiz" | "memory" | "puzzle" | "board" | "story" | "simulation")[];
    minAppVersion: string;
    locales: string[];
    packs: {
        version: string;
        engine: "activity" | "language" | "quiz" | "memory" | "puzzle" | "board" | "story" | "simulation";
        locale: string;
        packId: string;
        url: string;
    }[];
    countries?: string[] | undefined;
    products?: {
        kind: "subscription" | "one-time" | "consumable";
        productId: string;
        storeSku: string;
        title: string;
    }[] | undefined;
}>;
export type GameManifest = z.infer<typeof GameManifest>;
/**
 * The platform-level registry: the list of games the app may show, each summarised.
 * The app fetches this once, then fetches individual GameManifests on demand.
 */
export declare const GameRegistryEntry: z.ZodObject<{
    gameId: z.ZodString;
    title: z.ZodString;
    status: z.ZodEnum<["live", "maintenance", "coming-soon", "retired"]>;
    minAppVersion: z.ZodString;
    /** URL to this game's full GameManifest. */
    manifestUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "live" | "maintenance" | "coming-soon" | "retired";
    gameId: string;
    title: string;
    minAppVersion: string;
    manifestUrl: string;
}, {
    status: "live" | "maintenance" | "coming-soon" | "retired";
    gameId: string;
    title: string;
    minAppVersion: string;
    manifestUrl: string;
}>;
export declare const GameRegistry: z.ZodObject<{
    registryVersion: z.ZodNumber;
    games: z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        title: z.ZodString;
        status: z.ZodEnum<["live", "maintenance", "coming-soon", "retired"]>;
        minAppVersion: z.ZodString;
        /** URL to this game's full GameManifest. */
        manifestUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "live" | "maintenance" | "coming-soon" | "retired";
        gameId: string;
        title: string;
        minAppVersion: string;
        manifestUrl: string;
    }, {
        status: "live" | "maintenance" | "coming-soon" | "retired";
        gameId: string;
        title: string;
        minAppVersion: string;
        manifestUrl: string;
    }>, "many">;
    publishedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    publishedAt: string;
    registryVersion: number;
    games: {
        status: "live" | "maintenance" | "coming-soon" | "retired";
        gameId: string;
        title: string;
        minAppVersion: string;
        manifestUrl: string;
    }[];
}, {
    publishedAt: string;
    registryVersion: number;
    games: {
        status: "live" | "maintenance" | "coming-soon" | "retired";
        gameId: string;
        title: string;
        minAppVersion: string;
        manifestUrl: string;
    }[];
}>;
export type GameRegistry = z.infer<typeof GameRegistry>;
//# sourceMappingURL=game-manifest.d.ts.map