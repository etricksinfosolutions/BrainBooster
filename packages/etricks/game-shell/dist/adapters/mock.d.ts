/**
 * In-memory mock adapters for every injected shell port (ADR-0027 §5 seam, ports.ts). These are
 * **dev/test doubles only**: they let the Game Shell run fully offline — with no backend, no network,
 * no persistence — so screens can be exercised in Storybook-style dev and asserted in unit tests. In
 * production the server stays authoritative; nothing here ever ships as the real economy/auth/etc.
 *
 * Design rules honored throughout:
 * - **Stateful & in-memory**: each factory closes over mutable state so award/spend, sign-in, and
 *   analytics accumulate exactly like a real session, but reset the moment the factory is re-called.
 * - **Deterministic**: no Math.random / Date-derived ids. Ids come from an incrementing counter seeded
 *   per factory, so tests observe stable values ("guest-1", "prod-1", …).
 * - **Faithful to the interface**: methods whose port contract returns `unknown` return a sensible,
 *   inspectable in-memory shape rather than null, so dev screens have something coherent to render.
 * - **Game-agnostic** (Golden Rule): no Brain-Booster specifics; neutral placeholder content only.
 */
import type { AuthPort, SavePort, EconomyPort, RewardsPort, LeaderboardPort, CommercePort, AnalyticsPort, NotificationsPort, ContentPort, ShellPorts, Wallet } from "../ports.js";
/**
 * In-memory {@link AuthPort}. `current()` returns null until a sign-in happens; sign-in mints a
 * deterministic {@link PlayerProfile} and remembers it until `signOut()`.
 */
export declare function createMockAuthPort(): AuthPort;
/**
 * In-memory {@link SavePort}. `save()` overwrites a single held blob; `load()` returns it (null until
 * first save). `lastCheckpoint()` echoes the last checkpoint stashed via a save, or null.
 */
export declare function createMockSavePort(): SavePort;
/**
 * In-memory {@link EconomyPort}. `award`/`spend` mutate a held {@link Wallet} and return the new
 * balance; `spend` clamps every currency at >= 0 so it can never go negative.
 */
export declare function createMockEconomyPort(initial?: Partial<Wallet>): EconomyPort;
/**
 * In-memory {@link RewardsPort}. Returns neutral, inspectable placeholder tables. `claimDaily()`
 * flips the held daily status to claimed and reports what was granted.
 */
export declare function createMockRewardsPort(): RewardsPort;
/**
 * In-memory {@link LeaderboardPort}. Returns a small deterministic ranking so leaderboard screens have
 * rows to render offline.
 */
export declare function createMockLeaderboardPort(): LeaderboardPort;
/**
 * In-memory {@link CommercePort}. Offers one placeholder product; `purchase` records the granted
 * entitlement so `isEntitled` reflects it. `restore` re-reports whatever has been purchased.
 */
export declare function createMockCommercePort(): CommercePort;
/** A single recorded analytics event, captured in order for test inspection. */
export interface MockAnalyticsEvent {
    event: string;
    props?: Record<string, unknown>;
}
/**
 * {@link AnalyticsPort} extended with an inspectable, append-only `events` array. `track` pushes each
 * call so tests can assert exactly what was recorded, in order.
 */
export interface MockAnalyticsPort extends AnalyticsPort {
    readonly events: readonly MockAnalyticsEvent[];
}
/** In-memory analytics sink. Events accumulate in `.events` (never sent anywhere). */
export declare function createMockAnalyticsPort(): MockAnalyticsPort;
/**
 * In-memory {@link NotificationsPort}. `request()` always grants (dev convenience); `schedule()`
 * records scheduled notifications in a held array (not exposed, purely a no-op sink for dev).
 */
export declare function createMockNotificationsPort(): NotificationsPort;
/**
 * In-memory {@link ContentPort}. Returns a minimal, deterministic manifest/pack shape so content-driven
 * screens can render offline without a real CDN or checksum pipeline.
 */
export declare function createMockContentPort(): ContentPort;
/**
 * Assembles a complete {@link ShellPorts} bundle of fresh mock adapters — everything the shell needs to
 * run offline. Pass `overrides` to swap in a real adapter (or a customized mock) for any port; provided
 * overrides win over the generated mocks. Every call builds an independent, isolated set of state.
 */
export declare function createMockPorts(overrides?: Partial<ShellPorts>): ShellPorts;
//# sourceMappingURL=mock.d.ts.map