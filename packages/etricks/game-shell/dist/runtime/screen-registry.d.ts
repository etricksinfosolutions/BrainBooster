import type { ComponentType } from "react";
import type { Screen } from "../screens.js";
/**
 * The screen registry (Wave 1b seam for Wave 2). The runtime renders the component registered for the
 * current navigation screen. Screens are supplied as a map, so the Wave-2 UI teams (Home, Adventure,
 * Economy, Activity, Support) each register their screens **without touching the runtime** — exactly
 * the parallelism Wave 1b unlocks. A screen with no registered component falls back to a neutral
 * placeholder, so a partially-built game still boots and navigates.
 */
export type ScreenComponent = ComponentType<Record<string, never>>;
export type ScreenRegistry = Partial<Record<Screen, ScreenComponent>>;
/** Merge screen maps (later wins). Lets teams contribute registries independently, then compose them. */
export declare function composeRegistries(...maps: ScreenRegistry[]): ScreenRegistry;
//# sourceMappingURL=screen-registry.d.ts.map