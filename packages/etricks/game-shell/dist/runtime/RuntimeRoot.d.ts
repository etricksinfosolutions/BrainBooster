import { type ReactNode } from "react";
import type { ScreenRegistry } from "./screen-registry.js";
/**
 * The runtime root (Wave 1b). Renders the screen component registered for the current navigation
 * screen. Knows nothing about any specific screen or game — it just looks up the registry. Until a
 * screen is registered (Wave 2), it shows a neutral placeholder so the shell still boots and the FSM
 * is observable end-to-end.
 */
export interface RuntimeRootProps {
    screens: ScreenRegistry;
}
export declare function RuntimeRoot({ screens }: RuntimeRootProps): ReactNode;
//# sourceMappingURL=RuntimeRoot.d.ts.map