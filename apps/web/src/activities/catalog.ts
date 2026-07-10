// ---------------------------------------------------------------------------
// Brain Booster Kids — Activity Catalogue
// The library of activity *types*. Marquee, hand-authored types cover every
// mechanic and skill; themed variants are then expanded across worlds so the
// catalogue exceeds 100 distinct activities out of the box — and grows further
// from the server at runtime (see contentService.mergeActivityTypes).
// Everything here is pure data: adding an activity = adding a row.
// ---------------------------------------------------------------------------
import { ActivityType, Mechanic, isMechanic } from './types'
import { Skill } from '../data/levels'
import { QCategory } from '../data/questions'

// --- Marquee, hand-authored activities ---------------------------------------
// One "signature" entry per mechanic/flavour, spread across the difficulty
// tiers and skills. `quiz` fans out into its question providers so the single
// quiz renderer already delivers many distinct-feeling activities.

const MARQUEE: ActivityType[] = [
  // Quiz family (the escalating 6-question runner, one per provider)
  q('math', 'Number Ninja', '➕', 'math', 'Math', 0, 4),
  q('count', 'Count the Critters', '🔢', 'math', 'Counting', 0, 2),
  q('pattern', 'What Comes Next?', '🧩', 'logic', 'Patterns', 0, 4),
  q('sequence', 'Missing Number', '🔟', 'logic', 'Logic', 1, 4),
  q('shadow', 'Whose Shadow?', '🎯', 'observation', 'Observation', 0, 4),
  q('observation', 'Find the Odd One', '🕵️', 'observation', 'Observation', 0, 4),
  q('riddle', 'Riddle Time', '🤔', 'logic', 'Riddles', 1, 4),
  q('language', 'Opposite Day', '🔄', 'language', 'Language', 1, 4),
  q('knowledge', 'Flag Explorer', '🌍', 'knowledge', 'World', 2, 4),

  // Memory
  m('memory-flip', 'mem-pairs', 'Memory Match', '🧠', 'memory', 'Memory', 0, 4),
  m('memory-sequence', 'mem-simon', 'Repeat the Beat', '🎵', 'memory', 'Memory', 1, 4),
  m('memory-flip', 'mem-cards', 'Memory Cards', '🃏', 'memory', 'Memory', 2, 4),

  // Language
  m('spell', 'spell-word', 'Spell It!', '🔤', 'language', 'Spelling', 0, 4),
  m('spell', 'word-builder', 'Word Builder', '🔡', 'language', 'Spelling', 2, 4),

  // Story
  m('story', 'story-corner', 'Story Corner', '📖', 'language', 'Stories', 0, 4),
  m('story', 'story-adventure', 'Story Adventure', '📚', 'language', 'Stories', 1, 4),

  // Speed
  m('quick-tap', 'fruit-frenzy', 'Fruit Frenzy', '🍓', 'speed', 'Speed', 0, 4),
  m('quick-tap', 'reaction-test', 'Reaction Test', '⚡', 'speed', 'Speed', 1, 4),

  // NEW mechanics — the variety boost
  fresh('sorting', 'sort-things', 'Object Sorting', '🧺', 'observation', 'Sorting', 0, 4),
  fresh('sorting', 'food-sort', 'Healthy vs Treat', '🥗', 'knowledge', 'Sorting', 1, 4),
  fresh('match3', 'match3-classic', 'Match-3 Mania', '💎', 'observation', 'Match-3', 1, 4),
  fresh('match3', 'color-crush', 'Color Crush', '🌈', 'observation', 'Match-3', 0, 4),
  fresh('maze', 'maze-escape', 'Maze Escape', '🌽', 'logic', 'Maze', 1, 4),
  fresh('maze', 'robot-navigation', 'Robot Navigation', '🤖', 'logic', 'Maze', 2, 4),
  fresh('find-difference', 'spot-difference', 'Spot the Difference', '🔍', 'observation', 'Spot', 0, 4),
  fresh('find-difference', 'spot-mistake', 'Spot the Mistake', '❌', 'observation', 'Spot', 1, 4),
  fresh('sliding', 'sliding-puzzle', 'Sliding Puzzle', '🧩', 'logic', 'Puzzle', 1, 4),
  fresh('sliding', 'picture-slide', 'Picture Slide', '🖼️', 'logic', 'Puzzle', 2, 4),
]

// --- Themed expansion --------------------------------------------------------
// Each of these mechanics plays completely differently with different content,
// so every (mechanic × theme) is a genuinely distinct activity. This lifts the
// catalogue well past 100 while every entry stays real and playable.

interface ThemeDef { tag: string; label: string; icon: string; pool?: string }
const THEMES: ThemeDef[] = [
  { tag: 'ocean',   label: 'Ocean',    icon: '🐠', pool: 'sea' },
  { tag: 'forest',  label: 'Forest',   icon: '🦊', pool: 'animals' },
  { tag: 'dino',    label: 'Dino',     icon: '🦕', pool: 'dinos' },
  { tag: 'space',   label: 'Space',    icon: '🚀', pool: 'vehicles' },
  { tag: 'farm',    label: 'Farm',     icon: '🐄', pool: 'vegetables' },
  { tag: 'jungle',  label: 'Jungle',   icon: '🐒', pool: 'animals' },
  { tag: 'snow',    label: 'Snow',     icon: '⛄', pool: 'animals' },
  { tag: 'city',    label: 'City',     icon: '🚗', pool: 'vehicles' },
  { tag: 'magic',   label: 'Magic',    icon: '🦄', pool: 'cartoon' },
  { tag: 'beach',   label: 'Beach',    icon: '🏖️', pool: 'fruits' },
]

// Which mechanics get themed variants, and how to name them.
const THEMED: { mechanic: Mechanic; verb: string; skill: Skill; category: string; minTier: number; maxTier: number }[] = [
  { mechanic: 'sorting',         verb: 'Sorting',        skill: 'observation', category: 'Sorting', minTier: 0, maxTier: 4 },
  { mechanic: 'match3',          verb: 'Match-3',        skill: 'observation', category: 'Match-3', minTier: 1, maxTier: 4 },
  { mechanic: 'find-difference', verb: 'Spotting',       skill: 'observation', category: 'Spot',    minTier: 0, maxTier: 4 },
  { mechanic: 'memory-flip',     verb: 'Memory',         skill: 'memory',      category: 'Memory',  minTier: 0, maxTier: 4 },
  { mechanic: 'quick-tap',       verb: 'Dash',           skill: 'speed',       category: 'Speed',   minTier: 0, maxTier: 4 },
  { mechanic: 'maze',            verb: 'Maze',           skill: 'logic',       category: 'Maze',    minTier: 1, maxTier: 4 },
  { mechanic: 'sliding',         verb: 'Slide Puzzle',   skill: 'logic',       category: 'Puzzle',  minTier: 1, maxTier: 4 },
  { mechanic: 'story',           verb: 'Tales',          skill: 'language',    category: 'Stories', minTier: 0, maxTier: 4 },
]

// The genuinely-new interaction verbs get the "fresh" badge.
const FRESH_MECHANICS = new Set<Mechanic>(['sorting', 'match3', 'maze', 'find-difference', 'sliding'])

function buildThemed(): ActivityType[] {
  const out: ActivityType[] = []
  for (const t of THEMES) {
    for (const v of THEMED) {
      out.push({
        id: `${v.mechanic}-${t.tag}`,
        name: `${t.label} ${v.verb}`,
        icon: t.icon,
        mechanic: v.mechanic,
        skill: v.skill,
        category: v.category,
        minTier: v.minTier,
        maxTier: v.maxTier,
        themes: [t.tag],
        pool: t.pool,
        fresh: FRESH_MECHANICS.has(v.mechanic),
      })
    }
  }
  return out
}

// --- The active catalogue ----------------------------------------------------

let CATALOG: ActivityType[] = dedupe([...MARQUEE, ...buildThemed()])

export function ACTIVITY_TYPES(): ActivityType[] { return CATALOG }

/** Merge server-delivered activity types in (id wins → last write). Lets the
 *  backend grow the library with no app update (see contentService). */
export function mergeActivityTypes(extra: ActivityType[]) {
  CATALOG = dedupe([...CATALOG, ...extra.filter(isValidType)])
}

export function activityTypeById(id: string): ActivityType | undefined {
  return CATALOG.find(a => a.id === id)
}

// --- helpers -----------------------------------------------------------------

function q(cat: QCategory, name: string, icon: string, skill: Skill, category: string, minTier: number, maxTier: number): ActivityType {
  return { id: `quiz-${cat}`, name, icon, mechanic: 'quiz', skill, category, minTier, maxTier, quizCategory: cat }
}
function m(mechanic: Mechanic, id: string, name: string, icon: string, skill: Skill, category: string, minTier: number, maxTier: number): ActivityType {
  return { id, name, icon, mechanic, skill, category, minTier, maxTier }
}
function fresh(mechanic: Mechanic, id: string, name: string, icon: string, skill: Skill, category: string, minTier: number, maxTier: number): ActivityType {
  return { ...m(mechanic, id, name, icon, skill, category, minTier, maxTier), fresh: true }
}
function dedupe(list: ActivityType[]): ActivityType[] {
  const seen = new Map<string, ActivityType>()
  for (const a of list) seen.set(a.id, a)   // later entries win
  return [...seen.values()]
}
function isValidType(a: any): a is ActivityType {
  // A server type is only admitted if its mechanic has a renderer — otherwise
  // scheduling it would produce a blank screen.
  return a && typeof a.id === 'string' && typeof a.name === 'string' && isMechanic(a.mechanic)
}
