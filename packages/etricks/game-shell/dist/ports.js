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
export {};
//# sourceMappingURL=ports.js.map