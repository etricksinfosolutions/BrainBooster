import { type ReactNode, type CSSProperties } from "react";
import type { AssetRef } from "@etricks/contracts";
import type { AccessibilitySlice } from "../../runtime/state.js";
import type { ResolvedMascot } from "../../branding.js";
/** One-off style injection. Rendered inside a screen root; a single screen is mounted at a time. */
export declare function LaunchStyles(): ReactNode;
/** Resolve an AssetRef to a usable image src, or null when there is no art to show. */
export declare function assetUri(ref: AssetRef | null | undefined): string | null;
/** Full-bleed, centred stage every launch screen sits on. Paints purely from theme vars. */
export declare function LaunchStage({ children, ariaLabel, onActivate, reducedMotion, }: {
    children: ReactNode;
    ariaLabel: string;
    onActivate?: () => void;
    reducedMotion: boolean;
}): ReactNode;
/**
 * Brand art (logo / splash / loading illustration). Shows the resolved image when present, otherwise
 * a neutral wordmark of the display name — so a game with no art still renders something finished.
 */
export declare function BrandArt({ art, fallbackLabel, size, reducedMotion, bob, }: {
    art: AssetRef | null;
    fallbackLabel: string;
    size: number;
    reducedMotion: boolean;
    bob?: boolean;
}): ReactNode;
/** The game's mascot as a circular portrait. Renders nothing when the game has no mascot. */
export declare function MascotBadge({ mascot, size, reducedMotion, }: {
    mascot: ResolvedMascot | null;
    size: number;
    reducedMotion: boolean;
}): ReactNode;
export type ButtonTone = "primary" | "ghost" | "brand";
/**
 * Shared button style honouring accessibility toggles: bigButtons enlarges the hit target,
 * highContrast strengthens the border. All colours come from theme vars.
 */
export declare function launchButtonStyle(tone: ButtonTone, a11y: AccessibilitySlice, opts?: {
    fullWidth?: boolean;
    disabled?: boolean;
}): CSSProperties;
//# sourceMappingURL=shared.d.ts.map