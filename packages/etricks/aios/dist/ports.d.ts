/**
 * Ports — the one external capability AIOS needs, as an interface it does NOT implement.
 *
 * AIOS is the "manufacturing team", but it doesn't hard-wire itself to a specific LLM
 * vendor any more than the game-client hard-wires itself to React Native. Production
 * injects a Claude-backed adapter (see `claude.ts`); tests inject a deterministic fake.
 * The manufacturing logic — prompting, parsing, dedup, quality gating — is identical in
 * both, and that logic is the interesting, testable part.
 */
/** One prompt turn for the model: a system instruction and a user request. */
export interface LanguageModelRequest {
    /** Stable framing of the job — cacheable, identical across a generation run. */
    system: string;
    /** The specific ask, including what to avoid (already-generated prompts). */
    user: string;
}
/**
 * A text-in / text-out language model. Returns the model's raw response text
 * (expected to be JSON per the prompt contract) or throws on transport failure.
 */
export interface LanguageModel {
    complete(request: LanguageModelRequest): Promise<string>;
}
//# sourceMappingURL=ports.d.ts.map