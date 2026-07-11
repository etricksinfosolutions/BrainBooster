import type { ScreenRegistry } from "../../runtime/screen-registry.js";
import { SettingsScreen } from "./SettingsScreen.js";
import { AccessibilityScreen } from "./AccessibilityScreen.js";
import { ParentsScreen } from "./ParentsScreen.js";

/**
 * Team Foxtrot — the "support" group. Maps every support-surface screen id to its component so Atlas
 * can compose it into the shell's registry without touching the runtime.
 */
export const supportScreens: ScreenRegistry = {
  settings: SettingsScreen,
  accessibility: AccessibilityScreen,
  parents: ParentsScreen,
};
