/** Merge screen maps (later wins). Lets teams contribute registries independently, then compose them. */
export function composeRegistries(...maps) {
    return Object.assign({}, ...maps);
}
//# sourceMappingURL=screen-registry.js.map