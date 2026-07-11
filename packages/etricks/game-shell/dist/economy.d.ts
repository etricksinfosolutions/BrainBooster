import { z } from "zod";
/**
 * Economy presentation config (spine, Stage 1). The **server owns the amounts** (coins/diamonds/XP
 * balances and every award/spend — ADR-0027 §5); this config only names and skins the currencies so
 * a game can call them what it wants. Brain Booster's "Brain Coins" becomes `soft.label`, not a
 * hardcoded string; another game says "Star Dust" with zero code change.
 */
export declare const CurrencyStyle: z.ZodObject<{
    /** Player-facing name, singular (e.g. "Coin", "Brain Coin", "Star Dust"). */
    label: z.ZodString;
    /** Short emoji/glyph the HUD shows next to the balance. */
    icon: z.ZodString;
}, "strip", z.ZodTypeAny, {
    label: string;
    icon: string;
}, {
    label: string;
    icon: string;
}>;
export type CurrencyStyle = z.infer<typeof CurrencyStyle>;
/** How a game names its three universal currencies + progression unit. All optional → defaults. */
export declare const EconomyConfig: z.ZodObject<{
    /** The freely-earned soft currency (Brain Booster: "Brain Coins"). */
    soft: z.ZodOptional<z.ZodObject<{
        /** Player-facing name, singular (e.g. "Coin", "Brain Coin", "Star Dust"). */
        label: z.ZodString;
        /** Short emoji/glyph the HUD shows next to the balance. */
        icon: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        label: string;
        icon: string;
    }, {
        label: string;
        icon: string;
    }>>;
    /** The premium hard currency (Brain Booster: diamonds). */
    hard: z.ZodOptional<z.ZodObject<{
        /** Player-facing name, singular (e.g. "Coin", "Brain Coin", "Star Dust"). */
        label: z.ZodString;
        /** Short emoji/glyph the HUD shows next to the balance. */
        icon: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        label: string;
        icon: string;
    }, {
        label: string;
        icon: string;
    }>>;
    /** The experience/progression unit. */
    xp: z.ZodOptional<z.ZodObject<{
        /** Player-facing name, singular (e.g. "Coin", "Brain Coin", "Star Dust"). */
        label: z.ZodString;
        /** Short emoji/glyph the HUD shows next to the balance. */
        icon: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        label: string;
        icon: string;
    }, {
        label: string;
        icon: string;
    }>>;
    /** Whether the game shows a daily login streak counter. */
    showStreak: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    showStreak: boolean;
    soft?: {
        label: string;
        icon: string;
    } | undefined;
    hard?: {
        label: string;
        icon: string;
    } | undefined;
    xp?: {
        label: string;
        icon: string;
    } | undefined;
}, {
    soft?: {
        label: string;
        icon: string;
    } | undefined;
    hard?: {
        label: string;
        icon: string;
    } | undefined;
    xp?: {
        label: string;
        icon: string;
    } | undefined;
    showStreak?: boolean | undefined;
}>;
export type EconomyConfig = z.infer<typeof EconomyConfig>;
/** Concrete, fully-populated currency styling every HUD/shop screen can rely on. */
export interface ResolvedEconomy {
    soft: CurrencyStyle;
    hard: CurrencyStyle;
    xp: CurrencyStyle;
    showStreak: boolean;
}
/** Neutral defaults — a game with no economy config still renders a coherent HUD (not Brain Booster). */
export declare const DEFAULT_ECONOMY: ResolvedEconomy;
export declare function resolveEconomy(cfg?: EconomyConfig): ResolvedEconomy;
//# sourceMappingURL=economy.d.ts.map