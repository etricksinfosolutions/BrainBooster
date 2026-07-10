// ---------------------------------------------------------------------------
// Brain Booster Kids — level engine
// 100 levels across 12 game categories. Difficulty ramps in 5 tiers and each
// tier introduces new mechanics. Deterministic: the same level always builds
// the same challenge shape (content is seeded by level number).
// ---------------------------------------------------------------------------

export type GameKind =
  | 'memory-flip'      // Memory: match pairs
  | 'memory-sequence'  // Memory: Simon-style sequence
  | 'math'             // Math: counting / + / − / ×
  | 'odd-one-out'      // Observation
  | 'shadow-match'     // Observation
  | 'flags'            // GK: flags / capitals / continents
  | 'pattern'          // Logic: what comes next
  | 'missing-number'   // Logic
  | 'spell'            // Language: unscramble the word
  | 'opposites'        // Language
  | 'riddle'           // Riddles
  | 'story'            // Story activity
  | 'quick-tap'        // 30-second challenge
  | 'quick-count'      // 30-second challenge

export type Tier = 'Very Easy' | 'Easy' | 'Medium' | 'Hard' | 'Expert'

export interface LevelDef {
  id: number
  kind: GameKind
  tier: Tier
  tierIndex: number          // 0..4
  title: string
  skill: Skill
  /** knob passed to the game component: pairs, digits, sequence length, etc. */
  size: number
  milestone?: 'big' | 'chest' | 'badge' | 'golden' | 'champion'
}

export type Skill = 'memory' | 'logic' | 'observation' | 'math' | 'language' | 'knowledge' | 'speed'

export const SKILL_LABEL: Record<Skill, string> = {
  memory: 'Memory', logic: 'Logic', observation: 'Observation',
  math: 'Math', language: 'Language', knowledge: 'Knowledge', speed: 'Focus & Speed',
}

const KIND_META: Record<GameKind, { title: string; skill: Skill }> = {
  'memory-flip':     { title: 'Match the Pairs', skill: 'memory' },
  'memory-sequence': { title: 'Remember the Sequence', skill: 'memory' },
  'math':            { title: 'Number Ninja', skill: 'math' },
  'odd-one-out':     { title: 'Find the Odd One', skill: 'observation' },
  'shadow-match':    { title: 'Whose Shadow?', skill: 'observation' },
  'flags':           { title: 'Flag Explorer', skill: 'knowledge' },
  'pattern':         { title: 'What Comes Next?', skill: 'logic' },
  'missing-number':  { title: 'Missing Number', skill: 'logic' },
  'spell':           { title: 'Spell It!', skill: 'language' },
  'opposites':       { title: 'Opposite Day', skill: 'language' },
  'riddle':          { title: 'Riddle Time', skill: 'logic' },
  'story':           { title: 'Story Corner', skill: 'language' },
  'quick-tap':       { title: 'Fruit Frenzy (30s)', skill: 'speed' },
  'quick-count':     { title: 'Star Counter (30s)', skill: 'speed' },
}

/** The rotation of game kinds inside every 20-level tier. New mechanics
 *  unlock as levels progress: the first tier starts gentle, later tiers
 *  mix in sequences, riddles and timed challenges. */
const TIER_ROTATIONS: GameKind[][] = [
  // Levels 1–20 · Very Easy — gentle introductions
  ['memory-flip','math','odd-one-out','shadow-match','spell','memory-flip','pattern','math','story','quick-tap',
   'memory-flip','odd-one-out','flags','math','spell','shadow-match','pattern','riddle','story','quick-count'],
  // Levels 21–40 · Easy — sequences + opposites unlock
  ['memory-sequence','math','flags','pattern','spell','odd-one-out','memory-flip','opposites','riddle','quick-tap',
   'missing-number','shadow-match','math','memory-sequence','flags','spell','story','pattern','opposites','quick-count'],
  // Levels 41–60 · Medium — bigger boards, capitals unlock
  ['memory-flip','missing-number','flags','memory-sequence','math','riddle','pattern','spell','odd-one-out','quick-tap',
   'opposites','flags','memory-sequence','math','shadow-match','missing-number','story','riddle','pattern','quick-count'],
  // Levels 61–80 · Hard — multiplication + long sequences
  ['memory-sequence','math','flags','pattern','missing-number','spell','riddle','memory-flip','opposites','quick-tap',
   'odd-one-out','math','memory-sequence','flags','missing-number','riddle','story','pattern','spell','quick-count'],
  // Levels 81–100 · Expert — everything at full difficulty
  ['memory-flip','math','memory-sequence','missing-number','flags','riddle','pattern','spell','opposites','quick-tap',
   'memory-sequence','math','flags','odd-one-out','missing-number','riddle','story','pattern','memory-flip','quick-count'],
]

const TIERS: Tier[] = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Expert']

function milestoneFor(id: number, total = 100): LevelDef['milestone'] {
  if (id === total) return 'champion'
  if (id % 50 === 0) return 'golden'
  if (id % 25 === 0) return 'badge'
  if (id % 10 === 0) return 'chest'
  if (id % 5 === 0) return 'big'
  return undefined
}

/** Difficulty knob per kind per tier (pairs, digits, sequence length...) */
function sizeFor(kind: GameKind, tierIndex: number): number {
  switch (kind) {
    case 'memory-flip':     return [3, 4, 6, 8, 10][tierIndex]      // pairs
    case 'memory-sequence': return [3, 4, 5, 6, 7][tierIndex]       // sequence length
    case 'math':            return tierIndex                        // 0 count,1 add,2 sub,3 add/sub big,4 mult
    case 'quick-tap':       return [6, 8, 10, 12, 14][tierIndex]    // targets to tap
    case 'quick-count':     return [5, 8, 12, 16, 20][tierIndex]    // stars to count
    case 'flags':           return tierIndex                        // 0-1 flag→country, 2-3 capitals, 4 continents
    case 'pattern':         return [3, 3, 4, 4, 5][tierIndex]       // pattern window
    case 'missing-number':  return [5, 10, 20, 50, 100][tierIndex]  // number range
    case 'spell':           return [3, 4, 5, 6, 8][tierIndex]       // max word length
    default:                return tierIndex
  }
}

/** Builds `total` levels using the tier rotation. `total` is server-driven so
 *  the catalogue can grow (or shrink) without an app update — the five tiers
 *  stretch to cover however many levels the content document defines. */
export function buildLevelsFor(total: number): LevelDef[] {
  const count = Math.max(5, Math.floor(total) || 100)
  const perTier = Math.ceil(count / 5)
  const levels: LevelDef[] = []
  for (let id = 1; id <= count; id++) {
    const tierIndex = Math.min(4, Math.floor((id - 1) / perTier))
    const rotation = TIER_ROTATIONS[tierIndex]
    const kind = rotation[(id - 1) % rotation.length]
    const meta = KIND_META[kind]
    levels.push({
      id, kind, tier: TIERS[tierIndex], tierIndex,
      title: meta.title, skill: meta.skill,
      size: sizeFor(kind, tierIndex),
      milestone: milestoneFor(id, count),
    })
  }
  return levels
}

export function buildLevels(): LevelDef[] { return buildLevelsFor(100) }

/** The active catalogue. Seeded with the built-in 100 and replaced at startup
 *  by whatever the server content document provides (see contentService). */
export let LEVELS = buildLevels()

/** Swaps in a server-driven catalogue. Callers read LEVELS at render time so the
 *  new list flows through the whole app on the next render. */
export function setLevels(next: LevelDef[]) { LEVELS = next }

// --- Reward engine -----------------------------------------------------------

export interface RewardResult {
  stars: 1 | 2 | 3
  coins: number
  diamonds: number
  xp: number
  praise: boolean
}

/** stars from accuracy+speed, coins/xp scale with tier; milestones pay extra. */
export function computeReward(level: LevelDef, accuracy: number, opts?: { premium?: boolean }): RewardResult {
  const stars: 1 | 2 | 3 = accuracy >= 0.95 ? 3 : accuracy >= 0.7 ? 2 : 1
  const base = 10 + level.tierIndex * 5
  let coins = base * stars
  let diamonds = 0
  let xp = 20 + level.tierIndex * 10 + stars * 5
  switch (level.milestone) {
    case 'big': coins += 25; break
    case 'chest': coins += 60; diamonds += 1; break
    case 'badge': coins += 100; diamonds += 3; break
    case 'golden': coins += 250; diamonds += 5; break
    case 'champion': coins += 500; diamonds += 10; break
  }
  if (opts?.premium) { coins = Math.round(coins * 1.5); xp = Math.round(xp * 1.25) }
  return { stars, coins, diamonds, xp, praise: true }
}

/** Simple mulberry32 PRNG so each level generates the same content. */
export function seededRandom(seed: number) {
  let a = seed + 0x6d2b79f5
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// --- Adaptive recommendation (on-device "AI coach") ---------------------------

export interface SkillStats { plays: number; totalAccuracy: number }
export type SkillMap = Partial<Record<Skill, SkillStats>>

/** Recommends the unlocked level that trains the child's weakest skill. */
export function recommendLevel(skills: SkillMap, unlockedMax: number): { level: LevelDef; reason: string } {
  const entries = Object.entries(skills) as [Skill, SkillStats][]
  let weakest: Skill | null = null
  let weakestScore = Infinity
  for (const [skill, s] of entries) {
    if (s.plays === 0) continue
    const avg = s.totalAccuracy / s.plays
    if (avg < weakestScore) { weakestScore = avg; weakest = skill }
  }
  const pool = LEVELS.filter(l => l.id <= unlockedMax)
  if (!weakest || weakestScore > 0.85) {
    const level = pool[pool.length - 1]
    return { level, reason: 'You are doing great everywhere — keep climbing!' }
  }
  const match = [...pool].reverse().find(l => l.skill === weakest) ?? pool[pool.length - 1]
  return { level: match, reason: `A little extra ${SKILL_LABEL[weakest]} practice will make you unstoppable!` }
}
