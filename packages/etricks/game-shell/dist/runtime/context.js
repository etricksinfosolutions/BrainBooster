import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useReducer, useEffect, useMemo, useCallback, } from "react";
import { resolveGameIdentity } from "../identity.js";
import { createMockPorts } from "../adapters/mock.js";
import { themeVars } from "../theme.js";
import { canTransition } from "./navigation.js";
import { initialState } from "./state.js";
import { rootReducer } from "./reducer.js";
import { bootstrapRuntime, bootOptionsFromManifest } from "./bootstrap.js";
const ShellContext = createContext(null);
/**
 * Composes the entire runtime. Ports default to in-memory mocks when a game supplies none, so the shell
 * boots and runs offline in dev with zero wiring; production injects real adapters via `config.ports`.
 */
export function ShellProvider({ config, children }) {
    const identity = useMemo(() => resolveGameIdentity(config.definition, config.shell), [config.definition, config.shell]);
    const ports = useMemo(() => config.ports ?? createMockPorts(), [config.ports]);
    const [state, dispatch] = useReducer(rootReducer, identity, initialState);
    // Boot: load authoritative session/economy/resume through the ports, then route. Runs once.
    useEffect(() => {
        let cancelled = false;
        const opts = bootOptionsFromManifest(config.shell);
        bootstrapRuntime(ports, opts).then((action) => {
            if (!cancelled)
                dispatch(action);
        });
        return () => {
            cancelled = true;
        };
    }, [ports, config.shell]);
    // Theme runtime: paint the document with the resolved theme's CSS custom properties.
    useEffect(() => {
        if (typeof document === "undefined")
            return;
        const root = document.documentElement;
        const vars = themeVars(state.theme);
        for (const [k, v] of Object.entries(vars))
            root.style.setProperty(k, v);
    }, [state.theme]);
    const value = useMemo(() => ({ state, dispatch, ports, identity, config }), [state, ports, identity, config]);
    return _jsx(ShellContext.Provider, { value: value, children: children });
}
/** Access the whole shell context. Throws if used outside a `ShellProvider` (a wiring bug). */
export function useShell() {
    const ctx = useContext(ShellContext);
    if (!ctx)
        throw new Error("useShell must be used within a <ShellProvider> (call mountGame).");
    return ctx;
}
export const useShellState = () => useShell().state;
export const useShellDispatch = () => useShell().dispatch;
export const usePorts = () => useShell().ports;
export const useProfile = () => useShell().state.profile;
export const useEconomy = () => useShell().state.economy;
export const useShellTheme = () => useShell().state.theme;
export const useBranding = () => useShell().state.branding;
export const useSettings = () => useShell().state.settings;
export const useAccessibility = () => useShell().state.accessibility;
/** Typed navigation surface — the only way screens change the current screen. */
export function useNavigation() {
    const { state, dispatch } = useShell();
    const navigate = useCallback((to, params) => dispatch({ type: "NAVIGATE", to, params }), [dispatch]);
    const back = useCallback(() => dispatch({ type: "NAVIGATE_BACK" }), [dispatch]);
    const canNavigate = useCallback((to) => canTransition(state.navigation.screen, to), [
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
//# sourceMappingURL=context.js.map