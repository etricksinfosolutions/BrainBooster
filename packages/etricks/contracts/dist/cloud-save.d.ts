import { z } from "zod";
/**
 * Cloud Save contracts — the synchronised player document and the sync protocol. Shared by the
 * backend and every client. Builds on the Identity Platform (ADR-0018) and Postgres persistence
 * (ADR-0019); the server is the source of truth and every write is versioned. See ADR-0020.
 *
 * Design notes for the merge engine (see cloud-save.merge in the backend):
 *   - monotonic numbers (xp, coins, gems, stars, streak, furthest level/world) merge by MAX —
 *     earned progress is never lost;
 *   - sets (completedActivities, badges, achievements, daily.rewardsClaimed) merge by UNION;
 *   - preference fields (profile, settings) merge by last-write-wins on `metadata.lastModified`.
 * All rules are commutative/deterministic, so any two devices converge to the same result.
 */
export declare const PlayerProfile: z.ZodObject<{
    displayName: z.ZodOptional<z.ZodString>;
    /** Future-ready cosmetic id. */
    avatar: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    displayName?: string | undefined;
    avatar?: string | undefined;
}, {
    displayName?: string | undefined;
    avatar?: string | undefined;
}>;
export type PlayerProfile = z.infer<typeof PlayerProfile>;
export declare const PlayerProgress: z.ZodObject<{
    xp: z.ZodDefault<z.ZodNumber>;
    coins: z.ZodDefault<z.ZodNumber>;
    gems: z.ZodDefault<z.ZodNumber>;
    hearts: z.ZodDefault<z.ZodNumber>;
    /** Furthest unlocked level. */
    level: z.ZodDefault<z.ZodNumber>;
    /** Furthest progress per world id. */
    worldProgress: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    completedActivities: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Best star rating per level id. */
    stars: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    badges: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    achievements: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Future-ready: item id → count. */
    inventory: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    xp: number;
    coins: number;
    gems: number;
    hearts: number;
    level: number;
    worldProgress: Record<string, number>;
    completedActivities: string[];
    stars: Record<string, number>;
    badges: string[];
    achievements: string[];
    inventory: Record<string, number>;
}, {
    xp?: number | undefined;
    coins?: number | undefined;
    gems?: number | undefined;
    hearts?: number | undefined;
    level?: number | undefined;
    worldProgress?: Record<string, number> | undefined;
    completedActivities?: string[] | undefined;
    stars?: Record<string, number> | undefined;
    badges?: string[] | undefined;
    achievements?: string[] | undefined;
    inventory?: Record<string, number> | undefined;
}>;
export type PlayerProgress = z.infer<typeof PlayerProgress>;
export declare const PlayerSettings: z.ZodObject<{
    audio: z.ZodDefault<z.ZodBoolean>;
    language: z.ZodDefault<z.ZodString>;
    accessibility: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodBoolean, z.ZodString]>>>;
    notifications: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    audio: boolean;
    language: string;
    accessibility: Record<string, string | boolean>;
    notifications: boolean;
}, {
    audio?: boolean | undefined;
    language?: string | undefined;
    accessibility?: Record<string, string | boolean> | undefined;
    notifications?: boolean | undefined;
}>;
export type PlayerSettings = z.infer<typeof PlayerSettings>;
export declare const PlayerDaily: z.ZodObject<{
    rewardsClaimed: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    streak: z.ZodDefault<z.ZodNumber>;
    lastClaimedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rewardsClaimed: string[];
    streak: number;
    lastClaimedAt?: string | undefined;
}, {
    rewardsClaimed?: string[] | undefined;
    streak?: number | undefined;
    lastClaimedAt?: string | undefined;
}>;
export type PlayerDaily = z.infer<typeof PlayerDaily>;
export declare const SaveMetadata: z.ZodObject<{
    /** Server-assigned, monotonically increasing. The optimistic-concurrency token. */
    version: z.ZodDefault<z.ZodNumber>;
    /** ISO timestamp of the client edit that produced this document (drives last-write-wins). */
    lastModified: z.ZodString;
    device: z.ZodOptional<z.ZodString>;
    /** The account id that last wrote (audit + tie-break). */
    updatedBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    version: number;
    lastModified: string;
    device?: string | undefined;
    updatedBy?: string | undefined;
}, {
    lastModified: string;
    device?: string | undefined;
    version?: number | undefined;
    updatedBy?: string | undefined;
}>;
export type SaveMetadata = z.infer<typeof SaveMetadata>;
/** The complete synchronised document for one account. */
export declare const CloudSave: z.ZodObject<{
    profile: z.ZodDefault<z.ZodObject<{
        displayName: z.ZodOptional<z.ZodString>;
        /** Future-ready cosmetic id. */
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        displayName?: string | undefined;
        avatar?: string | undefined;
    }, {
        displayName?: string | undefined;
        avatar?: string | undefined;
    }>>;
    progress: z.ZodDefault<z.ZodObject<{
        xp: z.ZodDefault<z.ZodNumber>;
        coins: z.ZodDefault<z.ZodNumber>;
        gems: z.ZodDefault<z.ZodNumber>;
        hearts: z.ZodDefault<z.ZodNumber>;
        /** Furthest unlocked level. */
        level: z.ZodDefault<z.ZodNumber>;
        /** Furthest progress per world id. */
        worldProgress: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        completedActivities: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        /** Best star rating per level id. */
        stars: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        badges: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        achievements: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        /** Future-ready: item id → count. */
        inventory: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        xp: number;
        coins: number;
        gems: number;
        hearts: number;
        level: number;
        worldProgress: Record<string, number>;
        completedActivities: string[];
        stars: Record<string, number>;
        badges: string[];
        achievements: string[];
        inventory: Record<string, number>;
    }, {
        xp?: number | undefined;
        coins?: number | undefined;
        gems?: number | undefined;
        hearts?: number | undefined;
        level?: number | undefined;
        worldProgress?: Record<string, number> | undefined;
        completedActivities?: string[] | undefined;
        stars?: Record<string, number> | undefined;
        badges?: string[] | undefined;
        achievements?: string[] | undefined;
        inventory?: Record<string, number> | undefined;
    }>>;
    settings: z.ZodDefault<z.ZodObject<{
        audio: z.ZodDefault<z.ZodBoolean>;
        language: z.ZodDefault<z.ZodString>;
        accessibility: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodBoolean, z.ZodString]>>>;
        notifications: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        audio: boolean;
        language: string;
        accessibility: Record<string, string | boolean>;
        notifications: boolean;
    }, {
        audio?: boolean | undefined;
        language?: string | undefined;
        accessibility?: Record<string, string | boolean> | undefined;
        notifications?: boolean | undefined;
    }>>;
    daily: z.ZodDefault<z.ZodObject<{
        rewardsClaimed: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        streak: z.ZodDefault<z.ZodNumber>;
        lastClaimedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        rewardsClaimed: string[];
        streak: number;
        lastClaimedAt?: string | undefined;
    }, {
        rewardsClaimed?: string[] | undefined;
        streak?: number | undefined;
        lastClaimedAt?: string | undefined;
    }>>;
    metadata: z.ZodObject<{
        /** Server-assigned, monotonically increasing. The optimistic-concurrency token. */
        version: z.ZodDefault<z.ZodNumber>;
        /** ISO timestamp of the client edit that produced this document (drives last-write-wins). */
        lastModified: z.ZodString;
        device: z.ZodOptional<z.ZodString>;
        /** The account id that last wrote (audit + tie-break). */
        updatedBy: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        version: number;
        lastModified: string;
        device?: string | undefined;
        updatedBy?: string | undefined;
    }, {
        lastModified: string;
        device?: string | undefined;
        version?: number | undefined;
        updatedBy?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    profile: {
        displayName?: string | undefined;
        avatar?: string | undefined;
    };
    progress: {
        xp: number;
        coins: number;
        gems: number;
        hearts: number;
        level: number;
        worldProgress: Record<string, number>;
        completedActivities: string[];
        stars: Record<string, number>;
        badges: string[];
        achievements: string[];
        inventory: Record<string, number>;
    };
    settings: {
        audio: boolean;
        language: string;
        accessibility: Record<string, string | boolean>;
        notifications: boolean;
    };
    daily: {
        rewardsClaimed: string[];
        streak: number;
        lastClaimedAt?: string | undefined;
    };
    metadata: {
        version: number;
        lastModified: string;
        device?: string | undefined;
        updatedBy?: string | undefined;
    };
}, {
    metadata: {
        lastModified: string;
        device?: string | undefined;
        version?: number | undefined;
        updatedBy?: string | undefined;
    };
    profile?: {
        displayName?: string | undefined;
        avatar?: string | undefined;
    } | undefined;
    progress?: {
        xp?: number | undefined;
        coins?: number | undefined;
        gems?: number | undefined;
        hearts?: number | undefined;
        level?: number | undefined;
        worldProgress?: Record<string, number> | undefined;
        completedActivities?: string[] | undefined;
        stars?: Record<string, number> | undefined;
        badges?: string[] | undefined;
        achievements?: string[] | undefined;
        inventory?: Record<string, number> | undefined;
    } | undefined;
    settings?: {
        audio?: boolean | undefined;
        language?: string | undefined;
        accessibility?: Record<string, string | boolean> | undefined;
        notifications?: boolean | undefined;
    } | undefined;
    daily?: {
        rewardsClaimed?: string[] | undefined;
        streak?: number | undefined;
        lastClaimedAt?: string | undefined;
    } | undefined;
}>;
export type CloudSave = z.infer<typeof CloudSave>;
/** The mergeable body (everything except server-owned version). */
export declare const CloudSaveData: z.ZodObject<Omit<{
    profile: z.ZodDefault<z.ZodObject<{
        displayName: z.ZodOptional<z.ZodString>;
        /** Future-ready cosmetic id. */
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        displayName?: string | undefined;
        avatar?: string | undefined;
    }, {
        displayName?: string | undefined;
        avatar?: string | undefined;
    }>>;
    progress: z.ZodDefault<z.ZodObject<{
        xp: z.ZodDefault<z.ZodNumber>;
        coins: z.ZodDefault<z.ZodNumber>;
        gems: z.ZodDefault<z.ZodNumber>;
        hearts: z.ZodDefault<z.ZodNumber>;
        /** Furthest unlocked level. */
        level: z.ZodDefault<z.ZodNumber>;
        /** Furthest progress per world id. */
        worldProgress: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        completedActivities: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        /** Best star rating per level id. */
        stars: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        badges: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        achievements: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        /** Future-ready: item id → count. */
        inventory: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        xp: number;
        coins: number;
        gems: number;
        hearts: number;
        level: number;
        worldProgress: Record<string, number>;
        completedActivities: string[];
        stars: Record<string, number>;
        badges: string[];
        achievements: string[];
        inventory: Record<string, number>;
    }, {
        xp?: number | undefined;
        coins?: number | undefined;
        gems?: number | undefined;
        hearts?: number | undefined;
        level?: number | undefined;
        worldProgress?: Record<string, number> | undefined;
        completedActivities?: string[] | undefined;
        stars?: Record<string, number> | undefined;
        badges?: string[] | undefined;
        achievements?: string[] | undefined;
        inventory?: Record<string, number> | undefined;
    }>>;
    settings: z.ZodDefault<z.ZodObject<{
        audio: z.ZodDefault<z.ZodBoolean>;
        language: z.ZodDefault<z.ZodString>;
        accessibility: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodBoolean, z.ZodString]>>>;
        notifications: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        audio: boolean;
        language: string;
        accessibility: Record<string, string | boolean>;
        notifications: boolean;
    }, {
        audio?: boolean | undefined;
        language?: string | undefined;
        accessibility?: Record<string, string | boolean> | undefined;
        notifications?: boolean | undefined;
    }>>;
    daily: z.ZodDefault<z.ZodObject<{
        rewardsClaimed: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        streak: z.ZodDefault<z.ZodNumber>;
        lastClaimedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        rewardsClaimed: string[];
        streak: number;
        lastClaimedAt?: string | undefined;
    }, {
        rewardsClaimed?: string[] | undefined;
        streak?: number | undefined;
        lastClaimedAt?: string | undefined;
    }>>;
    metadata: z.ZodObject<{
        /** Server-assigned, monotonically increasing. The optimistic-concurrency token. */
        version: z.ZodDefault<z.ZodNumber>;
        /** ISO timestamp of the client edit that produced this document (drives last-write-wins). */
        lastModified: z.ZodString;
        device: z.ZodOptional<z.ZodString>;
        /** The account id that last wrote (audit + tie-break). */
        updatedBy: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        version: number;
        lastModified: string;
        device?: string | undefined;
        updatedBy?: string | undefined;
    }, {
        lastModified: string;
        device?: string | undefined;
        version?: number | undefined;
        updatedBy?: string | undefined;
    }>;
}, "metadata"> & {
    metadata: z.ZodObject<Omit<{
        /** Server-assigned, monotonically increasing. The optimistic-concurrency token. */
        version: z.ZodDefault<z.ZodNumber>;
        /** ISO timestamp of the client edit that produced this document (drives last-write-wins). */
        lastModified: z.ZodString;
        device: z.ZodOptional<z.ZodString>;
        /** The account id that last wrote (audit + tie-break). */
        updatedBy: z.ZodOptional<z.ZodString>;
    }, "version">, "strip", z.ZodTypeAny, {
        lastModified: string;
        device?: string | undefined;
        updatedBy?: string | undefined;
    }, {
        lastModified: string;
        device?: string | undefined;
        updatedBy?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    profile: {
        displayName?: string | undefined;
        avatar?: string | undefined;
    };
    progress: {
        xp: number;
        coins: number;
        gems: number;
        hearts: number;
        level: number;
        worldProgress: Record<string, number>;
        completedActivities: string[];
        stars: Record<string, number>;
        badges: string[];
        achievements: string[];
        inventory: Record<string, number>;
    };
    settings: {
        audio: boolean;
        language: string;
        accessibility: Record<string, string | boolean>;
        notifications: boolean;
    };
    daily: {
        rewardsClaimed: string[];
        streak: number;
        lastClaimedAt?: string | undefined;
    };
    metadata: {
        lastModified: string;
        device?: string | undefined;
        updatedBy?: string | undefined;
    };
}, {
    metadata: {
        lastModified: string;
        device?: string | undefined;
        updatedBy?: string | undefined;
    };
    profile?: {
        displayName?: string | undefined;
        avatar?: string | undefined;
    } | undefined;
    progress?: {
        xp?: number | undefined;
        coins?: number | undefined;
        gems?: number | undefined;
        hearts?: number | undefined;
        level?: number | undefined;
        worldProgress?: Record<string, number> | undefined;
        completedActivities?: string[] | undefined;
        stars?: Record<string, number> | undefined;
        badges?: string[] | undefined;
        achievements?: string[] | undefined;
        inventory?: Record<string, number> | undefined;
    } | undefined;
    settings?: {
        audio?: boolean | undefined;
        language?: string | undefined;
        accessibility?: Record<string, string | boolean> | undefined;
        notifications?: boolean | undefined;
    } | undefined;
    daily?: {
        rewardsClaimed?: string[] | undefined;
        streak?: number | undefined;
        lastClaimedAt?: string | undefined;
    } | undefined;
}>;
export type CloudSaveData = z.infer<typeof CloudSaveData>;
/** POST /cloud/sync — push the client document, based on the last server version it saw. */
export declare const SyncRequest: z.ZodObject<{
    /** The server `version` this client last synced from (0 if it has never synced). */
    baseVersion: z.ZodNumber;
    data: z.ZodObject<Omit<{
        profile: z.ZodDefault<z.ZodObject<{
            displayName: z.ZodOptional<z.ZodString>;
            /** Future-ready cosmetic id. */
            avatar: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            displayName?: string | undefined;
            avatar?: string | undefined;
        }, {
            displayName?: string | undefined;
            avatar?: string | undefined;
        }>>;
        progress: z.ZodDefault<z.ZodObject<{
            xp: z.ZodDefault<z.ZodNumber>;
            coins: z.ZodDefault<z.ZodNumber>;
            gems: z.ZodDefault<z.ZodNumber>;
            hearts: z.ZodDefault<z.ZodNumber>;
            /** Furthest unlocked level. */
            level: z.ZodDefault<z.ZodNumber>;
            /** Furthest progress per world id. */
            worldProgress: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
            completedActivities: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            /** Best star rating per level id. */
            stars: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
            badges: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            achievements: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            /** Future-ready: item id → count. */
            inventory: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            xp: number;
            coins: number;
            gems: number;
            hearts: number;
            level: number;
            worldProgress: Record<string, number>;
            completedActivities: string[];
            stars: Record<string, number>;
            badges: string[];
            achievements: string[];
            inventory: Record<string, number>;
        }, {
            xp?: number | undefined;
            coins?: number | undefined;
            gems?: number | undefined;
            hearts?: number | undefined;
            level?: number | undefined;
            worldProgress?: Record<string, number> | undefined;
            completedActivities?: string[] | undefined;
            stars?: Record<string, number> | undefined;
            badges?: string[] | undefined;
            achievements?: string[] | undefined;
            inventory?: Record<string, number> | undefined;
        }>>;
        settings: z.ZodDefault<z.ZodObject<{
            audio: z.ZodDefault<z.ZodBoolean>;
            language: z.ZodDefault<z.ZodString>;
            accessibility: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodBoolean, z.ZodString]>>>;
            notifications: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            audio: boolean;
            language: string;
            accessibility: Record<string, string | boolean>;
            notifications: boolean;
        }, {
            audio?: boolean | undefined;
            language?: string | undefined;
            accessibility?: Record<string, string | boolean> | undefined;
            notifications?: boolean | undefined;
        }>>;
        daily: z.ZodDefault<z.ZodObject<{
            rewardsClaimed: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            streak: z.ZodDefault<z.ZodNumber>;
            lastClaimedAt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            rewardsClaimed: string[];
            streak: number;
            lastClaimedAt?: string | undefined;
        }, {
            rewardsClaimed?: string[] | undefined;
            streak?: number | undefined;
            lastClaimedAt?: string | undefined;
        }>>;
        metadata: z.ZodObject<{
            /** Server-assigned, monotonically increasing. The optimistic-concurrency token. */
            version: z.ZodDefault<z.ZodNumber>;
            /** ISO timestamp of the client edit that produced this document (drives last-write-wins). */
            lastModified: z.ZodString;
            device: z.ZodOptional<z.ZodString>;
            /** The account id that last wrote (audit + tie-break). */
            updatedBy: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            version: number;
            lastModified: string;
            device?: string | undefined;
            updatedBy?: string | undefined;
        }, {
            lastModified: string;
            device?: string | undefined;
            version?: number | undefined;
            updatedBy?: string | undefined;
        }>;
    }, "metadata"> & {
        metadata: z.ZodObject<Omit<{
            /** Server-assigned, monotonically increasing. The optimistic-concurrency token. */
            version: z.ZodDefault<z.ZodNumber>;
            /** ISO timestamp of the client edit that produced this document (drives last-write-wins). */
            lastModified: z.ZodString;
            device: z.ZodOptional<z.ZodString>;
            /** The account id that last wrote (audit + tie-break). */
            updatedBy: z.ZodOptional<z.ZodString>;
        }, "version">, "strip", z.ZodTypeAny, {
            lastModified: string;
            device?: string | undefined;
            updatedBy?: string | undefined;
        }, {
            lastModified: string;
            device?: string | undefined;
            updatedBy?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        profile: {
            displayName?: string | undefined;
            avatar?: string | undefined;
        };
        progress: {
            xp: number;
            coins: number;
            gems: number;
            hearts: number;
            level: number;
            worldProgress: Record<string, number>;
            completedActivities: string[];
            stars: Record<string, number>;
            badges: string[];
            achievements: string[];
            inventory: Record<string, number>;
        };
        settings: {
            audio: boolean;
            language: string;
            accessibility: Record<string, string | boolean>;
            notifications: boolean;
        };
        daily: {
            rewardsClaimed: string[];
            streak: number;
            lastClaimedAt?: string | undefined;
        };
        metadata: {
            lastModified: string;
            device?: string | undefined;
            updatedBy?: string | undefined;
        };
    }, {
        metadata: {
            lastModified: string;
            device?: string | undefined;
            updatedBy?: string | undefined;
        };
        profile?: {
            displayName?: string | undefined;
            avatar?: string | undefined;
        } | undefined;
        progress?: {
            xp?: number | undefined;
            coins?: number | undefined;
            gems?: number | undefined;
            hearts?: number | undefined;
            level?: number | undefined;
            worldProgress?: Record<string, number> | undefined;
            completedActivities?: string[] | undefined;
            stars?: Record<string, number> | undefined;
            badges?: string[] | undefined;
            achievements?: string[] | undefined;
            inventory?: Record<string, number> | undefined;
        } | undefined;
        settings?: {
            audio?: boolean | undefined;
            language?: string | undefined;
            accessibility?: Record<string, string | boolean> | undefined;
            notifications?: boolean | undefined;
        } | undefined;
        daily?: {
            rewardsClaimed?: string[] | undefined;
            streak?: number | undefined;
            lastClaimedAt?: string | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    baseVersion: number;
    data: {
        profile: {
            displayName?: string | undefined;
            avatar?: string | undefined;
        };
        progress: {
            xp: number;
            coins: number;
            gems: number;
            hearts: number;
            level: number;
            worldProgress: Record<string, number>;
            completedActivities: string[];
            stars: Record<string, number>;
            badges: string[];
            achievements: string[];
            inventory: Record<string, number>;
        };
        settings: {
            audio: boolean;
            language: string;
            accessibility: Record<string, string | boolean>;
            notifications: boolean;
        };
        daily: {
            rewardsClaimed: string[];
            streak: number;
            lastClaimedAt?: string | undefined;
        };
        metadata: {
            lastModified: string;
            device?: string | undefined;
            updatedBy?: string | undefined;
        };
    };
}, {
    baseVersion: number;
    data: {
        metadata: {
            lastModified: string;
            device?: string | undefined;
            updatedBy?: string | undefined;
        };
        profile?: {
            displayName?: string | undefined;
            avatar?: string | undefined;
        } | undefined;
        progress?: {
            xp?: number | undefined;
            coins?: number | undefined;
            gems?: number | undefined;
            hearts?: number | undefined;
            level?: number | undefined;
            worldProgress?: Record<string, number> | undefined;
            completedActivities?: string[] | undefined;
            stars?: Record<string, number> | undefined;
            badges?: string[] | undefined;
            achievements?: string[] | undefined;
            inventory?: Record<string, number> | undefined;
        } | undefined;
        settings?: {
            audio?: boolean | undefined;
            language?: string | undefined;
            accessibility?: Record<string, string | boolean> | undefined;
            notifications?: boolean | undefined;
        } | undefined;
        daily?: {
            rewardsClaimed?: string[] | undefined;
            streak?: number | undefined;
            lastClaimedAt?: string | undefined;
        } | undefined;
    };
}>;
export type SyncRequest = z.infer<typeof SyncRequest>;
/** One field the merge had to reconcile between diverging devices — never silently dropped. */
export declare const SyncConflict: z.ZodObject<{
    field: z.ZodString;
    resolution: z.ZodEnum<["max", "union", "last-write-wins"]>;
    kept: z.ZodOptional<z.ZodUnknown>;
    discarded: z.ZodOptional<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    field: string;
    resolution: "max" | "union" | "last-write-wins";
    kept?: unknown;
    discarded?: unknown;
}, {
    field: string;
    resolution: "max" | "union" | "last-write-wins";
    kept?: unknown;
    discarded?: unknown;
}>;
export type SyncConflict = z.infer<typeof SyncConflict>;
export declare const SyncStatus: z.ZodEnum<["applied", "merged", "up-to-date"]>;
export type SyncStatus = z.infer<typeof SyncStatus>;
export declare const SyncResponse: z.ZodObject<{
    status: z.ZodEnum<["applied", "merged", "up-to-date"]>;
    /** The authoritative document after the sync. */
    save: z.ZodObject<{
        profile: z.ZodDefault<z.ZodObject<{
            displayName: z.ZodOptional<z.ZodString>;
            /** Future-ready cosmetic id. */
            avatar: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            displayName?: string | undefined;
            avatar?: string | undefined;
        }, {
            displayName?: string | undefined;
            avatar?: string | undefined;
        }>>;
        progress: z.ZodDefault<z.ZodObject<{
            xp: z.ZodDefault<z.ZodNumber>;
            coins: z.ZodDefault<z.ZodNumber>;
            gems: z.ZodDefault<z.ZodNumber>;
            hearts: z.ZodDefault<z.ZodNumber>;
            /** Furthest unlocked level. */
            level: z.ZodDefault<z.ZodNumber>;
            /** Furthest progress per world id. */
            worldProgress: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
            completedActivities: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            /** Best star rating per level id. */
            stars: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
            badges: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            achievements: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            /** Future-ready: item id → count. */
            inventory: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            xp: number;
            coins: number;
            gems: number;
            hearts: number;
            level: number;
            worldProgress: Record<string, number>;
            completedActivities: string[];
            stars: Record<string, number>;
            badges: string[];
            achievements: string[];
            inventory: Record<string, number>;
        }, {
            xp?: number | undefined;
            coins?: number | undefined;
            gems?: number | undefined;
            hearts?: number | undefined;
            level?: number | undefined;
            worldProgress?: Record<string, number> | undefined;
            completedActivities?: string[] | undefined;
            stars?: Record<string, number> | undefined;
            badges?: string[] | undefined;
            achievements?: string[] | undefined;
            inventory?: Record<string, number> | undefined;
        }>>;
        settings: z.ZodDefault<z.ZodObject<{
            audio: z.ZodDefault<z.ZodBoolean>;
            language: z.ZodDefault<z.ZodString>;
            accessibility: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodBoolean, z.ZodString]>>>;
            notifications: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            audio: boolean;
            language: string;
            accessibility: Record<string, string | boolean>;
            notifications: boolean;
        }, {
            audio?: boolean | undefined;
            language?: string | undefined;
            accessibility?: Record<string, string | boolean> | undefined;
            notifications?: boolean | undefined;
        }>>;
        daily: z.ZodDefault<z.ZodObject<{
            rewardsClaimed: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            streak: z.ZodDefault<z.ZodNumber>;
            lastClaimedAt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            rewardsClaimed: string[];
            streak: number;
            lastClaimedAt?: string | undefined;
        }, {
            rewardsClaimed?: string[] | undefined;
            streak?: number | undefined;
            lastClaimedAt?: string | undefined;
        }>>;
        metadata: z.ZodObject<{
            /** Server-assigned, monotonically increasing. The optimistic-concurrency token. */
            version: z.ZodDefault<z.ZodNumber>;
            /** ISO timestamp of the client edit that produced this document (drives last-write-wins). */
            lastModified: z.ZodString;
            device: z.ZodOptional<z.ZodString>;
            /** The account id that last wrote (audit + tie-break). */
            updatedBy: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            version: number;
            lastModified: string;
            device?: string | undefined;
            updatedBy?: string | undefined;
        }, {
            lastModified: string;
            device?: string | undefined;
            version?: number | undefined;
            updatedBy?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        profile: {
            displayName?: string | undefined;
            avatar?: string | undefined;
        };
        progress: {
            xp: number;
            coins: number;
            gems: number;
            hearts: number;
            level: number;
            worldProgress: Record<string, number>;
            completedActivities: string[];
            stars: Record<string, number>;
            badges: string[];
            achievements: string[];
            inventory: Record<string, number>;
        };
        settings: {
            audio: boolean;
            language: string;
            accessibility: Record<string, string | boolean>;
            notifications: boolean;
        };
        daily: {
            rewardsClaimed: string[];
            streak: number;
            lastClaimedAt?: string | undefined;
        };
        metadata: {
            version: number;
            lastModified: string;
            device?: string | undefined;
            updatedBy?: string | undefined;
        };
    }, {
        metadata: {
            lastModified: string;
            device?: string | undefined;
            version?: number | undefined;
            updatedBy?: string | undefined;
        };
        profile?: {
            displayName?: string | undefined;
            avatar?: string | undefined;
        } | undefined;
        progress?: {
            xp?: number | undefined;
            coins?: number | undefined;
            gems?: number | undefined;
            hearts?: number | undefined;
            level?: number | undefined;
            worldProgress?: Record<string, number> | undefined;
            completedActivities?: string[] | undefined;
            stars?: Record<string, number> | undefined;
            badges?: string[] | undefined;
            achievements?: string[] | undefined;
            inventory?: Record<string, number> | undefined;
        } | undefined;
        settings?: {
            audio?: boolean | undefined;
            language?: string | undefined;
            accessibility?: Record<string, string | boolean> | undefined;
            notifications?: boolean | undefined;
        } | undefined;
        daily?: {
            rewardsClaimed?: string[] | undefined;
            streak?: number | undefined;
            lastClaimedAt?: string | undefined;
        } | undefined;
    }>;
    /** Populated when status === "merged": what diverged and how it was resolved. */
    conflicts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        resolution: z.ZodEnum<["max", "union", "last-write-wins"]>;
        kept: z.ZodOptional<z.ZodUnknown>;
        discarded: z.ZodOptional<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        resolution: "max" | "union" | "last-write-wins";
        kept?: unknown;
        discarded?: unknown;
    }, {
        field: string;
        resolution: "max" | "union" | "last-write-wins";
        kept?: unknown;
        discarded?: unknown;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "applied" | "merged" | "up-to-date";
    save: {
        profile: {
            displayName?: string | undefined;
            avatar?: string | undefined;
        };
        progress: {
            xp: number;
            coins: number;
            gems: number;
            hearts: number;
            level: number;
            worldProgress: Record<string, number>;
            completedActivities: string[];
            stars: Record<string, number>;
            badges: string[];
            achievements: string[];
            inventory: Record<string, number>;
        };
        settings: {
            audio: boolean;
            language: string;
            accessibility: Record<string, string | boolean>;
            notifications: boolean;
        };
        daily: {
            rewardsClaimed: string[];
            streak: number;
            lastClaimedAt?: string | undefined;
        };
        metadata: {
            version: number;
            lastModified: string;
            device?: string | undefined;
            updatedBy?: string | undefined;
        };
    };
    conflicts: {
        field: string;
        resolution: "max" | "union" | "last-write-wins";
        kept?: unknown;
        discarded?: unknown;
    }[];
}, {
    status: "applied" | "merged" | "up-to-date";
    save: {
        metadata: {
            lastModified: string;
            device?: string | undefined;
            version?: number | undefined;
            updatedBy?: string | undefined;
        };
        profile?: {
            displayName?: string | undefined;
            avatar?: string | undefined;
        } | undefined;
        progress?: {
            xp?: number | undefined;
            coins?: number | undefined;
            gems?: number | undefined;
            hearts?: number | undefined;
            level?: number | undefined;
            worldProgress?: Record<string, number> | undefined;
            completedActivities?: string[] | undefined;
            stars?: Record<string, number> | undefined;
            badges?: string[] | undefined;
            achievements?: string[] | undefined;
            inventory?: Record<string, number> | undefined;
        } | undefined;
        settings?: {
            audio?: boolean | undefined;
            language?: string | undefined;
            accessibility?: Record<string, string | boolean> | undefined;
            notifications?: boolean | undefined;
        } | undefined;
        daily?: {
            rewardsClaimed?: string[] | undefined;
            streak?: number | undefined;
            lastClaimedAt?: string | undefined;
        } | undefined;
    };
    conflicts?: {
        field: string;
        resolution: "max" | "union" | "last-write-wins";
        kept?: unknown;
        discarded?: unknown;
    }[] | undefined;
}>;
export type SyncResponse = z.infer<typeof SyncResponse>;
/** GET /cloud/status — cheap freshness check. */
export declare const CloudStatus: z.ZodObject<{
    exists: z.ZodBoolean;
    version: z.ZodNumber;
    lastModified: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    version: number;
    exists: boolean;
    lastModified?: string | undefined;
}, {
    version: number;
    exists: boolean;
    lastModified?: string | undefined;
}>;
export type CloudStatus = z.infer<typeof CloudStatus>;
/** PUT /cloud/profile and PUT /cloud/progress — versioned partial writes (avoid full uploads). */
export declare const PutProfileRequest: z.ZodObject<{
    baseVersion: z.ZodNumber;
    profile: z.ZodObject<{
        displayName: z.ZodOptional<z.ZodString>;
        /** Future-ready cosmetic id. */
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        displayName?: string | undefined;
        avatar?: string | undefined;
    }, {
        displayName?: string | undefined;
        avatar?: string | undefined;
    }>;
    lastModified: z.ZodString;
    device: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    lastModified: string;
    profile: {
        displayName?: string | undefined;
        avatar?: string | undefined;
    };
    baseVersion: number;
    device?: string | undefined;
}, {
    lastModified: string;
    profile: {
        displayName?: string | undefined;
        avatar?: string | undefined;
    };
    baseVersion: number;
    device?: string | undefined;
}>;
export type PutProfileRequest = z.infer<typeof PutProfileRequest>;
export declare const PutProgressRequest: z.ZodObject<{
    baseVersion: z.ZodNumber;
    progress: z.ZodObject<{
        xp: z.ZodDefault<z.ZodNumber>;
        coins: z.ZodDefault<z.ZodNumber>;
        gems: z.ZodDefault<z.ZodNumber>;
        hearts: z.ZodDefault<z.ZodNumber>;
        /** Furthest unlocked level. */
        level: z.ZodDefault<z.ZodNumber>;
        /** Furthest progress per world id. */
        worldProgress: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        completedActivities: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        /** Best star rating per level id. */
        stars: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        badges: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        achievements: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        /** Future-ready: item id → count. */
        inventory: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        xp: number;
        coins: number;
        gems: number;
        hearts: number;
        level: number;
        worldProgress: Record<string, number>;
        completedActivities: string[];
        stars: Record<string, number>;
        badges: string[];
        achievements: string[];
        inventory: Record<string, number>;
    }, {
        xp?: number | undefined;
        coins?: number | undefined;
        gems?: number | undefined;
        hearts?: number | undefined;
        level?: number | undefined;
        worldProgress?: Record<string, number> | undefined;
        completedActivities?: string[] | undefined;
        stars?: Record<string, number> | undefined;
        badges?: string[] | undefined;
        achievements?: string[] | undefined;
        inventory?: Record<string, number> | undefined;
    }>;
    lastModified: z.ZodString;
    device: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    lastModified: string;
    progress: {
        xp: number;
        coins: number;
        gems: number;
        hearts: number;
        level: number;
        worldProgress: Record<string, number>;
        completedActivities: string[];
        stars: Record<string, number>;
        badges: string[];
        achievements: string[];
        inventory: Record<string, number>;
    };
    baseVersion: number;
    device?: string | undefined;
}, {
    lastModified: string;
    progress: {
        xp?: number | undefined;
        coins?: number | undefined;
        gems?: number | undefined;
        hearts?: number | undefined;
        level?: number | undefined;
        worldProgress?: Record<string, number> | undefined;
        completedActivities?: string[] | undefined;
        stars?: Record<string, number> | undefined;
        badges?: string[] | undefined;
        achievements?: string[] | undefined;
        inventory?: Record<string, number> | undefined;
    };
    baseVersion: number;
    device?: string | undefined;
}>;
export type PutProgressRequest = z.infer<typeof PutProgressRequest>;
//# sourceMappingURL=cloud-save.d.ts.map