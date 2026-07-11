import { type ReactNode } from "react";
/**
 * HomeScreen — the hub every manufactured game returns to (ADR-0027).
 *
 * Ported from the reference web app's hub screen, then fully de-branded: the
 * title comes from `useBranding().displayName`, the currency HUD is skinned from
 * `useShellState().economySkin` with live `useEconomy()` balances, the mascot is the resolved mascot
 * (hidden when a game has none), and every colour/font is a theme CSS variable. Nothing here names a
 * currency, mascot, studio or brand colour.
 */
export declare function HomeScreen(): ReactNode;
//# sourceMappingURL=HomeScreen.d.ts.map