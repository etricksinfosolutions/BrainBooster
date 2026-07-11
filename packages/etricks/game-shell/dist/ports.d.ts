/**
 * Injected ports — the seam between the Game Shell (presentation) and the platform's authoritative
 * services (ADR-0027 §5: the client never owns authoritative data). The shell renders and calls these
 * ports; concrete adapters (backed by @etricks/backend, @etricks/game-client, Capacitor, etc.) are
 * injected at mount. Offline adapters may serve cached data, but the server remains the source of
 * truth. This mirrors the repo-wide "injected ports & provider abstraction" pattern (ADR-0006).
 *
 * Phase 0 fixes these interface shapes so Hermes (backend), Guardian (security) and Apollo (screens)
 * code against one contract. Method bodies land in Phase 1–2; shapes may gain fields additively.
 */
/** The child/player's authoritative profile as the server owns it. */
export interface PlayerProfile {
    playerId: string;
    displayName: string;
    avatarId?: string;
    premium: boolean;
    locale: string;
}
/** The player's economy balances — authoritative on the server, never mutated client-side. */
export interface Wallet {
    coins: number;
    diamonds: number;
    xp: number;
    streakDays: number;
}
/** Authentication: guest, Google, Apple (matches the identity platform, ADR-0018). */
export interface AuthPort {
    current(): Promise<PlayerProfile | null>;
    signInGuest(): Promise<PlayerProfile>;
    signIn(provider: "google" | "apple"): Promise<PlayerProfile>;
    signOut(): Promise<void>;
}
/** Authoritative progress + saves; the shell reads/writes through here, server merges (ADR-0020). */
export interface SavePort {
    load(): Promise<unknown>;
    save(state: unknown): Promise<void>;
    /** Resume support: the last unfinished level/activity, if any. */
    lastCheckpoint(): Promise<{
        worldId: string;
        levelId: string;
    } | null>;
}
/** Economy: awards/spends are validated server-side; the shell only requests them. */
export interface EconomyPort {
    wallet(): Promise<Wallet>;
    award(delta: Partial<Wallet>, reason: string): Promise<Wallet>;
    spend(delta: Partial<Wallet>, reason: string): Promise<Wallet>;
}
/** Rewards surfaces: daily/weekly tables, achievements, challenges — defined and granted by server. */
export interface RewardsPort {
    dailyStatus(): Promise<unknown>;
    claimDaily(): Promise<unknown>;
    achievements(): Promise<unknown>;
    challenges(): Promise<unknown>;
}
/** Leaderboards — server-owned rankings (ADR-0027 fan-out, Hermes). */
export interface LeaderboardPort {
    top(scope: string, limit: number): Promise<unknown>;
    aroundMe(scope: string): Promise<unknown>;
}
/** In-app purchases & premium entitlement checks (validated server-side, ADR-0021). */
export interface CommercePort {
    products(): Promise<unknown>;
    purchase(productId: string): Promise<unknown>;
    restore(): Promise<unknown>;
    isEntitled(feature: string): Promise<boolean>;
}
/** Analytics — provider-agnostic event sink (ADR-0022); offline-queued by the adapter. */
export interface AnalyticsPort {
    track(event: string, props?: Record<string, unknown>): void;
}
/** Local device notifications for streaks/daily reminders (opt-in). */
export interface NotificationsPort {
    request(): Promise<boolean>;
    schedule(id: string, whenMs: number, body: string): Promise<void>;
}
/** Content delivery — manifest + packs, checksum-verified and cached offline (@etricks/game-client). */
export interface ContentPort {
    manifest(gameId: string): Promise<unknown>;
    pack(packId: string): Promise<unknown>;
}
/**
 * The full set of services the shell needs. All optional at the type level so a game can inject only
 * what it uses (a free, offline-only game may omit CommercePort/LeaderboardPort); the shell disables
 * the screens whose ports are absent.
 */
export interface ShellPorts {
    auth?: AuthPort;
    save?: SavePort;
    economy?: EconomyPort;
    rewards?: RewardsPort;
    leaderboard?: LeaderboardPort;
    commerce?: CommercePort;
    analytics?: AnalyticsPort;
    notifications?: NotificationsPort;
    content?: ContentPort;
}
//# sourceMappingURL=ports.d.ts.map