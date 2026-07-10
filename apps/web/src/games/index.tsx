// ---------------------------------------------------------------------------
// Brain Booster Kids — game components
// Every game receives its LevelDef and reports (accuracy 0..1) when finished.
// Challenges are freshly generated on every play (including replays), so a
// child who revisits a level always gets a new board / sequence / question
// set with shuffled options. All pictorial content renders as real artwork
// via <Gfx> (web images with native-emoji fallback), never raw emoji glyphs.
// ---------------------------------------------------------------------------
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { GameKind, LevelDef } from '../data/levels'
import { WORDS, MEMORY_EMOJI, FRUITS, NOT_FRUITS, COLORS_CB } from '../data/content'
import { storiesForThemes } from '../data/stories'
import { themeEmojis, worldForLevel } from '../data/worlds'
import { themeFor } from '../theme'
import { buildLevelQuestions, Question, DIFFICULTY_LABELS } from '../data/questions'
import { sfx, speak, useStore, randomEncourage, HINT_COST } from '../state/store'
import { track } from '../analytics'
import { EmojiImg } from '../components/emoji'
import { UiIcon } from '../components/art'
import { Sprite } from '../assets/Sprite'

/** Game content renderer: every pictorial token becomes a professionally
 *  illustrated sprite from the Asset Engine (never a raw emoji glyph), while
 *  plain text (numbers, words, "?") stays text. This is the single choke point
 *  all activities route their imagery through. */
const isGlyph = (v: string) => /[^\u0000-\u00ff]/.test(v)
export function Gfx({ v, size = 36, fill }: { v: string; size?: number; fill?: boolean }) {
  return isGlyph(v) ? <Sprite token={v} size={size} fill={fill} /> : <span className={fill ? 'gfx-text-fill' : undefined}>{v}</span>
}

export interface GameMeta { hintsUsed?: number; seenIds?: string[] }
export interface GameProps { level: LevelDef; onDone: (accuracy: number, meta?: GameMeta) => void }

// Prominent screen title so a child always knows what to do (spec #5).
export const GAME_HEAD: Record<GameKind, { icon: string; title: string }> = {
  'memory-flip': { icon: '🧠', title: 'Memory Match' },
  'memory-sequence': { icon: '🎵', title: 'Repeat the Sequence' },
  'math': { icon: '➕', title: 'Math Challenge' },
  'odd-one-out': { icon: '🕵️', title: 'Find the Odd One' },
  'shadow-match': { icon: '🎯', title: 'Shadow Matching' },
  'flags': { icon: '🌍', title: 'Guess the Flag' },
  'pattern': { icon: '🧩', title: 'Complete the Pattern' },
  'missing-number': { icon: '🔢', title: 'Missing Number' },
  'spell': { icon: '🔤', title: 'Fill in the Blanks' },
  'opposites': { icon: '🔄', title: 'Opposite Day' },
  'riddle': { icon: '🤔', title: 'Riddle Time' },
  'story': { icon: '📖', title: 'Story Time' },
  'quick-tap': { icon: '🍓', title: 'Fruit Frenzy' },
  'quick-count': { icon: '⭐', title: 'Star Counter' },
}

export function GameTitle({ icon, title, sub }: { icon: string; title: string; sub?: React.ReactNode }) {
  return (
    <div className="game-title-bar">
      <span className="game-title-icon"><Gfx v={icon} size={30} /></span>
      <span className="game-title-text">{title}</span>
      {sub}
    </div>
  )
}

/** Fresh shuffle on every call — replays never see the same arrangement. */
export const shuffle = <T,>(arr: T[], rnd: () => number = Math.random) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

export function useSound() {
  const { state } = useStore()
  const on = state.settings.sound
  const voice = state.settings.voice
  return {
    tap: () => on && sfx.tap(),
    good: () => on && sfx.good(),
    bad: () => on && sfx.bad(),
    say: (t: string) => speak(t, voice),
  }
}

// --- Shared bits -------------------------------------------------------------

export function Progress({ done, total }: { done: number; total: number }) {
  return (
    <div className="progress-row" aria-label={`Question ${Math.min(done + 1, total)} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`progress-dot ${i < done ? 'is-done' : ''}`} />
      ))}
    </div>
  )
}

function Feedback({ kind, text }: { kind: 'good' | 'bad' | null; text: string }) {
  if (!kind) return <div className="feedback" aria-hidden="true">&nbsp;</div>
  return <div className={`feedback feedback-${kind}`} role="status">{text}</div>
}

// --- Correct-answer celebration ------------------------------------------------
// Spoken cheer + a burst of party poppers so every right answer feels like a win.

const CELEBRATE = [
  'Congratulations! You gave the correct answer!',
  'Well done! That is correct!',
  'Hooray! You got it right!',
  'Amazing! Correct answer!',
  'Fantastic! That is right!',
  'Brilliant! You nailed it!',
]
export const randomCelebrate = () => CELEBRATE[Math.floor(Math.random() * CELEBRATE.length)]

/** A quick shower of party poppers + confetti, keyed to `trigger` so each
 *  correct answer re-fires the burst. Purely decorative, GPU-friendly. */
export function PartyPop({ trigger }: { trigger: number }) {
  const bits = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const fromLeft = i % 2 === 0
    const ang = (fromLeft ? -55 : 55) + (Math.random() * 50 - 25)
    const dist = 120 + Math.random() * 160
    const rad = (ang - 90) * Math.PI / 180
    return {
      emoji: ['🎉', '🎊', '✨', '⭐', '🎈'][i % 5],
      left: fromLeft ? 8 + Math.random() * 12 : 80 + Math.random() * 12,
      dx: Math.cos(rad) * dist, dy: Math.sin(rad) * dist,
      rot: Math.random() * 540 - 270, size: 20 + Math.random() * 16,
      delay: Math.random() * 0.08,
    }
  }), [trigger])
  if (!trigger) return null
  return (
    <div className="party-pop" key={trigger} aria-hidden="true">
      {bits.map((b, i) => (
        <span key={i} style={{
          left: `${b.left}%`, fontSize: b.size,
          ['--dx' as any]: `${b.dx}px`, ['--dy' as any]: `${b.dy}px`,
          ['--r' as any]: `${b.rot}deg`, animationDelay: `${b.delay}s`,
        }}>{b.emoji}</span>
      ))}
    </div>
  )
}

/** Generic multiple-choice round runner used by half the games. */
function MCQ({ rounds, onDone, big }: {
  rounds: { prompt: React.ReactNode; say?: string; options: React.ReactNode[]; answer: number; explain?: string }[]
  onDone: (accuracy: number) => void
  big?: boolean
}) {
  const [i, setI] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [fb, setFb] = useState<{ kind: 'good' | 'bad' | null; text: string }>({ kind: null, text: '' })
  const [locked, setLocked] = useState(false)
  const [pop, setPop] = useState(0)
  const s = useSound()
  const round = rounds[i]

  useEffect(() => { if (round?.say) s.say(round.say) }, [i]) // eslint-disable-line

  if (!round) return null

  const pick = (idx: number) => {
    if (locked) return
    setAttempts(a => a + 1)
    if (idx === round.answer) {
      s.good(); setLocked(true); setPop(p => p + 1); s.say(randomCelebrate())
      setCorrect(c => c + 1)
      setFb({ kind: 'good', text: round.explain ?? 'Correct! 🎉' })
      setTimeout(() => {
        setFb({ kind: null, text: '' }); setLocked(false)
        if (i + 1 >= rounds.length) onDone((correct + 1) / (attempts + 1))
        else setI(i + 1)
      }, 900)
    } else {
      s.bad()
      setFb({ kind: 'bad', text: randomEncourage() })
      setTimeout(() => setFb({ kind: null, text: '' }), 900)
    }
  }

  return (
    <div className="game-area">
      <PartyPop trigger={pop} />
      <Progress done={i} total={rounds.length} />
      <div className="prompt-card">{round.prompt}</div>
      <Feedback kind={fb.kind} text={fb.text} />
      <div className={`options-grid ${big ? 'options-big' : ''}`}>
        {round.options.map((o, idx) => (
          <button key={idx} className="option-btn" onClick={() => pick(idx)}>{o}</button>
        ))}
      </div>
    </div>
  )
}

// --- Coin-gated hint bar (spec #6) — collapsed at the bottom, 25 coins -------

function HintBar({ hint, onUsed }: { hint: string; onUsed: () => void }) {
  const { state, dispatch } = useStore()
  const coins = state.profile.coins
  const [stage, setStage] = useState<'closed' | 'confirm' | 'revealed'>('closed')
  useEffect(() => { setStage('closed') }, [hint])
  return (
    <div className="hint-bar">
      {stage === 'revealed' ? (
        <div className="hint-revealed"><span className="hint-lamp"><EmojiImg emoji="💡" size={22} /></span> {hint}</div>
      ) : stage === 'confirm' ? (
        <div className="hint-confirm">
          {coins >= HINT_COST ? (
            <>
              <span>Unlock this hint for <b><UiIcon name="coin" emoji="🪙" size={16} alt="coins" /> {HINT_COST}</b>?</span>
              <span className="hint-actions">
                <button className="btn btn-primary" onClick={() => { sfx.coin(); dispatch({ type: 'use-hint' }); track('hint_used', { cost: HINT_COST }); onUsed(); setStage('revealed') }}>Yes</button>
                <button className="btn btn-ghost" onClick={() => { sfx.tap(); setStage('closed') }}>No</button>
              </span>
            </>
          ) : (
            <>
              <span>Not enough coins — you have <UiIcon name="coin" emoji="🪙" size={16} alt="coins" /> {coins}. Finish levels or watch an ad to earn more!</span>
              <button className="btn btn-ghost" onClick={() => { sfx.tap(); setStage('closed') }}>OK</button>
            </>
          )}
        </div>
      ) : (
        <button className="hint-toggle" onClick={() => { sfx.tap(); setStage('confirm') }}>
          <EmojiImg emoji="💡" size={18} /> Need a hint? <span className="hint-cost"><UiIcon name="coin" emoji="🪙" size={14} alt="coins" /> {HINT_COST}</span>
        </button>
      )}
    </div>
  )
}

/** Renders one question's prompt (text / big media / shadow / pattern / count). */
function QuestionPrompt({ q }: { q: Question }) {
  return (
    <div className="prompt-card">
      {q.media && <span className={q.mediaShadow ? 'shadow-target' : 'flag-big'} aria-label="picture clue"><Gfx v={q.media} size={86} /></span>}
      {q.seq && <div className="pattern-row">{q.seq.map((e, i) => <span key={i} className={e === '?' ? 'pattern-blank' : ''}><Gfx v={e} size={38} /></span>)}</div>}
      {q.countItems && <div className="count-field">{q.countItems.map((e, i) => <span key={i}><Gfx v={e} size={34} /></span>)}</div>}
      <p className="prompt-text">{q.prompt}</p>
    </div>
  )
}

// --- Unified quiz: SIX questions of increasing difficulty, no repeats (spec #1,#2)

export function QuestionRunner({ level, onDone, category }: GameProps & { category?: import('../data/questions').QCategory }) {
  const { state } = useStore()
  const s = useSound()
  const seen = useMemo(() => new Set(state.profile.seenQuestions), []) // eslint-disable-line
  const questions = useMemo(() => buildLevelQuestions(level, seen, category), [level]) // eslint-disable-line
  const [i, setI] = useState(0)
  const [qAttempts, setQAttempts] = useState(0)
  const [fb, setFb] = useState<{ kind: 'good' | 'bad' | null; text: string }>({ kind: null, text: '' })
  const [locked, setLocked] = useState(false)
  const [wrongIdx, setWrongIdx] = useState<number | null>(null)
  const [pop, setPop] = useState(0)
  const firstCorrect = useRef(0)
  const hintsUsed = useRef(0)
  const answered = useRef<string[]>([])
  const q = questions[i]

  useEffect(() => { if (q?.say) s.say(q.say) }, [i]) // eslint-disable-line

  if (!q) return null

  const pick = (idx: number) => {
    if (locked) return
    if (idx === q.answer) {
      s.good(); setLocked(true); setWrongIdx(null); setPop(p => p + 1); s.say(randomCelebrate())
      if (qAttempts === 0) firstCorrect.current++
      setFb({ kind: 'good', text: q.explain ?? 'Correct! 🎉' })
      setTimeout(() => {
        setFb({ kind: null, text: '' }); setLocked(false)
        answered.current.push(q.id)
        if (i + 1 >= questions.length) {
          onDone(firstCorrect.current / questions.length, { hintsUsed: hintsUsed.current, seenIds: answered.current })
        } else { setI(i + 1); setQAttempts(0) }
      }, 850)
    } else {
      s.bad(); setQAttempts(a => a + 1); setWrongIdx(idx)
      setFb({ kind: 'bad', text: randomEncourage() })
      setTimeout(() => { setFb({ kind: null, text: '' }); setWrongIdx(null) }, 900)
    }
  }

  return (
    <div className="game-area">
      <PartyPop trigger={pop} />
      <GameTitle icon={q.icon} title={q.title}
        sub={<span className={`diff-pill diff-${q.difficulty}`}>{DIFFICULTY_LABELS[q.difficulty]}</span>} />
      <Progress done={i} total={questions.length} />
      <QuestionPrompt q={q} />
      <Feedback kind={fb.kind} text={fb.text} />
      <div className={`options-grid ${q.optionsEmoji ? 'options-big' : ''}`}>
        {q.options.map((o, idx) => (
          <button key={idx}
            className={`option-btn ${locked && idx === q.answer ? 'is-correct' : ''} ${wrongIdx === idx ? 'is-wrong' : ''}`}
            onClick={() => pick(idx)}>
            {q.optionsEmoji ? <span className="opt-emoji"><Gfx v={o} size={44} /></span> : o}
          </button>
        ))}
      </div>
      <HintBar hint={q.hint} onUsed={() => { hintsUsed.current++ }} />
    </div>
  )
}

// --- 1. Memory flip (match pairs) ---------------------------------------------

export function MemoryFlip({ level, onDone }: GameProps) {
  const s = useSound()
  const pairs = Math.max(2, level.size)   // never deal an empty/1-card board
  const deck = useMemo(() => {
    // Themed pool for this world (deduped so pairs are never ambiguous), with a
    // fallback to the general emoji set if a theme is short on unique symbols.
    // Unseeded: every play — including replaying a beaten level — deals a new board.
    const themed = [...new Set(themeEmojis(level.id))]
    const pool = themed.length >= pairs ? themed : [...new Set([...themed, ...MEMORY_EMOJI])]
    const picks = shuffle(pool).slice(0, pairs)
    return shuffle([...picks, ...picks].map((e, i) => ({ e, key: i })))
  }, [level]) // eslint-disable-line
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [moves, setMoves] = useState(0)
  // Memory, not guessing: every card is shown face-up for a couple of seconds so
  // the child can memorise the layout, then they flip down one-by-one in a wave.
  const [preview, setPreview] = useState(true)
  const [hiding, setHiding] = useState(false)   // true during the staggered flip-down
  const busy = useRef(false)

  useEffect(() => {
    setPreview(true); setHiding(false)
    s.say('Look carefully and remember where the cards are!')
    const ms = Math.min(4000, 2000 + Math.max(0, pairs - 3) * 250)   // a little longer for bigger boards
    const t = setTimeout(() => { setPreview(false); setHiding(true); s.say('Now find the matching pairs!') }, ms)
    return () => clearTimeout(t)
  }, [level]) // eslint-disable-line

  // Clear the stagger once the flip-down wave has finished, so cards the child
  // flips during play turn instantly (no leftover delay).
  useEffect(() => {
    if (!hiding) return
    const t = setTimeout(() => setHiding(false), deck.length * 55 + 550)
    return () => clearTimeout(t)
  }, [hiding, deck.length])

  const flip = (i: number) => {
    if (preview || busy.current || open.includes(i) || matched.has(deck[i].e)) return
    s.tap()
    const next = [...open, i]
    setOpen(next)
    if (next.length === 2) {
      setMoves(m => m + 1)
      busy.current = true
      const [a, b] = next
      if (deck[a].e === deck[b].e) {
        setTimeout(() => {
          s.good()
          const nm = new Set(matched); nm.add(deck[a].e)
          setMatched(nm); setOpen([]); busy.current = false
          if (nm.size === pairs) {
            const accuracy = Math.min(1, pairs / Math.max(moves + 1, pairs))
            setTimeout(() => onDone(Math.max(0.5, accuracy)), 500)
          }
        }, 400)
      } else {
        setTimeout(() => { s.bad(); setOpen([]); busy.current = false }, 750)
      }
    }
  }

  const cols = pairs <= 4 ? 4 : pairs <= 8 ? 4 : 5
  return (
    <div className="game-area">
      <GameTitle icon="🧠" title="Memory Match" />
      <p className="game-hint">{preview ? '👀 Remember where the cards are…' : 'Flip two cards and find the matching pairs! 🃏'}</p>
      <div className={`memory-grid ${preview ? 'is-preview' : ''}`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {deck.map((c, i) => {
          const shown = preview || open.includes(i) || matched.has(c.e)
          return (
            <button key={c.key} aria-label={shown ? c.e : 'hidden card'}
              className={`memory-card ${shown ? 'is-face-up' : ''} ${matched.has(c.e) ? 'is-matched' : ''}`}
              onClick={() => flip(i)}>
              {/* the face content re-keys whenever it flips (up↔down), replaying
                  the flip animation; during the reveal→hide wave each card gets a
                  staggered delay so they turn over one after another */}
              <span className="memory-face" key={shown ? 'u' : 'd'}
                style={{ animationDelay: hiding && !shown ? `${i * 0.055}s` : '0s' }}>
                {shown ? <Gfx v={c.e} size={40} /> : '✦'}
              </span>
            </button>
          )
        })}
      </div>
      <p className="game-meta">Pairs found: {matched.size}/{pairs}</p>
    </div>
  )
}

// --- 2. Memory sequence (Simon) ------------------------------------------------

export function MemorySequence({ level, onDone }: GameProps) {
  const s = useSound()
  const { state } = useStore()
  const pads = COLORS_CB
  // Unseeded: a replay always gets a brand-new sequence to remember.
  const seqLen = Math.max(3, level.size)   // never an empty sequence
  const seq = useMemo(() =>
    Array.from({ length: seqLen }, () => Math.floor(Math.random() * pads.length)),
  [level]) // eslint-disable-line
  const [showing, setShowing] = useState(true)
  const [lit, setLit] = useState<number | null>(null)
  const [pos, setPos] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const doneRef = useRef(false)   // guards against a double-tap on the final pad completing twice

  const playSeq = () => {
    setShowing(true); setPos(0)
    seq.forEach((p, i) => {
      setTimeout(() => { setLit(p); sfx.tap() }, 600 + i * 650)
      setTimeout(() => setLit(null), 600 + i * 650 + 420)
    })
    setTimeout(() => setShowing(false), 600 + seq.length * 650)
  }

  useEffect(() => { s.say('Watch carefully, then repeat the sequence!'); playSeq() }, []) // eslint-disable-line

  const press = (p: number) => {
    if (showing || doneRef.current) return
    s.tap(); setLit(p); setTimeout(() => setLit(null), 200)
    if (p === seq[pos]) {
      if (pos + 1 === seq.length) { doneRef.current = true; s.good(); setTimeout(() => onDone(Math.max(0.4, 1 - mistakes * 0.2)), 400) }
      else setPos(pos + 1)
    } else {
      s.bad(); setMistakes(m => m + 1); setPos(0)
      setTimeout(playSeq, 700)
    }
  }

  return (
    <div className="game-area">
      <GameTitle icon="🎵" title="Repeat the Sequence" />
      <p className="game-hint">{showing ? '👀 Watch the pattern...' : `Your turn! Tap ${seq.length} pads in order (${pos}/${seq.length})`}</p>
      <div className="simon-grid">
        {pads.map((c, i) => (
          <button key={c.name} aria-label={c.name}
            className={`simon-pad ${lit === i ? 'is-lit' : ''}`}
            style={{ background: c.hex }}
            onClick={() => press(i)}>
            {state.settings.colorBlind ? <span className="simon-shape">{c.shape}</span> : null}
          </button>
        ))}
      </div>
    </div>
  )
}

// --- 9. Spell it -----------------------------------------------------------------------------

// Fill in the Blank (spec #8): any letter can go in any slot. Check reveals
// green (right position) / red (wrong), shows "Incorrect Spelling", allows retry.
const LETTER_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function SpellGame({ level, onDone }: GameProps) {
  const s = useSound()
  const words = useMemo(() => {
    const wanted = 3
    // Words that grow in length across the round (easy → harder); a fresh
    // random pick + tray order on every play, including replays.
    const sorted = [...WORDS].sort((a, b) => a.word.length - b.word.length)
    const short = sorted.filter(w => w.word.length <= 4)
    const mid = sorted.filter(w => w.word.length === 5 || w.word.length === 6)
    const long = sorted.filter(w => w.word.length >= 7)
    const pick = (arr: typeof WORDS) => shuffle(arr.length ? arr : WORDS)[0]
    const chosen = [pick(short), pick(mid), pick(long)].filter(Boolean).slice(0, wanted)
    return chosen.map(w => {
      const letters = w.word.split('')
      const extras = shuffle(LETTER_POOL.filter(c => !letters.includes(c))).slice(0, 2)
      return { ...w, tray: shuffle([...letters, ...extras]) }
    })
  }, [level])

  const [wi, setWi] = useState(0)
  const w = words[wi]
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(w.word.length).fill(null)) // tray index in each slot
  const [checked, setChecked] = useState(false)
  const wrongChecks = useRef(0)
  const answered = useRef<string[]>([])
  const doneRef = useRef(false)   // guards against a double-tap on Check completing the level twice

  useEffect(() => {
    setSlots(Array(w.word.length).fill(null)); setChecked(false)
    s.say(`Spell the word: ${w.word.toLowerCase()}`)
  }, [wi]) // eslint-disable-line

  const usedTray = new Set(slots.filter(x => x !== null) as number[])
  const filledCount = slots.filter(x => x !== null).length

  const placeLetter = (trayIdx: number) => {
    if (usedTray.has(trayIdx)) return
    const empty = slots.indexOf(null)
    if (empty < 0) return
    s.tap(); setChecked(false)
    const next = [...slots]; next[empty] = trayIdx; setSlots(next)
  }
  const clearSlot = (slotIdx: number) => {
    if (slots[slotIdx] === null) return
    s.tap(); setChecked(false)
    const next = [...slots]; next[slotIdx] = null; setSlots(next)
  }

  const letterAt = (slotIdx: number) => { const t = slots[slotIdx]; return t === null ? '' : w.tray[t] }
  const slotStatus = (slotIdx: number): 'correct' | 'wrong' | '' =>
    !checked ? '' : letterAt(slotIdx) === w.word[slotIdx] ? 'correct' : 'wrong'

  const check = () => {
    if (filledCount < w.word.length || doneRef.current) return
    const guess = slots.map((_, i) => letterAt(i)).join('')
    setChecked(true)
    if (guess === w.word) {
      const last = wi + 1 >= words.length
      if (last) doneRef.current = true   // lock so a double-tap can't complete the level twice
      s.good()
      setTimeout(() => {
        answered.current.push(`spell:${w.word}`)
        if (last) onDone(Math.max(0.4, 1 - wrongChecks.current * 0.15), { seenIds: answered.current })
        else setWi(wi + 1)
      }, 900)
    } else { s.bad(); wrongChecks.current++ }
  }

  const anyWrong = checked && slots.some((_, i) => slotStatus(i) === 'wrong')

  return (
    <div className="game-area">
      <GameTitle icon="🔤" title="Fill in the Blanks" sub={<span className="game-title-sub">Word {wi + 1}/{words.length}</span>} />
      <Progress done={wi} total={words.length} />
      <div className="prompt-card spell-prompt">
        <span className="flag-big"><Gfx v={w.emoji} size={68} /></span>
        <div className="spell-slots">
          {w.word.split('').map((_, i) => (
            <button key={i} className={`spell-slot ${slots[i] !== null ? 'is-filled' : ''} ${slotStatus(i) ? `is-${slotStatus(i)}` : ''}`}
              onClick={() => clearSlot(i)} aria-label={`slot ${i + 1}`}>{letterAt(i)}</button>
          ))}
        </div>
        {anyWrong && <p className="spell-error">❌ Incorrect Spelling — tap the red letters to fix them!</p>}
      </div>
      <div className="options-grid options-big letter-tray">
        {w.tray.map((l, i) => (
          <button key={i} className={`option-btn letter-btn ${usedTray.has(i) ? 'is-used' : ''}`}
            onClick={() => placeLetter(i)} disabled={usedTray.has(i)}>{l}</button>
        ))}
      </div>
      <button className="btn btn-primary btn-big spell-check" disabled={filledCount < w.word.length} onClick={check}>Check ✓</button>
    </div>
  )
}

// --- 12. Story corner ---------------------------------------------------------------------------------

export function StoryGame({ level, onDone }: GameProps) {
  const s = useSound()
  // Stories belong to the world the level lives in: forest adventures among
  // the trees, pirate tales at sea, dino friends on Dinosaur Island…
  const story = useMemo(() => {
    const pool = storiesForThemes(themeFor(worldForLevel(level.id)).tags)
    return pool[level.id % pool.length]
  }, [level])
  const [page, setPage] = useState(0)
  const [reading, setReading] = useState(true)

  // Options are shuffled fresh every play, so re-reading a story is never a
  // matter of remembering "the answer was the second button".
  const rounds = useMemo(() => story.questions.map(q => {
    const opts = shuffle(q.options.map((o, i) => ({ o, correct: i === q.answer })))
    return {
      prompt: <div><span className="story-q-hero" aria-hidden="true"><Gfx v={story.emoji} size={44} /></span><p className="prompt-text">{q.q}</p></div>,
      options: opts.map(x => x.o),
      answer: opts.findIndex(x => x.correct),
    }
  }), [story])

  useEffect(() => { s.say(story.title) }, []) // eslint-disable-line

  if (reading) {
    return (
      <div className="game-area">
        <GameTitle icon="📖" title="Story Time" sub={<span className="game-title-sub">Page {page + 1}/{story.text.length}</span>} />
        <div className="prompt-card story-card">
          <h3 className="story-title">{story.title}</h3>
          <div key={page} className="story-illustration" aria-hidden="true">
            <span className="story-hero"><Sprite token={story.emoji} size={92} /></span>
            <span className="story-spark s1"><EmojiImg emoji="✨" size={22} /></span>
            <span className="story-spark s2"><EmojiImg emoji="⭐" size={20} /></span>
          </div>
          <p key={`t${page}`} className="story-text">{story.text[page]}</p>
        </div>
        <div className="story-nav">
          <button className="btn btn-ghost" disabled={page === 0} onClick={() => { sfx.tap(); setPage(p => p - 1) }}>← Back</button>
          <span className="game-meta">Page {page + 1}/{story.text.length}</span>
          {page + 1 < story.text.length
            ? <button className="btn btn-primary" onClick={() => { sfx.tap(); setPage(p => p + 1) }}>Next →</button>
            : <button className="btn btn-primary" onClick={() => { sfx.tap(); setReading(false); s.say('Now, some questions about the story!') }}>Questions! ✨</button>}
        </div>
      </div>
    )
  }
  return (
    <div className="game-area">
      <GameTitle icon="📖" title="Story Questions" />
      <MCQ rounds={rounds} onDone={onDone} />
    </div>
  )
}

// --- 13. Quick tap (30s fruit frenzy) -------------------------------------------------------------------

export function QuickTap({ level, onDone }: GameProps) {
  const s = useSound()
  const target = Math.max(4, level.size)   // never a zero-target (instant-win) round
  const [items, setItems] = useState<{ id: number; e: string; fruit: boolean; x: number; y: number }[]>([])
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [time, setTime] = useState(30)
  const idRef = useRef(0)
  const doneRef = useRef(false)

  useEffect(() => { s.say('Tap only the fruits! Ready, go!') }, []) // eslint-disable-line

  useEffect(() => {
    const spawn = setInterval(() => {
      setItems(prev => {
        const rnd = Math.random
        const fruit = rnd() > 0.35
        const e = fruit ? FRUITS[Math.floor(rnd() * FRUITS.length)] : NOT_FRUITS[Math.floor(rnd() * NOT_FRUITS.length)]
        const it = { id: idRef.current++, e, fruit, x: 5 + rnd() * 80, y: 5 + rnd() * 70 }
        return [...prev.slice(-7), it]
      })
    }, 650)
    const clock = setInterval(() => setTime(t => t - 1), 1000)
    return () => { clearInterval(spawn); clearInterval(clock) }
  }, [])

  useEffect(() => {
    if (doneRef.current) return
    if (hits >= target || time <= 0) {
      doneRef.current = true
      const acc = Math.min(1, (hits / target)) * (hits + misses > 0 ? hits / (hits + misses) : 1)
      setTimeout(() => onDone(Math.max(0.3, acc)), 300)
    }
  }, [hits, time]) // eslint-disable-line

  const tap = (id: number, fruit: boolean) => {
    setItems(prev => prev.filter(i => i.id !== id))
    if (fruit) { s.good(); setHits(h => h + 1) } else { s.bad(); setMisses(m => m + 1) }
  }

  return (
    <div className="game-area">
      <GameTitle icon="🍓" title="Fruit Frenzy" sub={<span className="game-title-sub">⏱ {time}s</span>} />
      <p className="game-hint">🍓 Tap {target} fruits — avoid everything else! ⏱ {time}s · {hits}/{target}</p>
      <div className="tap-field" role="application" aria-label="tap the fruits">
        {items.map(i => (
          <button key={i.id} className="tap-item" style={{ left: `${i.x}%`, top: `${i.y}%` }} onClick={() => tap(i.id, i.fruit)}><Gfx v={i.e} size={40} /></button>
        ))}
      </div>
    </div>
  )
}

// --- Registry -------------------------------------------------------------------------------------------------

// Quiz-style kinds all run through the unified QuestionRunner (6 escalating,
// no-repeat questions with titles + hints). Skill games keep their bespoke UI.
export const GAME_REGISTRY: Record<string, React.ComponentType<GameProps>> = {
  'memory-flip': MemoryFlip,
  'memory-sequence': MemorySequence,
  'math': QuestionRunner,
  'odd-one-out': QuestionRunner,
  'shadow-match': QuestionRunner,
  'flags': QuestionRunner,
  'pattern': QuestionRunner,
  'missing-number': QuestionRunner,
  'spell': SpellGame,
  'opposites': QuestionRunner,
  'riddle': QuestionRunner,
  'story': StoryGame,
  'quick-tap': QuickTap,
  'quick-count': QuestionRunner,
}
