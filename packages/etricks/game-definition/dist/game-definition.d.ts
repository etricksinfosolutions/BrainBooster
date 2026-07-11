import { z } from "zod";
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
export declare const Monetization: z.ZodObject<{
    subscription: z.ZodDefault<z.ZodBoolean>;
    oneTimePurchase: z.ZodDefault<z.ZodBoolean>;
    ads: z.ZodDefault<z.ZodEnum<["none", "rewarded", "interstitial", "banner"]>>;
}, "strip", z.ZodTypeAny, {
    subscription: boolean;
    oneTimePurchase: boolean;
    ads: "none" | "rewarded" | "interstitial" | "banner";
}, {
    subscription?: boolean | undefined;
    oneTimePurchase?: boolean | undefined;
    ads?: "none" | "rewarded" | "interstitial" | "banner" | undefined;
}>;
export type Monetization = z.infer<typeof Monetization>;
/** How the player advances. */
export declare const Progression: z.ZodObject<{
    mode: z.ZodEnum<["endless", "levels", "campaign", "daily"]>;
    /** For "levels"/"campaign": how many. Omitted for endless/daily. */
    levels: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    mode: "levels" | "endless" | "campaign" | "daily";
    levels?: number | undefined;
}, {
    mode: "levels" | "endless" | "campaign" | "daily";
    levels?: number | undefined;
}>;
export type Progression = z.infer<typeof Progression>;
/** A versioned content pack this game composes. */
export declare const ContentSlot: z.ZodObject<{
    packId: z.ZodString;
    engine: z.ZodEnum<["quiz", "memory", "puzzle", "board", "story", "language", "simulation", "activity"]>;
    /** The pinned content version this definition ships (bumped as packs are re-manufactured). */
    version: z.ZodString;
}, "strip", z.ZodTypeAny, {
    packId: string;
    engine: "quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation" | "activity";
    version: string;
}, {
    packId: string;
    engine: "quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation" | "activity";
    version: string;
}>;
export type ContentSlot = z.infer<typeof ContentSlot>;
export declare const GameDefinition: z.ZodEffects<z.ZodObject<{
    /** Definition schema version — lets tooling reject shapes it can't read. */
    definitionVersion: z.ZodNumber;
    id: z.ZodString;
    title: z.ZodString;
    /** The engines this game composes. The binary must contain all of them. */
    engines: z.ZodArray<z.ZodEnum<["quiz", "memory", "puzzle", "board", "story", "language", "simulation", "activity"]>, "many">;
    locales: z.ZodArray<z.ZodString, "many">;
    monetization: z.ZodDefault<z.ZodObject<{
        subscription: z.ZodDefault<z.ZodBoolean>;
        oneTimePurchase: z.ZodDefault<z.ZodBoolean>;
        ads: z.ZodDefault<z.ZodEnum<["none", "rewarded", "interstitial", "banner"]>>;
    }, "strip", z.ZodTypeAny, {
        subscription: boolean;
        oneTimePurchase: boolean;
        ads: "none" | "rewarded" | "interstitial" | "banner";
    }, {
        subscription?: boolean | undefined;
        oneTimePurchase?: boolean | undefined;
        ads?: "none" | "rewarded" | "interstitial" | "banner" | undefined;
    }>>;
    progression: z.ZodObject<{
        mode: z.ZodEnum<["endless", "levels", "campaign", "daily"]>;
        /** For "levels"/"campaign": how many. Omitted for endless/daily. */
        levels: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        mode: "levels" | "endless" | "campaign" | "daily";
        levels?: number | undefined;
    }, {
        mode: "levels" | "endless" | "campaign" | "daily";
        levels?: number | undefined;
    }>;
    /** The versioned packs the game ships. May be empty pre-launch. */
    content: z.ZodDefault<z.ZodArray<z.ZodObject<{
        packId: z.ZodString;
        engine: z.ZodEnum<["quiz", "memory", "puzzle", "board", "story", "language", "simulation", "activity"]>;
        /** The pinned content version this definition ships (bumped as packs are re-manufactured). */
        version: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        packId: string;
        engine: "quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation" | "activity";
        version: string;
    }, {
        packId: string;
        engine: "quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation" | "activity";
        version: string;
    }>, "many">>;
    /**
     * How the game arranges its activities into Worlds → Levels (ADR-0024). Optional: a game may
     * ship a flat pack (endless/daily) with no explicit map. Present for structured games.
     */
    composition: z.ZodOptional<z.ZodObject<{
        worlds: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            levels: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                requiredStars: z.ZodDefault<z.ZodNumber>;
                activities: z.ZodArray<z.ZodObject<{
                    packId: z.ZodString;
                    activityId: z.ZodString;
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
    }>>;
    /**
     * Visual identity tokens the Game Shell paints every screen with (ADR-0027). Optional: absent →
     * the shell's safe defaults. Two games differ by this + assets + content, never code.
     */
    theme: z.ZodOptional<z.ZodObject<{
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
        fontFamily: z.ZodOptional<z.ZodString>;
        cornerRadius: z.ZodDefault<z.ZodNumber>;
        motion: z.ZodDefault<z.ZodEnum<["calm", "standard", "playful", "energetic"]>>;
        artStyle: z.ZodOptional<z.ZodString>;
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
    }>>;
    /** Store-facing and app-launch identity (logo, icon, splash, mascot, listing). See ADR-0027. */
    branding: z.ZodOptional<z.ZodObject<{
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
        iconSetId: z.ZodOptional<z.ZodString>;
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
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    definitionVersion: number;
    engines: ("quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation" | "activity")[];
    locales: string[];
    monetization: {
        subscription: boolean;
        oneTimePurchase: boolean;
        ads: "none" | "rewarded" | "interstitial" | "banner";
    };
    progression: {
        mode: "levels" | "endless" | "campaign" | "daily";
        levels?: number | undefined;
    };
    content: {
        packId: string;
        engine: "quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation" | "activity";
        version: string;
    }[];
    composition?: {
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
    } | undefined;
    theme?: {
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
    } | undefined;
    branding?: {
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
    } | undefined;
}, {
    id: string;
    title: string;
    definitionVersion: number;
    engines: ("quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation" | "activity")[];
    locales: string[];
    progression: {
        mode: "levels" | "endless" | "campaign" | "daily";
        levels?: number | undefined;
    };
    monetization?: {
        subscription?: boolean | undefined;
        oneTimePurchase?: boolean | undefined;
        ads?: "none" | "rewarded" | "interstitial" | "banner" | undefined;
    } | undefined;
    content?: {
        packId: string;
        engine: "quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation" | "activity";
        version: string;
    }[] | undefined;
    composition?: {
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
    } | undefined;
    theme?: {
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
    } | undefined;
    branding?: {
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
    } | undefined;
}>, {
    id: string;
    title: string;
    definitionVersion: number;
    engines: ("quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation" | "activity")[];
    locales: string[];
    monetization: {
        subscription: boolean;
        oneTimePurchase: boolean;
        ads: "none" | "rewarded" | "interstitial" | "banner";
    };
    progression: {
        mode: "levels" | "endless" | "campaign" | "daily";
        levels?: number | undefined;
    };
    content: {
        packId: string;
        engine: "quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation" | "activity";
        version: string;
    }[];
    composition?: {
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
    } | undefined;
    theme?: {
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
    } | undefined;
    branding?: {
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
    } | undefined;
}, {
    id: string;
    title: string;
    definitionVersion: number;
    engines: ("quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation" | "activity")[];
    locales: string[];
    progression: {
        mode: "levels" | "endless" | "campaign" | "daily";
        levels?: number | undefined;
    };
    monetization?: {
        subscription?: boolean | undefined;
        oneTimePurchase?: boolean | undefined;
        ads?: "none" | "rewarded" | "interstitial" | "banner" | undefined;
    } | undefined;
    content?: {
        packId: string;
        engine: "quiz" | "memory" | "puzzle" | "board" | "story" | "language" | "simulation" | "activity";
        version: string;
    }[] | undefined;
    composition?: {
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
    } | undefined;
    theme?: {
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
    } | undefined;
    branding?: {
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
    } | undefined;
}>;
export type GameDefinition = z.infer<typeof GameDefinition>;
/**
 * Validate and type a game definition.
 *
 * @example
 *   export const brainBooster = defineGame({ id: "brain-booster", engines: ["quiz"], ... });
 */
export declare function defineGame(definition: unknown): GameDefinition;
//# sourceMappingURL=game-definition.d.ts.map