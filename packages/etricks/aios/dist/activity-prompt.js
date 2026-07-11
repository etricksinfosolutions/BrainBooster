/**
 * Prompt construction for activity manufacturing.
 *
 * The model proposes CONTENT blocks matching one activity type's shape; AIOS assigns the stable id,
 * tags and config, then validates every block against the engine's schema. As with quiz/memory this
 * is guidance only — the quality gate, not the prompt, is what guarantees a playable pack. The
 * offline deterministic model ignores this text; the production Claude adapter uses it.
 */
/** A compact JSON-shape hint per activity type so the model returns the right fields. */
const SHAPE_HINT = {
    "multiple-choice": `{"type":"multiple-choice","prompt":"...","choices":["..."],"correctIndex":0}`,
    "true-false": `{"type":"true-false","statement":"...","answer":true}`,
    "fill-blank": `{"type":"fill-blank","template":"... {{}} ...","blanks":[{"answers":["..."]}]}`,
    "word-search": `{"type":"word-search","words":["..."]}`,
    "memory-match": `{"type":"memory-match","pairs":[{"id":"...","a":"...","b":"..."}]}`,
    "sequence-ordering": `{"type":"sequence-ordering","items":["first","second","third"]}`,
    "drag-drop-match": `{"type":"drag-drop-match","pairs":[{"left":"...","right":"..."}]}`,
    "flash-cards": `{"type":"flash-cards","cards":[{"id":"...","front":"...","back":"..."}]}`,
    "image-quiz": `{"type":"image-quiz","image":{"assetId":"...","kind":"image","uri":"..."},"choices":["..."],"correctIndex":0}`,
    "audio-quiz": `{"type":"audio-quiz","audio":{"assetId":"...","kind":"audio","uri":"..."},"choices":["..."],"correctIndex":0}`,
    "typing-challenge": `{"type":"typing-challenge","text":"..."}`,
    "sorting": `{"type":"sorting","items":[{"label":"...","value":1}]}`,
    "classification": `{"type":"classification","categories":["..."],"items":[{"label":"...","category":"..."}]}`,
    "hotspot": `{"type":"hotspot","image":{"assetId":"...","kind":"image","uri":"..."},"prompt":"...","targets":[{"label":"...","x":0,"y":0,"w":0.2,"h":0.2}]}`,
    "puzzle-grid": `{"type":"puzzle-grid","rows":2,"cols":2,"tiles":["a","b","c","d"]}`,
};
export function buildActivitySystemPrompt(spec) {
    const shape = SHAPE_HINT[spec.activityType] ?? "{...}";
    return [
        `You author "${spec.activityType}" educational activities for a game called "${spec.gameId}".`,
        `Topic: ${spec.topic}. Language: ${spec.locale}.`,
        `Return ONLY a JSON object: {"items":[ ${shape} , ... ]}`,
        `Every item MUST use "type":"${spec.activityType}". No markdown, no prose, no code fences.`,
    ].join("\n\n");
}
export function buildActivityUserPrompt(spec, batchSize, avoid) {
    const lines = [`Produce ${batchSize} new, distinct ${spec.activityType} items about ${spec.topic}.`];
    if (avoid.length > 0) {
        lines.push(`Do NOT repeat these already-used items:`, ...avoid.map((a) => `- ${a}`));
    }
    return lines.join("\n");
}
export function buildActivityRequest(spec, batchSize, avoid) {
    return {
        system: buildActivitySystemPrompt(spec),
        user: buildActivityUserPrompt(spec, batchSize, avoid),
    };
}
//# sourceMappingURL=activity-prompt.js.map