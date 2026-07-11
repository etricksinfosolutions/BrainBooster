import type { ScreenRegistry } from "../../runtime/screen-registry.js";
import { WorldSelectScreen } from "./WorldSelectScreen.js";
import { LevelSelectScreen } from "./LevelSelectScreen.js";

/**
 * Team Charlie — "adventure" group. Registers the adventure-navigation screens so the runtime can
 * render them without importing any concrete component. Atlas composes this map into the shell.
 */
export const adventureScreens: ScreenRegistry = {
  "world-select": WorldSelectScreen,
  "level-select": LevelSelectScreen,
};
