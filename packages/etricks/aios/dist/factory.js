const registry = new Map();
const keyOf = (engine, contentType) => `${engine}:${contentType}`;
/** Register a built-in or custom content factory. Idempotent per (engine, contentType). */
export function registerContentFactory(factory) {
    registry.set(keyOf(factory.engine, factory.contentType), factory);
}
export function getContentFactory(engine, contentType) {
    return registry.get(keyOf(engine, contentType));
}
/**
 * The primary AIOS entry point. Dispatches to the factory registered for
 * (request.engine, request.contentType) and returns its validated payload + report.
 */
export async function generateContent(request, model, options = {}) {
    const factory = getContentFactory(request.engine, request.contentType);
    if (!factory) {
        throw new Error(`AIOS: no content factory registered for engine "${request.engine}", ` +
            `contentType "${request.contentType}". Register one with registerContentFactory().`);
    }
    return factory.generate(request.spec, model, options);
}
//# sourceMappingURL=factory.js.map