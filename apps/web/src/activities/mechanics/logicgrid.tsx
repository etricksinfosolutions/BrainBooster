// ---------------------------------------------------------------------------
// Brain Booster Kids — LOGIC GRID mechanic
//
// A single reusable engine that renders FIVE distinct, fully procedural logic
// puzzles as a light pick-an-answer mini-game (visible timer, running score +
// streak, satisfying correct/incorrect feedback). Every round is generated from
// Math.random (or an injected rng), so no two rounds are ever identical and the
// pure generators below can be unit-tested without any DOM.
//
// Which of the five variants renders is decided by `spec.activityId`:
//   logic-pyramid  — each brick = sum of the two below; find the missing brick
//   logic-missing  — a number-pattern grid with one blank cell; pick the piece
//   logic-pattern  — continue a number pattern (longer / compound rule by tier)
//   logic-domino   — find the next domino by its numeric rule
//   logic-deduce   — single-step "A is …er than B" transitive deduction
//
// Difficulty (Rule 2) scales by COMPLEXITY off level.tierIndex (0..4): taller
// pyramids, bigger grids, longer / compound patterns, harder domino rules, more
// deduction clues — never by shortening the timer alone.
// ---------------------------------------------------------------------------
import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { ActivitySpec } from '../types'
import type { LevelDef } from '../../data/levels'
import { useSound, GameTitle, Gfx, Progress, shuffle } from '../../games'
import { formatDuration } from './time'

// ============================================================================
// PURE GENERATORS (exported, DOM-free — unit-tested)
// ============================================================================

export type LogicVariant =
  | 'logic-pyramid'
  | 'logic-missing'
  | 'logic-pattern'
  | 'logic-domino'
  | 'logic-deduce'

/** A ready-to-render round. Exactly one display payload is populated per round;
 *  `options` are the answer choices (all distinct, exactly one correct) and
 *  `answerIndex` points at the correct one. */
export interface LogicRound {
  variant: LogicVariant
  instruction: string
  say: string
  options: string[]
  answerIndex: number
  pyramid?: { rows: (number | null)[][] }          // rows[0] = base (widest)
  matrix?: { rows: (number | null)[][] }            // square grid, one null cell
  sequence?: (number | null)[]                      // last cell is null (the blank)
  dominoes?: { top: number; bottom: number; unknown?: boolean }[]
  deduce?: { clues: string[]; question: string }
}

type Rng = () => number
const clampTier = (t: number) => Math.max(0, Math.min(4, Math.floor(t) || 0))
const randInt = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1))

/** Build `count` DISTINCT plausible integer options around `answer` (one correct). */
function numberOptions(answer: number, rng: Rng, count = 4, spread = 5): { options: string[]; answerIndex: number } {
  const set = new Set<number>([answer])
  let guard = 0
  while (set.size < count && guard++ < 300) {
    const delta = 1 + Math.floor(rng() * spread)
    const cand = answer + (rng() < 0.5 ? -delta : delta)
    if (cand >= 0) set.add(cand)
  }
  // If `answer` sat near 0 and collisions starved us, pad upward deterministically.
  let pad = answer + spread + 1
  while (set.size < count) set.add(pad++)
  const arr = shuffle([...set], rng)
  return { options: arr.map(String), answerIndex: arr.indexOf(answer) }
}

// --- 1. Number Pyramid -------------------------------------------------------
export function generatePyramid(tierIndex: number, rng: Rng = Math.random): LogicRound {
  const tier = clampTier(tierIndex)
  const height = 3 + Math.min(tier, 3)          // 3 → 6 rows: taller with tier
  const baseMax = 4 + tier * 3                   // bigger sums at higher tiers
  const base = Array.from({ length: height }, () => randInt(rng, 1, baseMax))
  const rows: number[][] = [base]
  for (let r = 1; r < height; r++) {
    const prev = rows[r - 1]
    rows.push(prev.slice(0, -1).map((v, i) => v + prev[i + 1]))
  }
  // Low tier: blank the apex (pure "add the two below"). Higher tiers can blank
  // anywhere (a single blank is always uniquely solvable from its neighbours).
  const blankRow = tier === 0 ? height - 1 : Math.floor(rng() * height)
  const blankCol = Math.floor(rng() * rows[blankRow].length)
  const answer = rows[blankRow][blankCol]
  const display: (number | null)[][] = rows.map((row, r) =>
    row.map((v, c) => (r === blankRow && c === blankCol ? null : v)))
  const { options, answerIndex } = numberOptions(answer, rng, 4, Math.max(3, Math.round(baseMax / 2)))
  return {
    variant: 'logic-pyramid',
    instruction: 'Each brick is the two bricks below it added together. What is the missing number?',
    say: 'Each brick equals the two below it added together. Find the missing brick!',
    options, answerIndex,
    pyramid: { rows: display },
  }
}

// --- 2. Missing Piece (number-pattern grid) ----------------------------------
export function generateMissing(tierIndex: number, rng: Rng = Math.random): LogicRound {
  const tier = clampTier(tierIndex)
  const dim = [2, 3, 3, 4, 4][tier]              // bigger grid with tier
  const start = randInt(rng, 1, 6)
  const rowStep = randInt(rng, 1, 2 + tier)
  const colStep = randInt(rng, 1, 2 + tier)
  const grid = Array.from({ length: dim }, (_, r) =>
    Array.from({ length: dim }, (_, c) => start + r * rowStep + c * colStep))
  const br = Math.floor(rng() * dim)
  const bc = Math.floor(rng() * dim)
  const answer = grid[br][bc]
  const display: (number | null)[][] = grid.map((row, r) =>
    row.map((v, c) => (r === br && c === bc ? null : v)))
  const { options, answerIndex } = numberOptions(answer, rng, 4, Math.max(2, rowStep + colStep))
  return {
    variant: 'logic-missing',
    instruction: 'The numbers follow a pattern across the rows and columns. Which piece is missing?',
    say: 'Look at how the numbers grow across and down. Which piece fits the empty square?',
    options, answerIndex,
    matrix: { rows: display },
  }
}

// --- 3. Pattern Completion ---------------------------------------------------
/** Build a length-`n` number pattern whose rule grows harder with tier. Every
 *  rule is deterministic from the first term(s), so the last term is uniquely
 *  determined (that is the answer). */
function buildPattern(tier: number, rng: Rng, n: number): number[] {
  const start = randInt(rng, 1, 6)
  if (tier <= 1) {                               // constant step (bigger at tier 1)
    const step = randInt(rng, 1, tier === 0 ? 4 : 7)
    return Array.from({ length: n }, (_, i) => start + i * step)
  }
  if (tier === 2) {                              // compound: alternating two steps
    const a = randInt(rng, 1, 4), b = randInt(rng, 2, 5)
    const seq = [start]
    for (let i = 1; i < n; i++) seq.push(seq[i - 1] + (i % 2 ? a : b))
    return seq
  }
  if (tier === 3) {                              // compound: step increases each time
    let step = randInt(rng, 1, 3)
    const seq = [start]
    for (let i = 1; i < n; i++) { seq.push(seq[i - 1] + step); step++ }
    return seq
  }
  // tier 4 — geometric growth
  const mult = randInt(rng, 2, 3)
  const seq = [randInt(rng, 1, 3)]
  for (let i = 1; i < n; i++) seq.push(seq[i - 1] * mult)
  return seq
}

export function generatePattern(tierIndex: number, rng: Rng = Math.random): LogicRound {
  const tier = clampTier(tierIndex)
  const n = [4, 5, 6, 6, 6][tier]                // longer sequence with tier
  const seq = buildPattern(tier, rng, n)
  const answer = seq[n - 1]
  const display: (number | null)[] = [...seq.slice(0, n - 1), null]
  const gap = Math.max(2, Math.abs(seq[n - 1] - seq[n - 2]))
  const { options, answerIndex } = numberOptions(answer, rng, 4, Math.min(gap, 24))
  return {
    variant: 'logic-pattern',
    instruction: 'What number comes next in the pattern?',
    say: 'Work out the rule, then choose the number that comes next!',
    options, answerIndex,
    sequence: display,
  }
}

// --- 4. Domino Logic ---------------------------------------------------------
function dominoOptions(top: number, bottom: number, rng: Rng): { options: string[]; answerIndex: number } {
  const key = (a: number, b: number) => `${a}|${b}`
  const keys = new Set<string>([key(top, bottom)])
  let guard = 0
  while (keys.size < 4 && guard++ < 300) {
    const dt = randInt(rng, -2, 2), db = randInt(rng, -2, 2)
    const nt = Math.max(0, top + dt), nb = Math.max(0, bottom + db)
    if (nt === top && nb === bottom) continue
    keys.add(key(nt, nb))
  }
  let p = 1
  while (keys.size < 4) { keys.add(key(top + p, bottom)); p++ }
  const arr = shuffle([...keys], rng)
  return { options: arr, answerIndex: arr.indexOf(key(top, bottom)) }
}

export function generateDomino(tierIndex: number, rng: Rng = Math.random): LogicRound {
  const tier = clampTier(tierIndex)
  const count = 3 + Math.min(tier, 3)            // 3 → 6 dominoes (incl. the unknown)
  const t0 = randInt(rng, 1, 4)
  let tStep: number, bStep: number
  if (tier <= 1) { tStep = randInt(rng, 1, 3); bStep = randInt(rng, 1, 3) }
  else if (tier === 2) { tStep = randInt(rng, 1, 3); bStep = -randInt(rng, 1, 2) }   // opposite directions
  else if (tier === 3) { tStep = randInt(rng, 2, 4); bStep = randInt(rng, 1, 4) }    // bigger steps
  else { tStep = randInt(rng, 1, 4); bStep = randInt(rng, -3, 4) || 2 }              // mixed
  // Keep every pip count >= 0 by lifting the bottom start above the total drop.
  const b0 = randInt(rng, 1, 4) + (bStep < 0 ? count * Math.abs(bStep) : 0)
  const tops = Array.from({ length: count }, (_, i) => t0 + i * tStep)
  const bottoms = Array.from({ length: count }, (_, i) => b0 + i * bStep)
  const dominoes = tops.map((top, i) => ({ top, bottom: bottoms[i], unknown: i === count - 1 }))
  const { options, answerIndex } = dominoOptions(tops[count - 1], bottoms[count - 1], rng)
  return {
    variant: 'logic-domino',
    instruction: 'The dominoes follow a number rule. Which domino comes next?',
    say: 'Look at how the top and bottom numbers change. Which domino comes next?',
    options, answerIndex,
    dominoes,
  }
}

// --- 5. Deductive Reasoning --------------------------------------------------
const DEDUCE_NAMES = ['Mia', 'Leo', 'Ava', 'Max', 'Zoe', 'Sam', 'Ben', 'Lily', 'Noah', 'Emma']
const DEDUCE_RELATIONS = [
  { comp: 'taller than', most: 'Who is the tallest?', least: 'Who is the shortest?' },
  { comp: 'faster than', most: 'Who is the fastest?', least: 'Who is the slowest?' },
  { comp: 'older than', most: 'Who is the oldest?', least: 'Who is the youngest?' },
  { comp: 'stronger than', most: 'Who is the strongest?', least: 'Who is the weakest?' },
]

export function generateDeduce(tierIndex: number, rng: Rng = Math.random): LogicRound {
  const tier = clampTier(tierIndex)
  const k = 3 + tier                              // 3 → 7 people: more clues with tier
  const chosen = shuffle(DEDUCE_NAMES, rng).slice(0, k)   // chosen[0] = greatest … chosen[k-1] = least
  const rel = DEDUCE_RELATIONS[Math.floor(rng() * DEDUCE_RELATIONS.length)]
  // Adjacent comparisons fully determine the order transitively (one clue per gap).
  const clues = shuffle(
    chosen.slice(0, -1).map((name, i) => `${name} is ${rel.comp} ${chosen[i + 1]}.`),
    rng,
  )
  const askMost = rng() < 0.5
  const answerName = askMost ? chosen[0] : chosen[k - 1]
  const question = askMost ? rel.most : rel.least
  // Options: the answer plus distinct other people from this puzzle.
  const optSet = new Set<string>([answerName])
  for (const nm of shuffle(chosen, rng)) { if (optSet.size >= Math.min(4, k)) break; optSet.add(nm) }
  const arr = shuffle([...optSet], rng)
  return {
    variant: 'logic-deduce',
    instruction: 'Read the clues, then work out the answer.',
    say: 'Read each clue carefully, then choose who the answer is.',
    options: arr,
    answerIndex: arr.indexOf(answerName),
    deduce: { clues, question },
  }
}

/** Dispatcher: build a round for any variant at a given tier. */
export function generateLogicRound(variant: LogicVariant, tierIndex: number, rng: Rng = Math.random): LogicRound {
  switch (variant) {
    case 'logic-pyramid': return generatePyramid(tierIndex, rng)
    case 'logic-missing': return generateMissing(tierIndex, rng)
    case 'logic-pattern': return generatePattern(tierIndex, rng)
    case 'logic-domino': return generateDomino(tierIndex, rng)
    case 'logic-deduce': return generateDeduce(tierIndex, rng)
    default: return generatePyramid(tierIndex, rng)
  }
}

// ============================================================================
// RENDERER — one component renders all five variants via config
// ============================================================================

const ROUNDS = 5
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const chip = (extra?: React.CSSProperties): React.CSSProperties => ({
  minWidth: 46, minHeight: 46, padding: '0 8px',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: 'var(--radius, 12px)', fontWeight: 800, fontSize: 20,
  background: 'var(--card, #fff)', color: 'var(--ink, #222)',
  border: '2px solid rgba(0,0,0,0.08)', ...extra,
})
const blankChip = (): React.CSSProperties => chip({
  background: 'color-mix(in srgb, var(--accent, #6c5ce7) 18%, var(--card, #fff))',
  border: '2px dashed var(--accent, #6c5ce7)', color: 'var(--accent, #6c5ce7)',
})

function PyramidView({ rows }: { rows: (number | null)[][] }) {
  // rows[0] is the base; render narrow apex first (top) down to the wide base.
  const view = [...rows].reverse()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }} aria-hidden="false">
      {view.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 6 }}>
          {row.map((v, ci) => (
            <span key={ci} style={v === null ? blankChip() : chip()}
              aria-label={v === null ? 'missing brick' : `brick ${v}`}>
              {v === null ? '?' : v}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

function MatrixView({ rows }: { rows: (number | null)[][] }) {
  const dim = rows.length
  return (
    <div role="grid" aria-label="number pattern grid"
      style={{ display: 'grid', gridTemplateColumns: `repeat(${dim}, 1fr)`, gap: 6, justifyContent: 'center' }}>
      {rows.flatMap((row, r) => row.map((v, c) => (
        <span key={`${r}-${c}`} role="gridcell" style={v === null ? blankChip() : chip()}
          aria-label={v === null ? 'missing piece' : `${v}`}>
          {v === null ? '?' : v}
        </span>
      )))}
    </div>
  )
}

function SequenceView({ sequence }: { sequence: (number | null)[] }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
      {sequence.map((v, i) => (
        <React.Fragment key={i}>
          <span style={v === null ? blankChip() : chip()} aria-label={v === null ? 'what comes next' : `${v}`}>
            {v === null ? '?' : v}
          </span>
          {i < sequence.length - 1 && <span aria-hidden="true" style={{ color: 'var(--ink, #888)', opacity: 0.5 }}>›</span>}
        </React.Fragment>
      ))}
    </div>
  )
}

function DominoTile({ top, bottom, unknown }: { top: number; bottom: number; unknown?: boolean }) {
  const face = (v: number | '?') => (
    <span style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 44, minHeight: 30, fontWeight: 800, fontSize: 18, color: 'var(--ink, #222)',
    }}>{v}</span>
  )
  return (
    <span aria-label={unknown ? 'unknown domino' : `domino ${top} over ${bottom}`}
      style={{
        display: 'inline-flex', flexDirection: 'column',
        borderRadius: 'var(--radius, 12px)', overflow: 'hidden',
        border: `2px ${unknown ? 'dashed' : 'solid'} ${unknown ? 'var(--accent, #6c5ce7)' : 'rgba(0,0,0,0.12)'}`,
        background: unknown ? 'color-mix(in srgb, var(--accent, #6c5ce7) 14%, var(--card, #fff))' : 'var(--card, #fff)',
      }}>
      {face(unknown ? '?' : top)}
      <span style={{ height: 2, background: 'rgba(0,0,0,0.14)' }} aria-hidden="true" />
      {face(unknown ? '?' : bottom)}
    </span>
  )
}

function DominoView({ dominoes }: { dominoes: { top: number; bottom: number; unknown?: boolean }[] }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
      {dominoes.map((d, i) => (
        <React.Fragment key={i}>
          <DominoTile {...d} />
          {i < dominoes.length - 1 && <span aria-hidden="true" style={{ color: 'var(--ink, #888)', opacity: 0.5 }}>›</span>}
        </React.Fragment>
      ))}
    </div>
  )
}

function DeduceView({ clues, question }: { clues: string[]; question: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch', width: '100%', maxWidth: 460 }}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {clues.map((c, i) => (
          <li key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
            borderRadius: 'var(--radius, 12px)', background: 'var(--card, #fff)',
            border: '2px solid rgba(0,0,0,0.06)', fontWeight: 600, color: 'var(--ink, #222)',
          }}>
            <span aria-hidden="true">🔎</span><span>{c}</span>
          </li>
        ))}
      </ul>
      <p style={{ margin: '4px 0 0', fontWeight: 800, fontSize: 18, textAlign: 'center', color: 'var(--ink, #222)' }}>{question}</p>
    </div>
  )
}

function RoundPrompt({ round }: { round: LogicRound }) {
  if (round.pyramid) return <PyramidView rows={round.pyramid.rows} />
  if (round.matrix) return <MatrixView rows={round.matrix.rows} />
  if (round.sequence) return <SequenceView sequence={round.sequence} />
  if (round.dominoes) return <DominoView dominoes={round.dominoes} />
  if (round.deduce) return <DeduceView clues={round.deduce.clues} question={round.deduce.question} />
  return null
}

/** Render one answer option — a domino for the domino variant, else a number/name. */
function OptionLabel({ variant, value }: { variant: LogicVariant; value: string }) {
  if (variant === 'logic-domino') {
    const [t, b] = value.split('|').map(Number)
    return <DominoTile top={t} bottom={b} />
  }
  return <span style={{ fontWeight: 800, fontSize: 22 }}>{value}</span>
}

export function LogicGridGame({ spec, level, onDone }: {
  spec: ActivitySpec
  level: LevelDef
  onDone: (accuracy: number, meta?: { hintsUsed?: number; seenIds?: string[] }) => void
}) {
  const s = useSound()
  const variant = (spec.activityId as LogicVariant)
  const tier = level.tierIndex
  const reduce = useMemo(prefersReducedMotion, [])

  // A fresh, procedurally-generated set of rounds every play (Rule 4).
  const rounds = useMemo(
    () => Array.from({ length: ROUNDS }, () => generateLogicRound(variant, tier)),
    [spec.activityId, level], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [locked, setLocked] = useState(false)
  const [pickedIdx, setPickedIdx] = useState<number | null>(null)
  const [wrongIdx, setWrongIdx] = useState<number | null>(null)
  const firstTryCorrect = useRef(0)
  const roundWrong = useRef(false)
  const doneRef = useRef(false)
  const round = rounds[i]

  // Visible timer counts UP (never the difficulty knob — Rule 2).
  useEffect(() => {
    if (doneRef.current) return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => { if (round) s.say(round.say) }, [i]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!round) return null

  const pick = (idx: number) => {
    if (locked || doneRef.current) return
    if (idx === round.answerIndex) {
      s.good()
      setLocked(true); setPickedIdx(idx)
      setScore(x => x + 10 + streak * 2 + tier * 2)   // combo + tier bonus
      setStreak(st => { const n = st + 1; setBest(b => Math.max(b, n)); return n })
      if (!roundWrong.current) firstTryCorrect.current++
      setTimeout(() => {
        setLocked(false); setPickedIdx(null); setWrongIdx(null); roundWrong.current = false
        if (i + 1 >= rounds.length) {
          doneRef.current = true
          onDone(Math.max(0.3, firstTryCorrect.current / rounds.length))
        } else setI(i + 1)
      }, 820)
    } else {
      s.bad()                                          // plays the invalid tone + 30ms buzz
      setWrongIdx(idx); roundWrong.current = true; setStreak(0)
      setTimeout(() => setWrongIdx(null), 620)
    }
  }

  const optBtnStyle = (idx: number): React.CSSProperties => {
    const isCorrect = locked && idx === round.answerIndex
    const isWrong = wrongIdx === idx
    return {
      minHeight: 66, minWidth: 84, padding: '10px 14px', cursor: locked ? 'default' : 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      borderRadius: 'var(--radius, 14px)', background: 'var(--card, #fff)', color: 'var(--ink, #222)',
      border: `3px solid ${isCorrect ? 'var(--mint, #2ecc71)' : isWrong ? 'var(--danger, #e74c3c)' : 'rgba(0,0,0,0.10)'}`,
      boxShadow: isCorrect ? '0 0 0 3px color-mix(in srgb, var(--mint, #2ecc71) 40%, transparent)' : 'none',
      transform: !reduce && isCorrect ? 'scale(1.06)' : !reduce && isWrong ? 'translateX(-2px)' : 'none',
      transition: reduce ? 'none' : 'transform .12s ease, border-color .12s ease, box-shadow .12s ease',
      position: 'relative',
    }
  }

  return (
    <div className="game-area">
      <GameTitle icon={spec.icon} title={spec.name}
        sub={<span className="game-title-sub">⭐ {score}</span>} />
      <p className="game-hint">
        {round.instruction} · 🔥 Streak {streak}{best > 1 ? ` (best ${best})` : ''} · ⏱ {formatDuration(elapsed)}
      </p>
      <Progress done={i} total={rounds.length} />

      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '18px 12px', margin: '6px 0 4px', minHeight: 120,
      }}>
        <RoundPrompt round={round} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}
        role="group" aria-label="answer choices">
        {round.options.map((opt, idx) => {
          const isCorrect = locked && idx === round.answerIndex
          const isWrong = wrongIdx === idx
          const label = variant === 'logic-domino' ? `domino ${opt.replace('|', ' over ')}` : opt
          return (
            <button key={idx} type="button" style={optBtnStyle(idx)} onClick={() => pick(idx)}
              disabled={locked}
              aria-label={`Answer ${label}${isCorrect ? ', correct' : ''}`}>
              <OptionLabel variant={variant} value={opt} />
              {isCorrect && <span aria-hidden="true" style={{ position: 'absolute', top: -10, right: -8, fontSize: 22 }}>✓</span>}
              {isWrong && <span aria-hidden="true" style={{ position: 'absolute', top: -10, right: -8, fontSize: 22 }}>✗</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LogicGridGame
