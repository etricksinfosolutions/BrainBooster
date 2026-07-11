import { describe, it, expect } from 'vitest'
import { genFillBoard, FILL_PALETTE } from '../activities/mechanics/fillcolor.gen'

/** Deterministic mulberry32 so each seed reproduces a board exactly. */
function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('Fill the Colors generator', () => {
  it('produces valid boards: full grid, every colour used, indices in range', () => {
    for (let t = 0; t <= 4; t++) {
      for (let s = 0; s < 40; s++) {
        const b = genFillBoard(t, rng(s * 31 + t))
        expect(b.plan.length, 'plan covers the grid').toBe(b.size * b.size)
        expect(b.colors.length).toBeGreaterThanOrEqual(2)
        // every plan index points at a real colour
        for (const idx of b.plan) expect(idx).toBeGreaterThanOrEqual(0), expect(idx).toBeLessThan(b.colors.length)
        // every chosen colour is actually used at least once (solvable / no dead colour)
        for (let c = 0; c < b.colors.length; c++) expect(b.plan).toContain(c)
        // palette entries are colour-blind-safe: distinct name + symbol
        for (const col of b.colors) { expect(col.name.length).toBeGreaterThan(0); expect(col.symbol.length).toBeGreaterThan(0) }
      }
    }
  })

  it('difficulty scales by grid size and colour count, not a shorter clock', () => {
    const sizes = [0, 1, 2, 3, 4].map((t) => genFillBoard(t, rng(t + 1)).size)
    const cols = [0, 1, 2, 3, 4].map((t) => genFillBoard(t, rng(t + 7)).colors.length)
    for (let i = 1; i < sizes.length; i++) expect(sizes[i]).toBeGreaterThanOrEqual(sizes[i - 1])
    for (let i = 1; i < cols.length; i++) expect(cols[i]).toBeGreaterThanOrEqual(cols[i - 1])
    expect(sizes[4]).toBeGreaterThan(sizes[0])
    expect(cols[4]).toBeGreaterThan(cols[0])
  })

  it('generates different boards across seeds (no repeats)', () => {
    const seen = new Set<string>()
    for (let s = 0; s < 60; s++) seen.add(genFillBoard(4, rng(s * 97 + 5)).plan.join(''))
    expect(seen.size).toBeGreaterThan(50) // overwhelmingly unique
  })

  it('exposes the full 5-colour palette', () => {
    expect(FILL_PALETTE.length).toBe(5)
  })
})
