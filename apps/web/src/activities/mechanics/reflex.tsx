// ---------------------------------------------------------------------------
// Brain Booster Kids — REFLEX / SPEED mechanic (mechanic id: "reflex")
//
// One reusable engine that renders FIVE distinct, procedurally-generated,
// difficulty-scaled reflex mini-games. Which variant renders is switched on
// spec.activityId (never a separate mechanic each). Every round is generated
// fresh from Math.random via the exported pure generators below, so no two
// rounds are ever identical — and those generators are unit-testable without a
// DOM. Difficulty scales by COMPLEXITY (more targets, more decoys, smaller
// rings, more colours, faster motion), never by shortening the clock alone.
//
// Colour is NEVER the only signal: every colour carries a text name AND a shape
// glyph, so the games stay solvable for colour-vision-deficient players.
// ---------------------------------------------------------------------------
import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { LevelDef } from '../../data/levels'
import type { ActivitySpec } from '../types'
import { useSound, GameTitle, Gfx } from '../../games'
import { haptics } from '../../state/store'

export interface ReflexProps {
  spec: ActivitySpec
  level: LevelDef
  onDone: (accuracy: number, meta?: { hintsUsed?: number; seenIds?: string[] }) => void
}

// ===========================================================================
// Shared, colour-blind-safe palette. Each colour is identified THREE ways:
// name (text), hex (fill) and shape (glyph) — never colour alone.
// ===========================================================================
export interface ReflexColor { name: string; hex: string; shape: string }
export const REFLEX_COLORS: ReflexColor[] = [
  { name: 'Red',    hex: '#e5484d', shape: '●' },
  { name: 'Blue',   hex: '#3e7bfa', shape: '■' },
  { name: 'Green',  hex: '#2f9e6e', shape: '▲' },
  { name: 'Yellow', hex: '#f5b93e', shape: '◆' },
  { name: 'Purple', hex: '#8e4ec6', shape: '★' },
  { name: 'Orange', hex: '#f76808', shape: '⬢' },
]
const colorByName = (n: string): ReflexColor => REFLEX_COLORS.find(c => c.name === n) ?? REFLEX_COLORS[0]

// --- tiny pure helpers (used by the generators; no DOM, no globals) ---------
const clampTier = (t: number): number => Math.max(0, Math.min(4, Math.floor(t || 0)))
/** Fisher–Yates on a COPY using an injected RNG (defaults to Math.random). */
function rshuffle<T>(arr: readonly T[], rnd: () => number = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}
const uid = (rnd: () => number) => Math.floor(rnd() * 1e9).toString(36)

const ROUND_MS = 24000   // ~24s timed rounds (Rule 5: a real mini-game)

// ===========================================================================
// PURE GENERATORS — every round is built here from an injectable RNG so tests
// can drive them deterministically and assert uniqueness / validity / scaling.
// ===========================================================================

// --- 1. Tap Fast ------------------------------------------------------------
export interface TapTarget { id: string; x: number; y: number; emoji: string; lifeMs: number }
export interface TapRound { lifeMs: number; spawnGapMs: number; spawns: TapTarget[] }
const TAP_EMOJI = ['⭐', '🌟', '💫', '✨', '🔵', '🟢', '🟡', '🟣', '🎯', '🍎', '🎈', '⚡']

/** Higher tier → MORE targets, SHORTER life, tighter spawn gap. */
export function genTapRound(tierIndex: number, rnd: () => number = Math.random): TapRound {
  const t = clampTier(tierIndex)
  const lifeMs = 1500 - t * 200        // 1500 → 700
  const count = 12 + t * 3             // 12 → 24
  const spawnGapMs = 900 - t * 120     // 900 → 420
  const spawns: TapTarget[] = Array.from({ length: count }, () => ({
    id: `tap-${uid(rnd)}`,
    x: 6 + rnd() * 80,
    y: 12 + rnd() * 68,
    emoji: TAP_EMOJI[Math.floor(rnd() * TAP_EMOJI.length)],
    lifeMs,
  }))
  return { lifeMs, spawnGapMs, spawns }
}

// --- 2. Reaction Time -------------------------------------------------------
export interface ReactionTrial { waitMs: number; fakes: number }
export interface ReactionRound { trials: ReactionTrial[] }

/** Higher tier → MORE trials and MORE fake-out flashes to resist. */
export function genReactionRound(tierIndex: number, rnd: () => number = Math.random): ReactionRound {
  const t = clampTier(tierIndex)
  const n = 3 + Math.min(t, 3)         // 3 → 6 trials (non-decreasing)
  const trials: ReactionTrial[] = Array.from({ length: n }, () => ({
    // random suspense so a child can never "time" the green — pure reaction.
    waitMs: 900 + Math.floor(rnd() * 2400),
    fakes: t >= 2 ? Math.floor(rnd() * t) : 0,   // fake pre-flashes only from tier 2
  }))
  return { trials }
}

// --- 3. Balloon Pop ---------------------------------------------------------
export interface Balloon { id: string; colorName: string; isTarget: boolean; x: number; riseMs: number }
export interface BalloonWave { targetColorName: string; decoyColorNames: string[]; balloons: Balloon[] }

/** Higher tier → MORE decoy colours, MORE balloons, FASTER rise (less react time). */
export function genBalloonWave(tierIndex: number, rnd: () => number = Math.random): BalloonWave {
  const t = clampTier(tierIndex)
  const palette = rshuffle(REFLEX_COLORS, rnd)
  const target = palette[0]
  const decoyCount = Math.min(1 + t, palette.length - 1)   // 1 → 5 distinct decoys
  const decoys = palette.slice(1, 1 + decoyCount)
  const balloonCount = 8 + t * 3                            // 8 → 20
  const riseMs = 3600 - t * 400                            // 3600 → 2000
  const balloons: Balloon[] = Array.from({ length: balloonCount }, () => {
    const wantsTarget = rnd() < 0.42
    const src = wantsTarget || decoys.length === 0 ? target : decoys[Math.floor(rnd() * decoys.length)]
    return { id: `b-${uid(rnd)}`, colorName: src.name, isTarget: src.name === target.name, x: 6 + rnd() * 82, riseMs }
  })
  // Guarantee at least two poppable targets so the round is always winnable.
  let targets = balloons.filter(b => b.isTarget).length
  for (let k = 0; targets < 2 && k < balloons.length; k++) {
    if (!balloons[k].isTarget) { balloons[k].colorName = target.name; balloons[k].isTarget = true; targets++ }
  }
  return { targetColorName: target.name, decoyColorNames: decoys.map(d => d.name), balloons }
}

// --- 4. Target Hit ----------------------------------------------------------
export interface TargetRound {
  ringCenter: number; ringHalfWidth: number; speedPctPerSec: number; passes: number; startX: number; dir: 1 | -1
}

/** Higher tier → SMALLER ring, FASTER marker, MORE passes to nail. */
export function genTargetRound(tierIndex: number, rnd: () => number = Math.random): TargetRound {
  const t = clampTier(tierIndex)
  const ringHalfWidth = 15 - t * 2       // 15 → 7 (% of the track)
  const speedPctPerSec = 55 + t * 22     // 55 → 143
  const passes = 4 + t                    // 4 → 8 taps required
  const ringCenter = 40 + rnd() * 20      // 40 → 60 (varies each round)
  const startX = rnd() < 0.5 ? 4 : 96
  const dir: 1 | -1 = startX < 50 ? 1 : -1
  return { ringCenter, ringHalfWidth, speedPctPerSec, passes, startX, dir }
}

// --- 5. Color Switch (Stroop) ----------------------------------------------
export interface StroopRound { wordColorName: string; inkColorName: string; options: string[]; answer: number }

/** A colour WORD painted in a (often different) INK colour. The task is to tap
 *  the colour the WORD SAYS, resisting the ink — text-based, so colour-blind
 *  safe. Higher tier → MORE colours in play and MORE answer options. Always a
 *  single correct answer with fully DISTINCT options. */
export function genStroopRound(tierIndex: number, rnd: () => number = Math.random): StroopRound {
  const t = clampTier(tierIndex)
  const paletteSize = Math.min(REFLEX_COLORS.length, 4 + Math.min(t, 2))   // 4 → 6
  const palette = rshuffle(REFLEX_COLORS, rnd).slice(0, paletteSize)
  const word = palette[Math.floor(rnd() * palette.length)]
  // Conflict (ink ≠ word) grows with tier — more interference to inhibit.
  const conflict = rnd() < (0.45 + t * 0.12)
  let ink = word
  if (conflict) {
    const others = palette.filter(c => c.name !== word.name)
    ink = others[Math.floor(rnd() * others.length)]
  }
  const optionCount = Math.min(paletteSize, 3 + Math.min(t, 3))            // 3 → 6 (≤ palette)
  const distractors = rshuffle(palette.filter(c => c.name !== word.name), rnd).slice(0, optionCount - 1)
  const options = rshuffle([word, ...distractors], rnd).map(c => c.name)
  return { wordColorName: word.name, inkColorName: ink.name, options, answer: options.indexOf(word.name) }
}

// ===========================================================================
// UI — one small HUD + one field per variant. The main <Reflex> component
// switches on spec.activityId. Each sub-component owns its own timers/score so
// hooks stay valid (no conditional hooks).
// ===========================================================================

function Hud({ ratio, score, streak, right }: { ratio: number; score: number; streak: number; right: React.ReactNode }) {
  const combo = streak >= 3
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 12px' }}>
      <div aria-hidden style={{ flex: 1, height: 12, borderRadius: 999, background: 'var(--card,#eef1ff)', overflow: 'hidden', border: '1px solid rgba(0,0,0,.08)' }}>
        <div style={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%`, height: '100%', background: 'var(--accent,#5b7cfa)', transition: 'width .25s linear' }} />
      </div>
      <span style={{ fontWeight: 800, whiteSpace: 'nowrap' }} aria-label={`Score ${score}`}>⭐ {score}</span>
      <span style={{ fontWeight: 800, whiteSpace: 'nowrap', color: combo ? 'var(--mint,#2f9e6e)' : 'var(--ink,#333)' }} aria-label={`Streak ${streak}`}>🔥 {streak}{combo ? '!' : ''}</span>
      <span style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{right}</span>
    </div>
  )
}

const FIELD: React.CSSProperties = {
  position: 'relative', width: '100%', height: 340, borderRadius: 'var(--radius,18px)',
  background: 'var(--sky,#eaf2ff)', overflow: 'hidden', border: '2px solid rgba(0,0,0,.06)',
  touchAction: 'manipulation',
}

// --- Variant 1: Tap Fast ----------------------------------------------------
function TapFast({ onDone, level }: ReflexProps) {
  const s = useSound()
  const round = useMemo(() => genTapRound(level.tierIndex), [level])
  const [live, setLive] = useState<TapTarget[]>([])
  const [hits, setHits] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeMs, setTimeMs] = useState(ROUND_MS)
  const idx = useRef(0)
  const alive = useRef<Set<string>>(new Set())
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const doneRef = useRef(false)

  useEffect(() => { s.say('Tap the shapes before they vanish!') }, []) // eslint-disable-line

  useEffect(() => {
    const spawn = setInterval(() => {
      if (idx.current >= round.spawns.length) return
      const tgt = round.spawns[idx.current++]
      alive.current.add(tgt.id)
      setLive(l => [...l, tgt])
      timers.current[tgt.id] = setTimeout(() => {
        if (!alive.current.has(tgt.id)) return
        alive.current.delete(tgt.id)
        setLive(l => l.filter(x => x.id !== tgt.id))
        setAttempts(a => a + 1); setStreak(0)      // vanished untapped = a miss
      }, round.lifeMs)
    }, round.spawnGapMs)
    return () => clearInterval(spawn)
  }, [round])

  useEffect(() => {
    const clock = setInterval(() => setTimeMs(t => Math.max(0, t - 100)), 100)
    return () => clearInterval(clock)
  }, [])

  useEffect(() => {
    if (doneRef.current) return
    const consumed = idx.current >= round.spawns.length && live.length === 0 && alive.current.size === 0
    if (timeMs <= 0 || consumed) {
      doneRef.current = true
      Object.values(timers.current).forEach(clearTimeout)
      const acc = attempts > 0 ? hits / attempts : 0
      setTimeout(() => onDone(Math.max(0, Math.min(1, acc))), 300)
    }
  }, [timeMs, live, attempts, hits, round, onDone])

  const tap = (t: TapTarget) => {
    if (!alive.current.has(t.id) || doneRef.current) return
    alive.current.delete(t.id); clearTimeout(timers.current[t.id])
    setLive(l => l.filter(x => x.id !== t.id))
    setHits(h => h + 1); setAttempts(a => a + 1); setStreak(k => k + 1)
    s.good()
  }

  return (
    <>
      <p className="game-hint">Tap the shapes before they pop away! ⚡</p>
      <Hud ratio={timeMs / ROUND_MS} score={hits} streak={streak} right={`⏱ ${Math.ceil(timeMs / 1000)}s`} />
      <div style={FIELD} role="application" aria-label="Tap the shapes before they vanish">
        {live.map(t => (
          <button key={t.id} onClick={() => tap(t)} aria-label="target shape" className="reflex-pop"
            style={{
              position: 'absolute', left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%,-50%)',
              minWidth: 64, minHeight: 64, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'var(--card,#fff)', boxShadow: '0 4px 12px rgba(0,0,0,.18)', fontSize: 30,
              display: 'grid', placeItems: 'center', animation: `reflexIn .18s ease-out`,
            }}>
            <Gfx v={t.emoji} size={38} />
          </button>
        ))}
      </div>
    </>
  )
}

// --- Variant 2: Reaction Time -----------------------------------------------
function ReactionTime({ onDone, level }: ReflexProps) {
  const s = useSound()
  const round = useMemo(() => genReactionRound(level.tierIndex), [level])
  const [trial, setTrial] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'wait' | 'go' | 'result'>('idle')
  const [lastMs, setLastMs] = useState<number | null>(null)
  const [hits, setHits] = useState(0)
  const [streak, setStreak] = useState(0)
  const [note, setNote] = useState('Get ready — watch for GREEN!')
  const goAt = useRef(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const hitsRef = useRef(0)
  const doneRef = useRef(false)

  useEffect(() => { s.say('Wait for green, then tap as fast as you can!') }, []) // eslint-disable-line
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }

  const startTrial = () => {
    clearTimers(); setLastMs(null); setPhase('wait'); setNote('Wait for green…')
    const tr = round.trials[trial]
    for (let f = 0; f < tr.fakes; f++) {
      const at = 300 + Math.random() * Math.max(200, tr.waitMs - 300)
      timers.current.push(setTimeout(() => setNote('Nope — not yet! Keep waiting…'), at))
    }
    timers.current.push(setTimeout(() => { setPhase('go'); goAt.current = Date.now(); setNote('TAP NOW!') }, tr.waitMs))
  }

  // Auto-run: each trial starts on its own after a brief "Get ready" beat, so the
  // RED wait → GREEN go sequence appears automatically without the child having to
  // tap a Start button first (they only tap to REACT to the green).
  useEffect(() => {
    if (doneRef.current || phase !== 'idle') return
    setNote('Get ready…')
    const t = setTimeout(() => startTrial(), 800)
    timers.current.push(t)
    return () => clearTimeout(t)
  }, [phase, trial]) // eslint-disable-line

  const advance = (ok: boolean) => {
    setPhase('result')
    if (ok) { hitsRef.current++; setHits(hitsRef.current) }
    const played = trial + 1
    timers.current.push(setTimeout(() => {
      if (doneRef.current) return
      if (played >= round.trials.length) {
        doneRef.current = true
        const acc = round.trials.length ? hitsRef.current / round.trials.length : 0
        setTimeout(() => onDone(Math.max(0, Math.min(1, acc))), 400)
      } else { setTrial(played); setPhase('idle'); setNote('Ready? Tap to start the next one!') }
    }, 900))
  }

  const onTap = () => {
    if (doneRef.current) return
    if (phase === 'idle') { startTrial(); return }
    if (phase === 'wait') { clearTimers(); s.bad(); haptics.wrong(); setStreak(0); setNote('Too soon! False start 🚫'); advance(false); return }
    if (phase === 'go') {
      const took = Date.now() - goAt.current
      setLastMs(took); s.good(); setStreak(k => k + 1)
      setNote(`${took} ms — ${took < 350 ? 'Lightning! ⚡' : took < 550 ? 'Great! 👍' : 'Got it!'}`)
      advance(true)
    }
  }

  const bg = phase === 'go' ? 'var(--mint,#2f9e6e)' : phase === 'wait' ? 'var(--danger,#e5484d)' : 'var(--card,#dfe6ff)'
  // White text reads on the coloured wait/go states; the light idle/result card
  // needs dark ink or the label is invisible (the "blank white screen" bug).
  const fg = phase === 'go' || phase === 'wait' ? '#fff' : 'var(--ink,#2a2350)'
  const bigLabel = phase === 'go' ? 'TAP!' : phase === 'wait' ? 'WAIT' : phase === 'idle' ? 'READY…' : lastMs != null ? `${lastMs} ms` : '—'
  return (
    <>
      <p className="game-hint">Wait for GREEN, then tap instantly. Tapping on RED is a false start! 🚦</p>
      <Hud ratio={trial / round.trials.length} score={hits} streak={streak} right={`${trial + (phase === 'result' ? 1 : 0)}/${round.trials.length}`} />
      <button onClick={onTap} aria-label={`${bigLabel}. ${note}`}
        style={{ ...FIELD, height: 300, border: 'none', cursor: 'pointer', color: fg, background: bg, display: 'grid', placeItems: 'center', transition: 'background .1s' }}>
        <div style={{ textAlign: 'center', padding: 16 }}>
          <div style={{ fontSize: 54, fontWeight: 900, letterSpacing: 1 }}>{bigLabel}</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 10, opacity: .95 }}>{note}</div>
        </div>
      </button>
    </>
  )
}

// --- Variant 3: Balloon Pop -------------------------------------------------
type LiveBalloon = Balloon & { key: string }
function BalloonPop({ onDone, level }: ReflexProps) {
  const s = useSound()
  const wave = useMemo(() => genBalloonWave(level.tierIndex), [level])
  const target = colorByName(wave.targetColorName)
  const [live, setLive] = useState<LiveBalloon[]>([])
  const [hits, setHits] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeMs, setTimeMs] = useState(ROUND_MS)
  const idx = useRef(0)
  const alive = useRef<Set<string>>(new Set())
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const doneRef = useRef(false)

  useEffect(() => { s.say(`Pop the ${wave.targetColorName} balloons and avoid the rest!`) }, []) // eslint-disable-line

  useEffect(() => {
    const gap = Math.max(420, 820 - level.tierIndex * 100)
    const spawn = setInterval(() => {
      const src = wave.balloons[idx.current % wave.balloons.length]; idx.current++
      const key = `${src.id}-${idx.current}`
      alive.current.add(key)
      setLive(l => [...l, { ...src, key }])
      timers.current[key] = setTimeout(() => {
        if (!alive.current.has(key)) return
        alive.current.delete(key)
        setLive(l => l.filter(b => b.key !== key))
        if (src.isTarget) { setAttempts(a => a + 1); setStreak(0) }   // let a target escape = miss
      }, src.riseMs)
    }, gap)
    return () => clearInterval(spawn)
  }, [wave, level])

  useEffect(() => {
    const clock = setInterval(() => setTimeMs(t => Math.max(0, t - 100)), 100)
    return () => clearInterval(clock)
  }, [])

  useEffect(() => {
    if (doneRef.current || timeMs > 0) return
    doneRef.current = true
    Object.values(timers.current).forEach(clearTimeout)
    const acc = attempts > 0 ? hits / attempts : 0
    setTimeout(() => onDone(Math.max(0, Math.min(1, acc))), 300)
  }, [timeMs, attempts, hits, onDone])

  const pop = (b: LiveBalloon) => {
    if (!alive.current.has(b.key) || doneRef.current) return
    alive.current.delete(b.key); clearTimeout(timers.current[b.key])
    setLive(l => l.filter(x => x.key !== b.key)); setAttempts(a => a + 1)
    if (b.isTarget) { s.good(); setHits(h => h + 1); setStreak(k => k + 1) }
    else { s.bad(); haptics.wrong(); setStreak(0) }
  }

  return (
    <>
      <p className="game-hint">
        Pop only the <b style={{ color: target.hex }}>{target.shape} {target.name}</b> balloons — avoid every other colour! 🎈
      </p>
      <Hud ratio={timeMs / ROUND_MS} score={hits} streak={streak} right={`⏱ ${Math.ceil(timeMs / 1000)}s`} />
      <div style={FIELD} role="application" aria-label={`Pop the ${target.name} balloons`}>
        {live.map(b => {
          const c = colorByName(b.colorName)
          return (
            <button key={b.key} onClick={() => pop(b)} aria-label={`${b.colorName} balloon`}
              className="reflex-rise"
              style={{
                position: 'absolute', left: `${b.x}%`, bottom: -70, transform: 'translateX(-50%)',
                width: 52, height: 66, border: 'none', cursor: 'pointer', background: 'transparent', padding: 0,
                animationDuration: `${b.riseMs}ms`,
              }}>
              <span style={{
                display: 'grid', placeItems: 'center', width: 52, height: 62, borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%',
                background: c.hex, color: '#fff', fontSize: 24, boxShadow: 'inset -6px -6px 0 rgba(0,0,0,.12)', fontWeight: 900,
              }}>{c.shape}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}

// --- Variant 4: Target Hit --------------------------------------------------
function TargetHit({ onDone, level }: ReflexProps) {
  const s = useSound()
  const round = useMemo(() => genTargetRound(level.tierIndex), [level])
  const [pos, setPos] = useState(round.startX)
  const [hits, setHits] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [streak, setStreak] = useState(0)
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null)
  const posRef = useRef(round.startX)
  const dir = useRef<1 | -1>(round.dir)
  const hitsRef = useRef(0)
  const attRef = useRef(0)
  const doneRef = useRef(false)

  useEffect(() => { s.say('Tap when the marker is inside the ring!') }, []) // eslint-disable-line

  useEffect(() => {
    const step = 30
    const dp = round.speedPctPerSec * step / 1000
    const mv = setInterval(() => {
      let x = posRef.current + dir.current * dp
      if (x >= 97) { x = 97; dir.current = -1 } else if (x <= 3) { x = 3; dir.current = 1 }
      posRef.current = x; setPos(x)
    }, step)
    return () => clearInterval(mv)
  }, [round])

  const tap = () => {
    if (doneRef.current) return
    const inRing = Math.abs(posRef.current - round.ringCenter) <= round.ringHalfWidth
    attRef.current++; setAttempts(attRef.current)
    if (inRing) { hitsRef.current++; setHits(hitsRef.current); setStreak(k => k + 1); s.good(); setFlash('good') }
    else { setStreak(0); s.bad(); haptics.wrong(); setFlash('bad') }
    setTimeout(() => setFlash(null), 200)
    if (attRef.current >= round.passes) {
      doneRef.current = true
      const acc = hitsRef.current / round.passes
      setTimeout(() => onDone(Math.max(0, Math.min(1, acc))), 400)
    }
  }

  return (
    <>
      <p className="game-hint">Tap when the 🎯 marker is inside the ring zone! Smaller ring = more points.</p>
      <Hud ratio={attempts / round.passes} score={hits} streak={streak} right={`${attempts}/${round.passes}`} />
      <div style={{ ...FIELD, height: 220, display: 'grid', placeItems: 'center' }} aria-label="Target track">
        <div style={{ position: 'relative', width: '92%', height: 70 }}>
          {/* ring zone (labelled RING so it is not colour-only) */}
          <div aria-hidden style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${round.ringCenter - round.ringHalfWidth}%`, width: `${round.ringHalfWidth * 2}%`,
            border: '3px dashed var(--accent,#5b7cfa)', borderRadius: 14, background: 'rgba(91,124,250,.10)',
            display: 'grid', placeItems: 'center', fontWeight: 800, color: 'var(--accent,#5b7cfa)', fontSize: 13,
          }}>RING</div>
          {/* moving marker */}
          <div aria-hidden style={{
            position: 'absolute', top: '50%', left: `${pos}%`, transform: 'translate(-50%,-50%)',
            width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 24,
            background: flash === 'good' ? 'var(--mint,#2f9e6e)' : flash === 'bad' ? 'var(--danger,#e5484d)' : 'var(--card,#fff)',
            boxShadow: '0 3px 10px rgba(0,0,0,.25)', transition: 'background .12s',
          }}>🎯</div>
        </div>
      </div>
      <button onClick={tap} aria-label="Hit the target now"
        style={{ marginTop: 14, width: '100%', minHeight: 64, borderRadius: 'var(--radius,18px)', border: 'none', cursor: 'pointer', fontSize: 24, fontWeight: 900, color: '#fff', background: 'var(--accent,#5b7cfa)' }}>
        HIT! 🎯
      </button>
    </>
  )
}

// --- Variant 5: Color Switch (Stroop) ---------------------------------------
function ColorSwitch({ onDone, level }: ReflexProps) {
  const s = useSound()
  const [round, setRound] = useState<StroopRound>(() => genStroopRound(level.tierIndex))
  const [hits, setHits] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeMs, setTimeMs] = useState(ROUND_MS)
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null)
  const doneRef = useRef(false)

  useEffect(() => { s.say('Tap the colour that the WORD says — ignore the ink!') }, []) // eslint-disable-line
  useEffect(() => {
    const clock = setInterval(() => setTimeMs(t => Math.max(0, t - 100)), 100)
    return () => clearInterval(clock)
  }, [])
  useEffect(() => {
    if (doneRef.current || timeMs > 0) return
    doneRef.current = true
    const acc = attempts > 0 ? hits / attempts : 0
    setTimeout(() => onDone(Math.max(0, Math.min(1, acc))), 300)
  }, [timeMs, attempts, hits, onDone])

  const pick = (name: string) => {
    if (doneRef.current) return
    setAttempts(a => a + 1)
    if (name === round.wordColorName) { s.good(); setHits(h => h + 1); setStreak(k => k + 1); setFlash('good') }
    else { s.bad(); haptics.wrong(); setStreak(0); setFlash('bad') }
    setTimeout(() => setFlash(null), 180)
    setRound(genStroopRound(level.tierIndex))
  }

  const ink = colorByName(round.inkColorName)
  return (
    <>
      <p className="game-hint">Read the WORD and tap that colour — don't be fooled by the ink colour! 🌈</p>
      <Hud ratio={timeMs / ROUND_MS} score={hits} streak={streak} right={`⏱ ${Math.ceil(timeMs / 1000)}s`} />
      <div style={{ ...FIELD, height: 130, display: 'grid', placeItems: 'center', background: flash === 'good' ? 'rgba(47,158,110,.12)' : flash === 'bad' ? 'rgba(229,72,77,.12)' : 'var(--sky,#eaf2ff)', transition: 'background .15s' }}>
        <span aria-label={`The word says ${round.wordColorName}`} style={{ fontSize: 52, fontWeight: 900, color: ink.hex, letterSpacing: 1 }}>
          {round.wordColorName.toUpperCase()}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, round.options.length)}, 1fr)`, gap: 10, marginTop: 14 }}>
        {round.options.map(name => {
          const c = colorByName(name)
          return (
            <button key={name} onClick={() => pick(name)} aria-label={`${name}`}
              style={{ minHeight: 64, borderRadius: 'var(--radius,16px)', border: '2px solid rgba(0,0,0,.08)', cursor: 'pointer', background: 'var(--card,#fff)', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span aria-hidden style={{ width: 26, height: 26, borderRadius: 8, background: c.hex, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 15 }}>{c.shape}</span>
              {c.name}
            </button>
          )
        })}
      </div>
    </>
  )
}

// ===========================================================================
// Scoped animations — injected once (never edits the shared styles.css).
// Respects reduced-motion by flattening the rise/pop to instant.
// ===========================================================================
const REFLEX_CSS = `
@keyframes reflexRise { from { transform: translateX(-50%) translateY(0); } to { transform: translateX(-50%) translateY(-420px); } }
@keyframes reflexIn { from { transform: translate(-50%,-50%) scale(.4); opacity: 0; } to { transform: translate(-50%,-50%) scale(1); opacity: 1; } }
.reflex-rise { animation-name: reflexRise; animation-timing-function: linear; animation-fill-mode: forwards; }
.reflex-pop:active { transform: translate(-50%,-50%) scale(.9) !important; }
@media (prefers-reduced-motion: reduce) {
  .reflex-rise { animation-duration: 3600ms !important; }
  .reflex-pop { animation: none !important; }
}
`

const VARIANTS: Record<string, React.ComponentType<ReflexProps>> = {
  'reflex-tap': TapFast,
  'reflex-reaction': ReactionTime,
  'reflex-balloon': BalloonPop,
  'reflex-target': TargetHit,
  'reflex-colorswitch': ColorSwitch,
}

/**
 * The single mechanic renderer. Registered in MECHANIC_REGISTRY under the
 * mechanic id "reflex"; picks which of the five reflex mini-games to run from
 * spec.activityId. Adding more reflex variants later = more catalog rows here,
 * never touching any other mechanic.
 */
export function Reflex({ spec, level, onDone }: ReflexProps) {
  const Variant = VARIANTS[spec.activityId] ?? TapFast
  return (
    <div className="game-area">
      <style>{REFLEX_CSS}</style>
      <GameTitle icon={spec.icon} title={spec.name} />
      <Variant spec={spec} level={level} onDone={onDone} />
    </div>
  )
}

export default Reflex
