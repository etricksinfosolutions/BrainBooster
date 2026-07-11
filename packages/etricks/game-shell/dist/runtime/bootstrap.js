import { routeAfterBoot } from "./navigation.js";
/**
 * Boot orchestration (Wave 1b). Given the injected ports and the game's shell manifest, load the
 * authoritative session data (profile, wallet, resume checkpoint) and decide the initial route, then
 * hand it all back as a single `BOOT_COMPLETE` action the reducer applies atomically.
 *
 * Everything goes **through the ports** — never a direct backend/network call — so the exact same boot
 * runs against mock, offline, or production adapters unchanged (ADR-0027 §5, port hot-swap). Failures
 * degrade gracefully: a port that throws yields a safe default rather than blocking startup.
 */
async function safe(op, fallback) {
    if (!op)
        return fallback;
    try {
        return await op();
    }
    catch {
        return fallback;
    }
}
export function bootOptionsFromManifest(manifest, overrides) {
    return {
        onboardingEnabled: manifest?.features.onboarding ?? true,
        loginEnabled: manifest?.features.login ?? true,
        onboardingSeen: false,
        online: true,
        ...overrides,
    };
}
/**
 * Run boot against the ports and produce the `BOOT_COMPLETE` action. Deterministic given deterministic
 * ports (e.g. the mock adapters), which is what the tests rely on.
 */
export async function bootstrapRuntime(ports, options) {
    const profile = await safe(ports.auth?.current.bind(ports.auth), null);
    const economy = await safe(ports.economy?.wallet.bind(ports.economy), {
        coins: 0,
        diamonds: 0,
        xp: 0,
        streakDays: 0,
    });
    const lastCheckpoint = await safe(ports.save?.lastCheckpoint.bind(ports.save), null);
    const route = routeAfterBoot({
        hasSession: profile !== null,
        onboardingEnabled: options.onboardingEnabled,
        loginEnabled: options.loginEnabled,
        onboardingSeen: options.onboardingSeen,
    });
    return {
        type: "BOOT_COMPLETE",
        profile,
        economy,
        lastCheckpoint,
        online: options.online,
        onboardingSeen: options.onboardingSeen,
        route,
    };
}
//# sourceMappingURL=bootstrap.js.map