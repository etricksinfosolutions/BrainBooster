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
export const AVATAR_SKINS: readonly AvatarSkin[] = [
  { id: "fox", glyph: "🦊", label: "Fox" },
  { id: "panda", glyph: "🐼", label: "Panda" },
  { id: "tiger", glyph: "🐯", label: "Tiger" },
  { id: "lion", glyph: "🦁", label: "Lion" },
  { id: "koala", glyph: "🐨", label: "Koala" },
  { id: "frog", glyph: "🐸", label: "Frog" },
  { id: "owl", glyph: "🦉", label: "Owl" },
  { id: "octopus", glyph: "🐙", label: "Octopus" },
  { id: "unicorn", glyph: "🦄", label: "Unicorn" },
  { id: "turtle", glyph: "🐢", label: "Turtle" },
  { id: "bee", glyph: "🐝", label: "Bee" },
  { id: "dino", glyph: "🦖", label: "Dino" },
  { id: "whale", glyph: "🐳", label: "Whale" },
  { id: "butterfly", glyph: "🦋", label: "Butterfly" },
  { id: "penguin", glyph: "🐧", label: "Penguin" },
  { id: "rabbit", glyph: "🐰", label: "Rabbit" },
];

/** The glyph used when a profile has no avatar chosen yet (or an unknown id). */
export const DEFAULT_AVATAR_GLYPH = "🙂";

/** Resolve an `avatarId` (as stored on `PlayerProfile.avatarId`) to its display glyph. */
export function avatarGlyph(avatarId: string | undefined): string {
  if (!avatarId) return DEFAULT_AVATAR_GLYPH;
  const skin = AVATAR_SKINS.find((a) => a.id === avatarId);
  return skin ? skin.glyph : DEFAULT_AVATAR_GLYPH;
}

/**
 * Neutral level curve from experience points. Smooth, ever-growing, and cheap to compute — a game with
 * a different progression can override the label later, but this keeps every shell screen consistent.
 */
export function levelForXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 25)) + 1;
}
