/**
 * @etricks/game-shell — the game-agnostic application framework every manufactured game runs inside.
 *
 * A game = game-shell + activity-engine + theme + content + assets + branding, and nothing else
 * (ADR-0027, Project Phoenix). This package owns the whole application *around* a level: the full
 * screen set, navigation, economy, rewards, theme, cloud sync and store packaging — all configurable,
 * none game-specific. The Activity Engine is one subsystem it hosts.
 *
 * Phase 0 (this commit) publishes the *contract* — the screen vocabulary, injected ports, shell
 * config, and the `mountGame` entry point — so all Phoenix teams code against a fixed seam. The
 * implementation is extracted from Brain Booster's `apps/web` in Phase 1. See
 * docs/programs/project-phoenix.md.
 */
export * from "./screens.js";
export * from "./ports.js";
export * from "./theme.js";
export * from "./economy.js";
export * from "./branding.js";
export * from "./identity.js";
export * from "./shell-config.js";
export * from "./adapters/mock.js";
// Runtime (Wave 1b) — pure state/navigation/bootstrap + the React binding.
export * from "./runtime/navigation.js";
export * from "./runtime/state.js";
export * from "./runtime/reducer.js";
export * from "./runtime/bootstrap.js";
export * from "./runtime/screen-registry.js";
export * from "./runtime/context.js";
export * from "./runtime/error-boundary.js";
export * from "./runtime/RuntimeRoot.js";
export * from "./mount.js";
// Wave 2 — the composed default screen registry every manufactured game boots against.
export * from "./screens/index.js";
// Wave 3 — the game-neutral activity player hosting @etricks/activity-engine.
export * from "./play/useActivityPlay.js";
export * from "./play/ActivityPlayer.js";
