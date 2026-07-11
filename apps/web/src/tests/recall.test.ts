// ---------------------------------------------------------------------------
// MEMORY RECALL mechanic — generator tests
//
// Headless (node env): we test the PURE generators, never the DOM. The
// invariants that keep the five variants correct and non-repeating:
//   • Uniqueness — across many rounds no two sets are identical
//   • Validity   — the answer is well-formed and in range; options hold exactly
//                  the shown items (select variants), with no distractor overlap
//   • Distinct   — option lists never contain a duplicate
//   • Difficulty — every complexity knob is monotonic non-decreasing across tiers
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest'
import {
  genNumberRound, genColorRound, genPositionRound, genWordRound, genImageRound,
  genRecallRound, memoriseMs, RECALL_VARIANTS, RECALL_DIFFICULTY,
} from '../activities/mechanics/recall'

const SEEDS = 60

/** A serialisable fingerprint of a round's *answer* for uniqueness checks. */
function fingerprint(r: ReturnType<typeof genRecallRound>): string {
  switch (r.kind) {
    case 'number': return r.digits.join('')
    case 'color': return r.sequence.join('-')
    case 'position': return `${r.grid}:${r.lit.join('-')}`
    default: return r.correct.slice().sort().join(',')
  }
}

describe('recall generators — uniqueness (no repeated rounds)', () => {
  for (const id of RECALL_VARIANTS) {
    it(`${id}: ${SEEDS} rounds are (almost) all distinct`, () => {
      const seen = new Set<string>()
      for (let i = 0; i < SEEDS; i++) seen.add(fingerprint(genRecallRound(id, 3)))
      // Allow the rare legitimate collision, but the vast majority must differ.
      expect(seen.size).toBeGreaterThanOrEqual(SEEDS - 3)
    })
  }
})

describe('recall-number', () => {
  it('produces the tier-sized number of digits, each 0..9', () => {
    for (let tier = 0; tier <= 4; tier++) {
      const r = genNumberRound(tier)
      expect(r.digits.length).toBe(RECALL_DIFFICULTY.number.len[tier])
      for (const d of r.digits) { expect(d).toBeGreaterThanOrEqual(0); expect(d).toBeLessThanOrEqual(9) }
    }
  })
})

describe('recall-color', () => {
  it('sequence length scales with tier; every index is a valid palette slot', () => {
    for (let tier = 0; tier <= 4; tier++) {
      const r = genColorRound(tier)
      expect(r.sequence.length).toBe(RECALL_DIFFICULTY.color.len[tier])
      for (const c of r.sequence) { expect(c).toBeGreaterThanOrEqual(0); expect(c).toBeLessThan(r.paletteSize) }
    }
  })
})

describe('recall-position', () => {
  it('lit cells are distinct, in-range, and fit inside the grid', () => {
    for (let tier = 0; tier <= 4; tier++) {
      const r = genPositionRound(tier)
      expect(r.grid).toBe(RECALL_DIFFICULTY.position.grid[tier])
      expect(new Set(r.lit).size).toBe(r.lit.length)          // no duplicate cells
      expect(r.lit.length).toBeLessThan(r.grid * r.grid)      // never a fully-lit board
      for (const c of r.lit) { expect(c).toBeGreaterThanOrEqual(0); expect(c).toBeLessThan(r.grid * r.grid) }
    }
  })
})

describe('recall-word / recall-image (multi-select)', () => {
  for (const gen of [genWordRound, genImageRound]) {
    const label = gen === genWordRound ? 'word' : 'image'
    it(`${label}: options = shown ∪ distractors, distinct, no overlap, correct == shown`, () => {
      for (let tier = 0; tier <= 4; tier++) {
        const r = gen(tier)
        // correct answer is exactly the shown set
        expect(r.correct.slice().sort()).toEqual(r.shown.slice().sort())
        // shown and distractors never overlap (a decoy that was shown would be unfair)
        for (const d of r.distractors) expect(r.shown).not.toContain(d)
        // options are exactly shown ∪ distractors, and every option is unique
        expect(new Set(r.options).size).toBe(r.options.length)
        expect(r.options.slice().sort()).toEqual([...r.shown, ...r.distractors].sort())
        // every correct item is actually pickable
        for (const c of r.correct) expect(r.options).toContain(c)
      }
    })
  }
})

describe('difficulty scales with tier (complexity, monotonic non-decreasing)', () => {
  const nonDecreasing = (xs: number[]) => xs.every((v, i) => i === 0 || v >= xs[i - 1])

  it('number: digit count grows', () => {
    nonDecreasingAssert([0, 1, 2, 3, 4].map(t => genNumberRound(t).digits.length))
  })
  it('color: sequence length grows', () => {
    nonDecreasingAssert([0, 1, 2, 3, 4].map(t => genColorRound(t).sequence.length))
  })
  it('position: grid size and lit count grow', () => {
    nonDecreasingAssert([0, 1, 2, 3, 4].map(t => genPositionRound(t).grid))
    nonDecreasingAssert([0, 1, 2, 3, 4].map(t => genPositionRound(t).lit.length))
  })
  it('word/image: shown set grows', () => {
    nonDecreasingAssert([0, 1, 2, 3, 4].map(t => genWordRound(t).shown.length))
    nonDecreasingAssert([0, 1, 2, 3, 4].map(t => genImageRound(t).shown.length))
  })
  it('strictly harder from tier 0 → 4 for every variant', () => {
    expect(genNumberRound(4).digits.length).toBeGreaterThan(genNumberRound(0).digits.length)
    expect(genColorRound(4).sequence.length).toBeGreaterThan(genColorRound(0).sequence.length)
    expect(genPositionRound(4).grid).toBeGreaterThan(genPositionRound(0).grid)
    expect(genWordRound(4).shown.length).toBeGreaterThan(genWordRound(0).shown.length)
    expect(genImageRound(4).shown.length).toBeGreaterThan(genImageRound(0).shown.length)
  })

  function nonDecreasingAssert(xs: number[]) { expect(nonDecreasing(xs), xs.join(',')).toBe(true) }
})

describe('memorise window grows with set size (never rushed by difficulty)', () => {
  it('bigger tiers get a LONGER memorise window, not shorter', () => {
    expect(memoriseMs(genNumberRound(4))).toBeGreaterThan(memoriseMs(genNumberRound(0)))
    expect(memoriseMs(genColorRound(4))).toBeGreaterThan(memoriseMs(genColorRound(0)))
    expect(memoriseMs(genPositionRound(4))).toBeGreaterThan(memoriseMs(genPositionRound(0)))
    expect(memoriseMs(genWordRound(4))).toBeGreaterThan(memoriseMs(genWordRound(0)))
  })
})

describe('tier clamping', () => {
  it('out-of-range tiers clamp into the 0..4 band', () => {
    expect(genNumberRound(-5).digits.length).toBe(RECALL_DIFFICULTY.number.len[0])
    expect(genNumberRound(99).digits.length).toBe(RECALL_DIFFICULTY.number.len[4])
  })
})
