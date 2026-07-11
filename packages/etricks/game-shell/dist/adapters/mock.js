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
/** A fresh, zeroed wallet — the starting balance for a mock economy. */
function emptyWallet() {
    return { coins: 0, diamonds: 0, xp: 0, streakDays: 0 };
}
/**
 * Adds `delta`'s numeric fields onto `wallet` in place, flooring every balance at 0 (spends can never
 * push a currency negative). Only the four known Wallet keys are touched; unknown keys are ignored.
 */
function applyDelta(wallet, delta, sign) {
    const keys = ["coins", "diamonds", "xp", "streakDays"];
    for (const key of keys) {
        const change = delta[key];
        if (typeof change === "number") {
            wallet[key] = Math.max(0, wallet[key] + sign * change);
        }
    }
}
// ---------------------------------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------------------------------
/**
 * In-memory {@link AuthPort}. `current()` returns null until a sign-in happens; sign-in mints a
 * deterministic {@link PlayerProfile} and remembers it until `signOut()`.
 */
export function createMockAuthPort() {
    let profile = null;
    let counter = 0;
    function makeProfile(kind, displayName, premium) {
        counter += 1;
        return {
            playerId: `${kind}-${counter}`,
            displayName,
            premium,
            locale: "en",
        };
    }
    return {
        async current() {
            return profile;
        },
        async signInGuest() {
            profile = makeProfile("guest", "Guest Player", false);
            return profile;
        },
        async signIn(provider) {
            const label = provider === "google" ? "Google Player" : "Apple Player";
            profile = makeProfile(provider, label, false);
            return profile;
        },
        async signOut() {
            profile = null;
        },
    };
}
// ---------------------------------------------------------------------------------------------------
// Save
// ---------------------------------------------------------------------------------------------------
/**
 * In-memory {@link SavePort}. `save()` overwrites a single held blob; `load()` returns it (null until
 * first save). `lastCheckpoint()` echoes the last checkpoint stashed via a save, or null.
 */
export function createMockSavePort() {
    let state = null;
    let checkpoint = null;
    return {
        async load() {
            return state;
        },
        async save(next) {
            state = next;
            // If the saved state carries a checkpoint shape, remember it for resume support.
            if (next !== null &&
                typeof next === "object" &&
                "worldId" in next &&
                "levelId" in next &&
                typeof next.worldId === "string" &&
                typeof next.levelId === "string") {
                const c = next;
                checkpoint = { worldId: c.worldId, levelId: c.levelId };
            }
        },
        async lastCheckpoint() {
            return checkpoint;
        },
    };
}
// ---------------------------------------------------------------------------------------------------
// Economy
// ---------------------------------------------------------------------------------------------------
/**
 * In-memory {@link EconomyPort}. `award`/`spend` mutate a held {@link Wallet} and return the new
 * balance; `spend` clamps every currency at >= 0 so it can never go negative.
 */
export function createMockEconomyPort(initial) {
    const wallet = { ...emptyWallet(), ...initial };
    return {
        async wallet() {
            return { ...wallet };
        },
        async award(delta) {
            applyDelta(wallet, delta, 1);
            return { ...wallet };
        },
        async spend(delta) {
            applyDelta(wallet, delta, -1);
            return { ...wallet };
        },
    };
}
// ---------------------------------------------------------------------------------------------------
// Rewards
// ---------------------------------------------------------------------------------------------------
/**
 * In-memory {@link RewardsPort}. Returns neutral, inspectable placeholder tables. `claimDaily()`
 * flips the held daily status to claimed and reports what was granted.
 */
export function createMockRewardsPort() {
    let dailyClaimed = false;
    return {
        async dailyStatus() {
            return { available: !dailyClaimed, claimed: dailyClaimed, streakDays: 0, reward: { coins: 10 } };
        },
        async claimDaily() {
            const alreadyClaimed = dailyClaimed;
            dailyClaimed = true;
            return { claimed: !alreadyClaimed, granted: alreadyClaimed ? {} : { coins: 10 } };
        },
        async achievements() {
            return [];
        },
        async challenges() {
            return [];
        },
    };
}
// ---------------------------------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------------------------------
/**
 * In-memory {@link LeaderboardPort}. Returns a small deterministic ranking so leaderboard screens have
 * rows to render offline.
 */
export function createMockLeaderboardPort() {
    function row(rank) {
        return { rank, playerId: `player-${rank}`, displayName: `Player ${rank}`, score: 1000 - rank * 10 };
    }
    return {
        async top(scope, limit) {
            const count = Math.max(0, Math.min(limit, 10));
            return { scope, entries: Array.from({ length: count }, (_, i) => row(i + 1)) };
        },
        async aroundMe(scope) {
            return { scope, entries: [row(4), row(5), row(6)] };
        },
    };
}
// ---------------------------------------------------------------------------------------------------
// Commerce
// ---------------------------------------------------------------------------------------------------
/**
 * In-memory {@link CommercePort}. Offers one placeholder product; `purchase` records the granted
 * entitlement so `isEntitled` reflects it. `restore` re-reports whatever has been purchased.
 */
export function createMockCommercePort() {
    const entitlements = new Set();
    return {
        async products() {
            return [{ id: "mock.premium", title: "Premium", price: "$0.00", feature: "premium" }];
        },
        async purchase(productId) {
            // Grant an entitlement keyed by product id (and a generic "premium" for the sample product).
            entitlements.add(productId);
            if (productId === "mock.premium")
                entitlements.add("premium");
            return { productId, success: true, entitlements: [...entitlements] };
        },
        async restore() {
            return { entitlements: [...entitlements] };
        },
        async isEntitled(feature) {
            return entitlements.has(feature);
        },
    };
}
/** In-memory analytics sink. Events accumulate in `.events` (never sent anywhere). */
export function createMockAnalyticsPort() {
    const events = [];
    return {
        track(event, props) {
            events.push(props === undefined ? { event } : { event, props });
        },
        get events() {
            return events;
        },
    };
}
// ---------------------------------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------------------------------
/**
 * In-memory {@link NotificationsPort}. `request()` always grants (dev convenience); `schedule()`
 * records scheduled notifications in a held array (not exposed, purely a no-op sink for dev).
 */
export function createMockNotificationsPort() {
    const scheduled = [];
    return {
        async request() {
            return true;
        },
        async schedule(id, whenMs, body) {
            scheduled.push({ id, whenMs, body });
        },
    };
}
// ---------------------------------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------------------------------
/**
 * In-memory {@link ContentPort}. Returns a minimal, deterministic manifest/pack shape so content-driven
 * screens can render offline without a real CDN or checksum pipeline.
 */
export function createMockContentPort() {
    return {
        async manifest(gameId) {
            return { gameId, version: 1, packs: [{ id: "core", checksum: "mock-core" }] };
        },
        async pack(packId) {
            return { id: packId, checksum: `mock-${packId}`, items: [] };
        },
    };
}
// ---------------------------------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------------------------------
/**
 * Assembles a complete {@link ShellPorts} bundle of fresh mock adapters — everything the shell needs to
 * run offline. Pass `overrides` to swap in a real adapter (or a customized mock) for any port; provided
 * overrides win over the generated mocks. Every call builds an independent, isolated set of state.
 */
export function createMockPorts(overrides) {
    return {
        auth: createMockAuthPort(),
        save: createMockSavePort(),
        economy: createMockEconomyPort(),
        rewards: createMockRewardsPort(),
        leaderboard: createMockLeaderboardPort(),
        commerce: createMockCommercePort(),
        analytics: createMockAnalyticsPort(),
        notifications: createMockNotificationsPort(),
        content: createMockContentPort(),
        ...overrides,
    };
}
//# sourceMappingURL=mock.js.map