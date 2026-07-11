import { z } from "zod";

/**
 * Economy presentation config (spine, Stage 1). The **server owns the amounts** (coins/diamonds/XP
 * balances and every award/spend — ADR-0027 §5); this config only names and skins the currencies so
 * a game can call them what it wants. Brain Booster's "Brain Coins" becomes `soft.label`, not a
 * hardcoded string; another game says "Star Dust" with zero code change.
 */
export const CurrencyStyle = z.object({
  /** Player-facing name, singular (e.g. "Coin", "Brain Coin", "Star Dust"). */
  label: z.string().min(1),
  /** Short emoji/glyph the HUD shows next to the balance. */
  icon: z.string().min(1),
});
export type CurrencyStyle = z.infer<typeof CurrencyStyle>;

/** How a game names its three universal currencies + progression unit. All optional → defaults. */
export const EconomyConfig = z.object({
  /** The freely-earned soft currency (Brain Booster: "Brain Coins"). */
  soft: CurrencyStyle.optional(),
  /** The premium hard currency (Brain Booster: diamonds). */
  hard: CurrencyStyle.optional(),
  /** The experience/progression unit. */
  xp: CurrencyStyle.optional(),
  /** Whether the game shows a daily login streak counter. */
  showStreak: z.boolean().default(true),
});
export type EconomyConfig = z.infer<typeof EconomyConfig>;

/** Concrete, fully-populated currency styling every HUD/shop screen can rely on. */
export interface ResolvedEconomy {
  soft: CurrencyStyle;
  hard: CurrencyStyle;
  xp: CurrencyStyle;
  showStreak: boolean;
}

/** Neutral defaults — a game with no economy config still renders a coherent HUD (not Brain Booster). */
export const DEFAULT_ECONOMY: ResolvedEconomy = {
  soft: { label: "Coin", icon: "🪙" },
  hard: { label: "Gem", icon: "💎" },
  xp: { label: "XP", icon: "⭐" },
  showStreak: true,
};

export function resolveEconomy(cfg?: EconomyConfig): ResolvedEconomy {
  return {
    soft: cfg?.soft ?? DEFAULT_ECONOMY.soft,
    hard: cfg?.hard ?? DEFAULT_ECONOMY.hard,
    xp: cfg?.xp ?? DEFAULT_ECONOMY.xp,
    showStreak: cfg?.showStreak ?? DEFAULT_ECONOMY.showStreak,
  };
}
