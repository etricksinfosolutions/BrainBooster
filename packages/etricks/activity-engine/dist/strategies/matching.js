import { z } from "zod";
import { AssetRef } from "@etricks/contracts";
import { shuffle } from "../rng.js";
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
export const memoryMatchStrategy = {
    type: "memory-match",
    contentSchema: MemoryMatchContent,
    prepare(content, config, rng) {
        const cards = content.pairs.flatMap((p) => [
            { cardId: `${p.id}-a`, pairId: p.id, face: p.a },
            { cardId: `${p.id}-b`, pairId: p.id, face: p.b },
        ]);
        return {
            cards: config.shuffle ? shuffle(cards, rng) : cards,
            pairCount: content.pairs.length,
        };
    },
    grade(prepared, response) {
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
export const dragDropMatchStrategy = {
    type: "drag-drop-match",
    contentSchema: DragDropMatchContent,
    prepare(content, config, rng) {
        const rightIndices = content.pairs.map((_, i) => i);
        const presented = config.shuffle ? shuffle(rightIndices, rng) : rightIndices;
        const rights = presented.map((i) => content.pairs[i].right);
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
            if (mapping[leftIdx] === right)
                correctUnits++;
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
export const classificationStrategy = {
    type: "classification",
    contentSchema: ClassificationContent.refine((c) => c.items.every((it) => c.categories.includes(it.category)), { message: "every item's category must be listed in categories", path: ["items"] }),
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
            if (assignments[i] === it.correctCategory)
                correctUnits++;
        });
        return { correctUnits, totalUnits: prepared.items.length };
    },
};
//# sourceMappingURL=matching.js.map