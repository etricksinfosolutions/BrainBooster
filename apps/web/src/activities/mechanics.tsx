// ---------------------------------------------------------------------------
// Brain Booster Kids — Activity Mechanics
// The renderers behind the Modular Activity Engine. Each interaction "verb" is
// one component; the registry maps a Mechanic → its renderer so the Play screen
// can render ANY scheduled activity spec without knowing what it is. The five
// NEW mechanics (sorting, match-3, maze, spot-the-difference, sliding) give the
// game genuinely different things to DO, not just different questions to answer.
// All content is themed to the world the level lives in and works fully offline.
// ---------------------------------------------------------------------------
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { LevelDef } from '../data/levels'
import { ASSET_POOLS } from '../data/questions'
import { themeEmojis } from '../data/worlds'
import { sfx } from '../state/store'
import {
  Gfx, GameTitle, useSound, Progress, shuffle,
  MemoryFlip, MemorySequence, SpellGame, StoryGame, QuickTap, QuestionRunner,
} from '../games'
import { ActivitySpec, Mechanic } from './types'
import { freshBoard, resolveSwap, dirFromDelta, neighborInDirection, areAdjacent, Dir } from './match3'
import { subjectFor } from '../assets/registry'

export interface ActivityProps { spec: ActivitySpec; level: LevelDef; onDone: (accuracy: number, meta?: { hintsUsed?: number; seenIds?: string[] }) => void }

// Themed content: this world's imagery blended with the spec's category pool.
function themedItems(spec: ActivitySpec, level: LevelDef): string[] {
  const pool = spec.pool && ASSET_POOLS[spec.pool] ? ASSET_POOLS[spec.pool] : []
  return [...new Set([...pool, ...themeEmojis(level.id)])].filter(Boolean)
}

const POOL_META: Record<string, { label: string; icon: string }> = {
  animals: { label: 'Animals', icon: '🐾' }, fruits: { label: 'Fruits', icon: '🍎' },
  vegetables: { label: 'Veggies', icon: '🥕' }, sea: { label: 'Sea Life', icon: '🌊' },
  birds: { label: 'Birds', icon: '🐦' }, insects: { label: 'Bugs', icon: '🐛' },
  vehicles: { label: 'Vehicles', icon: '🚗' }, dinos: { label: 'Dinos', icon: '🦕' },
  toys: { label: 'Toys', icon: '🧸' }, instruments: { label: 'Music', icon: '🎵' },
  sports: { label: 'Sports', icon: '⚽' }, household: { label: 'Home', icon: '🏠' },
  cartoon: { label: 'Fun Stuff', icon: '⭐' },
}

// ============================================================================
// 1. SORTING — drag/tap each item into the bucket it belongs to
// ============================================================================
export function SortingGame({ spec, level, onDone }: ActivityProps) {
  const s = useSound()
  const { buckets, items } = useMemo(() => {
    const nB = level.tierIndex < 2 ? 2 : 3
    const usable = Object.keys(ASSET_POOLS).filter(k => ASSET_POOLS[k].length >= 4)
    const chosen: string[] = []
    if (spec.pool && ASSET_POOLS[spec.pool]) chosen.push(spec.pool)
    for (const k of shuffle(usable)) { if (chosen.length >= nB) break; if (!chosen.includes(k)) chosen.push(k) }
    const perBucket = Math.max(2, Math.round(spec.size / chosen.length))
    const buckets = chosen.map(k => ({ key: k, ...(POOL_META[k] ?? { label: k, icon: '❓' }) }))
    // Never let the same emoji land in two buckets — that would be ambiguous
    // (the child couldn't know which basket is "right").
    const used = new Set<string>()
    const items = shuffle(chosen.flatMap(k => {
      const uniq = shuffle([...new Set(ASSET_POOLS[k])].filter(e => !used.has(e))).slice(0, perBucket)
      uniq.forEach(e => used.add(e))
      return uniq.map((emoji, i) => ({ emoji, key: k, id: `${k}-${i}` }))
    }))
    return { buckets, items }
  }, [level]) // eslint-disable-line

  const [placed, setPlaced] = useState<Record<string, string>>({})   // itemId → bucketKey
  const [sel, setSel] = useState<string | null>(null)
  const [wrongId, setWrongId] = useState<string | null>(null)
  const firstTryWrong = useRef(0)
  const attempted = useRef<Set<string>>(new Set())

  useEffect(() => { s.say('Sort each one into the right basket!') }, []) // eslint-disable-line

  const placeInto = (bucketKey: string) => {
    if (!sel) return
    const item = items.find(i => i.id === sel)!
    if (item.key === bucketKey) {
      s.good(); setPlaced(p => ({ ...p, [sel]: bucketKey })); setSel(null)
      const done = { ...placed, [sel]: bucketKey }
      if (Object.keys(done).length === items.length) {
        const acc = Math.max(0.4, 1 - firstTryWrong.current / items.length)
        setTimeout(() => onDone(acc), 450)
      }
    } else {
      s.bad(); setWrongId(sel)
      if (!attempted.current.has(sel)) firstTryWrong.current++
      setTimeout(() => setWrongId(null), 500)
    }
    attempted.current.add(sel)
  }

  const remaining = items.filter(i => !placed[i.id])
  return (
    <div className="game-area">
      <GameTitle icon={spec.icon} title={spec.name} sub={<span className="game-title-sub">{remaining.length} left</span>} />
      <p className="game-hint">Tap an item, then tap the basket it belongs in! 🧺</p>
      <div className="sort-tray">
        {remaining.map(i => (
          <button key={i.id} className={`sort-item ${sel === i.id ? 'is-sel' : ''} ${wrongId === i.id ? 'is-wrong' : ''}`}
            onClick={() => { s.tap(); setSel(i.id) }}><Gfx v={i.emoji} size={40} /></button>
        ))}
        {!remaining.length && <p className="game-meta">All sorted! 🎉</p>}
      </div>
      <div className="sort-buckets" style={{ gridTemplateColumns: `repeat(${buckets.length}, 1fr)` }}>
        {buckets.map(b => (
          <button key={b.key} className="sort-bucket" onClick={() => placeInto(b.key)}>
            <span className="sort-bucket-head"><Gfx v={b.icon} size={26} /> {b.label}</span>
            <span className="sort-bucket-items">
              {items.filter(i => placed[i.id] === b.key).map(i => <Gfx key={i.id} v={i.emoji} size={26} />)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// 2. MATCH-3 — swap adjacent tiles to line up three or more (educational board)
// ============================================================================
export function Match3Game({ spec, level, onDone }: ActivityProps) {
  const s = useSound()
  const n = 5
  // Exactly 4 DISTINCT tile kinds — deduped so two tiles never look identical
  // yet fail to match. The fallback set is SHAPE-distinct (star / apple /
  // mushroom / balloon / flower / key), never colour-only circles, so tiles
  // stay distinguishable for children with colour-vision deficiencies (#8).
  const kinds = useMemo(() =>
    [...new Set([...themedItems(spec, level), '⭐', '🍎', '🍄', '🎈', '🌸', '🔑'])].slice(0, 4),
  [level]) // eslint-disable-line
  const target = 8 + level.tierIndex * 3

  const [cells, setCells] = useState<number[]>(() => freshBoard(n, kinds.length))
  const [sel, setSel] = useState<number | null>(null)
  const [focus, setFocus] = useState(Math.floor((n * n) / 2))  // keyboard cursor
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(12 + level.tierIndex * 2)
  const [pop, setPop] = useState<Set<number>>(new Set())      // tiles bouncing after a match
  const [shake, setShake] = useState<Set<number>>(new Set())  // tiles wobbling after an invalid move
  const [spark, setSpark] = useState<{ i: number; k: number } | null>(null) // sparkle burst
  const busy = useRef(false)
  const done = useRef(false)
  // Pointer gesture start (works for tap, swipe-anywhere and drag alike).
  const press = useRef<{ x: number; y: number; index: number | null } | null>(null)

  useEffect(() => { s.say('Tap a tile, then swipe or tap a neighbour to swap!') }, []) // eslint-disable-line
  useEffect(() => {
    if (done.current) return
    if (score >= target) { done.current = true; s.good(); setTimeout(() => onDone(1), 500) }
    else if (moves <= 0) { done.current = true; setTimeout(() => onDone(Math.max(0.4, score / target)), 500) }
  }, [score, moves]) // eslint-disable-line

  /** Wobble tiles + soft "oops", keeping the current selection so the child can
   *  simply try again — invalid moves never punish or reset progress. */
  const reject = (...idx: number[]) => {
    s.bad()
    setShake(new Set(idx))
    setTimeout(() => setShake(new Set()), 420)
  }

  /** The one place a swap happens — every input method routes through here. */
  const commitSwap = (a: number, b: number) => {
    if (busy.current || done.current) return
    const res = resolveSwap(cells, n, a, b, kinds.length)   // null = no match → invalid
    if (!res) { reject(a, b); return }                      // shake, keep selection
    setSel(null)
    // resolveSwap guarantees the returned board still has a legal move, so the
    // board can never deadlock into an unwinnable, unexitable state.
    busy.current = true; setMoves(m => m - 1)
    setCells(res.cells); s.good(); setScore(sc => sc + res.gained)
    setFocus(b)
    // Satisfying feedback: the swapped tiles bounce and a sparkle burst pops.
    setPop(new Set([a, b]))
    setSpark(prev => ({ i: b, k: (prev?.k ?? 0) + 1 }))
    setTimeout(() => setPop(new Set()), 460)
    setTimeout(() => { busy.current = false }, 260)
  }

  /** Swipe/arrow a tile toward a direction; edge swipes just wobble. */
  const swapDir = (from: number, dir: Dir) => {
    const to = neighborInDirection(from, dir, n)
    if (to == null) reject(from)
    else commitSwap(from, to)
  }

  const select = (i: number) => { s.tap(); setSel(i); setFocus(i) }

  // --- Unified pointer input: tap-to-select, tap-neighbour-to-swap, swipe &
  //     drag (Methods 1-3 + forgiving gesture radius, Parts 2 & 6) -----------
  const onPointerDown = (e: React.PointerEvent) => {
    if (busy.current || done.current) return
    const cell = (e.target as HTMLElement).closest('[data-index]') as HTMLElement | null
    press.current = { x: e.clientX, y: e.clientY, index: cell ? Number(cell.dataset.index) : null }
    // Capture so a swipe that drifts off the tile/board still delivers its
    // pointerup here — forgiving for small hands (Parts 5 & 6).
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* unsupported */ }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const p = press.current; press.current = null
    if (!p || busy.current || done.current) return
    const dir = dirFromDelta(e.clientX - p.x, e.clientY - p.y, 16)   // forgiving 16px threshold
    if (dir) {
      // Swipe/drag: move the pressed tile, or the already-selected tile if the
      // gesture started off a tile (swipe anywhere on the board).
      const origin = p.index ?? sel
      if (origin != null) swapDir(origin, dir)
      return
    }
    // Tap: select, deselect, or swap with a tapped neighbour.
    if (p.index == null) return
    if (sel == null) select(p.index)
    else if (sel === p.index) { setSel(null) }
    else if (areAdjacent(sel, p.index, n)) commitSwap(sel, p.index)
    else select(p.index)
  }

  // --- Keyboard (Method 4 + accessibility) ----------------------------------
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (busy.current || done.current) return
    const dir: Dir | null = e.key === 'ArrowLeft' ? 'left' : e.key === 'ArrowRight' ? 'right'
      : e.key === 'ArrowUp' ? 'up' : e.key === 'ArrowDown' ? 'down' : null
    if (dir) {
      e.preventDefault()
      if (sel != null) swapDir(sel, dir)                 // selected → swap that way
      else { const nx = neighborInDirection(focus, dir, n); if (nx != null) setFocus(nx) }  // move cursor
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (sel == null) select(focus)
      else if (sel === focus) setSel(null)
      else if (areAdjacent(sel, focus, n)) commitSwap(sel, focus)
      else select(focus)
    }
  }

  const dirs: Dir[] = ['up', 'down', 'left', 'right']
  return (
    <div className="game-area">
      <GameTitle icon={spec.icon} title={spec.name} sub={<span className="game-title-sub">🎯 {Math.min(score, target)}/{target}</span>} />
      <p className="game-hint">Tap a tile, then swipe or tap a neighbour · Moves left: {moves}</p>
      <div className="match3-board" style={{ ['--n' as string]: n, touchAction: 'none' }}
        role="grid" aria-label="Match 3 board — tap a tile then swipe or tap a neighbour to swap"
        tabIndex={0} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onKeyDown={onKeyDown}>
        {cells.map((k, i) => (
          <button key={i} type="button" tabIndex={-1} data-index={i}
            className={`match3-cell ${sel === i ? 'is-sel' : ''} ${focus === i ? 'is-focus' : ''} ${pop.has(i) ? 'is-pop' : ''} ${shake.has(i) ? 'is-shake' : ''}`}
            aria-label={subjectFor(kinds[k])} aria-pressed={sel === i}>
            {/* stagger each tile's breathing so the board never pulses in unison */}
            <span className="match3-art" style={{ ['--bd' as string]: `${-((i * 7) % 34) * 0.1}s` }}>
              <Gfx v={kinds[k]} size={96} fill />
            </span>
            {/* subtle directional hints on the selected tile — show a child which
                way it can move (only toward valid neighbours) */}
            {sel === i && (
              <span className="m3-hints" aria-hidden="true">
                {dirs.map(d => neighborInDirection(i, d, n) != null && <span key={d} className={`m3-hint m3-hint-${d}`} />)}
              </span>
            )}
            {spark && spark.i === i && (
              <span className="match3-spark" key={spark.k} aria-hidden="true">
                {Array.from({ length: 6 }, (_, p) => (
                  <span key={p} className="m3-star" style={{ ['--a' as string]: `${p * 60}deg` }} />
                ))}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// 3. MAZE — steer the character through the maze to the goal
// ============================================================================
export function MazeGame({ spec, level, onDone }: ActivityProps) {
  const s = useSound()
  const n = Math.max(4, Math.min(8, spec.size))
  const goal = n * n - 1
  const open = useMemo(() => {
    const set = new Set<number>([0, goal])
    let pos = 0
    let guard = 0
    while (pos !== goal && guard++ < n * n * 4) {
      const r = Math.floor(pos / n), c = pos % n
      const gr = n - 1, gc = n - 1
      const opts: number[] = []
      if (c < n - 1) opts.push(pos + 1); if (r < n - 1) opts.push(pos + n)
      if (c > 0) opts.push(pos - 1); if (r > 0) opts.push(pos - n)
      // 70% bias toward the goal so the maze is always solvable
      const toward = opts.filter(o => Math.abs(Math.floor(o / n) - gr) + Math.abs((o % n) - gc) < Math.abs(r - gr) + Math.abs(c - gc))
      pos = (Math.random() < 0.7 && toward.length) ? toward[Math.floor(Math.random() * toward.length)] : opts[Math.floor(Math.random() * opts.length)]
      set.add(pos)
    }
    // Guarantee solvability: if the random walk didn't reach the goal within the
    // guard budget, carve a Manhattan path from where it stopped to the goal.
    let cur = pos
    while (cur !== goal) {
      const r = Math.floor(cur / n), c = cur % n
      if (c < n - 1) cur += 1; else if (r < n - 1) cur += n; else break
      set.add(cur)
    }
    // sprinkle a few false-branch cells for real choices
    for (let k = 0; k < Math.ceil(n * 1.5); k++) set.add(Math.floor(Math.random() * n * n))
    return set
  }, [level]) // eslint-disable-line

  const [pos, setPos] = useState(0)
  const bumps = useRef(0)
  const done = useRef(false)
  useEffect(() => { s.say('Find the path to the treasure!') }, []) // eslint-disable-line

  const move = (d: 'up' | 'down' | 'left' | 'right') => {
    if (done.current) return
    const r = Math.floor(pos / n), c = pos % n
    let t = pos
    if (d === 'up' && r > 0) t = pos - n
    else if (d === 'down' && r < n - 1) t = pos + n
    else if (d === 'left' && c > 0) t = pos - 1
    else if (d === 'right' && c < n - 1) t = pos + 1
    if (t === pos) return
    if (!open.has(t)) { s.bad(); bumps.current++; return }
    s.tap(); setPos(t)
    if (t === goal) { done.current = true; s.good(); setTimeout(() => onDone(Math.max(0.6, 1 - bumps.current * 0.05)), 450) }
  }
  const tapCell = (i: number) => {
    const r = Math.floor(pos / n), c = pos % n, tr = Math.floor(i / n), tc = i % n
    if (Math.abs(r - tr) + Math.abs(c - tc) !== 1) return
    move(tr < r ? 'up' : tr > r ? 'down' : tc < c ? 'left' : 'right')
  }

  return (
    <div className="game-area">
      <GameTitle icon={spec.icon} title={spec.name} />
      <p className="game-hint">Reach the 🏆 — tap a path tile or use the arrows!</p>
      <div className="maze-board" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {Array.from({ length: n * n }, (_, i) => (
          <button key={i} className={`maze-cell ${open.has(i) ? 'is-open' : 'is-wall'} ${i === pos ? 'is-here' : ''}`}
            onClick={() => tapCell(i)} disabled={!open.has(i)}>
            {i === pos ? <Gfx v="🐯" size={24} /> : i === goal ? <Gfx v="🏆" size={22} /> : open.has(i) ? '' : <Gfx v="🌳" size={18} />}
          </button>
        ))}
      </div>
      <div className="maze-pad">
        <button className="btn btn-ghost" onClick={() => move('up')} aria-label="up">⬆️</button>
        <div>
          <button className="btn btn-ghost" onClick={() => move('left')} aria-label="left">⬅️</button>
          <button className="btn btn-ghost" onClick={() => move('down')} aria-label="down">⬇️</button>
          <button className="btn btn-ghost" onClick={() => move('right')} aria-label="right">➡️</button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 4. FIND THE DIFFERENCE — spot what changed between two scenes
// ============================================================================
export function FindDifferenceGame({ spec, level, onDone }: ActivityProps) {
  const s = useSound()
  const K = Math.max(2, Math.min(5, spec.size))
  const cols = level.tierIndex < 2 ? 3 : 4
  const rows = 3
  const { base, alt, diffs } = useMemo(() => {
    const items = themedItems(spec, level)
    const total = rows * cols
    const base = Array.from({ length: total }, () => items[Math.floor(Math.random() * items.length)])
    const alt = base.slice()
    const positions = shuffle([...Array(total).keys()]).slice(0, K)
    // Only positions that ACTUALLY changed count as differences — otherwise a
    // "difference" the child can never spot would make the level uncompletable.
    const realDiffs = new Set<number>()
    for (const p of positions) {
      let e = items[Math.floor(Math.random() * items.length)]
      let guard = 0
      while (e === base[p] && guard++ < 20) e = items[Math.floor(Math.random() * items.length)]
      if (e !== base[p]) { alt[p] = e; realDiffs.add(p) }
    }
    return { base, alt, diffs: realDiffs }
  }, [level]) // eslint-disable-line

  const [found, setFound] = useState<Set<number>>(new Set())
  const wrong = useRef(0)
  const done = useRef(false)
  useEffect(() => { s.say(`Find ${K} differences between the two pictures!`) }, []) // eslint-disable-line

  const tap = (i: number) => {
    if (done.current || found.has(i)) return
    if (diffs.has(i)) {
      s.good(); const nf = new Set(found); nf.add(i); setFound(nf)
      if (nf.size === diffs.size) { done.current = true; setTimeout(() => onDone(Math.max(0.4, 1 - wrong.current * 0.1)), 450) }
    } else { s.bad(); wrong.current++ }
  }

  const Grid = ({ data }: { data: string[] }) => (
    <div className="diff-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {data.map((e, i) => (
        <button key={i} className={`diff-cell ${found.has(i) ? 'is-found' : ''}`} onClick={() => tap(i)}><Gfx v={e} size={30} /></button>
      ))}
    </div>
  )
  return (
    <div className="game-area">
      <GameTitle icon={spec.icon} title={spec.name} sub={<span className="game-title-sub">{found.size}/{diffs.size}</span>} />
      <p className="game-hint">Tap the {K} things that are different! 🔍</p>
      <Grid data={base} />
      <div className="diff-divider">vs</div>
      <Grid data={alt} />
    </div>
  )
}

// ============================================================================
// 5. SLIDING PUZZLE — slide the tiles into order
// ============================================================================
export function SlidingGame({ spec, level, onDone }: ActivityProps) {
  const s = useSound()
  const n = Math.max(3, Math.min(4, spec.size))
  const solved = useMemo(() => [...Array(n * n - 1).keys()].map(i => i + 1).concat(0), [n])
  const start = useMemo(() => {
    let t = solved.slice()
    let blank = t.length - 1
    for (let k = 0; k < 80; k++) {   // shuffle by legal moves → always solvable
      const r = Math.floor(blank / n), c = blank % n
      const nb: number[] = []
      if (r > 0) nb.push(blank - n); if (r < n - 1) nb.push(blank + n)
      if (c > 0) nb.push(blank - 1); if (c < n - 1) nb.push(blank + 1)
      const pick = nb[Math.floor(Math.random() * nb.length)];
      [t[blank], t[pick]] = [t[pick], t[blank]]; blank = pick
    }
    // Avoid the rare case where the shuffle lands back on solved — do ONE more
    // legal slide (a plain swap would flip parity and make it unsolvable).
    if (t.every((v, k) => v === solved[k])) {
      const r = Math.floor(blank / n), c = blank % n
      const nb: number[] = []
      if (r > 0) nb.push(blank - n); if (r < n - 1) nb.push(blank + n)
      if (c > 0) nb.push(blank - 1); if (c < n - 1) nb.push(blank + 1)
      const pick = nb[0];[t[blank], t[pick]] = [t[pick], t[blank]]; blank = pick
    }
    return t
  }, [level]) // eslint-disable-line

  const [tiles, setTiles] = useState<number[]>(start)
  const [moves, setMoves] = useState(0)
  const done = useRef(false)
  useEffect(() => { s.say('Slide the tiles until the numbers are in order!') }, []) // eslint-disable-line

  const tap = (i: number) => {
    if (done.current) return
    const blank = tiles.indexOf(0)
    const r = Math.floor(i / n), c = i % n, br = Math.floor(blank / n), bc = blank % n
    if (Math.abs(r - br) + Math.abs(c - bc) !== 1) return
    const next = tiles.slice();
    [next[blank], next[i]] = [next[i], next[blank]]
    s.tap(); setTiles(next); setMoves(m => m + 1)
    if (next.every((v, k) => v === solved[k])) {
      done.current = true; s.good(); setTimeout(() => onDone(Math.max(0.6, 1 - moves * 0.004)), 450)
    }
  }
  return (
    <div className="game-area">
      <GameTitle icon={spec.icon} title={spec.name} sub={<span className="game-title-sub">{moves} moves</span>} />
      <p className="game-hint">Slide tiles into the empty space to sort 1→{n * n - 1}! 🧩</p>
      <div className="slide-board" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {tiles.map((v, i) => (
          <button key={i} className={`slide-tile ${v === 0 ? 'is-blank' : ''} ${v === i + 1 ? 'is-home' : ''}`}
            onClick={() => tap(i)} disabled={v === 0}>{v === 0 ? '' : v}</button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Registry — Mechanic → renderer. The legacy games read `level.size`, which was
// sized for the level's ORIGINAL kind — but the scheduler may pick a different
// mechanic, so we hand them a level whose `size` is the scheduler's spec.size
// (correctly sized for THIS mechanic). Without this a memory game landing on a
// story/riddle level got size 0 → an empty board → a blank screen.
// ============================================================================
const sized = (level: LevelDef, spec: ActivitySpec): LevelDef => ({ ...level, size: Math.max(2, spec.size) })

export const MECHANIC_REGISTRY: Record<Mechanic, React.ComponentType<ActivityProps>> = {
  'quiz': ({ spec, level, onDone }) => <QuestionRunner level={sized(level, spec)} onDone={onDone} category={spec.quizCategory} />,
  'memory-flip': ({ spec, level, onDone }) => <MemoryFlip level={sized(level, spec)} onDone={onDone} />,
  'memory-sequence': ({ spec, level, onDone }) => <MemorySequence level={sized(level, spec)} onDone={onDone} />,
  'spell': ({ spec, level, onDone }) => <SpellGame level={sized(level, spec)} onDone={onDone} />,
  'story': ({ level, onDone }) => <StoryGame level={level} onDone={onDone} />,
  'quick-tap': ({ spec, level, onDone }) => <QuickTap level={sized(level, spec)} onDone={onDone} />,
  'sorting': SortingGame,
  'match3': Match3Game,
  'maze': MazeGame,
  'find-difference': FindDifferenceGame,
  'sliding': SlidingGame,
}
