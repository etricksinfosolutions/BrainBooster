import type { Screen } from "../screens.js";
import type { Wallet, PlayerProfile } from "../ports.js";
import type { RootState, SettingsSlice, AccessibilitySlice, ShellError } from "./state.js";
/**
 * The root reducer (Wave 1b). Pure, exhaustively-typed, game-agnostic. Every state change in the shell
 * flows through here so behaviour is deterministic and testable without React. Navigation is guarded by
 * the FSM (`canTransition`) — an illegal move is a no-op, never a crash — and tests assert both the
 * legal path and that illegal moves are rejected.
 */
export type Action = 
/** Boot finished: authoritative data loaded from the ports, plus where to route. */
{
    type: "BOOT_COMPLETE";
    profile: PlayerProfile | null;
    economy: Wallet;
    lastCheckpoint: {
        worldId: string;
        levelId: string;
    } | null;
    online: boolean;
    onboardingSeen: boolean;
    route: Screen;
} | {
    type: "NAVIGATE";
    to: Screen;
    params?: Record<string, unknown>;
} | {
    type: "NAVIGATE_BACK";
} | {
    type: "SET_WALLET";
    economy: Wallet;
} | {
    type: "SET_PROFILE";
    profile: PlayerProfile | null;
} | {
    type: "SET_PREMIUM";
    premium: boolean;
} | {
    type: "SET_ONLINE";
    online: boolean;
} | {
    type: "CLAIM_DAILY";
} | {
    type: "UPDATE_SETTINGS";
    patch: Partial<SettingsSlice>;
} | {
    type: "UPDATE_ACCESSIBILITY";
    patch: Partial<AccessibilitySlice>;
} | {
    type: "SET_ERROR";
    error: ShellError;
} | {
    type: "CLEAR_ERROR";
};
export declare function rootReducer(state: RootState, action: Action): RootState;
//# sourceMappingURL=reducer.d.ts.map