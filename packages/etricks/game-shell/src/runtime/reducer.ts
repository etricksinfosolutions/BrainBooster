import type { Screen } from "../screens.js";
import type { Wallet, PlayerProfile } from "../ports.js";
import type { RootState, SettingsSlice, AccessibilitySlice, ShellError } from "./state.js";
import { canTransition } from "./navigation.js";

/**
 * The root reducer (Wave 1b). Pure, exhaustively-typed, game-agnostic. Every state change in the shell
 * flows through here so behaviour is deterministic and testable without React. Navigation is guarded by
 * the FSM (`canTransition`) — an illegal move is a no-op, never a crash — and tests assert both the
 * legal path and that illegal moves are rejected.
 */

export type Action =
  /** Boot finished: authoritative data loaded from the ports, plus where to route. */
  | {
      type: "BOOT_COMPLETE";
      profile: PlayerProfile | null;
      economy: Wallet;
      lastCheckpoint: { worldId: string; levelId: string } | null;
      online: boolean;
      onboardingSeen: boolean;
      route: Screen;
    }
  | { type: "NAVIGATE"; to: Screen; params?: Record<string, unknown> }
  | { type: "NAVIGATE_BACK" }
  | { type: "SET_WALLET"; economy: Wallet }
  | { type: "SET_PROFILE"; profile: PlayerProfile | null }
  | { type: "SET_PREMIUM"; premium: boolean }
  | { type: "SET_ONLINE"; online: boolean }
  | { type: "CLAIM_DAILY" }
  | { type: "UPDATE_SETTINGS"; patch: Partial<SettingsSlice> }
  | { type: "UPDATE_ACCESSIBILITY"; patch: Partial<AccessibilitySlice> }
  | { type: "SET_ERROR"; error: ShellError }
  | { type: "CLEAR_ERROR" };

export function rootReducer(state: RootState, action: Action): RootState {
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
      if (!canTransition(from, action.to)) return state;
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
      if (history.length === 0) return state;
      const prev = history[history.length - 1]!;
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
      const _never: never = action;
      return _never;
    }
  }
}
