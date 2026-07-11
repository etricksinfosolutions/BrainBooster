// ---------------------------------------------------------------------------
// Brain Booster Kids — FILL THE COLORS · pure generator (no React, no game deps)
//
// A colour-by-number board: every cell carries a number; the child fills it with
// the matching palette colour. Kept React-free so its tests transform instantly
// (see docs/testing.md § Vitest pool). Difficulty scales by COMPLEXITY — bigger
// grid and more colours — never by a shorter clock. Colour is never the only
// signal: each colour has a name + symbol + its number.
// ---------------------------------------------------------------------------

export interface FillColor { name: string; hex: string; symbol: string }

/** Colour-blind-safe palette: distinct hue AND symbol AND (in play) a number. */
export const FILL_PALETTE: FillColor[] = [
  { name: 'Red', hex: '#e5484d', symbol: '●' },
  { name: 'Blue', hex: '#3e7bfa', symbol: '■' },
  { name: 'Green', hex: '#2f9e6e', symbol: '▲' },
  { name: 'Yellow', hex: '#f5b93e', symbol: '◆' },
  { name: 'Purple', hex: '#8e4ec6', symbol: '★' },
]

export interface FillBoard {
  size: number           // grid is size×size
  colors: FillColor[]    // the palette for this round (2..5 colours)
  plan: number[]         // plan[i] = index into `colors` the cell i must become
}

function shuffleLocal<T>(arr: readonly T[], rnd: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

const clampTier = (t: number): number => Math.max(0, Math.min(4, Math.floor(t || 0)))

/** Higher tier → bigger grid and more colours (more to plan + track), not a faster clock. */
export function genFillBoard(tierIndex: number, rnd: () => number = Math.random): FillBoard {
  const t = clampTier(tierIndex)
  const size = [2, 3, 3, 4, 4][t]
  const nColors = [2, 2, 3, 3, 4][t]
  const colors = shuffleLocal(FILL_PALETTE, rnd).slice(0, nColors)
  const cells = size * size
  // Guarantee every chosen colour is actually used at least once, then fill the rest.
  const plan: number[] = []
  for (let i = 0; i < nColors; i++) plan.push(i)
  for (let i = nColors; i < cells; i++) plan.push(Math.floor(rnd() * nColors))
  return { size, colors, plan: shuffleLocal(plan, rnd) }
}
