import { z } from "zod";
import { ACTIVITY_TYPES } from "@etricks/activity-engine";

/**
 * ActivitySpec — the manufacturing order for the Universal Activity Engine.
 *
 * One spec targets one activity type (multiple-choice, memory-match, word-search…) for one topic.
 * A game manufactures its content by handing AIOS a list of these — no code. Adding "Science Master"
 * is a handful of specs, exactly as adding a quiz game was one `GenerationSpec`. See ADR-0024.
 */
export const ActivitySpec = z.object({
  /** Which game this content is for, e.g. "science-master". */
  gameId: z.string().min(1),
  /** Which activity type to manufacture — dispatches to that type's content shape. */
  activityType: z.enum(ACTIVITY_TYPES),
  /** Human topic the model writes to, e.g. "the water cycle", "world capitals". */
  topic: z.string().min(1),
  /** Content locale (matches the pack's locale). */
  locale: z.string().min(1).default("en"),
  /** How many quality-passing activities to put in the finished pack. */
  count: z.number().int().positive(),
  /** Seed tags applied to every generated activity ("science", "biology"). */
  tags: z.array(z.string()).default([]),
  /** Prefix for generated activity ids, e.g. "sm-cells" → "sm-cells-0001". */
  idPrefix: z.string().min(1),
  /** Config baked onto every generated activity (time limit, lives, scoring…). Partial; engine resolves. */
  config: z.record(z.string(), z.unknown()).optional(),
  /** How many items to request per model call. Defaults to min(count, 20). */
  batchSize: z.number().int().positive().optional(),
});
export type ActivitySpec = z.infer<typeof ActivitySpec>;
