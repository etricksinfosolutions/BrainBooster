import { type ReactNode, type CSSProperties } from "react";
/**
 * Shared, game-NEUTRAL building blocks for the Economy screen group (Team Echo). Every value here is
 * either read from typed shell hooks or painted from the theme CSS custom properties the shell sets on
 * :root — no Brain-Booster literals, no hardcoded colours, no hardcoded currency names/amounts. The
 * authoritative wallet balances flow in from the economy port via state; the currency SKIN (labels +
 * icons) flows from `state.economySkin`. Screens compose these primitives so the group looks like one
 * coherent, accessible surface across tablet and phone.
 */
/** Narrow an unknown value to a plain object, or null. */
export declare function asRecord(v: unknown): Record<string, unknown> | null;
/** Narrow an unknown value to an array (empty array for anything else). */
export declare function asArray(v: unknown): unknown[];
/** A finite string, or null. */
export declare function asStr(v: unknown): string | null;
/** A finite number, or null (guards NaN/Infinity for safe arithmetic). */
export declare function asNum(v: unknown): number | null;
/** A strict boolean-true check (unknown → boolean). */
export declare function isTrue(v: unknown): boolean;
/** Derived, accessibility-aware style tokens every economy screen shares. */
export declare function useUiTokens(): {
    reducedMotion: boolean;
    /** A transition string that collapses to "none" under reduced-motion. */
    transition: string;
    /** Border width strengthens under high-contrast. */
    border: string;
    strongBorder: string;
    /** Comfortable hit target; enlarges under big-buttons. */
    minTarget: number;
    pad: number;
    fontScale: number;
    highContrast: boolean;
};
/**
 * The shared screen frame: a sticky header with a back affordance (only when there is history) and a
 * scrollable body constrained to a comfortable reading width on tablets, full-bleed on phones.
 */
export declare function EconomyScreen({ title, subtitle, hud, children, }: {
    title: string;
    subtitle?: string | null;
    /** When true, render the wallet HUD in the header (shop/premium/daily surfaces). */
    hud?: boolean;
    children: ReactNode;
}): ReactNode;
/**
 * Live balances from the authoritative wallet (state.economy) skinned by state.economySkin. Streak is
 * shown only when the game's economy config opts in. All amounts come from state — never hardcoded.
 */
export declare function WalletHud({ compact }: {
    compact?: boolean;
}): ReactNode;
/** A themed surface card. */
export declare function Card({ children, style }: {
    children: ReactNode;
    style?: CSSProperties;
}): ReactNode;
/** A themed section heading. */
export declare function SectionTitle({ children }: {
    children: ReactNode;
}): ReactNode;
/** The primary call-to-action button, accessibility-aware and theme-painted. */
export declare function ActionButton({ children, onClick, disabled, variant, ariaLabel, full, }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: "primary" | "ghost";
    ariaLabel?: string;
    full?: boolean;
}): ReactNode;
/**
 * A shared state block for the three data states every economy screen must render: LOADING (data still
 * hydrating from a port), EMPTY (port returned nothing), and ERROR (a port threw). Neutral copy only.
 */
export declare function StateBlock({ kind, message, onRetry, }: {
    kind: "loading" | "empty" | "error";
    message: string;
    onRetry?: () => void;
}): ReactNode;
/** Small helper: format a soft/hard/xp reward tri: only the parts that are present, using the skin. */
export declare function useRewardFormat(): (reward: {
    coins?: number | null;
    diamonds?: number | null;
    xp?: number | null;
}) => string;
//# sourceMappingURL=_shared.d.ts.map