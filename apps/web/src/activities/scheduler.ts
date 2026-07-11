// ---------------------------------------------------------------------------
// Brain Booster Kids — Activity Scheduler
// Picks the next activity so the game feels fresh for years, not days. Rules,
// in priority order:
//   1. Match the level's difficulty tier.
//   2. Never repeat the same INTERACTION MECHANIC back-to-back (the core fix
//      for "it's always the same kind of game").
//   3. Prefer activities themed to the world the child is currently in.
//   4. Prioritise UNSEEN activities; only repeat once the pool is exhausted,
//      then pick the least-recently-seen.
//   5. Personalise: gently favour the child's weakest skill, and lean into the
//      kinds of games they actually finish.
// Pure & deterministic (seeded) so a given (level, history) is stable, but the
// choice evolves as the child's history grows.
// ---------------------------------------------------------------------------
import { LevelDef, Skill, SkillMap, seededRandom } from '../data/levels'
import { worldForLevel } from '../data/worlds'
import { themeFor } from '../theme'
import { ACTIVITY_TYPES } from './catalog'
import { ActivityType, ActivitySpec, ActivityLog, Mechanic } from './types'

/** How many recent activities/mechanics to remember for the no-repeat window. */
export const RECENT_WINDOW = 12
export const MECHANIC_COOLDOWN = 1   // mechanics can't appear within N levels

export interface ScheduleContext {
  recentActivities: string[]   // most-recent-first activity ids
  recentMechanics: string[]    // most-recent-first mechanics
  activityLog: ActivityLog
  skills: SkillMap
}

/** Difficulty 0..5 for a level's tier, nudged up a touch inside the tier. */
function difficultyFor(level: LevelDef): number {
  return Math.min(5, level.tierIndex + (level.id % 5 >= 3 ? 1 : 0))
}

/** Mechanic knob sized to the tier (pairs, board dim, #diffs, word length…). */
export function sizeForMechanic(m: Mechanic, tierIndex: number): number {
  const t = Math.max(0, Math.min(4, tierIndex))
  switch (m) {
    case 'memory-flip':     return [3, 4, 6, 8, 10][t]
    case 'memory-sequence': return [3, 4, 5, 6, 7][t]
    case 'quick-tap':       return [6, 8, 10, 12, 14][t]
    case 'spell':           return [3, 4, 5, 6, 8][t]
    case 'sorting':         return [6, 6, 8, 9, 10][t]
    case 'match3':          return 5                       // 5×5 board, target scales
    case 'maze':            return [4, 5, 6, 7, 8][t]      // grid dimension
    case 'find-difference': return [2, 3, 3, 4, 5][t]      // number of differences
    case 'sliding':         return [3, 3, 3, 4, 4][t]      // n×n tiles
    // Self-scaling engines: reflex / recall / arithmetic / logicgrid read
    // level.tierIndex directly and ignore spec.size. We still return a positive,
    // tier-rising value so every scheduled spec has size ≥ 1 (never a 0-size spec).
    case 'reflex':          return [3, 4, 5, 6, 7][t]
    case 'recall':          return [3, 4, 5, 6, 7][t]
    case 'arithmetic':      return [3, 4, 5, 6, 7][t]
    case 'logicgrid':       return [3, 4, 5, 6, 7][t]
    default:                return t + 1                    // quiz / story (size unused; kept ≥1)
  }
}

export function weakestSkill(skills: SkillMap): Skill | null {
  let weak: Skill | null = null
  let score = Infinity
  for (const [skill, s] of Object.entries(skills) as [Skill, { plays: number; totalAccuracy: number }][]) {
    if (!s.plays) continue
    const avg = s.totalAccuracy / s.plays
    if (avg < score) { score = avg; weak = skill }
  }
  return score < 0.85 ? weak : null   // only steer when there's a real weak spot
}

function toSpec(type: ActivityType, level: LevelDef, themeTags: string[]): ActivitySpec {
  return {
    activityId: type.id,
    mechanic: type.mechanic,
    name: type.name,
    icon: type.icon,
    skill: type.skill,
    category: type.category,
    difficulty: difficultyFor(level),
    size: sizeForMechanic(type.mechanic, level.tierIndex),
    themeTags: type.themes && type.themes.length ? type.themes : themeTags,
    quizCategory: type.quizCategory,
    pool: type.pool,
  }
}

/**
 * Chooses the activity for a level. Deterministic given (level, ctx) so the
 * same state always resolves the same spec, but variety emerges as history
 * grows. Never throws — falls back to a safe quiz if the catalogue is odd.
 */
/**
 * Rebuilds the EXACT spec for a specific activity id on a level — used to pin
 * the activity a child already played on a completed level, so revisiting it
 * from the map always replays the SAME kind of challenge (not a fresh reshuffle
 * of which mechanic runs). Returns null if the id is no longer in the catalogue.
 */
export function specForActivityId(level: LevelDef, activityId: string): ActivitySpec | null {
  const type = ACTIVITY_TYPES().find(a => a.id === activityId)
  if (!type) return null
  const tags = themeFor(worldForLevel(level.id)).tags
  return toSpec(type, level, tags)
}

export function pickActivity(level: LevelDef, ctx: ScheduleContext): ActivitySpec {
  const tier = level.tierIndex
  const tags = themeFor(worldForLevel(level.id)).tags
  const all = ACTIVITY_TYPES()
  const inTier = all.filter(a => tier >= a.minTier && tier <= a.maxTier)
  const base = inTier.length ? inTier : all

  // (2) no back-to-back mechanic
  const cooling = new Set(ctx.recentMechanics.slice(0, MECHANIC_COOLDOWN))
  let pool = base.filter(a => !cooling.has(a.mechanic))
  if (!pool.length) pool = base

  // (3) prefer themed-to-this-world (with a fallback so we never empty out)
  const themed = pool.filter(a => !a.themes || a.themes.some(t => tags.includes(t)))
  if (themed.length) pool = themed

  // (4) unseen first, then least-recently-seen
  const recent = new Set(ctx.recentActivities.slice(0, RECENT_WINDOW))
  const neverPlayed = pool.filter(a => !ctx.activityLog[a.id] && !recent.has(a.id))
  const notRecent = pool.filter(a => !recent.has(a.id))
  let choicePool = neverPlayed.length ? neverPlayed : notRecent.length ? notRecent : pool

  // (5) personalise: gently steer toward the weakest skill
  const rng = seededRandom(level.id * 97 + Object.keys(ctx.activityLog).length * 13)
  const weak = weakestSkill(ctx.skills)
  if (weak) {
    const forWeak = choicePool.filter(a => a.skill === weak)
    if (forWeak.length && rng() < 0.6) choicePool = forWeak
  }

  const pick = choicePool[Math.floor(rng() * choicePool.length)] ?? base[0] ?? all[0]
  return toSpec(pick, level, tags)
}
