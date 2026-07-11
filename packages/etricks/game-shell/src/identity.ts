import type { GameDefinition } from "@etricks/game-definition";
import { resolveTheme, type ResolvedTheme } from "./theme.js";
import { resolveBranding, type ResolvedBranding } from "./branding.js";
import { resolveEconomy, type ResolvedEconomy } from "./economy.js";
import type { GameShellManifest } from "./shell-config.js";

/**
 * Game Identity resolver (spine, Stage 1). The three spine resolvers — theme, branding, economy — each
 * answer one narrow question about how a game looks and reads. This folds them into a single call the
 * shell makes once at mount time, producing everything a screen needs to paint a coherent, finished
 * product.
 *
 * Deliberately game-agnostic: it holds no knowledge of any particular game (no Brain Booster, no
 * Science Master). A game differs only by the declarative `GameDefinition` and shell manifest it passes
 * in — the Golden Rule made literal. Two games manufactured on the same platform become two distinct
 * premium products purely by handing different config through this function.
 */

/** The complete, concrete visual + brand + economy identity for one game — no optionals to guess at. */
export interface GameIdentity {
  definition: GameDefinition;
  theme: ResolvedTheme;
  branding: ResolvedBranding;
  economy: ResolvedEconomy;
}

/**
 * Compose the spine resolvers into a single concrete identity. Pure: the same inputs always yield the
 * same output, and no input is mutated. The economy is skinned from the shell manifest (the game names
 * its currencies; the server still owns the amounts), while theme and branding come from the game's
 * declarative definition. A bare definition with no manifest resolves entirely to neutral defaults.
 */
export function resolveGameIdentity(
  definition: GameDefinition,
  manifest?: GameShellManifest,
): GameIdentity {
  return {
    definition,
    theme: resolveTheme(definition.theme),
    branding: resolveBranding(definition),
    economy: resolveEconomy(manifest?.economy),
  };
}
