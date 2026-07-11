// ---------------------------------------------------------------------------
// Brain Booster Kids — MEMORY RECALL mechanic (id: "recall")
//
// One reusable engine that renders FIVE distinct "show-then-recall" activities:
//   recall-number   — memorise a digit string, then key it back in
//   recall-word     — memorise words, then pick which ones were shown
//   recall-color    — watch a colour sequence, then reproduce it
//   recall-position — tiles light up on a grid, then reproduce the lit cells
//   recall-image    — memorise emoji/images, then pick which appeared
//
// Every variant follows the same rhythm: a brief MEMORISE phase (a shrinking
// timer bar, scaled by tier + set size) → the set hides → a RECALL phase where
// the child reproduces it. A running score / streak and per-round progress give
// it a real mini-game feel. `onDone(accuracy 0..1)` reports the round average.
//
// Difficulty (Rule 2) scales by COMPLEXITY — more digits, more words, longer
// sequences, bigger grids, more decoys — NOT by a shorter clock alone (the
// memorise window actually GROWS with the set so bigger sets stay fair).
//
// All content is procedurally generated every round from a passed-in RNG, so no
// two rounds repeat. The pure generators (genNumberRound … genRecallRound) are
// exported and unit-tested headlessly — they touch no DOM.
// ---------------------------------------------------------------------------
import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { ActivitySpec } from '../types'
import type { LevelDef } from '../../data/levels'
import { useSound, GameTitle, Gfx, Progress, shuffle } from '../../games'
import { sfx, haptics } from '../../state/store'
import { COLORS_CB } from '../../data/content'

type RecallProps = {
  spec: ActivitySpec
  level: LevelDef
  onDone: (accuracy: number, meta?: { hintsUsed?: number; seenIds?: string[] }) => void
}

// ===========================================================================
// PURE GENERATORS (exported, unit-tested — no DOM, deterministic given `rnd`)
// ===========================================================================

export type RecallVariant =
  | 'recall-number' | 'recall-word' | 'recall-color' | 'recall-position' | 'recall-image'

export const RECALL_VARIANTS: RecallVariant[] =
  ['recall-number', 'recall-word', 'recall-color', 'recall-position', 'recall-image']

export type Rng = () => number

/** Clamp a tier to the 0..4 band the difficulty tables are indexed by. */
const t5 = (tier: number) => Math.max(0, Math.min(4, Math.floor(tier)))

/** Per-tier complexity knobs. Higher tier = MORE to remember (Rule 2). */
export const RECALL_DIFFICULTY = {
  number:   { len:   [3, 4, 5, 6, 7] },                 // digits to memorise
  color:    { len:   [3, 4, 5, 6, 7] },                 // sequence length
  position: { grid:  [3, 3, 4, 4, 5], lit: [3, 4, 5, 7, 9] }, // board dim + lit tiles
  word:     { shown: [2, 3, 4, 5, 6], decoys: [2, 3, 3, 4, 5] },
  image:    { shown: [2, 3, 4, 5, 6], decoys: [2, 3, 4, 5, 6] },
} as const

// Distinct, kid-friendly content pools (deduped, plenty for the top tier's
// shown+decoy demand of 11–12 items).
const WORD_POOL = [
  'cat', 'dog', 'sun', 'moon', 'star', 'tree', 'fish', 'bird', 'frog', 'boat',
  'cake', 'ball', 'book', 'shoe', 'milk', 'leaf', 'rock', 'kite', 'drum', 'ring',
  'lion', 'bear', 'duck', 'crab', 'bell', 'nest', 'corn', 'rain',
]
const IMAGE_POOL = [
  '🍎', '🐶', '⭐', '🚗', '🌸', '🐟', '🎈', '🍌', '🐱', '🌙',
  '🍓', '🦋', '🐸', '🚀', '🌈', '🐝', '🍇', '🐢', '🎃', '🦄',
  '🐧', '🍉', '🌻', '🎸',
]

export interface NumberRound { kind: 'number'; tier: number; digits: number[] }
export interface ColorRound { kind: 'color'; tier: number; sequence: number[]; paletteSize: number }
export interface PositionRound { kind: 'position'; tier: number; grid: number; lit: number[] }
export interface SelectRound {
  kind: 'word' | 'image'; tier: number
  shown: string[]; distractors: string[]; options: string[]; correct: string[]
}
export type RecallRound = NumberRound | ColorRound | PositionRound | SelectRound

/** recall-number: a digit string to memorise and key back in. */
export function genNumberRound(tier: number, rnd: Rng = Math.random): NumberRound {
  const len = RECALL_DIFFICULTY.number.len[t5(tier)]
  const digits = Array.from({ length: len }, () => Math.floor(rnd() * 10))
  return { kind: 'number', tier: t5(tier), digits }
}

/** recall-color: a colour sequence (indices into the 4-colour CB palette). */
export function genColorRound(tier: number, rnd: Rng = Math.random): ColorRound {
  const len = RECALL_DIFFICULTY.color.len[t5(tier)]
  const paletteSize = COLORS_CB.length
  const sequence = Array.from({ length: len }, () => Math.floor(rnd() * paletteSize))
  return { kind: 'color', tier: t5(tier), sequence, paletteSize }
}

/** recall-position: which cells of an n×n grid lit up. */
export function genPositionRound(tier: number, rnd: Rng = Math.random): PositionRound {
  const tt = t5(tier)
  const grid = RECALL_DIFFICULTY.position.grid[tt]
  const litCount = Math.min(RECALL_DIFFICULTY.position.lit[tt], grid * grid - 1)
  const cells = shuffle(Array.from({ length: grid * grid }, (_, i) => i), rnd)
  const lit = cells.slice(0, litCount).sort((a, b) => a - b)
  return { kind: 'position', tier: tt, grid, lit }
}

/** Shared builder for the two "which ones did you see?" variants. */
function genSelectRound(kind: 'word' | 'image', pool: readonly string[], tier: number, rnd: Rng): SelectRound {
  const tt = t5(tier)
  const cfg = kind === 'word' ? RECALL_DIFFICULTY.word : RECALL_DIFFICULTY.image
  const picks = shuffle([...pool], rnd)
  const shown = picks.slice(0, cfg.shown[tt])
  const distractors = picks.slice(cfg.shown[tt], cfg.shown[tt] + cfg.decoys[tt])
  const options = shuffle([...shown, ...distractors], rnd)
  return { kind, tier: tt, shown, distractors, options, correct: [...shown] }
}

/** recall-word: memorise words, then pick which were shown (vs distractors). */
export function genWordRound(tier: number, rnd: Rng = Math.random): SelectRound {
  return genSelectRound('word', WORD_POOL, tier, rnd)
}

/** recall-image: memorise emoji, then pick which appeared (vs decoys). */
export function genImageRound(tier: number, rnd: Rng = Math.random): SelectRound {
  return genSelectRound('image', IMAGE_POOL, tier, rnd)
}

/** Single dispatch entry — build the round for a given activity id + tier. */
export function genRecallRound(activityId: string, tier: number, rnd: Rng = Math.random): RecallRound {
  switch (activityId) {
    case 'recall-word': return genWordRound(tier, rnd)
    case 'recall-color': return genColorRound(tier, rnd)
    case 'recall-position': return genPositionRound(tier, rnd)
    case 'recall-image': return genImageRound(tier, rnd)
    case 'recall-number':
    default: return genNumberRound(tier, rnd)
  }
}

/** How long the memorise window stays open (ms) — GROWS with the set so bigger
 *  sets are never unfairly rushed. Never scaled DOWN to add difficulty. */
export function memoriseMs(round: RecallRound): number {
  switch (round.kind) {
    case 'number': return 1400 + round.digits.length * 450
    case 'color': return 700 + round.sequence.length * 720   // one flash per step
    case 'position': return 1600 + round.lit.length * 380
    case 'word':
    case 'image': return 1600 + round.shown.length * 650
  }
}

// ===========================================================================
// SHARED UI BITS
// ===========================================================================

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** A shrinking "memorise!" timer bar. Calls onEnd once when it runs out. */
function MemoriseBar({ ms, onEnd }: { ms: number; onEnd: () => void }) {
  const [left, setLeft] = useState(ms)
  const fired = useRef(false)
  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      const rem = ms - (Date.now() - start)
      setLeft(Math.max(0, rem))
      if (rem <= 0 && !fired.current) { fired.current = true; clearInterval(id); onEnd() }
    }, 60)
    return () => clearInterval(id)
  }, []) // eslint-disable-line
  const pct = clamp01(left / ms) * 100
  return (
    <div aria-hidden="true" style={{
      height: 10, borderRadius: 999, background: 'var(--card)',
      border: '2px solid var(--sky)', overflow: 'hidden', margin: '8px 0',
    }}>
      <div style={{
        width: `${pct}%`, height: '100%', borderRadius: 999,
        background: 'var(--accent)', transition: 'width 60ms linear',
      }} />
    </div>
  )
}

/** Right-hand HUD: current round + running streak. */
function ScoreHud({ round, total, streak }: { round: number; total: number; streak: number }) {
  return (
    <span className="game-title-sub" aria-label={`Round ${round} of ${total}, streak ${streak}`}>
      🎯 {round}/{total} · 🔥 {streak}
    </span>
  )
}

function Banner({ tone, text }: { tone: 'good' | 'bad' | 'info'; text: string }) {
  const bg = tone === 'good' ? 'var(--mint)' : tone === 'bad' ? 'var(--danger)' : 'var(--sky)'
  return (
    <div role="status" style={{
      textAlign: 'center', fontWeight: 700, padding: '8px 12px', borderRadius: 'var(--radius)',
      background: bg, color: 'var(--ink)', minHeight: 20,
    }}>{text}</div>
  )
}

const btnBase: React.CSSProperties = {
  minWidth: 56, minHeight: 56, fontSize: 24, fontWeight: 700, cursor: 'pointer',
  borderRadius: 'var(--radius)', border: '2px solid var(--sky)', background: 'var(--card)',
  color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}

// ===========================================================================
// VARIANT: recall-number
// ===========================================================================
function NumberRecall({ round, onResult }: { round: NumberRound; onResult: (acc: number) => void }) {
  const s = useSound()
  const [phase, setPhase] = useState<'show' | 'recall'>('show')
  const [entry, setEntry] = useState<number[]>([])
  const [locked, setLocked] = useState(false)
  useEffect(() => { s.say('Remember these numbers!') }, []) // eslint-disable-line

  const len = round.digits.length
  const key = (d: number) => { if (locked || entry.length >= len) return; s.tap(); setEntry(e => [...e, d]) }
  const back = () => { if (locked) return; s.tap(); setEntry(e => e.slice(0, -1)) }
  const check = () => {
    if (locked || entry.length !== len) return
    setLocked(true)
    const correct = entry.reduce((n, d, i) => n + (d === round.digits[i] ? 1 : 0), 0)
    const acc = correct / len
    if (acc >= 0.6) s.good(); else { s.bad(); haptics.wrong() }
    setTimeout(() => onResult(acc), 650)
  }

  if (phase === 'show') {
    return (
      <div>
        <p className="game-hint">👀 Memorise this number…</p>
        <MemoriseBar ms={memoriseMs(round)} onEnd={() => { setPhase('recall'); s.say('Now type it back!') }} />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {round.digits.map((d, i) => (
            <span key={i} style={{ ...btnBase, minWidth: 48, minHeight: 62, fontSize: 34, background: 'var(--sky)' }}>{d}</span>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div>
      <p className="game-hint">🔢 Type the number you saw!</p>
      <div aria-label="your answer" style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', margin: '10px 0' }}>
        {Array.from({ length: len }, (_, i) => (
          <span key={i} style={{
            ...btnBase, minWidth: 40, minHeight: 56, fontSize: 30,
            background: entry[i] != null ? 'var(--mint)' : 'var(--card)',
            borderStyle: entry[i] != null ? 'solid' : 'dashed',
          }}>{entry[i] ?? ''}</span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 260, margin: '0 auto' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
          <button key={d} style={btnBase} onClick={() => key(d)} aria-label={`digit ${d}`}>{d}</button>
        ))}
        <button style={{ ...btnBase, fontSize: 18 }} onClick={back} aria-label="backspace">⌫</button>
        <button style={btnBase} onClick={() => key(0)} aria-label="digit 0">0</button>
        <button
          style={{ ...btnBase, background: entry.length === len ? 'var(--accent)' : 'var(--card)', opacity: entry.length === len ? 1 : 0.5 }}
          onClick={check} disabled={entry.length !== len} aria-label="check answer">✓</button>
      </div>
    </div>
  )
}

// ===========================================================================
// VARIANT: recall-color
// ===========================================================================
function ColorRecall({ round, onResult }: { round: ColorRound; onResult: (acc: number) => void }) {
  const s = useSound()
  const [phase, setPhase] = useState<'show' | 'recall'>('show')
  const [lit, setLit] = useState<number | null>(null)
  const [entry, setEntry] = useState<number[]>([])
  const [locked, setLocked] = useState(false)
  const pads = COLORS_CB
  const len = round.sequence.length

  // Play the sequence back, one pad flash at a time.
  useEffect(() => {
    s.say('Watch the colours!')
    const reduced = prefersReducedMotion()
    const step = reduced ? 520 : 720
    const timers: ReturnType<typeof setTimeout>[] = []
    round.sequence.forEach((p, i) => {
      timers.push(setTimeout(() => { setLit(p); sfx.tap() }, 400 + i * step))
      timers.push(setTimeout(() => setLit(null), 400 + i * step + step * 0.6))
    })
    timers.push(setTimeout(() => { setPhase('recall'); s.say('Now your turn!') }, 400 + len * step + 150))
    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line

  const tap = (p: number) => {
    if (phase !== 'recall' || locked) return
    s.tap(); setLit(p); setTimeout(() => setLit(null), 180)
    const next = [...entry, p]
    setEntry(next)
    if (next.length === len) {
      setLocked(true)
      const correct = next.reduce((n, v, i) => n + (v === round.sequence[i] ? 1 : 0), 0)
      const acc = correct / len
      if (acc >= 0.6) s.good(); else { s.bad(); haptics.wrong() }
      setTimeout(() => onResult(acc), 650)
    }
  }

  return (
    <div>
      <p className="game-hint">{phase === 'show' ? '👀 Watch the colour pattern…' : `🌈 Tap the colours in order (${entry.length}/${len})`}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, maxWidth: 260, margin: '10px auto' }}>
        {pads.map((c, i) => (
          <button key={c.name} aria-label={c.name}
            disabled={phase !== 'recall'}
            onClick={() => tap(i)}
            style={{
              height: 96, borderRadius: 'var(--radius)', border: '3px solid var(--ink)',
              background: c.hex, cursor: phase === 'recall' ? 'pointer' : 'default',
              opacity: lit === i ? 1 : 0.72, transform: lit === i ? 'scale(1.06)' : 'scale(1)',
              transition: prefersReducedMotion() ? 'none' : 'opacity 120ms, transform 120ms',
              fontSize: 30, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            {/* shape label so the sequence is distinguishable without colour alone */}
            <span aria-hidden="true">{c.shape}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ===========================================================================
// VARIANT: recall-position
// ===========================================================================
function PositionRecall({ round, onResult }: { round: PositionRound; onResult: (acc: number) => void }) {
  const s = useSound()
  const [phase, setPhase] = useState<'show' | 'recall'>('show')
  const [sel, setSel] = useState<Set<number>>(new Set())
  const [locked, setLocked] = useState(false)
  const litSet = useMemo(() => new Set(round.lit), [round])
  useEffect(() => { s.say('Remember which tiles light up!') }, []) // eslint-disable-line

  const toggle = (i: number) => {
    if (phase !== 'recall' || locked) return
    s.tap()
    setSel(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
  }
  const check = () => {
    if (locked) return
    setLocked(true)
    let correct = 0, wrong = 0
    sel.forEach(i => (litSet.has(i) ? correct++ : wrong++))
    const acc = clamp01((correct - wrong) / round.lit.length)
    if (acc >= 0.6) s.good(); else { s.bad(); haptics.wrong() }
    setTimeout(() => onResult(acc), 650)
  }

  const n = round.grid
  return (
    <div>
      <p className="game-hint">
        {phase === 'show' ? '👀 Memorise the glowing tiles…' : `🟦 Tap the ${round.lit.length} tiles that lit up (${sel.size} picked)`}
      </p>
      {phase === 'show'
        ? <MemoriseBar ms={memoriseMs(round)} onEnd={() => { setPhase('recall'); s.say('Now tap them!') }} />
        : <div style={{ height: 10, margin: '8px 0' }} />}
      <div role="grid" aria-label="memory grid" style={{
        display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 8,
        maxWidth: Math.min(320, n * 72), margin: '0 auto',
      }}>
        {Array.from({ length: n * n }, (_, i) => {
          const showLit = phase === 'show' && litSet.has(i)
          const picked = sel.has(i)
          const reveal = locked && litSet.has(i)
          return (
            <button key={i} onClick={() => toggle(i)} disabled={phase !== 'recall'}
              aria-label={showLit || reveal ? `tile ${i + 1} lit` : `tile ${i + 1}`}
              aria-pressed={picked}
              style={{
                aspectRatio: '1 / 1', borderRadius: 12, border: '3px solid var(--sky)',
                background: showLit || reveal ? 'var(--accent)' : picked ? 'var(--mint)' : 'var(--card)',
                cursor: phase === 'recall' ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                transition: prefersReducedMotion() ? 'none' : 'background 120ms',
              }}>
              {/* symbol (not colour alone) marks lit/picked for CB accessibility */}
              <span aria-hidden="true">{showLit || reveal ? '⭐' : picked ? '●' : ''}</span>
            </button>
          )
        })}
      </div>
      {phase === 'recall' && (
        <button style={{ ...btnBase, width: '100%', maxWidth: 320, margin: '12px auto 0', display: 'flex', background: 'var(--accent)' }}
          onClick={check} aria-label="check answer">Check ✓</button>
      )}
    </div>
  )
}

// ===========================================================================
// VARIANTS: recall-word / recall-image (shared multi-select recall)
// ===========================================================================
function SelectRecall({ round, onResult }: { round: SelectRound; onResult: (acc: number) => void }) {
  const s = useSound()
  const isImage = round.kind === 'image'
  const [phase, setPhase] = useState<'show' | 'recall'>('show')
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [locked, setLocked] = useState(false)
  const correctSet = useMemo(() => new Set(round.correct), [round])
  useEffect(() => { s.say(isImage ? 'Remember these pictures!' : 'Remember these words!') }, []) // eslint-disable-line

  const toggle = (v: string) => {
    if (phase !== 'recall' || locked) return
    s.tap()
    setSel(prev => { const n = new Set(prev); n.has(v) ? n.delete(v) : n.add(v); return n })
  }
  const check = () => {
    if (locked) return
    setLocked(true)
    let correct = 0, wrong = 0
    sel.forEach(v => (correctSet.has(v) ? correct++ : wrong++))
    const acc = clamp01((correct - wrong) / round.correct.length)
    if (acc >= 0.6) s.good(); else { s.bad(); haptics.wrong() }
    setTimeout(() => onResult(acc), 650)
  }

  if (phase === 'show') {
    return (
      <div>
        <p className="game-hint">👀 Memorise {isImage ? 'these pictures' : 'these words'}…</p>
        <MemoriseBar ms={memoriseMs(round)} onEnd={() => { setPhase('recall'); s.say('Which ones did you see?') }} />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', padding: '8px 0' }}>
          {round.shown.map((v, i) => (
            <span key={i} style={{
              ...btnBase, minWidth: 72, minHeight: 60, padding: '6px 12px', fontSize: isImage ? 34 : 20,
              background: 'var(--sky)',
            }}>{isImage ? <Gfx v={v} size={40} /> : v}</span>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div>
      <p className="game-hint">✅ Tap every one you saw ({sel.size} picked)</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxWidth: 340, margin: '10px auto' }}>
        {round.options.map((v, i) => {
          const picked = sel.has(v)
          const reveal = locked && correctSet.has(v)
          return (
            <button key={i} onClick={() => toggle(v)} aria-pressed={picked}
              aria-label={`${isImage ? 'picture' : v}${picked ? '●' : ''}`}
              style={{
                ...btnBase, minHeight: 64, fontSize: isImage ? 32 : 18, position: 'relative',
                background: reveal ? 'var(--accent)' : picked ? 'var(--mint)' : 'var(--card)',
                borderWidth: picked ? 4 : 2,
              }}>
              {isImage ? <Gfx v={v} size={38} /> : v}
              {picked && <span aria-hidden="true" style={{ position: 'absolute', top: 2, right: 6, fontSize: 14 }}>✓</span>}
            </button>
          )
        })}
      </div>
      <button style={{ ...btnBase, width: '100%', maxWidth: 340, margin: '12px auto 0', display: 'flex', background: 'var(--accent)' }}
        onClick={check} aria-label="check answer">Check ✓</button>
    </div>
  )
}

// ===========================================================================
// THE MECHANIC — one renderer, all five variants via config + a round loop
// ===========================================================================
const ROUNDS = 3

export function RecallGame({ spec, level, onDone }: RecallProps) {
  const s = useSound()
  const tier = level.tierIndex
  const variant = (RECALL_VARIANTS.includes(spec.activityId as RecallVariant)
    ? spec.activityId : 'recall-number') as RecallVariant

  const [roundIdx, setRoundIdx] = useState(0)
  const [streak, setStreak] = useState(0)
  const [banner, setBanner] = useState<{ tone: 'good' | 'bad' | 'info'; text: string } | null>(null)
  const scores = useRef<number[]>([])
  const done = useRef(false)

  // Fresh procedural round every time the index advances (no repeats).
  const round = useMemo(() => genRecallRound(variant, tier), [variant, tier, roundIdx])

  const onResult = (acc: number) => {
    if (done.current) return
    scores.current.push(acc)
    const win = acc >= 0.6
    setStreak(st => (win ? st + 1 : 0))
    setBanner(win
      ? { tone: 'good', text: acc >= 0.99 ? 'Perfect memory! 🌟' : 'Nice recall! 🎉' }
      : { tone: 'bad', text: 'Tricky one — keep going! 💪' })
    setTimeout(() => {
      if (roundIdx + 1 >= ROUNDS) {
        done.current = true
        const avg = scores.current.reduce((a, b) => a + b, 0) / scores.current.length
        onDone(clamp01(avg))
      } else {
        setBanner(null)
        setRoundIdx(i => i + 1)
      }
    }, 900)
  }

  return (
    <div className="game-area">
      <GameTitle icon={spec.icon} title={spec.name}
        sub={<ScoreHud round={Math.min(roundIdx + 1, ROUNDS)} total={ROUNDS} streak={streak} />} />
      <Progress done={roundIdx} total={ROUNDS} />
      <Banner tone={banner?.tone ?? 'info'} text={banner?.text ?? 'Look, remember, and recall! 🧠'} />
      {/* key on roundIdx so each round remounts fresh in its 'show' phase */}
      <div key={roundIdx} style={{ marginTop: 10 }}>
        {round.kind === 'number' && <NumberRecall round={round} onResult={onResult} />}
        {round.kind === 'color' && <ColorRecall round={round} onResult={onResult} />}
        {round.kind === 'position' && <PositionRecall round={round} onResult={onResult} />}
        {(round.kind === 'word' || round.kind === 'image') && <SelectRecall round={round} onResult={onResult} />}
      </div>
    </div>
  )
}

export default RecallGame
