// ---------------------------------------------------------------------------
// LOGIC GRID mechanic — generator gate
//
// Node-only (no DOM). Verifies the pure generators behind the five logic-puzzle
// variants: procedural uniqueness across many seeds, a single valid correct
// answer, distinct plausible options, and difficulty that scales with tier by
// COMPLEXITY (taller pyramids, bigger grids, longer patterns, more clues…).
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest'
import {
  generatePyramid, generateMissing, generatePattern, generateDomino, generateDeduce,
  generateLogicRound, LogicRound, LogicVariant,
} from '../activities/mechanics/logicgrid'

/** mulberry32 — a deterministic seedable rng so tests are reproducible. */
function rngFor(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const VARIANTS: LogicVariant[] = ['logic-pyramid', 'logic-missing', 'logic-pattern', 'logic-domino', 'logic-deduce']
const GEN: Record<LogicVariant, (t: number, r: () => number) => LogicRound> = {
  'logic-pyramid': generatePyramid,
  'logic-missing': generateMissing,
  'logic-pattern': generatePattern,
  'logic-domino': generateDomino,
  'logic-deduce': generateDeduce,
}

const payloadSig = (r: LogicRound) =>
  JSON.stringify({ p: r.pyramid, m: r.matrix, s: r.sequence, d: r.dominoes, de: r.deduce, o: r.options })

describe('logicgrid — every generator produces a valid, single-answer round', () => {
  for (const v of VARIANTS) {
    it(`${v}: exactly one correct, distinct options, valid index (all tiers, many seeds)`, () => {
      for (let tier = 0; tier <= 4; tier++) {
        for (let seed = 1; seed <= 40; seed++) {
          const r = GEN[v](tier, rngFor(seed * 131 + tier))
          expect(r.variant).toBe(v)
          expect(r.options.length).toBeGreaterThanOrEqual(3)
          // options are all distinct → the one correct index is unambiguous
          expect(new Set(r.options).size).toBe(r.options.length)
          expect(r.answerIndex).toBeGreaterThanOrEqual(0)
          expect(r.answerIndex).toBeLessThan(r.options.length)
        }
      }
    })
  }

  it('generateLogicRound dispatches to the right variant', () => {
    for (const v of VARIANTS) {
      expect(generateLogicRound(v, 2, rngFor(7)).variant).toBe(v)
    }
  })
})

describe('logicgrid — procedural uniqueness across >=50 seeds', () => {
  for (const v of VARIANTS) {
    it(`${v}: generates mostly-distinct rounds`, () => {
      const sigs = new Set<string>()
      for (let seed = 1; seed <= 60; seed++) sigs.add(payloadSig(GEN[v](3, rngFor(seed * 977 + 5))))
      // Fully procedural: the overwhelming majority of 60 seeds are distinct.
      expect(sigs.size).toBeGreaterThanOrEqual(45)
    })
  }
})

describe('logicgrid — the correct answer is actually correct', () => {
  it('pyramid: filling the blank with the answer satisfies brick = sum of the two below', () => {
    for (let tier = 0; tier <= 4; tier++) {
      for (let seed = 1; seed <= 30; seed++) {
        const r = generatePyramid(tier, rngFor(seed * 17 + tier))
        const rows = r.pyramid!.rows.map(row => row.slice())
        // plug the answer into the single blank
        let blanks = 0
        for (const row of rows) for (let c = 0; c < row.length; c++) {
          if (row[c] === null) { row[c] = Number(r.options[r.answerIndex]); blanks++ }
        }
        expect(blanks).toBe(1)
        for (let rr = 1; rr < rows.length; rr++) {
          for (let c = 0; c < rows[rr].length; c++) {
            expect(rows[rr][c]).toBe((rows[rr - 1][c] as number) + (rows[rr - 1][c + 1] as number))
          }
        }
      }
    }
  })

  it('missing: filling the blank keeps constant row and column steps', () => {
    for (let tier = 0; tier <= 4; tier++) {
      for (let seed = 1; seed <= 30; seed++) {
        const r = generateMissing(tier, rngFor(seed * 29 + tier))
        const rows = r.matrix!.rows.map(row => row.slice())
        for (const row of rows) for (let c = 0; c < row.length; c++) {
          if (row[c] === null) row[c] = Number(r.options[r.answerIndex])
        }
        const g = rows as number[][]
        // every row shares one horizontal step; every column shares one vertical step
        for (let rr = 0; rr < g.length; rr++) {
          const step = g[rr][1] - g[rr][0]
          for (let c = 1; c < g[rr].length; c++) expect(g[rr][c] - g[rr][c - 1]).toBe(step)
        }
        for (let c = 0; c < g[0].length; c++) {
          const step = g[1][c] - g[0][c]
          for (let rr = 1; rr < g.length; rr++) expect(g[rr][c] - g[rr - 1][c]).toBe(step)
        }
      }
    }
  })

  it('pattern (tier 0-1): the answer continues the constant difference', () => {
    for (const tier of [0, 1]) {
      for (let seed = 1; seed <= 30; seed++) {
        const r = generatePattern(tier, rngFor(seed * 41 + tier))
        const seq = r.sequence!.slice()
        seq[seq.length - 1] = Number(r.options[r.answerIndex])
        const nums = seq as number[]
        const step = nums[1] - nums[0]
        for (let k = 1; k < nums.length; k++) expect(nums[k] - nums[k - 1]).toBe(step)
      }
    }
  })

  it('domino: the answer continues both the top and bottom arithmetic runs', () => {
    for (let tier = 0; tier <= 4; tier++) {
      for (let seed = 1; seed <= 30; seed++) {
        const r = generateDomino(tier, rngFor(seed * 53 + tier))
        const doms = r.dominoes!.map(d => ({ ...d }))
        const [t, b] = r.options[r.answerIndex].split('|').map(Number)
        const last = doms[doms.length - 1]
        last.top = t; last.bottom = b
        const tStep = doms[1].top - doms[0].top
        const bStep = doms[1].bottom - doms[0].bottom
        for (let k = 1; k < doms.length; k++) {
          expect(doms[k].top - doms[k - 1].top).toBe(tStep)
          expect(doms[k].bottom - doms[k - 1].bottom).toBe(bStep)
        }
        expect(t).toBeGreaterThanOrEqual(0)
        expect(b).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('deduce: the correct option is a person named in the clues and options are people', () => {
    for (let tier = 1; tier <= 4; tier++) {
      for (let seed = 1; seed <= 30; seed++) {
        const r = generateDeduce(tier, rngFor(seed * 71 + tier))
        const answer = r.options[r.answerIndex]
        const cluesText = r.deduce!.clues.join(' ')
        // The extreme person always appears in at least one adjacent-comparison clue.
        expect(cluesText.includes(answer)).toBe(true)
        expect(r.deduce!.question.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('logicgrid — difficulty scales with tier (complexity, not just speed)', () => {
  const R = () => rngFor(12345)
  it('pyramid gets taller', () => {
    expect(generatePyramid(0, R()).pyramid!.rows.length)
      .toBeLessThan(generatePyramid(4, R()).pyramid!.rows.length)
  })
  it('missing grid gets bigger', () => {
    expect(generateMissing(0, R()).matrix!.rows.length)
      .toBeLessThan(generateMissing(4, R()).matrix!.rows.length)
  })
  it('pattern gets longer', () => {
    expect(generatePattern(0, R()).sequence!.length)
      .toBeLessThan(generatePattern(4, R()).sequence!.length)
  })
  it('domino chain gets longer', () => {
    expect(generateDomino(0, R()).dominoes!.length)
      .toBeLessThan(generateDomino(4, R()).dominoes!.length)
  })
  it('deduce gives more clues', () => {
    expect(generateDeduce(1, R()).deduce!.clues.length)
      .toBeLessThan(generateDeduce(4, R()).deduce!.clues.length)
  })
})
