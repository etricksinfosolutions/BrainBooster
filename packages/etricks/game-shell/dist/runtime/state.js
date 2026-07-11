import { INITIAL_SCREEN } from "./navigation.js";
const ZERO_WALLET = { coins: 0, diamonds: 0, xp: 0, streakDays: 0 };
export const DEFAULT_SETTINGS = {
    sound: true,
    music: true,
    voice: true,
    notifications: true,
    musicVolume: 0.7,
    sfxVolume: 0.9,
    language: "en",
};
export const DEFAULT_ACCESSIBILITY = {
    reducedMotion: false,
    highContrast: false,
    bigButtons: false,
    colorBlind: false,
};
/**
 * Build the initial state for a game from its resolved identity. Pure: the same identity always yields
 * the same starting tree. Boot then hydrates session/profile/economy/progress from the ports.
 */
export function initialState(identity) {
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
//# sourceMappingURL=state.js.map