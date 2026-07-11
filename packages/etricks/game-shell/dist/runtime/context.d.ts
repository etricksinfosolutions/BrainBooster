import { type ReactNode, type Dispatch } from "react";
import type { Screen } from "../screens.js";
import type { ShellPorts } from "../ports.js";
import type { GameShellConfig } from "../shell-config.js";
import { type GameIdentity } from "../identity.js";
import { type RootState } from "./state.js";
import { type Action } from "./reducer.js";
/**
 * The React binding for the platform runtime (Wave 1b). This is the ONLY place the shell touches React
 * contexts/reducers — applications never see them, they call `mountGame` and read the typed hooks. A
 * single `ShellProvider` composes every slice of runtime state, wires the injected ports, resolves the
 * game identity once, runs boot, and keeps the document themed. React is an implementation detail.
 */
export interface ShellContextValue {
    state: RootState;
    dispatch: Dispatch<Action>;
    ports: ShellPorts;
    identity: GameIdentity;
    config: GameShellConfig;
}
export interface ShellProviderProps {
    config: GameShellConfig;
    children: ReactNode;
}
/**
 * Composes the entire runtime. Ports default to in-memory mocks when a game supplies none, so the shell
 * boots and runs offline in dev with zero wiring; production injects real adapters via `config.ports`.
 */
export declare function ShellProvider({ config, children }: ShellProviderProps): ReactNode;
/** Access the whole shell context. Throws if used outside a `ShellProvider` (a wiring bug). */
export declare function useShell(): ShellContextValue;
export declare const useShellState: () => RootState;
export declare const useShellDispatch: () => Dispatch<Action>;
export declare const usePorts: () => ShellPorts;
export declare const useProfile: () => import("../ports.js").PlayerProfile | null;
export declare const useEconomy: () => import("../ports.js").Wallet;
export declare const useShellTheme: () => import("../theme.js").ResolvedTheme;
export declare const useBranding: () => import("../branding.js").ResolvedBranding;
export declare const useSettings: () => import("./state.js").SettingsSlice;
export declare const useAccessibility: () => import("./state.js").AccessibilitySlice;
/** Typed navigation surface — the only way screens change the current screen. */
export declare function useNavigation(): {
    screen: "splash" | "loading" | "onboarding" | "login" | "home" | "profile" | "avatar" | "world-select" | "level-select" | "activity" | "result" | "victory" | "failure" | "pause" | "reward" | "daily-rewards" | "weekly-rewards" | "achievements" | "challenges" | "leaderboard" | "shop" | "premium" | "parents" | "settings" | "accessibility";
    params: Readonly<Record<string, unknown>>;
    history: readonly ("splash" | "loading" | "onboarding" | "login" | "home" | "profile" | "avatar" | "world-select" | "level-select" | "activity" | "result" | "victory" | "failure" | "pause" | "reward" | "daily-rewards" | "weekly-rewards" | "achievements" | "challenges" | "leaderboard" | "shop" | "premium" | "parents" | "settings" | "accessibility")[];
    navigate: (to: Screen, params?: Record<string, unknown>) => void;
    back: () => void;
    canNavigate: (to: Screen) => boolean;
};
//# sourceMappingURL=context.d.ts.map