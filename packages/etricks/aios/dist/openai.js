export function makeOpenAILanguageModel(client, options = {}) {
    const model = options.model ?? "gpt-4o";
    const maxTokens = options.maxTokens ?? 4096;
    const temperature = options.temperature ?? 0.7;
    return {
        async complete(request) {
            const res = await client.chat.completions.create({
                model,
                max_tokens: maxTokens,
                temperature,
                messages: [
                    { role: "system", content: request.system },
                    { role: "user", content: request.user },
                ],
            });
            return res.choices.map((c) => c.message.content ?? "").join("");
        },
    };
}
//# sourceMappingURL=openai.js.map