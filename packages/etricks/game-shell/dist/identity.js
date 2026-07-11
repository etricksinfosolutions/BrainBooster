import { resolveTheme } from "./theme.js";
import { resolveBranding } from "./branding.js";
import { resolveEconomy } from "./economy.js";
/**
 * Compose the spine resolvers into a single concrete identity. Pure: the same inputs always yield the
 * same output, and no input is mutated. The economy is skinned from the shell manifest (the game names
 * its currencies; the server still owns the amounts), while theme and branding come from the game's
 * declarative definition. A bare definition with no manifest resolves entirely to neutral defaults.
 */
export function resolveGameIdentity(definition, manifest) {
    return {
        definition,
        theme: resolveTheme(definition.theme),
        branding: resolveBranding(definition),
        economy: resolveEconomy(manifest?.economy),
    };
}
//# sourceMappingURL=identity.js.map