import { type ReactNode } from "react";
import type { Activity } from "@etricks/activity-engine";
import { type LevelSummary } from "./useActivityPlay.js";
/**
 * ActivityPlayer — the game-neutral React player mounted inside the shell's ActivityScreen. It drives
 * a level's `Activity[]` through the Universal Activity Engine (via `useActivityPlay`), renders the
 * right DOM view per type, shows correct/incorrect feedback + explanation, and reports the level
 * summary to `onComplete` when finished. No game-specific logic — the same player runs every game.
 */
export declare function ActivityPlayer(props: {
    gameId: string;
    activities: Activity[];
    seed?: string;
    onComplete: (summary: LevelSummary) => void;
}): ReactNode;
//# sourceMappingURL=ActivityPlayer.d.ts.map