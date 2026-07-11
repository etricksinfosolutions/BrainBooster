import { z } from "zod";
import { defineContentPack } from "@etricks/contracts";
import { ActivityConfig } from "./config.js";
import { ALL_STRATEGIES } from "./registry.js";
import { MultipleChoiceContent, TrueFalseContent, ImageQuizContent, AudioQuizContent, } from "./strategies/choice.js";
import { FillBlankContent, TypingChallengeContent } from "./strategies/text.js";
import { SequenceOrderingContent, SortingContent } from "./strategies/ordering.js";
import { MemoryMatchContent, DragDropMatchContent, ClassificationContent, } from "./strategies/matching.js";
import { FlashCardsContent } from "./strategies/study.js";
import { WordSearchContent, HotspotContent, PuzzleGridContent } from "./strategies/spatial.js";
/**
 * The Universal Activity Engine's content contract.
 *
 * `ActivityContent` is the discriminated union of every activity type's authored content — the
 * exact shape AIOS must produce and the engine can play. An `Activity` pairs one content block
 * with its (optional) config; an `ActivityPayload` is the list carried inside an `activity`
 * ContentPack. This is what makes a game "configuration + content": the game ships a pack of these
 * and the engine does the rest. New activity types extend the union by adding their schema below,
 * mirroring the strategy registry.
 */
/** The `type` field discriminates which content shape (and strategy) applies. */
export const ActivityContent = z.union([
    MultipleChoiceContent,
    TrueFalseContent,
    FillBlankContent,
    WordSearchContent,
    MemoryMatchContent,
    SequenceOrderingContent,
    DragDropMatchContent,
    FlashCardsContent,
    ImageQuizContent,
    AudioQuizContent,
    TypingChallengeContent,
    SortingContent,
    ClassificationContent,
    HotspotContent,
    PuzzleGridContent,
]);
/** One authored activity: a stable id, its content, and the config it plays under. */
export const Activity = z.object({
    /** Stable id, unique within the pack — used for progress, analytics, and level references. */
    id: z.string().min(1),
    /** Optional authoring metadata for selection/merchandising (topic, world, "boss"). */
    tags: z.array(z.string()).default([]),
    /** Partial config; unspecified fields fall back to DEFAULT_CONFIG at play time. */
    config: ActivityConfig.partial().optional(),
    content: ActivityContent,
});
/** The payload carried inside an `activity` ContentPack — a bank of playable activities. */
export const ActivityPayload = z.object({
    activities: z.array(Activity).min(1),
});
/** The full, typed activity ContentPack = envelope (contracts) + activity payload. */
export const ActivityPack = defineContentPack(ActivityPayload);
/**
 * The set of activity `type` literals the content union covers — derived from the strategy
 * registry so it can never drift from what the engine can actually play.
 */
export const SUPPORTED_ACTIVITY_TYPES = ALL_STRATEGIES.map((s) => s.type);
//# sourceMappingURL=schema.js.map