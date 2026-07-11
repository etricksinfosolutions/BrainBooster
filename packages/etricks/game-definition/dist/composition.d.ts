import { z } from "zod";
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
export declare const ActivityRef: z.ZodObject<{
    /** The pack this activity comes from (a game's content slot). */
    packId: z.ZodString;
    /** The `Activity.id` within that pack's payload. */
    activityId: z.ZodString;
    /** Optional config override layered over the activity's authored config (engine resolves it). */
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    packId: string;
    activityId: string;
    config?: Record<string, unknown> | undefined;
}, {
    packId: string;
    activityId: string;
    config?: Record<string, unknown> | undefined;
}>;
export type ActivityRef = z.infer<typeof ActivityRef>;
/** A level: a small ordered set of activities the player completes to progress. */
export declare const Level: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    /** Level-wide config override applied to every activity in the level (before per-ref overrides). */
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    /** Stars required to unlock this level (0 = open). Drives the progression map. */
    requiredStars: z.ZodDefault<z.ZodNumber>;
    activities: z.ZodArray<z.ZodObject<{
        /** The pack this activity comes from (a game's content slot). */
        packId: z.ZodString;
        /** The `Activity.id` within that pack's payload. */
        activityId: z.ZodString;
        /** Optional config override layered over the activity's authored config (engine resolves it). */
        config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        packId: string;
        activityId: string;
        config?: Record<string, unknown> | undefined;
    }, {
        packId: string;
        activityId: string;
        config?: Record<string, unknown> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    requiredStars: number;
    activities: {
        packId: string;
        activityId: string;
        config?: Record<string, unknown> | undefined;
    }[];
    config?: Record<string, unknown> | undefined;
}, {
    id: string;
    title: string;
    activities: {
        packId: string;
        activityId: string;
        config?: Record<string, unknown> | undefined;
    }[];
    config?: Record<string, unknown> | undefined;
    requiredStars?: number | undefined;
}>;
export type Level = z.infer<typeof Level>;
/** A world: a themed group of levels (a chapter on the map). */
export declare const World: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    levels: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        /** Level-wide config override applied to every activity in the level (before per-ref overrides). */
        config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        /** Stars required to unlock this level (0 = open). Drives the progression map. */
        requiredStars: z.ZodDefault<z.ZodNumber>;
        activities: z.ZodArray<z.ZodObject<{
            /** The pack this activity comes from (a game's content slot). */
            packId: z.ZodString;
            /** The `Activity.id` within that pack's payload. */
            activityId: z.ZodString;
            /** Optional config override layered over the activity's authored config (engine resolves it). */
            config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            packId: string;
            activityId: string;
            config?: Record<string, unknown> | undefined;
        }, {
            packId: string;
            activityId: string;
            config?: Record<string, unknown> | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        requiredStars: number;
        activities: {
            packId: string;
            activityId: string;
            config?: Record<string, unknown> | undefined;
        }[];
        config?: Record<string, unknown> | undefined;
    }, {
        id: string;
        title: string;
        activities: {
            packId: string;
            activityId: string;
            config?: Record<string, unknown> | undefined;
        }[];
        config?: Record<string, unknown> | undefined;
        requiredStars?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    levels: {
        id: string;
        title: string;
        requiredStars: number;
        activities: {
            packId: string;
            activityId: string;
            config?: Record<string, unknown> | undefined;
        }[];
        config?: Record<string, unknown> | undefined;
    }[];
}, {
    id: string;
    title: string;
    levels: {
        id: string;
        title: string;
        activities: {
            packId: string;
            activityId: string;
            config?: Record<string, unknown> | undefined;
        }[];
        config?: Record<string, unknown> | undefined;
        requiredStars?: number | undefined;
    }[];
}>;
export type World = z.infer<typeof World>;
export declare const GameComposition: z.ZodObject<{
    worlds: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        levels: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            /** Level-wide config override applied to every activity in the level (before per-ref overrides). */
            config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            /** Stars required to unlock this level (0 = open). Drives the progression map. */
            requiredStars: z.ZodDefault<z.ZodNumber>;
            activities: z.ZodArray<z.ZodObject<{
                /** The pack this activity comes from (a game's content slot). */
                packId: z.ZodString;
                /** The `Activity.id` within that pack's payload. */
                activityId: z.ZodString;
                /** Optional config override layered over the activity's authored config (engine resolves it). */
                config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            }, "strip", z.ZodTypeAny, {
                packId: string;
                activityId: string;
                config?: Record<string, unknown> | undefined;
            }, {
                packId: string;
                activityId: string;
                config?: Record<string, unknown> | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            id: string;
            title: string;
            requiredStars: number;
            activities: {
                packId: string;
                activityId: string;
                config?: Record<string, unknown> | undefined;
            }[];
            config?: Record<string, unknown> | undefined;
        }, {
            id: string;
            title: string;
            activities: {
                packId: string;
                activityId: string;
                config?: Record<string, unknown> | undefined;
            }[];
            config?: Record<string, unknown> | undefined;
            requiredStars?: number | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        levels: {
            id: string;
            title: string;
            requiredStars: number;
            activities: {
                packId: string;
                activityId: string;
                config?: Record<string, unknown> | undefined;
            }[];
            config?: Record<string, unknown> | undefined;
        }[];
    }, {
        id: string;
        title: string;
        levels: {
            id: string;
            title: string;
            activities: {
                packId: string;
                activityId: string;
                config?: Record<string, unknown> | undefined;
            }[];
            config?: Record<string, unknown> | undefined;
            requiredStars?: number | undefined;
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    worlds: {
        id: string;
        title: string;
        levels: {
            id: string;
            title: string;
            requiredStars: number;
            activities: {
                packId: string;
                activityId: string;
                config?: Record<string, unknown> | undefined;
            }[];
            config?: Record<string, unknown> | undefined;
        }[];
    }[];
}, {
    worlds: {
        id: string;
        title: string;
        levels: {
            id: string;
            title: string;
            activities: {
                packId: string;
                activityId: string;
                config?: Record<string, unknown> | undefined;
            }[];
            config?: Record<string, unknown> | undefined;
            requiredStars?: number | undefined;
        }[];
    }[];
}>;
export type GameComposition = z.infer<typeof GameComposition>;
/** Validate and type a game composition. */
export declare function defineComposition(composition: unknown): GameComposition;
/** All distinct pack ids a composition references — handy for verifying content coverage. */
export declare function referencedPackIds(composition: GameComposition): string[];
/** Total level count across all worlds — the game's progression length. */
export declare function levelCount(composition: GameComposition): number;
//# sourceMappingURL=composition.d.ts.map