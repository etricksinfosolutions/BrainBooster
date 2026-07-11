/**
 * @etricks/contracts — the two contracts the whole platform is built around.
 *
 *   ContentPack  → what AIOS manufactures and the CDN serves.
 *   GameManifest → what the app fetches to know what to run and download.
 *
 * If these stay clean, launching game #10 is configuration, not engineering.
 */
export * from "./primitives.js";
export * from "./asset.js";
export * from "./content-pack.js";
export * from "./game-manifest.js";
export * from "./auth.js";
export * from "./cloud-save.js";
export * from "./subscription.js";
export * from "./analytics.js";
export * from "./content-factory.js";
export * from "./learning.js";
export * from "./parent.js";
export * from "./serialize.js";
//# sourceMappingURL=index.js.map