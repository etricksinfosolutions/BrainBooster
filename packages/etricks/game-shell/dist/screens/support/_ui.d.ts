import { type CSSProperties, type ReactNode } from "react";
/**
 * Shared, game-neutral presentation primitives for the Support surfaces (settings / accessibility /
 * parents). Every primitive paints exclusively from the shell's CSS custom properties (`var(--bg)`,
 * `var(--surface)`, …) so a game re-skins them for free, and each one honours the live accessibility
 * slice (`bigButtons`, `highContrast`, `reducedMotion`). Nothing here hardcodes a brand colour, font,
 * or name. These are internal to the group (prefixed `_`) — not screens, not part of the registry.
 */
/** Derived styling knobs from the live accessibility preferences — read once per component. */
export declare function useUiPrefs(): {
    /** High contrast: thicker, ink-coloured outlines instead of the subtle line token. */
    borderWidth: number;
    borderColor: string;
    /** Big buttons: enlarge hit targets and type for small hands. */
    controlMinHeight: number;
    controlPad: string;
    fontScale: number;
    /** Reduced motion: transitions become instant everywhere. */
    transition: string;
    reducedMotion: boolean;
    highContrast: boolean;
    bigButtons: boolean;
    colorBlind: boolean;
};
/** Full-screen, scrollable page frame: themed background, safe padding, phone→tablet responsive. */
export declare function ScreenShell({ children }: {
    children: ReactNode;
}): ReactNode;
/** A title row with a Back affordance wired to the shell's typed navigation history. */
export declare function TitleBar({ title, icon }: {
    title: string;
    icon?: string;
}): ReactNode;
/** A labelled group heading that separates sections within a screen. */
export declare function SectionTitle({ children }: {
    children: ReactNode;
}): ReactNode;
/** A rounded surface card the sections sit inside. */
export declare function Card({ children, style }: {
    children: ReactNode;
    style?: CSSProperties;
}): ReactNode;
/** An accessible on/off switch row (role="switch"). Fully controlled by the caller. */
export declare function ToggleRow({ checked, onToggle, label, hint, icon, disabled, }: {
    checked: boolean;
    onToggle: () => void;
    label: string;
    hint?: string;
    icon?: string;
    disabled?: boolean;
}): ReactNode;
/** A 0–1 valued slider row rendered as a percentage. Disabled state dims the row. */
export declare function SliderRow({ label, icon, value, onChange, disabled, }: {
    label: string;
    icon?: string;
    value: number;
    onChange: (v: number) => void;
    disabled?: boolean;
}): ReactNode;
/** A tappable row that navigates or triggers an action, with a trailing chevron/marker. */
export declare function ActionRow({ label, hint, icon, onClick, disabled, marker, }: {
    label: string;
    hint?: string;
    icon?: string;
    onClick: () => void;
    disabled?: boolean;
    marker?: string;
}): ReactNode;
/** A thin divider between rows inside a card. */
export declare function RowDivider(): ReactNode;
/** A primary call-to-action button using the accent token. */
export declare function PrimaryButton({ children, onClick, disabled, }: {
    children: ReactNode;
    onClick: () => void;
    disabled?: boolean;
}): ReactNode;
export declare function clamp01(n: number): number;
//# sourceMappingURL=_ui.d.ts.map