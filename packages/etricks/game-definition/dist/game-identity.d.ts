import { z } from "zod";
/** The colour system a game paints its shell with. Extends per world at runtime via the theme engine. */
export declare const ThemePalette: z.ZodObject<{
    bg: z.ZodString;
    surface: z.ZodString;
    ink: z.ZodString;
    dim: z.ZodString;
    accent: z.ZodString;
    accentInk: z.ZodString;
    ok: z.ZodOptional<z.ZodString>;
    bad: z.ZodOptional<z.ZodString>;
    line: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    bg: string;
    surface: string;
    ink: string;
    dim: string;
    accent: string;
    accentInk: string;
    ok?: string | undefined;
    bad?: string | undefined;
    line?: string | undefined;
}, {
    bg: string;
    surface: string;
    ink: string;
    dim: string;
    accent: string;
    accentInk: string;
    ok?: string | undefined;
    bad?: string | undefined;
    line?: string | undefined;
}>;
export type ThemePalette = z.infer<typeof ThemePalette>;
/** Motion character — how transitions and reward animations feel. */
export declare const ThemeMotion: z.ZodEnum<["calm", "standard", "playful", "energetic"]>;
export type ThemeMotion = z.infer<typeof ThemeMotion>;
/**
 * GameTheme — the visual identity tokens the Game Shell consumes to paint every screen. Fonts and art
 * styles are declared as tokens/refs so the AI asset pipeline can regenerate consistently.
 */
export declare const GameTheme: z.ZodObject<{
    palette: z.ZodObject<{
        bg: z.ZodString;
        surface: z.ZodString;
        ink: z.ZodString;
        dim: z.ZodString;
        accent: z.ZodString;
        accentInk: z.ZodString;
        ok: z.ZodOptional<z.ZodString>;
        bad: z.ZodOptional<z.ZodString>;
        line: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        bg: string;
        surface: string;
        ink: string;
        dim: string;
        accent: string;
        accentInk: string;
        ok?: string | undefined;
        bad?: string | undefined;
        line?: string | undefined;
    }, {
        bg: string;
        surface: string;
        ink: string;
        dim: string;
        accent: string;
        accentInk: string;
        ok?: string | undefined;
        bad?: string | undefined;
        line?: string | undefined;
    }>;
    /** Font family stack for the game (loaded by the shell). */
    fontFamily: z.ZodOptional<z.ZodString>;
    /** Corner radius scale in px; the shell derives its radii from this. */
    cornerRadius: z.ZodDefault<z.ZodNumber>;
    motion: z.ZodDefault<z.ZodEnum<["calm", "standard", "playful", "energetic"]>>;
    /** A named art-direction token (e.g. "laboratory", "parchment", "library") the asset pipeline keys off. */
    artStyle: z.ZodOptional<z.ZodString>;
    /** A named sound theme (e.g. "sci-fi", "adventure") the shell's audio system loads. */
    soundTheme: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    palette: {
        bg: string;
        surface: string;
        ink: string;
        dim: string;
        accent: string;
        accentInk: string;
        ok?: string | undefined;
        bad?: string | undefined;
        line?: string | undefined;
    };
    cornerRadius: number;
    motion: "calm" | "standard" | "playful" | "energetic";
    fontFamily?: string | undefined;
    artStyle?: string | undefined;
    soundTheme?: string | undefined;
}, {
    palette: {
        bg: string;
        surface: string;
        ink: string;
        dim: string;
        accent: string;
        accentInk: string;
        ok?: string | undefined;
        bad?: string | undefined;
        line?: string | undefined;
    };
    fontFamily?: string | undefined;
    cornerRadius?: number | undefined;
    motion?: "calm" | "standard" | "playful" | "energetic" | undefined;
    artStyle?: string | undefined;
    soundTheme?: string | undefined;
}>;
export type GameTheme = z.infer<typeof GameTheme>;
/** A mascot identity — the friendly guide unique to each game. */
export declare const MascotIdentity: z.ZodObject<{
    name: z.ZodString;
    /** The mascot artwork; resolved via the Asset Registry (ADR-0011) once it lands. */
    art: z.ZodOptional<z.ZodObject<{
        assetId: z.ZodString;
        kind: z.ZodEnum<["image", "audio", "video", "font", "lottie"]>;
        uri: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    }, {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    }>>;
    /** Prompt seed the AI asset pipeline uses to (re)generate the mascot consistently. */
    promptSeed: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    art?: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    } | undefined;
    promptSeed?: string | undefined;
}, {
    name: string;
    art?: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    } | undefined;
    promptSeed?: string | undefined;
}>;
export type MascotIdentity = z.infer<typeof MascotIdentity>;
/**
 * GameBranding — the store-facing and app-launch identity: what the player sees before and outside
 * gameplay. Asset slots are `AssetRef`s so the AI asset pipeline (ADR-0027 Phase 3) can manufacture
 * and version them; each may instead carry a `promptSeed` for regeneration.
 */
export declare const GameBranding: z.ZodObject<{
    /** Reverse-DNS app id for the store artifact, e.g. "com.etricks.astronomymaster". */
    appId: z.ZodOptional<z.ZodString>;
    displayName: z.ZodOptional<z.ZodString>;
    tagline: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodObject<{
        assetId: z.ZodString;
        kind: z.ZodEnum<["image", "audio", "video", "font", "lottie"]>;
        uri: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    }, {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    }>>;
    appIcon: z.ZodOptional<z.ZodObject<{
        assetId: z.ZodString;
        kind: z.ZodEnum<["image", "audio", "video", "font", "lottie"]>;
        uri: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    }, {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    }>>;
    splash: z.ZodOptional<z.ZodObject<{
        assetId: z.ZodString;
        kind: z.ZodEnum<["image", "audio", "video", "font", "lottie"]>;
        uri: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    }, {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    }>>;
    loadingArt: z.ZodOptional<z.ZodObject<{
        assetId: z.ZodString;
        kind: z.ZodEnum<["image", "audio", "video", "font", "lottie"]>;
        uri: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    }, {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    }>>;
    mascot: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        /** The mascot artwork; resolved via the Asset Registry (ADR-0011) once it lands. */
        art: z.ZodOptional<z.ZodObject<{
            assetId: z.ZodString;
            kind: z.ZodEnum<["image", "audio", "video", "font", "lottie"]>;
            uri: z.ZodString;
            alt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        }, {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        }>>;
        /** Prompt seed the AI asset pipeline uses to (re)generate the mascot consistently. */
        promptSeed: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        art?: {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        } | undefined;
        promptSeed?: string | undefined;
    }, {
        name: string;
        art?: {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        } | undefined;
        promptSeed?: string | undefined;
    }>>;
    /** Named icon set for achievements/rewards (resolved by the shop/achievements screens). */
    iconSetId: z.ZodOptional<z.ZodString>;
    /** Store-listing metadata for release engineering (Voyager). */
    store: z.ZodOptional<z.ZodObject<{
        shortDescription: z.ZodOptional<z.ZodString>;
        keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        category: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        shortDescription?: string | undefined;
        keywords?: string[] | undefined;
        category?: string | undefined;
    }, {
        shortDescription?: string | undefined;
        keywords?: string[] | undefined;
        category?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    appId?: string | undefined;
    displayName?: string | undefined;
    tagline?: string | undefined;
    logo?: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    } | undefined;
    appIcon?: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    } | undefined;
    splash?: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    } | undefined;
    loadingArt?: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    } | undefined;
    mascot?: {
        name: string;
        art?: {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        } | undefined;
        promptSeed?: string | undefined;
    } | undefined;
    iconSetId?: string | undefined;
    store?: {
        shortDescription?: string | undefined;
        keywords?: string[] | undefined;
        category?: string | undefined;
    } | undefined;
}, {
    appId?: string | undefined;
    displayName?: string | undefined;
    tagline?: string | undefined;
    logo?: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    } | undefined;
    appIcon?: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    } | undefined;
    splash?: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    } | undefined;
    loadingArt?: {
        assetId: string;
        kind: "image" | "audio" | "video" | "font" | "lottie";
        uri: string;
        alt?: string | undefined;
    } | undefined;
    mascot?: {
        name: string;
        art?: {
            assetId: string;
            kind: "image" | "audio" | "video" | "font" | "lottie";
            uri: string;
            alt?: string | undefined;
        } | undefined;
        promptSeed?: string | undefined;
    } | undefined;
    iconSetId?: string | undefined;
    store?: {
        shortDescription?: string | undefined;
        keywords?: string[] | undefined;
        category?: string | undefined;
    } | undefined;
}>;
export type GameBranding = z.infer<typeof GameBranding>;
//# sourceMappingURL=game-identity.d.ts.map