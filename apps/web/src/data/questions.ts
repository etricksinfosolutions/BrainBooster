// ---------------------------------------------------------------------------
// Brain Booster Kids — Question Engine
// Serves every quiz-style level SIX questions of increasing difficulty
// (Very Easy → Expert), each with a stable unique id, and guarantees no repeats
// by tracking a "seen" set (persisted locally + in cloud save).
//
// Two kinds of providers feed the engine:
//   • generative  — math / counting / patterns / sequences / shadows produce an
//     effectively unlimited supply of unique questions, so hundreds of levels
//     never run dry.
//   • curated     — riddles / general-knowledge / opposites / odd-one-out draw
//     from content banks; more can be added to the banks with zero code change.
// Adding thousands more questions = appending data. The engine never changes.
// ---------------------------------------------------------------------------
import { GameKind, LevelDef } from './levels'
import { RIDDLES, OPPOSITES, FLAGS } from './content'
import { worldForLevel } from './worlds'
import { themeFor } from '../theme'

export type Difficulty = 0 | 1 | 2 | 3 | 4 | 5
export const DIFFICULTY_LABELS = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard', 'Expert']

export type QCategory =
  | 'math' | 'count' | 'pattern' | 'sequence' | 'observation'
  | 'knowledge' | 'language' | 'riddle' | 'shadow'

export interface Question {
  id: string                 // globally unique + stable
  category: QCategory
  difficulty: Difficulty
  title: string              // screen title shown to the child ("Math Challenge")
  icon: string
  prompt: string
  media?: string             // a big emoji / flag to display above the prompt
  mediaShadow?: boolean      // render `media` as a black silhouette
  seq?: string[]             // pattern / number sequence to display
  countItems?: string[]      // items to count
  options: string[]
  optionsEmoji?: boolean     // render options as large emoji
  answer: number
  hint: string
  explain?: string
  say?: string               // spoken prompt
}

const rnd = () => Math.random()
const randInt = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1))
const pickOne = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)]
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
/** Builds an options array with the answer shuffled in; returns {options, answer}. */
function mc(correct: string, wrong: string[]): { options: string[]; answer: number } {
  const options = shuffle([correct, ...wrong])
  return { options, answer: options.indexOf(correct) }
}

// --- Themed asset pools (large, categorised) for shadows / odd-one-out --------
export const ASSET_POOLS: Record<string, string[]> = {
  animals: ['🐶','🐱','🐘','🦒','🦁','🐯','🐰','🐭','🐻','🐨','🦊','🐮','🐷','🐹','🐺','🦌','🦝','🦥','🦩','🦔','🐴','🐒','🐗','🦇'],
  fruits: ['🍎','🍌','🍇','🍉','🍓','🍑','🍍','🥝','🍒','🥭','🍊','🍐','🍈','🥥','🫐','🍋'],
  vegetables: ['🥕','🌽','🥦','🍅','🥒','🍆','🧅','🧄','🥔','🌶️','🫑','🥬','🍠','🫛'],
  toys: ['🧸','🪀','🎈','🪁','🎲','🧩','🪆','🎮','🚂','🛴','🎯','🪃'],
  dinos: ['🦕','🦖','🦴','🥚','🐊','🦎'],
  vehicles: ['🚗','🚕','🚌','🚑','🚒','🚓','🚚','🚜','🏎️','🚲','🛵','✈️','🚁','🚢','⛵','🚀','🚂','🛺'],
  birds: ['🐦','🦅','🦉','🦜','🦢','🦆','🐧','🦩','🦚','🐓','🕊️','🦤'],
  sea: ['🐟','🐠','🐡','🦈','🐬','🐳','🐙','🦀','🦞','🦑','🐚','🪸','🐢','🦭'],
  insects: ['🦋','🐛','🐝','🐞','🐜','🦗','🕷️','🦂','🪲','🪳','🦟'],
  instruments: ['🎸','🥁','🎹','🎺','🎻','🪕','🎷','🪗','🪘'],
  sports: ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🥊','⛳','🏒','🏑','🥍'],
  household: ['🪑','🛏️','🚪','🪟','🕯️','🔑','🧹','🪣','🧺','🍽️','🥄','🪥','📺','☎️','🧴','🪞'],
  cartoon: ['⭐','🌈','☁️','🌙','☀️','❤️','🎁','👑','🍄','🌸','💎','🔔','🎀','🌻','🍀','🎃'],
}
const POOL_KEYS = Object.keys(ASSET_POOLS)

// --- World flavour ------------------------------------------------------------
// Generated questions are built FROM the world the level lives in: its emoji
// pool and its themed asset categories, so counting fish happens in the ocean
// and spotting dinosaurs happens on Dinosaur Island.

export interface WorldFlavour {
  name: string       // world name (hints/explanations)
  emojis: string[]   // the world's own imagery (deduped)
  pools: string[]    // ASSET_POOLS keys matching the world's themes
}

export function flavourForLevel(level: LevelDef): WorldFlavour {
  const world = worldForLevel(level.id)
  const theme = themeFor(world)
  return {
    name: world.name,
    emojis: [...new Set(world.emojis)],
    pools: theme.pools.filter(k => ASSET_POOLS[k]),
  }
}

const GENERIC_FLAVOUR: WorldFlavour = { name: 'the adventure', emojis: [], pools: POOL_KEYS }

/** The world's imagery blended with its themed categories. */
function themedPool(f: WorldFlavour): string[] {
  const fromPools = f.pools.flatMap(k => ASSET_POOLS[k])
  return [...new Set([...f.emojis, ...fromPools])]
}

// ============================================================================
// Generative providers — unlimited unique questions
// ============================================================================

function genMath(d: Difficulty, f: WorldFlavour): Question {
  let a = 0, b = 0, ans = 0, sym = '+', say = ''
  if (d <= 0) { // count objects from this world
    const n = randInt(2, 6); const e = pickOne(f.emojis.length ? f.emojis : ASSET_POOLS.fruits)
    const wrong = [String(n + 1), String(Math.max(1, n - 1)), String(n + 2)]
    const { options, answer } = mc(String(n), shuffle(wrong).slice(0, 3))
    return { id: `mc:${e}:${n}`, category: 'math', difficulty: d, title: 'Math Challenge', icon: '➕',
      prompt: `How many do you see?`, countItems: Array.from({ length: n }, () => e), options, answer,
      hint: 'Point at each one and count out loud: 1, 2, 3…', say: 'How many can you count?' }
  }
  if (d === 1) { a = randInt(1, 9); b = randInt(1, 9); ans = a + b; sym = '+'; say = `What is ${a} plus ${b}?` }
  else if (d === 2) { a = randInt(6, 15); b = randInt(1, a - 1); ans = a - b; sym = '−'; say = `What is ${a} minus ${b}?` }
  else if (d === 3) { a = randInt(10, 40); b = randInt(5, 30); if (rnd() > 0.5) { ans = a + b; sym = '+'; say = `${a} plus ${b}?` } else { if (b > a) [a, b] = [b, a]; ans = a - b; sym = '−'; say = `${a} minus ${b}?` } }
  else if (d === 4) { a = randInt(2, 9); b = randInt(2, 9); ans = a * b; sym = '×'; say = `${a} times ${b}?` }
  else { a = randInt(3, 12); b = randInt(3, 12); ans = a * b; sym = '×'; say = `${a} times ${b}?` }
  const delta = () => randInt(1, Math.max(2, Math.floor(ans * 0.2) + 2))
  const wrongs = new Set<number>()
  while (wrongs.size < 3) { const w = ans + (rnd() > 0.5 ? 1 : -1) * delta(); if (w !== ans && w >= 0) wrongs.add(w) }
  const { options, answer } = mc(String(ans), [...wrongs].map(String))
  return { id: `m:${a}${sym}${b}`, category: 'math', difficulty: d, title: 'Math Challenge', icon: '➕',
    prompt: `${a} ${sym} ${b} = ?`, options, answer, hint: sym === '×' ? `Add ${a} to itself ${b} times.` : 'Use your fingers to help you count.', say }
}

function genCount(d: Difficulty, f: WorldFlavour): Question {
  const stars = randInt(3 + d, 6 + d * 2)
  const noise = randInt(2, 4 + d)
  const decoyPool = f.emojis.filter(e => e !== '⭐')
  const decoy = pickOne(decoyPool.length ? decoyPool : ['🎈', '🌸', '🍬', '🐞', '🍀'])
  const items = shuffle([...Array.from({ length: stars }, () => '⭐'), ...Array.from({ length: noise }, () => decoy)])
  const wrong = shuffle([String(stars + 1), String(Math.max(1, stars - 1)), String(stars + 2)]).slice(0, 3)
  const { options, answer } = mc(String(stars), wrong)
  return { id: `cnt:${stars}:${noise}:${decoy}`, category: 'count', difficulty: d, title: 'Star Counter', icon: '⭐',
    prompt: `How many ⭐ do you see?`, countItems: items, options, answer,
    hint: `Ignore the ${decoy} — only count the stars.`, say: 'Count the stars, quick!' }
}

const PATTERN_POOLS = [['🍎','🍌'], ['⭐','🌙','☀️'], ['🔴','🔵'], ['🐟','🐙','🦀'], ['💜','💛','💚','❤️'], ['🔺','🔵','🟩'], ['🐶','🐱'], ['🌸','🌻','🌷']]
function genPattern(d: Difficulty, f: WorldFlavour): Question {
  // Patterns are woven from this world's own imagery when it has enough.
  const pool = f.emojis.length >= 4 ? shuffle(f.emojis).slice(0, 4) : pickOne(PATTERN_POOLS)
  const unit = shuffle(pool).slice(0, Math.min(pool.length, 2 + (d >= 3 ? 1 : 0)))
  const reps = 2 + Math.floor(d / 2)
  const seq: string[] = []
  for (let i = 0; i < reps * unit.length; i++) seq.push(unit[i % unit.length])
  const next = unit[seq.length % unit.length]
  const distract = shuffle([...f.emojis, ...PATTERN_POOLS.flat()].filter(x => x !== next))
  const { options, answer } = mc(next, [...new Set(distract)].slice(0, 3))
  return { id: `pat:${seq.join('')}`, category: 'pattern', difficulty: d, title: 'Complete the Pattern', icon: '🧩',
    prompt: 'What comes next?', seq: [...seq, '?'], options, optionsEmoji: true, answer,
    hint: `Look at how ${unit.join(' ')} keeps repeating.`, say: 'What comes next in the pattern?' }
}

function genSequence(d: Difficulty): Question {
  const step = d <= 1 ? 1 : pickOne([2, 3, 5, 10])
  const start = randInt(1, 5 + d * 3)
  const seq = Array.from({ length: 5 }, (_, i) => start + i * step)
  const hole = randInt(1, 3)
  const ans = seq[hole]
  // Distinct distractors — never two identical option buttons (which would make
  // the choice ambiguous). At step 1, ans+step === ans+1, so dedupe via a Set
  // and top up from a widening spread until three unique non-answers exist.
  const wrongSet = new Set<string>()
  for (const w of [ans + step, ans - step, ans + 1, ans - 1, ans + 2 * step, ans - 2 * step, ans + step + 1]) {
    if (w >= 0 && w !== ans) wrongSet.add(String(w))
    if (wrongSet.size >= 3) break
  }
  const wrong = shuffle([...wrongSet]).slice(0, 3)
  const { options, answer } = mc(String(ans), wrong)
  return { id: `seq:${start}:${step}:${hole}`, category: 'sequence', difficulty: d, title: 'Missing Number', icon: '🔢',
    prompt: 'Which number is missing?', seq: seq.map((n, i) => (i === hole ? '?' : String(n))), options, answer,
    hint: `The numbers jump by ${step} each time.`, say: 'Which number is missing?' }
}

function genShadow(d: Difficulty, f: WorldFlavour): Question {
  // Shadows come from this world's imagery + themed categories.
  const pool = themedPool(f)
  const target = pickOne(pool)
  const nOptions = d >= 3 ? 4 : 3
  // Higher difficulty → distractors from the SAME themed pool (similar shapes).
  const distractPool = d >= 2 ? pool : [...pool, ...POOL_KEYS.flatMap(k => ASSET_POOLS[k])]
  const wrong = shuffle([...new Set(distractPool)].filter(x => x !== target)).slice(0, nOptions - 1)
  const { options, answer } = mc(target, wrong)
  return { id: `sh:${target}:${d}`, category: 'shadow', difficulty: d, title: 'Shadow Matching', icon: '🎯',
    prompt: 'Whose shadow is this?', media: target, mediaShadow: true, options, optionsEmoji: true, answer,
    hint: 'Look at the outline shape — which one matches?', say: 'Whose shadow is this?' }
}

// --- Odd one out (things from THIS world vs. one visitor) ---------------------
function genObservation(d: Difficulty, f: WorldFlavour): Question {
  const groupCount = d >= 3 ? 4 : 3
  const home = themedPool(f)
  const group = shuffle(home).slice(0, groupCount)
  // The odd one sneaks in from a category outside this world's themes.
  const awayKeys = POOL_KEYS.filter(k => !f.pools.includes(k))
  const away = ASSET_POOLS[pickOne(awayKeys.length ? awayKeys : POOL_KEYS)].filter(x => !home.includes(x))
  const odd = pickOne(away.length ? away : ASSET_POOLS.cartoon.filter(x => !group.includes(x)))
  const items = shuffle([...group, odd])
  return { id: `odd:${items.join('')}`, category: 'observation', difficulty: d, title: 'Find the Odd One', icon: '🕵️',
    prompt: 'Which one does NOT belong?', options: items, optionsEmoji: true, answer: items.indexOf(odd),
    hint: `Most of them belong in ${f.name}. One is a visitor!`, explain: `That one doesn't belong in ${f.name}!`, say: 'Find the odd one out!' }
}

// ============================================================================
// Curated providers (banks tagged into difficulty bands by index)
// ============================================================================

/** Splits a bank into 6 difficulty bands and returns the band for `d`. */
function band<T>(bank: T[], d: Difficulty): T[] {
  const size = Math.max(1, Math.ceil(bank.length / 6))
  const start = Math.min(bank.length - size, d * size)
  return bank.slice(Math.max(0, start), Math.max(size, start + size))
}
function firstUnseen<T>(items: T[], idOf: (t: T) => string, seen: Set<string>): T {
  const fresh = items.filter(t => !seen.has(idOf(t)))
  return pickOne(fresh.length ? fresh : items)
}

function curRiddle(d: Difficulty, seen: Set<string>): Question {
  const pool = band(RIDDLES, d)
  const r = firstUnseen(pool, x => `rid:${x.q}`, seen)
  const { options, answer } = mc(r.options[r.answer], r.options.filter((_, i) => i !== r.answer))
  return { id: `rid:${r.q}`, category: 'riddle', difficulty: d, title: 'Riddle Time', icon: '🤔',
    prompt: `🤔 ${r.q}`, options, answer, hint: r.hint, say: r.q, explain: 'Great thinking! 🎉' }
}

function curLanguage(d: Difficulty, seen: Set<string>): Question {
  const pool = band(OPPOSITES, d)
  const o = firstUnseen(pool, x => `opp:${x.a}`, seen)
  const { options, answer } = mc(o.b, shuffle(o.wrong).slice(0, 2))
  return { id: `opp:${o.a}`, category: 'language', difficulty: d, title: 'Opposite Day', icon: '🔤',
    prompt: `What is the opposite of "${o.a}"?`, options, answer, hint: `Think of the word that means NOT ${o.a.toLowerCase()}.`,
    say: `What is the opposite of ${o.a}?` }
}

function curKnowledge(d: Difficulty, seen: Set<string>): Question {
  const f = firstUnseen(FLAGS, x => `flag:${x.country}:${d}`, seen)
  if (d >= 4) {
    const conts = [...new Set(['Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania'].filter(c => c !== f.continent))]
    const { options, answer } = mc(f.continent, shuffle(conts).slice(0, d >= 5 ? 3 : 2))
    return { id: `flag:${f.country}:cont`, category: 'knowledge', difficulty: d, title: 'Guess the Flag', icon: '🌍',
      prompt: `Which continent is ${f.country} in?`, media: f.flag, options, answer, hint: `${f.country} is far away — think big!`, say: `Which continent is ${f.country} in?` }
  }
  if (d >= 2) {
    const wrong = shuffle(FLAGS.filter(x => x !== f)).slice(0, 2).map(x => x.capital)
    const { options, answer } = mc(f.capital, wrong)
    return { id: `flag:${f.country}:cap`, category: 'knowledge', difficulty: d, title: 'Guess the Capital', icon: '🌍',
      prompt: `What is the capital of ${f.country}?`, media: f.flag, options, answer, hint: `It is the biggest city in ${f.country}.`, say: `What is the capital of ${f.country}?` }
  }
  const wrong = shuffle(FLAGS.filter(x => x !== f)).slice(0, 2).map(x => x.country)
  const { options, answer } = mc(f.country, wrong)
  return { id: `flag:${f.country}:name`, category: 'knowledge', difficulty: d, title: 'Guess the Flag', icon: '🌍',
    prompt: 'Which country is this flag?', media: f.flag, options, answer, hint: 'Look at the colours and shapes.', say: 'Which country does this flag belong to?' }
}

// ============================================================================
// Engine — assemble a level of 6 escalating questions with no repeats
// ============================================================================

const CATEGORY_FOR: Partial<Record<GameKind, QCategory>> = {
  'math': 'math', 'missing-number': 'sequence', 'pattern': 'pattern', 'riddle': 'riddle',
  'flags': 'knowledge', 'odd-one-out': 'observation', 'shadow-match': 'shadow',
  'opposites': 'language', 'quick-count': 'count',
}

/** Which level kinds are served by the unified 6-question runner. */
export function isQuizKind(kind: GameKind): boolean {
  return kind in CATEGORY_FOR
}

function provide(cat: QCategory, d: Difficulty, seen: Set<string>, f: WorldFlavour): Question {
  switch (cat) {
    case 'math': return genMath(d, f)
    case 'count': return genCount(d, f)
    case 'pattern': return genPattern(d, f)
    case 'sequence': return genSequence(d)
    case 'shadow': return genShadow(d, f)
    case 'observation': return genObservation(d, f)
    case 'riddle': return curRiddle(d, seen)
    case 'language': return curLanguage(d, seen)
    case 'knowledge': return curKnowledge(d, seen)
  }
}

/** Six questions, difficulty 0→5, none already seen and none repeated in the
 *  set — all flavoured with the imagery of the world the level belongs to.
 *  `categoryOverride` lets the Activity Engine drive which question provider is
 *  used, independent of the level's default kind. */
export function buildLevelQuestions(level: LevelDef, seen: Set<string>, categoryOverride?: QCategory): Question[] {
  const cat = categoryOverride ?? CATEGORY_FOR[level.kind] ?? 'math'
  const flavour = (() => {
    try { return flavourForLevel(level) } catch { return GENERIC_FLAVOUR }
  })()
  const out: Question[] = []
  const usedIds = new Set<string>()
  for (let d = 0 as Difficulty; d <= 5; d = (d + 1) as Difficulty) {
    let q = provide(cat, d, seen, flavour)
    let tries = 0
    // Avoid anything already seen or already in this level (generative → just reroll).
    while ((seen.has(q.id) || usedIds.has(q.id)) && tries < 24) { q = provide(cat, d, seen, flavour); tries++ }
    usedIds.add(q.id)
    out.push({ ...q, difficulty: d })
  }
  return out
}
