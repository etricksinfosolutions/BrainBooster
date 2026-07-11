import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
  type Dispatch,
} from "react";
import type { Screen } from "../screens.js";
import type { ShellPorts } from "../ports.js";
import type { GameShellConfig } from "../shell-config.js";
import { resolveGameIdentity, type GameIdentity } from "../identity.js";
import { createMockPorts } from "../adapters/mock.js";
import { themeVars } from "../theme.js";
import { canTransition } from "./navigation.js";
import { initialState, type RootState } from "./state.js";
import { rootReducer, type Action } from "./reducer.js";
import { bootstrapRuntime, bootOptionsFromManifest } from "./bootstrap.js";

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

const ShellContext = createContext<ShellContextValue | null>(null);

export interface ShellProviderProps {
  config: GameShellConfig;
  children: ReactNode;
}

/**
 * Composes the entire runtime. Ports default to in-memory mocks when a game supplies none, so the shell
 * boots and runs offline in dev with zero wiring; production injects real adapters via `config.ports`.
 */
export function ShellProvider({ config, children }: ShellProviderProps): ReactNode {
  const identity = useMemo(
    () => resolveGameIdentity(config.definition, config.shell),
    [config.definition, config.shell],
  );
  const ports = useMemo(() => config.ports ?? createMockPorts(), [config.ports]);
  const [state, dispatch] = useReducer(rootReducer, identity, initialState);

  // Boot: load authoritative session/economy/resume through the ports, then route. Runs once.
  useEffect(() => {
    let cancelled = false;
    const opts = bootOptionsFromManifest(config.shell);
    bootstrapRuntime(ports, opts).then((action) => {
      if (!cancelled) dispatch(action);
    });
    return () => {
      cancelled = true;
    };
  }, [ports, config.shell]);

  // Theme runtime: paint the document with the resolved theme's CSS custom properties.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const vars = themeVars(state.theme);
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  }, [state.theme]);

  const value = useMemo<ShellContextValue>(
    () => ({ state, dispatch, ports, identity, config }),
    [state, ports, identity, config],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

/** Access the whole shell context. Throws if used outside a `ShellProvider` (a wiring bug). */
export function useShell(): ShellContextValue {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within a <ShellProvider> (call mountGame).");
  return ctx;
}

export const useShellState = (): RootState => useShell().state;
export const useShellDispatch = (): Dispatch<Action> => useShell().dispatch;
export const usePorts = (): ShellPorts => useShell().ports;
export const useProfile = () => useShell().state.profile;
export const useEconomy = () => useShell().state.economy;
export const useShellTheme = () => useShell().state.theme;
export const useBranding = () => useShell().state.branding;
export const useSettings = () => useShell().state.settings;
export const useAccessibility = () => useShell().state.accessibility;

/** Typed navigation surface — the only way screens change the current screen. */
export function useNavigation() {
  const { state, dispatch } = useShell();
  const navigate = useCallback(
    (to: Screen, params?: Record<string, unknown>) => dispatch({ type: "NAVIGATE", to, params }),
    [dispatch],
  );
  const back = useCallback(() => dispatch({ type: "NAVIGATE_BACK" }), [dispatch]);
  const canNavigate = useCallback((to: Screen) => canTransition(state.navigation.screen, to), [
    state.navigation.screen,
  ]);
  return {
    screen: state.navigation.screen,
    params: state.navigation.params,
    history: state.navigation.history,
    navigate,
    back,
    canNavigate,
  };
}
