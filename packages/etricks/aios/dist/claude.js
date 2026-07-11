/**
 * Wrap an Anthropic client as a LanguageModel. Uses adaptive thinking — the manufacturing
 * task benefits from the model reasoning about factual accuracy and answer plausibility
 * before emitting the batch.
 */
export function makeClaudeLanguageModel(client, options = {}) {
    const model = options.model ?? "claude-opus-4-8";
    const maxTokens = options.maxTokens ?? 8192;
    return {
        async complete(request) {
            const response = await client.messages.create({
                model,
                max_tokens: maxTokens,
                system: request.system,
                thinking: { type: "adaptive" },
                messages: [{ role: "user", content: request.user }],
            });
            return response.content
                .filter((block) => block.type === "text")
                .map((block) => block.text ?? "")
                .join("");
        },
    };
}
//# sourceMappingURL=claude.js.map