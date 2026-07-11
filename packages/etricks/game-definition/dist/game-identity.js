import { z } from "zod";
import { AssetRef, Slug } from "@etricks/contracts";
/**
 * Game identity — the *visual and brand* configuration that makes two games manufactured on the same
 * platform feel like different premium products (ADR-0027, Project Phoenix). Purely declarative: the
 * only difference between Science Master and History Master is this config plus content and assets,
 * never code.
 *
 * These are **additive and optional** on `GameDefinition`. A game that supplies none renders with the
 * shell's safe defaults; Brain Booster supplies a full set. Kept here in the composition contract (not
 * in the shell package) so the manufacturing pipeline and CMS can author and validate them without
 * importing the UI framework.
 */
/** A hex colour token (e.g. "#7a5cc8"). */
const Hex = z
    .string()
    .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "must be a hex colour like #7a5cc8");
/** The colour system a game paints its shell with. Extends per world at runtime via the theme engine. */
export const ThemePalette = z.object({
    bg: Hex,
    surface: Hex,
    ink: Hex,
    dim: Hex,
    accent: Hex,
    accentInk: Hex,
    ok: Hex.optional(),
    bad: Hex.optional(),
    line: Hex.optional(),
});
/** Motion character — how transitions and reward animations feel. */
export const ThemeMotion = z.enum(["calm", "standard", "playful", "energetic"]);
/**
 * GameTheme — the visual identity tokens the Game Shell consumes to paint every screen. Fonts and art
 * styles are declared as tokens/refs so the AI asset pipeline can regenerate consistently.
 */
export const GameTheme = z.object({
    palette: ThemePalette,
    /** Font family stack for the game (loaded by the shell). */
    fontFamily: z.string().min(1).optional(),
    /** Corner radius scale in px; the shell derives its radii from this. */
    cornerRadius: z.number().int().nonnegative().default(20),
    motion: ThemeMotion.default("playful"),
    /** A named art-direction token (e.g. "laboratory", "parchment", "library") the asset pipeline keys off. */
    artStyle: z.string().min(1).optional(),
    /** A named sound theme (e.g. "sci-fi", "adventure") the shell's audio system loads. */
    soundTheme: z.string().min(1).optional(),
});
/** A mascot identity — the friendly guide unique to each game. */
export const MascotIdentity = z.object({
    name: z.string().min(1),
    /** The mascot artwork; resolved via the Asset Registry (ADR-0011) once it lands. */
    art: AssetRef.optional(),
    /** Prompt seed the AI asset pipeline uses to (re)generate the mascot consistently. */
    promptSeed: z.string().min(1).optional(),
});
/**
 * GameBranding — the store-facing and app-launch identity: what the player sees before and outside
 * gameplay. Asset slots are `AssetRef`s so the AI asset pipeline (ADR-0027 Phase 3) can manufacture
 * and version them; each may instead carry a `promptSeed` for regeneration.
 */
export const GameBranding = z.object({
    /** Reverse-DNS app id for the store artifact, e.g. "com.etricks.astronomymaster". */
    appId: z
        .string()
        .regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/, "must be a reverse-DNS id like com.etricks.game")
        .optional(),
    displayName: z.string().min(1).optional(),
    tagline: z.string().min(1).optional(),
    logo: AssetRef.optional(),
    appIcon: AssetRef.optional(),
    splash: AssetRef.optional(),
    loadingArt: AssetRef.optional(),
    mascot: MascotIdentity.optional(),
    /** Named icon set for achievements/rewards (resolved by the shop/achievements screens). */
    iconSetId: Slug.optional(),
    /** Store-listing metadata for release engineering (Voyager). */
    store: z
        .object({
        shortDescription: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        category: z.string().optional(),
    })
        .optional(),
});
//# sourceMappingURL=game-identity.js.map