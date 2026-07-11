import { composeRegistries } from "../runtime/screen-registry.js";
import { launchScreens } from "./launch/registry.js";
import { homeScreens } from "./home/registry.js";
import { adventureScreens } from "./adventure/registry.js";
import { activityScreens } from "./activity/registry.js";
import { economyScreens } from "./economy/registry.js";
import { supportScreens } from "./support/registry.js";
/**
 * The composed default screen registry (Wave 2). Each screen group — launch, home, adventure, activity,
 * economy, support — is authored by a separate team as its own `<group>/registry.ts` and contributes a
 * map of screen id → propless component. Atlas folds them into one registry here with
 * `composeRegistries`, so the runtime renders the whole game's screen set without any team touching a
 * shared barrel or the runtime itself. Groups are disjoint (no id collisions); later maps would win.
 *
 * This is the single map a manufactured game boots against: `mountGame` (and the Science Master gate)
 * feed it to the runtime, and it covers the full ADR-0027 screen vocabulary declared in `screens.ts`.
 */
export const defaultScreens = composeRegistries(launchScreens, homeScreens, adventureScreens, activityScreens, economyScreens, supportScreens);
//# sourceMappingURL=index.js.map