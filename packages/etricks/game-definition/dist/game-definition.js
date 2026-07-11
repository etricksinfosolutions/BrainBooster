import { z } from "zod";
import { EngineId, Locale, Semver, Slug } from "@etricks/contracts";
import { GameComposition } from "./composition.js";
import { GameBranding, GameTheme } from "./game-identity.js";
/**
 * GameDefinition — the composition contract for a game.
 *
 * This is the **authoring** source of truth for *what a game is*: which reusable engines it
 * composes, how it makes money, how the player progresses, and which versioned content packs it
 * ships. A game is a composition of engines + versioned packs + rules — not code.
 *
 * Design-time vs runtime: `GameDefinition` (here) is authored and is the source of truth.
 * `GameManifest` (in @etricks/contracts) is the runtime document the app fetches to know what to
 * download. The target is that a GameDefinition **compiles to** a published GameManifest; that
 * compiler needs pack-URL resolution + concrete product/SKU mapping, so it lives with the
 * backend/CMS and is built when the second game or CMS needs it. See ADR-0009.
 */
/** How the game makes money. Intent, not concrete store SKUs (those live in the manifest). */
export const Monetization = z.object({
    subscription: z.boolean().default(false),
    oneTimePurchase: z.boolean().default(false),
    ads: z.enum(["none", "rewarded", "interstitial", "banner"]).default("none"),
});
/** How the player advances. */
export const Progression = z.object({
    mode: z.enum(["endless", "levels", "campaign", "daily"]),
    /** For "levels"/"campaign": how many. Omitted for endless/daily. */
    levels: z.number().int().positive().optional(),
});
/** A versioned content pack this game composes. */
export const ContentSlot = z.object({
    packId: Slug,
    engine: EngineId,
    /** The pinned content version this definition ships (bumped as packs are re-manufactured). */
    version: Semver,
});
export const GameDefinition = z
    .object({
    /** Definition schema version — lets tooling reject shapes it can't read. */
    definitionVersion: z.number().int().positive(),
    id: Slug,
    title: z.string().min(1),
    /** The engines this game composes. The binary must contain all of them. */
    engines: z.array(EngineId).min(1),
    locales: z.array(Locale).min(1),
    monetization: Monetization.default({}),
    progression: Progression,
    /** The versioned packs the game ships. May be empty pre-launch. */
    content: z.array(ContentSlot).default([]),
    /**
     * How the game arranges its activities into Worlds → Levels (ADR-0024). Optional: a game may
     * ship a flat pack (endless/daily) with no explicit map. Present for structured games.
     */
    composition: GameComposition.optional(),
    /**
     * Visual identity tokens the Game Shell paints every screen with (ADR-0027). Optional: absent →
     * the shell's safe defaults. Two games differ by this + assets + content, never code.
     */
    theme: GameTheme.optional(),
    /** Store-facing and app-launch identity (logo, icon, splash, mascot, listing). See ADR-0027. */
    branding: GameBranding.optional(),
})
    .refine((d) => d.content.every((c) => d.engines.includes(c.engine)), {
    message: "every content slot's engine must be declared in engines[]",
    path: ["content"],
});
/**
 * Validate and type a game definition.
 *
 * @example
 *   export const brainBooster = defineGame({ id: "brain-booster", engines: ["quiz"], ... });
 */
export function defineGame(definition) {
    return GameDefinition.parse(definition);
}
//# sourceMappingURL=game-definition.js.map