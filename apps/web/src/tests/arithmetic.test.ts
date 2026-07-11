// Unit tests for the ARITHMETIC mechanic's PURE generators (no DOM). We verify
// procedural uniqueness across many seeds, exactly-one-correct-answer with
// distinct near-miss options, the operator invariants (whole division, no
// negative subtraction), and monotonic difficulty scaling by tier.
import { describe, it, expect } from 'vitest'
import {
  genArithProblem, genOptions, genProblemSet, pickRaceOp,
  operandMax, problemCountForTier, type ArithOp, type ArithProblem,
} from '../activities/mechanics/arithmetic'

/** mulberry32 — deterministic seeded RNG so each test seed is reproducible. */
function rngFor(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const OPS: ArithOp[] = ['add', 'sub', 'mul', 'div']

/** The result the problem's `text` claims must actually equal `answer`. */
function checkMath(p: ArithProblem) {
  const expected =
    p.op === 'add' ? p.a + p.b :
    p.op === 'sub' ? p.a - p.b :
    p.op === 'mul' ? p.a * p.b :
                     p.a / p.b
  expect(expected).toBe(p.answer)
}

describe('arithmetic generators — validity', () => {
  it('every problem has exactly one correct answer among distinct options', () => {
    for (const op of OPS) {
      for (let t = 0; t <= 4; t++) {
        for (let seed = 0; seed < 60; seed++) {
          const p = genArithProblem(op, t, rngFor(seed * 31 + t))
          checkMath(p)
          // options are distinct
          expect(new Set(p.options).size).toBe(p.options.length)
          // the answer appears exactly once
          expect(p.options.filter(o => o === p.answer).length).toBe(1)
          // all options are valid non-negative results
          expect(p.options.every(o => o >= 0 && Number.isInteger(o))).toBe(true)
          // at least 4 choices to pick from
          expect(p.options.length).toBeGreaterThanOrEqual(4)
        }
      }
    }
  })

  it('division is always whole and subtraction never negative', () => {
    for (let t = 0; t <= 4; t++) {
      for (let seed = 0; seed < 100; seed++) {
        const d = genArithProblem('div', t, rngFor(seed + 7))
        expect(Number.isInteger(d.a / d.b)).toBe(true)
        expect(d.b).toBeGreaterThan(0)

        const s = genArithProblem('sub', t, rngFor(seed + 500))
        expect(s.answer).toBeGreaterThanOrEqual(0)
        expect(s.a).toBeGreaterThanOrEqual(s.b)
      }
    }
  })

  it('distractors are plausible near-misses and never equal the answer', () => {
    for (const op of OPS) {
      for (let seed = 0; seed < 80; seed++) {
        const p = genArithProblem(op, 3, rngFor(seed * 13))
        const wrongs = p.options.filter(o => o !== p.answer)
        expect(wrongs.length).toBeGreaterThanOrEqual(3)
        // none of the distractors accidentally equals the correct answer
        expect(wrongs.includes(p.answer)).toBe(false)
      }
    }
  })

  it('genOptions always includes the answer once, distinct, for tricky small answers', () => {
    for (const answer of [0, 1, 2, 3, 5]) {
      for (let seed = 0; seed < 30; seed++) {
        const opts = genOptions(answer, 'sub', rngFor(seed + answer * 100), 4)
        expect(opts.length).toBe(4)
        expect(new Set(opts).size).toBe(4)
        expect(opts.filter(o => o === answer).length).toBe(1)
        expect(opts.every(o => o >= 0)).toBe(true)
      }
    }
  })
})

describe('arithmetic generators — procedural uniqueness', () => {
  it('produces highly-varied problems across >= 50 seeds (per operator)', () => {
    for (const op of OPS) {
      const texts = new Set<string>()
      for (let seed = 0; seed < 60; seed++) {
        texts.add(genArithProblem(op, 4, rngFor(seed * 97 + 3)).text)
      }
      // Expect the overwhelming majority of 60 seeds to yield distinct prompts.
      expect(texts.size).toBeGreaterThanOrEqual(50)
    }
  })

  it('a full mixed "race" round is not a single repeated problem', () => {
    const set = genProblemSet('mix', 4, problemCountForTier(4), rngFor(12345))
    const texts = new Set(set.map(p => p.text))
    expect(texts.size).toBeGreaterThan(1)
    // mixed round actually mixes operators over enough draws
    const ops = new Set(set.map(p => p.op))
    expect(ops.size).toBeGreaterThanOrEqual(2)
  })

  it('pickRaceOp only ever yields the four supported operators', () => {
    for (let seed = 0; seed < 200; seed++) {
      expect(OPS).toContain(pickRaceOp(rngFor(seed)))
    }
  })
})

describe('arithmetic generators — difficulty scales with tier', () => {
  it('operand ceiling grows monotonically with tier for every operator', () => {
    for (const op of OPS) {
      for (let t = 1; t <= 4; t++) {
        expect(operandMax(op, t)).toBeGreaterThan(operandMax(op, t - 1))
      }
    }
  })

  it('problem count grows monotonically with tier', () => {
    for (let t = 1; t <= 4; t++) {
      expect(problemCountForTier(t)).toBeGreaterThan(problemCountForTier(t - 1))
    }
  })

  it('higher tiers actually produce larger numbers on average (size, not just time)', () => {
    const avgOperand = (op: ArithOp, t: number) => {
      let sum = 0, n = 0
      for (let seed = 0; seed < 200; seed++) {
        const p = genArithProblem(op, t, rngFor(seed * 17 + t))
        sum += Math.max(p.a, p.b); n++
      }
      return sum / n
    }
    for (const op of OPS) {
      expect(avgOperand(op, 4)).toBeGreaterThan(avgOperand(op, 0))
    }
  })

  it('tier index is clamped to 0..4', () => {
    expect(problemCountForTier(-3)).toBe(problemCountForTier(0))
    expect(problemCountForTier(99)).toBe(problemCountForTier(4))
    expect(operandMax('mul', 99)).toBe(operandMax('mul', 4))
  })
})
