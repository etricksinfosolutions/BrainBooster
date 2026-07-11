import { z } from "zod";
import { AssetRef, defineContentPack } from "@etricks/contracts";
/**
 * The Memory Engine's content contract — the platform's first NON-TEXT payload.
 *
 * A quiz item is text-in / text-out. A memory pair is a themed concept with an **image
 * dependency**: the whole reason this engine exists is to prove AIOS can manufacture content
 * that references assets, and that `defineContentPack` carries a payload shaped nothing like a
 * quiz. The pack ships the *pairs*; the engine lays them onto a board at play time.
 */
export const MemoryDifficulty = z.enum(["easy", "medium", "hard"]);
/**
 * One matchable concept. On the board it becomes TWO identical cards the player must pair.
 * `face` is an image AssetRef — resolvable today, registry-resolved later (see ADR-0011).
 */
export const MemoryPair = z
    .object({
    /** Stable id, unique within the pack. Used for progress + dedup + board pairing. */
    id: z.string().min(1),
    /** Human label for the concept ("Lion"). Shown for accessibility / non-image modes. */
    label: z.string().min(1),
    /** The image shown on the card face — the asset this content depends on. */
    face: AssetRef,
    difficulty: MemoryDifficulty.default("medium"),
    /** Theme/selection tags ("animals", "safari"). */
    tags: z.array(z.string()).default([]),
})
    .refine((p) => p.face.kind === "image", {
    message: "a memory card face must be an image asset",
    path: ["face", "kind"],
});
/** The payload carried inside a memory ContentPack. */
export const MemoryPayload = z.object({
    /** The pack's theme ("Animals", "Fruits", "Countries"). */
    theme: z.string().min(1),
    /** At least two pairs — a board needs something to match. */
    pairs: z.array(MemoryPair).min(2),
});
/** The full, typed memory ContentPack = envelope (contracts) + memory payload. */
export const MemoryPack = defineContentPack(MemoryPayload);
//# sourceMappingURL=schema.js.map