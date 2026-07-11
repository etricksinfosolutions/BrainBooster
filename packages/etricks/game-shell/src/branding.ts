import type { GameBranding, GameDefinition } from "@etricks/game-definition";
import type { AssetRef } from "@etricks/contracts";

/**
 * Branding + Mascot resolution (spine, Stage 1). Every place a screen would otherwise hardcode
 * "Brain Booster", Tigo the tiger, or a studio name now reads from here. Resolved from the game's
 * optional `GameBranding`, falling back to the `GameDefinition` and neutral defaults so a screen can
 * always show *something* finished.
 */

/** Concrete brand identity every screen can rely on (no optionals on the essentials). */
export interface ResolvedBranding {
  /** App/game display name — replaces every hardcoded title. */
  displayName: string;
  tagline: string | null;
  appId: string | null;
  logo: AssetRef | null;
  appIcon: AssetRef | null;
  splash: AssetRef | null;
  loadingArt: AssetRef | null;
  /** The game's guide/mascot — replaces the hardwired Tigo. */
  mascot: ResolvedMascot | null;
  iconSetId: string | null;
}

export interface ResolvedMascot {
  name: string;
  art: AssetRef | null;
  promptSeed: string | null;
}

/**
 * Resolve branding for a game. `definition.title` is the safety net for the display name so a game
 * with no branding block still shows its real title rather than a placeholder.
 */
export function resolveBranding(definition: GameDefinition): ResolvedBranding {
  const b: GameBranding | undefined = definition.branding;
  const mascot = b?.mascot
    ? {
        name: b.mascot.name,
        art: b.mascot.art ?? null,
        promptSeed: b.mascot.promptSeed ?? null,
      }
    : null;
  return {
    displayName: b?.displayName ?? definition.title,
    tagline: b?.tagline ?? null,
    appId: b?.appId ?? null,
    logo: b?.logo ?? null,
    appIcon: b?.appIcon ?? null,
    splash: b?.splash ?? null,
    loadingArt: b?.loadingArt ?? null,
    mascot,
    iconSetId: b?.iconSetId ?? null,
  };
}
