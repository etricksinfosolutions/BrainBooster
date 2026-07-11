import { z } from "zod";
/**
 * The free-text family: fill-in-the-blank and typing-challenge. Both grade a typed string against
 * a target, with partial credit — so they run through the same universal scoring as multiple
 * choice, just with `totalUnits > 1`.
 */
/** Normalise a typed answer for comparison unless the blank is case-sensitive. */
function normalise(s, caseSensitive) {
    const trimmed = s.trim();
    return caseSensitive ? trimmed : trimmed.toLowerCase();
}
// --- fill-blank --------------------------------------------------------------------------------
const Blank = z.object({
    /** Accepted answers for this blank; the player's input must match one. */
    answers: z.array(z.string().min(1)).min(1),
    caseSensitive: z.boolean().default(false),
});
export const FillBlankContent = z.object({
    type: z.literal("fill-blank"),
    /**
     * The sentence with `{{}}` marking each blank, e.g. "The capital of France is {{}}.".
     * The number of `{{}}` markers must equal `blanks.length`.
     */
    template: z.string().min(1),
    blanks: z.array(Blank).min(1),
});
const BLANK_MARKER = /\{\{\}\}/g;
export const fillBlankStrategy = {
    type: "fill-blank",
    contentSchema: FillBlankContent.refine((c) => (c.template.match(BLANK_MARKER)?.length ?? 0) === c.blanks.length, { message: "template must contain exactly one {{}} per blank", path: ["template"] }),
    prepare(content) {
        // Split the template into the text segments around each blank, for renderers.
        const segments = content.template.split(BLANK_MARKER);
        return { segments, blanks: content.blanks };
    },
    grade(prepared, response) {
        const values = response?.values ?? [];
        let correctUnits = 0;
        const perBlank = prepared.blanks.map((blank, i) => {
            const given = values[i];
            if (given === undefined)
                return false;
            const ok = blank.answers.some((a) => normalise(a, blank.caseSensitive) === normalise(given, blank.caseSensitive));
            if (ok)
                correctUnits++;
            return ok;
        });
        return { correctUnits, totalUnits: prepared.blanks.length, detail: { perBlank } };
    },
};
// --- typing-challenge --------------------------------------------------------------------------
export const TypingChallengeContent = z.object({
    type: z.literal("typing-challenge"),
    /** The exact text the player must reproduce. */
    text: z.string().min(1),
});
export const typingChallengeStrategy = {
    type: "typing-challenge",
    contentSchema: TypingChallengeContent,
    prepare: (content) => ({ text: content.text }),
    grade(prepared, response) {
        const target = prepared.text;
        const typed = response?.typed ?? "";
        // Per-character accuracy — one unit per character in the target.
        let correct = 0;
        for (let i = 0; i < target.length; i++) {
            if (typed[i] === target[i])
                correct++;
        }
        return {
            correctUnits: correct,
            totalUnits: target.length,
            detail: { typedLength: typed.length },
        };
    },
};
//# sourceMappingURL=text.js.map