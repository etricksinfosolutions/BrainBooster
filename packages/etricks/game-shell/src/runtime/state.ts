import type { Screen } from "../screens.js";
import type { Wallet, PlayerProfile } from "../ports.js";
import type { ResolvedTheme } from "../theme.js";
import type { ResolvedBranding } from "../branding.js";
import type { ResolvedEconomy } from "../economy.js";
import type { GameIdentity } from "../identity.js";
import { INITIAL_SCREEN } from "./navigation.js";

/**
 * The platform state (Wave 1b). Strongly-typed, **game-agnostic** slices that every manufactured game
 * runs on. No game owns a reducer; a game only supplies config/identity, and this state is derived
 * from it. Slices deliberately hold presentation/session state — the *authoritative* copy of anything
 * durable (wallet, profile, progress) lives on the server and flows in through ports (ADR-0027 §5).
 */

export type SessionStatus = "booting" | "authenticating" | "ready" | "error";

export interface SessionSlice {
  status: SessionStatus;
  playerId: string | null;
  online: boolean;
  /** Whether onboarding has been completed on this device (drives first-run routing). */
  onboardingSeen: boolean;
}

export interface NavigationSlice {
  screen: Screen;
  /** Back-stack of screens visited, most-recent last (excludes the current screen). */
  history: readonly Screen[];
  /** Opaque per-screen params (e.g. the world/level being opened). */
  params: Readonly<Record<string, unknown>>;
}

/** Accessibility toggles the shell honours everywhere (generalised, not game-specific). */
export interface AccessibilitySlice {
  reducedMotion: boolean;
  highContrast: boolean;
  bigButtons: boolean;
  colorBlind: boolean;
}

/** Universal, game-agnostic settings. Games extend behaviour via config, not by forking this shape. */
export interface SettingsSlice {
  sound: boolean;
  music: boolean;
  voice: boolean;
  notifications: boolean;
  musicVolume: number;
  sfxVolume: number;
  language: string;
}

export interface ProgressSlice {
  lastCheckpoint: { worldId: string; levelId: string } | null;
}

export interface RewardsSlice {
  dailyClaimed: boolean;
}

export interface ShellError {
  fatal: boolean;
  message: string;
  /** Distinguishes recoverable modes the error boundary can render a flow for. */
  kind: "recoverable" | "offline" | "maintenance" | "version-mismatch" | "fatal";
}

/** The complete runtime state tree. */
export interface RootState {
  session: SessionSlice;
  navigation: NavigationSlice;
  profile: PlayerProfile | null;
  economy: Wallet;
  progress: ProgressSlice;
  rewards: RewardsSlice;
  settings: SettingsSlice;
  accessibility: AccessibilitySlice;
  premium: boolean;
  /** Resolved identity — memoised once at mount; screens read theme/branding/economy skin from here. */
  theme: ResolvedTheme;
  branding: ResolvedBranding;
  economySkin: ResolvedEconomy;
  error: ShellError | null;
}

const ZERO_WALLET: Wallet = { coins: 0, diamonds: 0, xp: 0, streakDays: 0 };

export const DEFAULT_SETTINGS: SettingsSlice = {
  sound: true,
  music: true,
  voice: true,
  notifications: true,
  musicVolume: 0.7,
  sfxVolume: 0.9,
  language: "en",
};

export const DEFAULT_ACCESSIBILITY: AccessibilitySlice = {
  reducedMotion: false,
  highContrast: false,
  bigButtons: false,
  colorBlind: false,
};

/**
 * Build the initial state for a game from its resolved identity. Pure: the same identity always yields
 * the same starting tree. Boot then hydrates session/profile/economy/progress from the ports.
 */
export function initialState(identity: GameIdentity): RootState {
  return {
    session: { status: "booting", playerId: null, online: true, onboardingSeen: false },
    navigation: { screen: INITIAL_SCREEN, history: [], params: {} },
    profile: null,
    economy: { ...ZERO_WALLET },
    progress: { lastCheckpoint: null },
    rewards: { dailyClaimed: false },
    settings: { ...DEFAULT_SETTINGS, language: identity.definition.locales[0] ?? "en" },
    accessibility: { ...DEFAULT_ACCESSIBILITY },
    premium: false,
    theme: identity.theme,
    branding: identity.branding,
    economySkin: identity.economy,
    error: null,
  };
}
