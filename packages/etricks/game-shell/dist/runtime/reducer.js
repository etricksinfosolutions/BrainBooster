import { canTransition } from "./navigation.js";
export function rootReducer(state, action) {
    switch (action.type) {
        case "BOOT_COMPLETE": {
            return {
                ...state,
                session: {
                    status: "ready",
                    playerId: action.profile?.playerId ?? null,
                    online: action.online,
                    onboardingSeen: action.onboardingSeen,
                },
                profile: action.profile,
                economy: action.economy,
                premium: action.profile?.premium ?? false,
                progress: { ...state.progress, lastCheckpoint: action.lastCheckpoint },
                navigation: { screen: action.route, history: [], params: {} },
            };
        }
        case "NAVIGATE": {
            const from = state.navigation.screen;
            // FSM guard: illegal transitions are ignored (never throw at runtime).
            if (!canTransition(from, action.to))
                return state;
            return {
                ...state,
                navigation: {
                    screen: action.to,
                    history: [...state.navigation.history, from],
                    params: action.params ?? {},
                },
            };
        }
        case "NAVIGATE_BACK": {
            const history = state.navigation.history;
            if (history.length === 0)
                return state;
            const prev = history[history.length - 1];
            return {
                ...state,
                navigation: { screen: prev, history: history.slice(0, -1), params: {} },
            };
        }
        case "SET_WALLET":
            return { ...state, economy: action.economy };
        case "SET_PROFILE":
            return {
                ...state,
                profile: action.profile,
                premium: action.profile?.premium ?? state.premium,
                session: { ...state.session, playerId: action.profile?.playerId ?? null },
            };
        case "SET_PREMIUM":
            return { ...state, premium: action.premium };
        case "SET_ONLINE":
            return { ...state, session: { ...state.session, online: action.online } };
        case "CLAIM_DAILY":
            return { ...state, rewards: { ...state.rewards, dailyClaimed: true } };
        case "UPDATE_SETTINGS":
            return { ...state, settings: { ...state.settings, ...action.patch } };
        case "UPDATE_ACCESSIBILITY":
            return { ...state, accessibility: { ...state.accessibility, ...action.patch } };
        case "SET_ERROR":
            return { ...state, error: action.error };
        case "CLEAR_ERROR":
            return { ...state, error: null };
        default: {
            // Exhaustiveness guard — a new Action variant without a case is a compile error.
            const _never = action;
            return _never;
        }
    }
}
//# sourceMappingURL=reducer.js.map