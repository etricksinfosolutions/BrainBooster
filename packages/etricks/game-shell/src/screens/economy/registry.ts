import type { ScreenRegistry } from "../../runtime/screen-registry.js";
import { DailyRewardsScreen } from "./DailyRewardsScreen.js";
import { WeeklyRewardsScreen } from "./WeeklyRewardsScreen.js";
import { AchievementsScreen } from "./AchievementsScreen.js";
import { ChallengesScreen } from "./ChallengesScreen.js";
import { LeaderboardScreen } from "./LeaderboardScreen.js";
import { ShopScreen } from "./ShopScreen.js";
import { PremiumScreen } from "./PremiumScreen.js";

/**
 * Team Echo — the "economy" screen group (ADR-0027). Maps every economy/engagement screen id this team
 * owns to its game-neutral component. Atlas composes this into the full shell registry; nothing here
 * touches a shared barrel.
 */
export const economyScreens: ScreenRegistry = {
  "daily-rewards": DailyRewardsScreen,
  "weekly-rewards": WeeklyRewardsScreen,
  achievements: AchievementsScreen,
  challenges: ChallengesScreen,
  leaderboard: LeaderboardScreen,
  shop: ShopScreen,
  premium: PremiumScreen,
};
