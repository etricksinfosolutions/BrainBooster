// ---------------------------------------------------------------------------
// Brain Booster Kids — Modular Activity Engine · core types
//
// An "activity" is DATA, not code. Every playable thing is described by an
// ActivityType (a template in the catalogue) which the scheduler turns into a
// concrete ActivitySpec for a given level + child. A small set of interaction
// "mechanics" (the verbs — match, sort, navigate, spell, swap…) render any
// spec, so new activity types are added by appending catalogue data, never by
// touching application code. The catalogue is server-downloadable, so the set
// of activities can grow to millions without shipping a new app build.
// ---------------------------------------------------------------------------
import { Skill } from '../data/levels'
import { QCategory } from '../data/questions'

/** The interaction verbs. Each maps to exactly one renderer (see mechanics). */
export type Mechanic =
  | 'quiz'            // answer escalating questions (math, count, pattern, riddle…)
  | 'memory-flip'     // flip & match pairs
  | 'memory-sequence' // watch & repeat (Simon)
  | 'spell'           // drag letters into place
  | 'fillcolor'       // colour-by-number: fill each square with its matching colour
  | 'quick-tap'       // tap the right moving things against the clock
  | 'sorting'         // drag/tap items into the right buckets
  | 'match3'          // swap to line up 3+ on an educational board
  | 'maze'            // navigate a character to the goal
  | 'find-difference' // spot what changed between two scenes
  | 'sliding'         // slide tiles into the solved order
  | 'reflex'          // fast reflex/speed mini-games (tap, reaction, balloon…)
  | 'recall'          // show-then-recall memory games (number, word, position…)
  | 'arithmetic'      // fast mental-math games (add, sub, mul, div, race)
  | 'logicgrid'       // procedural logic puzzles (pyramid, pattern, deduce…)

/** Every mechanic that has a renderer. Anything else must NEVER be scheduled
 *  (it would have no component and render a blank screen). */
export const MECHANICS: Mechanic[] = [
  'quiz', 'memory-flip', 'memory-sequence', 'spell', 'fillcolor', 'quick-tap',
  'sorting', 'match3', 'maze', 'find-difference', 'sliding',
  'reflex', 'recall', 'arithmetic', 'logicgrid',
]
export const isMechanic = (m: unknown): m is Mechanic => typeof m === 'string' && (MECHANICS as string[]).includes(m)

/** The board/knob families used to size a mechanic per difficulty. */
export interface ActivityType {
  id: string           // stable unique id (e.g. 'sort-animals', 'match3-ocean')
  name: string         // child-facing title ("Animal Sorting")
  icon: string         // emoji shown in titles/pickers
  mechanic: Mechanic
  skill: Skill         // which skill it trains (drives personalization)
  category: string     // grouping label for analytics/UX ("Sorting", "Puzzle"…)
  minTier: number      // earliest difficulty tier it appears (0..4)
  maxTier: number      // latest tier it appears (0..4)
  themes?: string[]    // world-theme tags it fits best (undefined = any world)
  pool?: string        // ASSET_POOLS key hint for its content
  quizCategory?: QCategory // for mechanic 'quiz' — which question provider
  fresh?: boolean      // marquee "brand-new kind of game" flag (UX can badge it)
}

/** A concrete, ready-to-play activity for one level and child. */
export interface ActivitySpec {
  activityId: string
  mechanic: Mechanic
  name: string
  icon: string
  skill: Skill
  category: string
  difficulty: number   // 0..5 (escalates with tier)
  size: number         // mechanic knob: pairs, board dim, #diffs, word length…
  themeTags: string[]  // world theme tags → themed content
  quizCategory?: QCategory
  pool?: string
}

/** One row of the User Activity Mapping — what a child did with an activity. */
export interface ActivityRecord {
  plays: number
  completed: number
  skips: number
  stars: number        // best stars earned
  hints: number        // total hints used
  bestMs: number       // best completion time (ms), 0 = none yet
  lastLevel: number    // last level it was served at
  ts: number           // last-seen day-index (see scheduler; avoids Date in data)
}

export type ActivityLog = Record<string, ActivityRecord>
