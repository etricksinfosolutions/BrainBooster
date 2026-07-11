export function makeGeminiLanguageModel(client, options = {}) {
    const maxOutputTokens = options.maxTokens ?? 4096;
    const temperature = options.temperature ?? 0.7;
    return {
        async complete(request) {
            const res = await client.generateContent({
                systemInstruction: request.system,
                contents: [{ role: "user", parts: [{ text: request.user }] }],
                generationConfig: { maxOutputTokens, temperature },
            });
            return res.response.text();
        },
    };
}
//# sourceMappingURL=gemini.js.map