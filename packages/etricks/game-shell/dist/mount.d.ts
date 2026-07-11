import type { GameShellConfig } from "./shell-config.js";
import { type ScreenRegistry } from "./runtime/screen-registry.js";
/**
 * `mountGame` — the single public entry point every game app calls (ADR-0027). An app builds its
 * `GameShellConfig` (definition + theme + branding + manifest + ports) and hands it here; the shell
 * boots the complete runtime (providers, state, navigation, ports, theming, error boundary) and renders
 * the registered screens. The app never sees a context, reducer, or provider — only this call. That is
 * the whole point of Wave 1b: the shell owns execution, the app owns composition.
 */
export interface GameShellHandle {
    unmount(): void;
}
export interface MountOptions {
    /** Screen implementations to render (Wave 2 supplies these). Multiple maps compose; later wins. */
    screens?: ScreenRegistry | ScreenRegistry[];
}
/** A DOM element to render into (kept as the structural minimum so callers can pass any host element). */
export type MountTarget = Pick<Element, "nodeType">;
export declare function mountGame(config: GameShellConfig, target: MountTarget, options?: MountOptions): GameShellHandle;
//# sourceMappingURL=mount.d.ts.map