import { z } from "zod";
import { AssetRef } from "@etricks/contracts";
import { shuffle } from "../rng.js";
import type { ActivityStrategy, StrategyGrade } from "../types.js";

/**
 * The matching family: memory-match (flip cards to find pairs), drag-drop-match (connect left↔right)
 * and classification (drop items into categories). All three grade a mapping the player produces —
 * one unit per pair/item correctly associated.
 */

/** A card face is either text or an image asset — the same shape the memory engine established. */
const Face = z.union([z.string().min(1), AssetRef]);

// --- memory-match ------------------------------------------------------------------------------

export const MemoryMatchContent = z.object({
  type: z.literal("memory-match"),
  /** Each pair yields two cards the player must find. `a`/`b` may be text or images. */
  pairs: z.array(z.object({ id: z.string().min(1), a: Face, b: Face })).min(2),
});
export type MemoryMatchContent = z.infer<typeof MemoryMatchContent>;

export interface MemoryCard {
  /** Stable card id, unique in the board. */
  cardId: string;
  /** The pair this card belongs to — its twin shares the same `pairId`. */
  pairId: string;
  face: z.infer<typeof Face>;
}

export interface MemoryResponse {
  /** Pair ids the player successfully matched. */
  matched: string[];
}

export const memoryMatchStrategy: ActivityStrategy<
  MemoryMatchContent,
  { cards: MemoryCard[]; pairCount: number },
  MemoryResponse
> = {
  type: "memory-match",
  contentSchema: MemoryMatchContent,
  prepare(content, config, rng) {
    const cards: MemoryCard[] = content.pairs.flatMap((p) => [
      { cardId: `${p.id}-a`, pairId: p.id, face: p.a },
      { cardId: `${p.id}-b`, pairId: p.id, face: p.b },
    ]);
    return {
      cards: config.shuffle ? shuffle(cards, rng) : cards,
      pairCount: content.pairs.length,
    };
  },
  grade(prepared, response): StrategyGrade {
    const valid = new Set(prepared.cards.map((c) => c.pairId));
    const matched = new Set((response?.matched ?? []).filter((id) => valid.has(id)));
    return { correctUnits: matched.size, totalUnits: prepared.pairCount };
  },
};

// --- drag-drop-match ---------------------------------------------------------------------------

export const DragDropMatchContent = z.object({
  type: z.literal("drag-drop-match"),
  prompt: z.string().min(1).optional(),
  /** Correct associations. Lefts are shown in order; rights are shuffled for the player. */
  pairs: z.array(z.object({ left: z.string().min(1), right: z.string().min(1) })).min(2),
});
export type DragDropMatchContent = z.infer<typeof DragDropMatchContent>;

export interface DragDropResponse {
  /** For each left (in order), the index of the presented right the player connected to it. */
  mapping: number[];
}

export interface PreparedDragDrop {
  prompt?: string;
  lefts: string[];
  rights: string[];
  /** correctRight[leftIndex] = index into presented `rights` that is the right answer. */
  correctRight: number[];
}

export const dragDropMatchStrategy: ActivityStrategy<
  DragDropMatchContent,
  PreparedDragDrop,
  DragDropResponse
> = {
  type: "drag-drop-match",
  contentSchema: DragDropMatchContent,
  prepare(content, config, rng) {
    const rightIndices = content.pairs.map((_, i) => i);
    const presented = config.shuffle ? shuffle(rightIndices, rng) : rightIndices;
    const rights = presented.map((i) => content.pairs[i]!.right);
    // For each left i, find where its correct right landed in the presented order.
    const correctRight = content.pairs.map((_, leftIdx) => presented.indexOf(leftIdx));
    return {
      prompt: content.prompt,
      lefts: content.pairs.map((p) => p.left),
      rights,
      correctRight,
    };
  },
  grade(prepared, response) {
    const mapping = response?.mapping ?? [];
    let correctUnits = 0;
    prepared.correctRight.forEach((right, leftIdx) => {
      if (mapping[leftIdx] === right) correctUnits++;
    });
    return { correctUnits, totalUnits: prepared.correctRight.length };
  },
};

// --- classification ----------------------------------------------------------------------------

export const ClassificationContent = z.object({
  type: z.literal("classification"),
  prompt: z.string().min(1).optional(),
  categories: z.array(z.string().min(1)).min(2),
  /** Each item belongs in exactly one category (by name; must appear in `categories`). */
  items: z.array(z.object({ label: z.string().min(1), category: z.string().min(1) })).min(2),
});
export type ClassificationContent = z.infer<typeof ClassificationContent>;

export interface ClassificationResponse {
  /** For each presented item (in order), the index into `categories` the player chose. */
  assignments: number[];
}

export interface PreparedClassification {
  prompt?: string;
  categories: string[];
  items: { label: string; correctCategory: number }[];
}

export const classificationStrategy: ActivityStrategy<
  ClassificationContent,
  PreparedClassification,
  ClassificationResponse
> = {
  type: "classification",
  contentSchema: ClassificationContent.refine(
    (c) => c.items.every((it) => c.categories.includes(it.category)),
    { message: "every item's category must be listed in categories", path: ["items"] },
  ),
  prepare(content, config, rng) {
    const items = content.items.map((it) => ({
      label: it.label,
      correctCategory: content.categories.indexOf(it.category),
    }));
    return {
      prompt: content.prompt,
      categories: content.categories,
      items: config.shuffle ? shuffle(items, rng) : items,
    };
  },
  grade(prepared, response) {
    const assignments = response?.assignments ?? [];
    let correctUnits = 0;
    prepared.items.forEach((it, i) => {
      if (assignments[i] === it.correctCategory) correctUnits++;
    });
    return { correctUnits, totalUnits: prepared.items.length };
  },
};
