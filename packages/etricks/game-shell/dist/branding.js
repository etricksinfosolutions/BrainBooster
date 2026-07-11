/**
 * Resolve branding for a game. `definition.title` is the safety net for the display name so a game
 * with no branding block still shows its real title rather than a placeholder.
 */
export function resolveBranding(definition) {
    const b = definition.branding;
    const mascot = b?.mascot
        ? {
            name: b.mascot.name,
            art: b.mascot.art ?? null,
            promptSeed: b.mascot.promptSeed ?? null,
        }
        : null;
    return {
        displayName: b?.displayName ?? definition.title,
        tagline: b?.tagline ?? null,
        appId: b?.appId ?? null,
        logo: b?.logo ?? null,
        appIcon: b?.appIcon ?? null,
        splash: b?.splash ?? null,
        loadingArt: b?.loadingArt ?? null,
        mascot,
        iconSetId: b?.iconSetId ?? null,
    };
}
//# sourceMappingURL=branding.js.map