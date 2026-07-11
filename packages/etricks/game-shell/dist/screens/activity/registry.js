import { ActivityScreen } from "./ActivityScreen.js";
import { ResultScreen } from "./ResultScreen.js";
import { VictoryScreen } from "./VictoryScreen.js";
import { FailureScreen } from "./FailureScreen.js";
import { PauseScreen } from "./PauseScreen.js";
import { RewardScreen } from "./RewardScreen.js";
/**
 * Team Delta — the ACTIVITY FLOW group. The shell hosts activities and renders their outcomes; it never
 * implements gameplay (that is @etricks/activity-engine). Registered without touching the runtime.
 */
export const activityScreens = {
    activity: ActivityScreen,
    result: ResultScreen,
    victory: VictoryScreen,
    failure: FailureScreen,
    pause: PauseScreen,
    reward: RewardScreen,
};
//# sourceMappingURL=registry.js.map