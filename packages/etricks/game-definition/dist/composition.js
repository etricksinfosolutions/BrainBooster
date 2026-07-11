import { z } from "zod";
import { Slug } from "@etricks/contracts";
/**
 * GameComposition — how a game arranges reusable activities into a playable structure.
 *
 * The platform's product shape is: **Game → Worlds → Levels → Activities → Content Packs → Assets**.
 * A `GameComposition` captures the middle of that chain declaratively: worlds group levels, a level
 * sequences a handful of activity references, and each reference points at an activity id inside a
 * manufactured content pack plus optional config overrides. This is authoring data — no gameplay
 * logic — so building a new game's structure is editing this object (or clicking through the CMS),
 * never writing code. See ADR-0024.
 *
 * Config overrides are kept as a loose record here on purpose: the composition layer stays free of
 * any single engine's config type, and the Universal Activity Engine resolves + validates the
 * override (`resolveConfig`) at play time. A level's override layers over each activity's own config.
 */
/** A pointer from a level to one manufactured activity, with optional per-placement config. */
export const ActivityRef = z.object({
    /** The pack this activity comes from (a game's content slot). */
    packId: Slug,
    /** The `Activity.id` within that pack's payload. */
    activityId: z.string().min(1),
    /** Optional config override layered over the activity's authored config (engine resolves it). */
    config: z.record(z.string(), z.unknown()).optional(),
});
/** A level: a small ordered set of activities the player completes to progress. */
export const Level = z.object({
    id: Slug,
    title: z.string().min(1),
    /** Level-wide config override applied to every activity in the level (before per-ref overrides). */
    config: z.record(z.string(), z.unknown()).optional(),
    /** Stars required to unlock this level (0 = open). Drives the progression map. */
    requiredStars: z.number().int().nonnegative().default(0),
    activities: z.array(ActivityRef).min(1),
});
/** A world: a themed group of levels (a chapter on the map). */
export const World = z.object({
    id: Slug,
    title: z.string().min(1),
    levels: z.array(Level).min(1),
});
export const GameComposition = z.object({
    worlds: z.array(World).min(1),
});
/** Validate and type a game composition. */
export function defineComposition(composition) {
    return GameComposition.parse(composition);
}
/** All distinct pack ids a composition references — handy for verifying content coverage. */
export function referencedPackIds(composition) {
    const ids = new Set();
    for (const world of composition.worlds)
        for (const level of world.levels)
            for (const ref of level.activities)
                ids.add(ref.packId);
    return [...ids];
}
/** Total level count across all worlds — the game's progression length. */
export function levelCount(composition) {
    return composition.worlds.reduce((n, w) => n + w.levels.length, 0);
}
//# sourceMappingURL=composition.js.map