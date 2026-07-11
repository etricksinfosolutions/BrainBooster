// ---------------------------------------------------------------------------
// Brain Booster Kids — ARITHMETIC mechanic
// A fast mental-math mini-game (distinct from the escalating quiz runner). One
// reusable engine renders FIVE procedurally-generated, difficulty-scaled
// variants — Mental Addition, Mental Subtraction, Multiplication Speed,
// Division Challenge and Arithmetic Race (mixed operators). A stream of problems
// plays against a shared timer with a running score and a streak/combo
// multiplier; the child taps the correct answer from near-miss distractors that
// are plausible but never equal the answer. Difficulty scales the operand SIZE
// and the number of problems (Rule 2) — never the clock alone. Every round is
// generated from Math.random (Rule 4); the pure generators below are exported so
// they can be unit-tested without a DOM.
// ---------------------------------------------------------------------------
import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { LevelDef } from '../../data/levels'
import type { ActivitySpec } from '../types'
import { useSound, GameTitle, Progress } from '../../games'
import { haptics } from '../../state/store'

// ===========================================================================
// PURE GENERATORS (unit-tested — no DOM, no React)
// ===========================================================================

export type ArithOp = 'add' | 'sub' | 'mul' | 'div'

/** A single, ready-to-play mental-math problem. */
export interface ArithProblem {
  a: number            // left operand (dividend for division)
  b: number            // right operand (divisor for division)
  op: ArithOp
  symbol: string       // display glyph: + − × ÷
  text: string         // "7 × 8"
  answer: number       // the one correct result
  options: number[]    // shuffled choices — includes `answer`, all distinct, all ≥ 0
}

const clampTier = (t: number) => Math.max(0, Math.min(4, Math.floor(t) || 0))
const SYMBOL: Record<ArithOp, string> = { add: '+', sub: '−', mul: '×', div: '÷' }

/** Number of problems in one round, scaled by tier (grows — Rule 2). Exported
 *  so a test can assert the count rises monotonically with difficulty. */
export function problemCountForTier(tierIndex: number): number {
  return [8, 10, 12, 14, 16][clampTier(tierIndex)]
}

/** The largest operand/factor a variant uses at a given tier. Drives difficulty
 *  by SIZE (bigger numbers = harder mental math), and lets tests assert scaling
 *  is monotonic per operator. */
export function operandMax(op: ArithOp, tierIndex: number): number {
  const t = clampTier(tierIndex)
  switch (op) {
    case 'add':
    case 'sub': return [10, 20, 50, 100, 200][t]   // sum/difference range
    case 'mul': return [5, 6, 9, 12, 15][t]        // factor range
    case 'div': return [5, 6, 9, 12, 15][t]        // divisor / quotient range
  }
}

/** Pick a random operator for the mixed "Arithmetic Race" variant. */
export function pickRaceOp(rng: () => number = Math.random): ArithOp {
  return (['add', 'sub', 'mul', 'div'] as ArithOp[])[Math.floor(rng() * 4)]
}

/** Fisher–Yates using the supplied RNG (kept local so the generators stay pure
 *  and importable by node tests without pulling in React helpers). */
function shuffleWith<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Build `count` answer options for a problem: the correct `answer` plus
 * near-miss distractors that are PLAUSIBLE (small / operator-flavoured slips)
 * but NEVER equal to the answer, all DISTINCT and all ≥ 0. Returns them shuffled.
 */
export function genOptions(
  answer: number,
  op: ArithOp,
  rng: () => number = Math.random,
  count = 4,
): number[] {
  const opts = new Set<number>([answer])
  // Proportional spread so big answers get proportionally-sized near misses,
  // while small answers stay tight (off-by-one/two).
  const spread = Math.max(2, Math.round(Math.abs(answer) * 0.2))
  let guard = 0
  while (opts.size < count && guard++ < 300) {
    const roll = rng()
    let delta: number
    if (roll < 0.55) delta = (rng() < 0.5 ? -1 : 1) * (1 + Math.floor(rng() * 3))          // tight off-by-1..3
    else if (roll < 0.85) delta = (rng() < 0.5 ? -1 : 1) * (1 + Math.floor(rng() * spread)) // proportional slip
    else delta = op === 'add' ? 10 : op === 'mul' ? Math.max(1, answer > 0 ? answer % 7 + 1 : 3) * (rng() < 0.5 ? -1 : 1) : (rng() < 0.5 ? -1 : 1) * (2 + Math.floor(rng() * 4))
    const cand = answer + delta
    if (cand >= 0 && cand !== answer) opts.add(cand)
  }
  // Guaranteed fill for tiny answers where the random walk can starve.
  let up = answer + 1
  while (opts.size < count) { if (up !== answer && up >= 0) opts.add(up); up++ }
  return shuffleWith([...opts], rng)
}

/**
 * Generate ONE arithmetic problem for the given operator + tier. Guarantees:
 *  · subtraction never goes negative (a ≥ b),
 *  · division is always whole (a = b × quotient, answer = quotient),
 *  · exactly one correct option among distinct near-miss distractors.
 */
export function genArithProblem(
  op: ArithOp,
  tierIndex: number,
  rng: () => number = Math.random,
): ArithProblem {
  const t = clampTier(tierIndex)
  const ri = (min: number, max: number) => min + Math.floor(rng() * (max - min + 1))
  let a: number, b: number, answer: number

  if (op === 'add') {
    const max = operandMax('add', t)
    a = ri(1, max); b = ri(1, max); answer = a + b
  } else if (op === 'sub') {
    const max = operandMax('sub', t)
    a = ri(1, max); b = ri(0, a); answer = a - b          // a ≥ b ⇒ never negative
  } else if (op === 'mul') {
    const max = operandMax('mul', t)
    a = ri(2, max); b = ri(2, max); answer = a * b
  } else {
    const maxD = operandMax('div', t)
    b = ri(2, maxD)                                        // divisor ≥ 2
    const q = ri(2, maxD)                                  // quotient (the answer)
    a = b * q; answer = q                                  // a ÷ b = q, always whole
  }

  return { a, b, op, symbol: SYMBOL[op], text: `${a} ${SYMBOL[op]} ${b}`, answer, options: genOptions(answer, op, rng) }
}

/**
 * Generate a full round: `count` problems for a variant. Pass op = 'mix' for the
 * Arithmetic Race (each problem draws a fresh random operator). Exported for
 * uniqueness/validity testing across many seeds.
 */
export function genProblemSet(
  op: ArithOp | 'mix',
  tierIndex: number,
  count: number,
  rng: () => number = Math.random,
): ArithProblem[] {
  return Array.from({ length: count }, () =>
    genArithProblem(op === 'mix' ? pickRaceOp(rng) : op, tierIndex, rng))
}

// ===========================================================================
// VARIANT CONFIG — one component renders all five via spec.activityId
// ===========================================================================

interface VariantCfg { op: ArithOp | 'mix'; verb: string; hint: string }
const VARIANTS: Record<string, VariantCfg> = {
  'math-add':  { op: 'add', verb: 'Add',      hint: 'Add the two numbers as fast as you can!' },
  'math-sub':  { op: 'sub', verb: 'Subtract', hint: 'Take the second number away from the first!' },
  'math-mul':  { op: 'mul', verb: 'Multiply', hint: 'Multiply the two numbers — beat the clock!' },
  'math-div':  { op: 'div', verb: 'Divide',   hint: 'How many times does it go in? Every answer is whole.' },
  'math-race': { op: 'mix', verb: 'Solve',    hint: 'Mixed operators — solve each one before time runs out!' },
}
const cfgFor = (id: string): VariantCfg => VARIANTS[id] ?? VARIANTS['math-add']

const SEC_PER_PROBLEM = 5   // keeps clock proportional to COUNT, not tier — so higher tiers are harder, not merely faster
const prefersReducedMotion = () => {
  try { return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches } catch { return false }
}

// ===========================================================================
// RENDERER
// ===========================================================================

export function ArithmeticGame({ spec, level, onDone }: {
  spec: ActivitySpec
  level: LevelDef
  onDone: (accuracy: number, meta?: { hintsUsed?: number; seenIds?: string[] }) => void
}) {
  const s = useSound()
  const cfg = cfgFor(spec.activityId)
  const total = problemCountForTier(level.tierIndex)

  // Whole round generated up-front from Math.random — no two rounds alike.
  const problems = useMemo(
    () => genProblemSet(cfg.op, level.tierIndex, total),
    [spec.activityId, level.id], // eslint-disable-line
  )

  const [idx, setIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [time, setTime] = useState(total * SEC_PER_PROBLEM)
  const [picked, setPicked] = useState<number | null>(null)   // chosen option value (for feedback flash)
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null)
  const locked = useRef(false)
  const done = useRef(false)
  const reduce = useMemo(prefersReducedMotion, [])

  const cur = problems[idx]
  const combo = 1 + Math.floor(streak / 3)   // ×2 at streak 3, ×3 at 6, …

  useEffect(() => { s.say(cfg.hint) }, []) // eslint-disable-line

  const finish = (finalCorrect: number) => {
    if (done.current) return
    done.current = true
    // Rule: accuracy = correct / total (unanswered problems count against you).
    setTimeout(() => onDone(Math.max(0, finalCorrect / total)), 450)
  }

  // Shared countdown — time's up ends the stream wherever the child is.
  useEffect(() => {
    if (done.current) return
    if (time <= 0) { finish(correct); return }
    const t = setInterval(() => setTime(v => v - 1), 1000)
    return () => clearInterval(t)
  }, [time]) // eslint-disable-line

  const pick = (value: number) => {
    if (locked.current || done.current || !cur) return
    locked.current = true
    setPicked(value)
    const right = value === cur.answer
    if (!right) {
      // Wrong answer: buzz + flash the pick red, but DON'T reveal the correct
      // option and DON'T move on. The child stays on this problem and tries again
      // until they get it right (or the round timer runs out). (#5)
      s.bad(); haptics.wrong()
      setStreak(0); setFlash('bad')
      setTimeout(() => {
        locked.current = false
        setPicked(null); setFlash(null)
      }, 650)
      return
    }
    s.good()
    const gained = 10 * combo
    setScore(v => v + gained)
    const ns = streak + 1
    setStreak(ns); setBest(b => Math.max(b, ns))
    setCorrect(c => c + 1)
    setFlash('good')
    const advance = () => {
      locked.current = false
      setPicked(null); setFlash(null)
      const next = idx + 1
      if (next >= problems.length) finish(correct + 1)
      else setIdx(next)
    }
    setTimeout(advance, 420)
  }

  if (!cur) return null

  const ink = 'var(--ink)'
  const timeLow = time <= 5
  const optBg = (v: number) => {
    if (picked == null) return 'var(--card)'
    // Only ever highlight the child's OWN pick: green when it's right, red when
    // it's wrong. The correct answer is never revealed on a wrong guess (#5).
    if (v === picked) return picked === cur.answer ? 'var(--mint)' : 'var(--danger)'
    return 'var(--card)'
  }

  return (
    <div className="game-area">
      <GameTitle
        icon={spec.icon}
        title={spec.name}
        sub={<span className="game-title-sub" aria-label={`${time} seconds left`} style={{ color: timeLow ? 'var(--danger)' : undefined, fontWeight: 800 }}>⏱ {time}s</span>}
      />

      {/* Live status: score + streak/combo — the running mini-game feel (Rule 5) */}
      <div
        aria-live="polite"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, margin: '2px 0 8px', fontWeight: 800, color: ink }}
      >
        <span aria-label={`Score ${score}`}>⭐ {score}</span>
        <span
          aria-label={combo > 1 ? `Streak ${streak}, combo times ${combo}` : `Streak ${streak}`}
          style={{
            padding: '2px 12px', borderRadius: 'var(--radius)',
            background: combo > 1 ? 'var(--accent)' : 'var(--card)',
            color: combo > 1 ? '#fff' : ink,
            transition: reduce ? undefined : 'transform .15s',
            transform: reduce ? undefined : (flash === 'good' && combo > 1 ? 'scale(1.12)' : 'scale(1)'),
          }}
        >
          🔥 {streak}{combo > 1 ? ` ·×${combo}` : ''}
        </span>
      </div>

      <Progress done={idx} total={problems.length} />

      {/* The problem — big, high-contrast, screen-reader friendly */}
      <div
        className="prompt-card"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '18px 12px' }}
      >
        <p className="game-hint" style={{ margin: 0 }}>{cfg.hint}</p>
        <div
          role="math"
          aria-label={`${cur.a} ${cfg.verb.toLowerCase()} ${cur.b}`}
          style={{ fontSize: 'clamp(34px, 9vw, 56px)', fontWeight: 900, color: ink, letterSpacing: 1 }}
        >
          {cur.text} <span aria-hidden="true">= ?</span>
        </div>
      </div>

      {/* Answer options — plausible near-miss distractors, exactly one correct */}
      <div
        className="options-grid"
        role="group"
        aria-label="Choose the correct answer"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 10 }}
      >
        {cur.options.map((v, i) => {
          const isAnswer = picked != null && v === cur.answer
          const isWrongPick = picked != null && v === picked && v !== cur.answer
          return (
            <button
              key={i}
              className="option-btn"
              onClick={() => pick(v)}
              disabled={picked != null}
              aria-label={`Answer ${v}${isAnswer ? ' (correct)' : ''}${isWrongPick ? ' (incorrect)' : ''}`}
              style={{
                minHeight: 64, fontSize: 'clamp(22px, 6vw, 30px)', fontWeight: 800,
                borderRadius: 'var(--radius)', color: ink,
                background: optBg(v),
                border: `3px solid ${isAnswer ? 'var(--mint)' : isWrongPick ? 'var(--danger)' : 'var(--sky)'}`,
                transition: reduce ? undefined : 'transform .12s, background .15s',
                transform: reduce ? undefined : (isWrongPick ? 'translateX(0)' : 'none'),
                cursor: picked != null ? 'default' : 'pointer',
              }}
            >
              {/* shape/label prefix keeps correct/incorrect legible without relying on colour (Rule 8) */}
              {isAnswer ? '✓ ' : isWrongPick ? '✗ ' : ''}{v}
            </button>
          )
        })}
      </div>

      <p className="game-meta" style={{ textAlign: 'center', marginTop: 10, color: ink }}>
        {correct}/{total} correct · best streak {best} 🔥
      </p>
    </div>
  )
}

export default ArithmeticGame
