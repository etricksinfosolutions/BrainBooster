/**
 * Shared, game-NEUTRAL helpers for the Home experience group (Team Bravo).
 *
 * Nothing here is Brain-Booster specific: the avatar skins are generic emoji glyphs with plain
 * descriptive labels (an animal name is not a brand mascot name), and the level curve is a neutral
 * progression formula every game can rely on. Screens import these so Home / Profile / Avatar agree
 * on how an `avatarId` renders and how XP maps to a player level.
 */
/** A purely presentational avatar skin. `id` is what we persist on the profile's `avatarId`. */
export interface AvatarSkin {
    id: string;
    /** Emoji glyph rendered as the avatar face. */
    glyph: string;
    /** Human, non-brand label used for accessibility. */
    label: string;
}
/**
 * The neutral avatar catalogue. Generic friendly characters — no game-specific / brand names. A game
 * can theme these via config later; the shell ships a coherent default set so the picker is never empty.
 */
export declare const AVATAR_SKINS: readonly AvatarSkin[];
/** The glyph used when a profile has no avatar chosen yet (or an unknown id). */
export declare const DEFAULT_AVATAR_GLYPH = "\uD83D\uDE42";
/** Resolve an `avatarId` (as stored on `PlayerProfile.avatarId`) to its display glyph. */
export declare function avatarGlyph(avatarId: string | undefined): string;
/**
 * Neutral level curve from experience points. Smooth, ever-growing, and cheap to compute — a game with
 * a different progression can override the label later, but this keeps every shell screen consistent.
 */
export declare function levelForXp(xp: number): number;
//# sourceMappingURL=common.d.ts.map