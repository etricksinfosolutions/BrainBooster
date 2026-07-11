import { z } from "zod";
import { shuffle } from "../rng.js";
import type { ActivityStrategy, StrategyGrade } from "../types.js";

/**
 * The ordering family: sequence-ordering (arrange into the authored order) and sorting (arrange by
 * a numeric key). Both present a scrambled list and grade how many items the player placed in the
 * correct slot — one unit per item.
 */

/** Count items whose position in `given` matches the goal position. */
function gradePlacement(goalOrder: number[], given: number[] | undefined): StrategyGrade {
  const response = given ?? [];
  let correctUnits = 0;
  for (let slot = 0; slot < goalOrder.length; slot++) {
    if (response[slot] === goalOrder[slot]) correctUnits++;
  }
  return { correctUnits, totalUnits: goalOrder.length };
}

// --- sequence-ordering -------------------------------------------------------------------------

export const SequenceOrderingContent = z.object({
  type: z.literal("sequence-ordering"),
  prompt: z.string().min(1).optional(),
  /** Items in their CORRECT order. The engine scrambles them for presentation. */
  items: z.array(z.string().min(1)).min(2),
});
export type SequenceOrderingContent = z.infer<typeof SequenceOrderingContent>;

export interface OrderingResponse {
  /** The presented indices, in the order the player arranged them. */
  order: number[];
}

/** Presented item i is `originalIndex[i]` in the authored (correct) list. */
export interface PreparedOrdering {
  prompt?: string;
  items: string[];
  originalIndex: number[];
}

export const sequenceOrderingStrategy: ActivityStrategy<
  SequenceOrderingContent,
  PreparedOrdering,
  OrderingResponse
> = {
  type: "sequence-ordering",
  contentSchema: SequenceOrderingContent,
  prepare(content, config, rng) {
    const indices = content.items.map((_, i) => i);
    const presentedOriginal = config.shuffle ? shuffle(indices, rng) : indices;
    return {
      prompt: content.prompt,
      items: presentedOriginal.map((i) => content.items[i]!),
      originalIndex: presentedOriginal,
    };
  },
  grade(prepared, response) {
    // The player returns presented-slot indices in their chosen final order. The item at final
    // slot k is correct when its authored index (originalIndex[...]) equals k.
    const order = response?.order ?? [];
    const total = prepared.items.length;
    let correctUnits = 0;
    for (let k = 0; k < total; k++) {
      const presentedIdx = order[k];
      if (presentedIdx !== undefined && prepared.originalIndex[presentedIdx] === k) correctUnits++;
    }
    return { correctUnits, totalUnits: total };
  },
};

// --- sorting -----------------------------------------------------------------------------------

export const SortingContent = z.object({
  type: z.literal("sorting"),
  prompt: z.string().min(1).optional(),
  /** Ascending sort by `value` is the correct order. Labels are what the player sees. */
  items: z.array(z.object({ label: z.string().min(1), value: z.number() })).min(2),
});
export type SortingContent = z.infer<typeof SortingContent>;

export interface PreparedSorting {
  prompt?: string;
  items: { label: string; value: number }[];
  /** goalOrder[slot] = presented index that belongs in this slot when sorted ascending. */
  goalOrder: number[];
}

export const sortingStrategy: ActivityStrategy<SortingContent, PreparedSorting, OrderingResponse> = {
  type: "sorting",
  contentSchema: SortingContent,
  prepare(content, config, rng) {
    const indices = content.items.map((_, i) => i);
    const presented = config.shuffle ? shuffle(indices, rng) : indices;
    const items = presented.map((i) => content.items[i]!);
    // The correct arrangement of the PRESENTED list, by ascending value (stable on ties).
    const goalOrder = items
      .map((it, i) => ({ i, value: it.value }))
      .sort((a, b) => a.value - b.value || a.i - b.i)
      .map((x) => x.i);
    return { prompt: content.prompt, items, goalOrder };
  },
  grade: (prepared, response) => gradePlacement(prepared.goalOrder, response?.order),
};
