/**
 * Ports — the one external capability AIOS needs, as an interface it does NOT implement.
 *
 * AIOS is the "manufacturing team", but it doesn't hard-wire itself to a specific LLM
 * vendor any more than the game-client hard-wires itself to React Native. Production
 * injects a Claude-backed adapter (see `claude.ts`); tests inject a deterministic fake.
 * The manufacturing logic — prompting, parsing, dedup, quality gating — is identical in
 * both, and that logic is the interesting, testable part.
 */
export {};
//# sourceMappingURL=ports.js.map