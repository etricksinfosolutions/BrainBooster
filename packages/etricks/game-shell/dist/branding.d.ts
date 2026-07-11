import type { GameDefinition } from "@etricks/game-definition";
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
export declare function resolveBranding(definition: GameDefinition): ResolvedBranding;
//# sourceMappingURL=branding.d.ts.map