import { HomeScreen } from "./HomeScreen.js";
import { ProfileScreen } from "./ProfileScreen.js";
import { AvatarScreen } from "./AvatarScreen.js";
/**
 * Team Bravo — the Home experience group. Maps the hub screen ids this group owns to their
 * propless components. Atlas composes this into the global registry (do not edit shared barrels).
 */
export const homeScreens = {
    home: HomeScreen,
    profile: ProfileScreen,
    avatar: AvatarScreen,
};
//# sourceMappingURL=registry.js.map