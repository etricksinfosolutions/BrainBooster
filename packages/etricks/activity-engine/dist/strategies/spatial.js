import { z } from "zod";
import { AssetRef } from "@etricks/contracts";
import { shuffle } from "../rng.js";
/**
 * The spatial family: word-search (find words on a letter grid), hotspot (tap the right regions of
 * an image) and puzzle-grid (arrange scrambled tiles into their solved positions). Each has a real,
 * deterministic layout step and grades one unit per target word / region / tile.
 */
// --- word-search -------------------------------------------------------------------------------
export const WordSearchContent = z.object({
    type: z.literal("word-search"),
    words: z.array(z.string().min(2).regex(/^[A-Za-z]+$/)).min(1),
    /** Optional grid side. Defaults to fit the longest word with a little slack. */
    size: z.number().int().min(3).max(20).optional(),
});
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
/** Deterministically place words across/down, then fill gaps with RNG letters. */
function layoutWordSearch(words, size, rng) {
    const upper = words.map((w) => w.toUpperCase());
    const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => null));
    const placements = [];
    const fits = (word, row, col, dir) => {
        for (let i = 0; i < word.length; i++) {
            const r = dir === "down" ? row + i : row;
            const c = dir === "across" ? col + i : col;
            if (r >= size || c >= size)
                return false;
            const cell = grid[r][c];
            if (cell !== null && cell !== word[i])
                return false; // allow overlap on shared letters
        }
        return true;
    };
    const place = (word, row, col, dir) => {
        for (let i = 0; i < word.length; i++) {
            const r = dir === "down" ? row + i : row;
            const c = dir === "across" ? col + i : col;
            grid[r][c] = word[i];
        }
        placements.push({ word, row, col, dir });
    };
    for (const word of upper) {
        let placed = false;
        // Try a bounded set of RNG-chosen positions/directions, then fall back to a scan so a
        // valid puzzle is ALWAYS produced (never a silent drop).
        for (let attempt = 0; attempt < 60 && !placed; attempt++) {
            const dir = rng() < 0.5 ? "across" : "down";
            const maxStart = size - word.length;
            if (maxStart < 0)
                break;
            const row = dir === "down" ? Math.floor(rng() * (maxStart + 1)) : Math.floor(rng() * size);
            const col = dir === "across" ? Math.floor(rng() * (maxStart + 1)) : Math.floor(rng() * size);
            if (fits(word, row, col, dir)) {
                place(word, row, col, dir);
                placed = true;
            }
        }
        if (!placed) {
            outer: for (const dir of ["across", "down"]) {
                const maxStart = size - word.length;
                for (let row = 0; row <= (dir === "down" ? maxStart : size - 1); row++) {
                    for (let col = 0; col <= (dir === "across" ? maxStart : size - 1); col++) {
                        if (fits(word, row, col, dir)) {
                            place(word, row, col, dir);
                            placed = true;
                            break outer;
                        }
                    }
                }
            }
        }
        if (!placed) {
            throw new Error(`word-search: cannot place "${word}" in a ${size}×${size} grid; increase size`);
        }
    }
    const filled = grid.map((rowArr) => rowArr.map((cell) => cell ?? ALPHABET[Math.floor(rng() * ALPHABET.length)]));
    return { size, grid: filled, placements, words: upper };
}
export const wordSearchStrategy = {
    type: "word-search",
    contentSchema: WordSearchContent,
    prepare(content, _config, rng) {
        const longest = content.words.reduce((m, w) => Math.max(m, w.length), 0);
        const size = content.size ?? Math.max(longest + 2, Math.ceil(Math.sqrt(content.words.length * longest)) + 1);
        return layoutWordSearch(content.words, size, rng);
    },
    grade(prepared, response) {
        const target = new Set(prepared.words);
        const found = new Set((response?.found ?? []).map((w) => w.toUpperCase()).filter((w) => target.has(w)));
        return { correctUnits: found.size, totalUnits: prepared.words.length };
    },
};
// --- hotspot -----------------------------------------------------------------------------------
const Region = z.object({
    label: z.string().min(1),
    /** Normalised 0..1 bounding box on the image. */
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    w: z.number().min(0).max(1),
    h: z.number().min(0).max(1),
});
export const HotspotContent = z.object({
    type: z.literal("hotspot"),
    image: AssetRef,
    prompt: z.string().min(1),
    targets: z.array(Region).min(1),
});
export const hotspotStrategy = {
    type: "hotspot",
    contentSchema: HotspotContent,
    prepare: (content) => ({ image: content.image, prompt: content.prompt, targets: content.targets }),
    grade(prepared, response) {
        const points = response?.points ?? [];
        const hit = (t) => points.some((p) => p.x >= t.x && p.x <= t.x + t.w && p.y >= t.y && p.y <= t.y + t.h);
        const correctUnits = prepared.targets.filter(hit).length;
        return { correctUnits, totalUnits: prepared.targets.length };
    },
};
// --- puzzle-grid -------------------------------------------------------------------------------
export const PuzzleGridContent = z.object({
    type: z.literal("puzzle-grid"),
    prompt: z.string().min(1).optional(),
    rows: z.number().int().min(2).max(8),
    cols: z.number().int().min(2).max(8),
    /** Tiles in SOLVED order (length must equal rows×cols). Labels or image-slice ids. */
    tiles: z.array(z.string().min(1)).min(4),
});
export const puzzleGridStrategy = {
    type: "puzzle-grid",
    contentSchema: PuzzleGridContent.refine((c) => c.tiles.length === c.rows * c.cols, {
        message: "tiles length must equal rows × cols",
        path: ["tiles"],
    }),
    prepare(content, config, rng) {
        const indices = content.tiles.map((_, i) => i);
        const presented = config.shuffle ? shuffle(indices, rng) : indices;
        return {
            rows: content.rows,
            cols: content.cols,
            prompt: content.prompt,
            tiles: presented.map((i) => content.tiles[i]),
            originalIndex: presented,
        };
    },
    grade(prepared, response) {
        const arrangement = response?.arrangement ?? [];
        const total = prepared.tiles.length;
        let correctUnits = 0;
        for (let k = 0; k < total; k++) {
            const presentedIdx = arrangement[k];
            if (presentedIdx !== undefined && prepared.originalIndex[presentedIdx] === k)
                correctUnits++;
        }
        return { correctUnits, totalUnits: total };
    },
};
//# sourceMappingURL=spatial.js.map