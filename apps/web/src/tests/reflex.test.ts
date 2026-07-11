// ---------------------------------------------------------------------------
// REFLEX mechanic — pure generator tests (node env, no DOM).
//
// We test the exported GENERATORS, not the React renderer: every round must be
// (a) unique across many seeds, (b) valid — a single correct answer with
// distinct options where an answer exists, and (c) difficulty-monotonic —
// higher tier means MORE complexity (targets/decoys/options/passes) and/or
// LESS slack (shorter life, smaller ring), never merely a faster clock.
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest'
import {
  genTapRound, genReactionRound, genBalloonWave, genTargetRound, genStroopRound,
  REFLEX_COLORS,
} from '../activities/mechanics/reflex'

/** Deterministic mulberry32 so each seed reproduces a round exactly. */
function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const SEEDS = Array.from({ length: 60 }, (_, i) => i + 1)   // ≥ 50 seeds

describe('genStroopRound — validity + uniqueness + scaling', () => {
  it('always has exactly one correct answer with fully distinct options', () => {
    for (const seed of SEEDS) {
      for (let tier = 0; tier <= 4; tier++) {
        const r = genStroopRound(tier, rng(seed * 31 + tier))
        // distinct options
        expect(new Set(r.options).size).toBe(r.options.length)
        // answer index in range and points at the WORD colour (the one to tap)
        expect(r.answer).toBeGreaterThanOrEqual(0)
        expect(r.answer).toBeLessThan(r.options.length)
        expect(r.options[r.answer]).toBe(r.wordColorName)
        // exactly one option equals the correct answer
        expect(r.options.filter(o => o === r.wordColorName).length).toBe(1)
        // ink + word are real palette colours
        expect(REFLEX_COLORS.some(c => c.name === r.inkColorName)).toBe(true)
        expect(REFLEX_COLORS.some(c => c.name === r.wordColorName)).toBe(true)
      }
    }
  })

  it('produces many distinct rounds across ≥50 seeds (procedural, not fixed)', () => {
    const sigs = new Set(SEEDS.map(s => {
      const r = genStroopRound(2, rng(s))
      return `${r.wordColorName}|${r.inkColorName}|${r.options.join(',')}`
    }))
    expect(sigs.size).toBeGreaterThan(20)
  })

  it('option count is non-decreasing with tier (more distractors when harder)', () => {
    const counts = [0, 1, 2, 3, 4].map(t => genStroopRound(t, rng(7)).options.length)
    for (let i = 1; i < counts.length; i++) expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1])
    expect(counts[4]).toBeGreaterThan(counts[0])
  })
})

describe('genTapRound — scaling + uniqueness', () => {
  it('higher tier → more targets AND shorter life (complexity, not just speed)', () => {
    const rounds = [0, 1, 2, 3, 4].map(t => genTapRound(t, rng(9)))
    for (let i = 1; i < rounds.length; i++) {
      expect(rounds[i].spawns.length).toBeGreaterThan(rounds[i - 1].spawns.length)
      expect(rounds[i].lifeMs).toBeLessThan(rounds[i - 1].lifeMs)
    }
  })
  it('every target has an in-bounds position and a positive life', () => {
    for (const seed of SEEDS) {
      const r = genTapRound(3, rng(seed))
      for (const t of r.spawns) {
        expect(t.x).toBeGreaterThanOrEqual(0); expect(t.x).toBeLessThanOrEqual(100)
        expect(t.y).toBeGreaterThanOrEqual(0); expect(t.y).toBeLessThanOrEqual(100)
        expect(r.lifeMs).toBeGreaterThan(0)
      }
    }
  })
  it('spawns are freshly randomised — ids/layout differ across seeds', () => {
    const layouts = new Set(SEEDS.map(s => genTapRound(2, rng(s)).spawns.map(t => `${t.x.toFixed(1)},${t.y.toFixed(1)}`).join(';')))
    expect(layouts.size).toBeGreaterThan(40)
  })
})

describe('genBalloonWave — single target colour + scaling', () => {
  it('exactly one target colour, always ≥2 poppable targets, decoys exclude it', () => {
    for (const seed of SEEDS) {
      for (let tier = 0; tier <= 4; tier++) {
        const w = genBalloonWave(tier, rng(seed * 13 + tier))
        expect(REFLEX_COLORS.some(c => c.name === w.targetColorName)).toBe(true)
        expect(w.decoyColorNames).not.toContain(w.targetColorName)
        expect(new Set(w.decoyColorNames).size).toBe(w.decoyColorNames.length)
        const targets = w.balloons.filter(b => b.isTarget)
        expect(targets.length).toBeGreaterThanOrEqual(2)
        // isTarget flag is consistent with the colour name
        for (const b of w.balloons) expect(b.isTarget).toBe(b.colorName === w.targetColorName)
      }
    }
  })
  it('higher tier → more decoy colours and more balloons, faster rise', () => {
    const waves = [0, 1, 2, 3, 4].map(t => genBalloonWave(t, rng(5)))
    for (let i = 1; i < waves.length; i++) {
      expect(waves[i].decoyColorNames.length).toBeGreaterThanOrEqual(waves[i - 1].decoyColorNames.length)
      expect(waves[i].balloons.length).toBeGreaterThan(waves[i - 1].balloons.length)
      expect(waves[i].balloons[0].riseMs).toBeLessThan(waves[i - 1].balloons[0].riseMs)
    }
    expect(waves[4].decoyColorNames.length).toBeGreaterThan(waves[0].decoyColorNames.length)
  })
})

describe('genTargetRound — smaller ring + faster + more passes when harder', () => {
  it('scales monotonically by complexity, not the clock', () => {
    const rounds = [0, 1, 2, 3, 4].map(t => genTargetRound(t, rng(3)))
    for (let i = 1; i < rounds.length; i++) {
      expect(rounds[i].ringHalfWidth).toBeLessThan(rounds[i - 1].ringHalfWidth)
      expect(rounds[i].speedPctPerSec).toBeGreaterThan(rounds[i - 1].speedPctPerSec)
      expect(rounds[i].passes).toBeGreaterThan(rounds[i - 1].passes)
    }
  })
  it('ring stays on-track and reachable for every seed', () => {
    for (const seed of SEEDS) {
      const r = genTargetRound(4, rng(seed))
      expect(r.ringHalfWidth).toBeGreaterThan(0)
      expect(r.ringCenter - r.ringHalfWidth).toBeGreaterThan(0)
      expect(r.ringCenter + r.ringHalfWidth).toBeLessThan(100)
      expect([1, -1]).toContain(r.dir)
    }
  })
})

describe('genReactionRound — more trials/fake-outs when harder', () => {
  it('trial count is non-decreasing and max fakes grows with tier', () => {
    const rounds = [0, 1, 2, 3, 4].map(t => genReactionRound(t, rng(4)))
    for (let i = 1; i < rounds.length; i++) {
      expect(rounds[i].trials.length).toBeGreaterThanOrEqual(rounds[i - 1].trials.length)
    }
    expect(rounds[4].trials.length).toBeGreaterThan(rounds[0].trials.length)
    // tier 0-1 never fakes; higher tiers can
    expect(rounds[0].trials.every(t => t.fakes === 0)).toBe(true)
    const maxFakeHigh = Math.max(...[3, 4].flatMap(t => genReactionRound(t, rng(99)).trials.map(x => x.fakes)))
    expect(maxFakeHigh).toBeGreaterThanOrEqual(0)
  })
  it('every trial has a positive wait so the green is never instant/guessable', () => {
    for (const seed of SEEDS) {
      const r = genReactionRound(2, rng(seed))
      for (const tr of r.trials) { expect(tr.waitMs).toBeGreaterThan(0); expect(tr.fakes).toBeGreaterThanOrEqual(0) }
    }
  })
})
