import { z } from "zod";
import { AssetRef } from "@etricks/contracts";
import { shuffle } from "../rng.js";
/**
 * flash-cards — a study activity. There is no "wrong": the player self-reports which cards they
 * knew, and mastery is the fraction known. It still flows through universal scoring (each known
 * card is a correct unit), so progress/stars work with no special-casing.
 */
const Face = z.union([z.string().min(1), AssetRef]);
export const FlashCardsContent = z.object({
    type: z.literal("flash-cards"),
    cards: z.array(z.object({ id: z.string().min(1), front: Face, back: Face })).min(1),
});
export const flashCardsStrategy = {
    type: "flash-cards",
    contentSchema: FlashCardsContent,
    prepare(content, config, rng) {
        return { cards: config.shuffle ? shuffle(content.cards, rng) : content.cards };
    },
    grade(prepared, response) {
        const valid = new Set(prepared.cards.map((c) => c.id));
        const known = new Set((response?.known ?? []).filter((id) => valid.has(id)));
        return { correctUnits: known.size, totalUnits: prepared.cards.length };
    },
};
//# sourceMappingURL=study.js.map