/**
 * Canonical activity catalogue for the admin portal's Level→Activity picker.
 * Mirrors the web app's built-in catalogue (apps/web/src/activities/catalog.ts)
 * so the dropdown lists the same activities the game can render. Kept as plain
 * data here because the server cannot import the web app's TS modules.
 */

/** @typedef {{ id: string, name: string, icon: string, mechanic: string, category: string }} ActivityMeta */

/** @type {ActivityMeta[]} */
const CANONICAL_ACTIVITIES = [
  { id: 'fill-colors', name: 'Fill the Colors', icon: '🎨', mechanic: 'fillcolor', category: 'Creative' },
  { id: 'color-by-number', name: 'Color by Number', icon: '🖌️', mechanic: 'fillcolor', category: 'Creative' },
  { id: 'fruit-frenzy', name: 'Fruit Frenzy', icon: '🍓', mechanic: 'quick-tap', category: 'Speed' },
  { id: 'reaction-test', name: 'Reaction Test', icon: '⚡', mechanic: 'quick-tap', category: 'Speed' },
  { id: 'sort-things', name: 'Object Sorting', icon: '🧺', mechanic: 'sorting', category: 'Sorting' },
  { id: 'food-sort', name: 'Healthy vs Treat', icon: '🥗', mechanic: 'sorting', category: 'Sorting' },
  { id: 'match3-classic', name: 'Match-3 Mania', icon: '💎', mechanic: 'match3', category: 'Match-3' },
  { id: 'color-crush', name: 'Color Crush', icon: '🌈', mechanic: 'match3', category: 'Match-3' },
  { id: 'maze-escape', name: 'Maze Escape', icon: '🌽', mechanic: 'maze', category: 'Maze' },
  { id: 'robot-navigation', name: 'Robot Navigation', icon: '🤖', mechanic: 'maze', category: 'Maze' },
  { id: 'spot-difference', name: 'Spot the Difference', icon: '🔍', mechanic: 'find-difference', category: 'Spot' },
  { id: 'spot-mistake', name: 'Spot the Mistake', icon: '❌', mechanic: 'find-difference', category: 'Spot' },
  { id: 'sliding-puzzle', name: 'Sliding Puzzle', icon: '🧩', mechanic: 'sliding', category: 'Puzzle' },
  { id: 'picture-slide', name: 'Picture Slide', icon: '🖼️', mechanic: 'sliding', category: 'Puzzle' },
  { id: 'reflex-tap', name: 'Tap Fast', icon: '👆', mechanic: 'reflex', category: 'Reflex' },
  { id: 'reflex-reaction', name: 'Reaction Time', icon: '🚦', mechanic: 'reflex', category: 'Reflex' },
  { id: 'reflex-balloon', name: 'Balloon Pop', icon: '🎈', mechanic: 'reflex', category: 'Reflex' },
  { id: 'reflex-target', name: 'Target Hit', icon: '🎯', mechanic: 'reflex', category: 'Reflex' },
  { id: 'reflex-colorswitch', name: 'Color Switch', icon: '🌈', mechanic: 'reflex', category: 'Reflex' },
  { id: 'recall-number', name: 'Number Recall', icon: '🔢', mechanic: 'recall', category: 'Memory' },
  { id: 'recall-word', name: 'Word Recall', icon: '📝', mechanic: 'recall', category: 'Memory' },
  { id: 'recall-color', name: 'Color Recall', icon: '🎨', mechanic: 'recall', category: 'Memory' },
  { id: 'recall-position', name: 'Position Memory', icon: '📍', mechanic: 'recall', category: 'Memory' },
  { id: 'recall-image', name: 'Image Recall', icon: '📸', mechanic: 'recall', category: 'Memory' },
  { id: 'math-add', name: 'Mental Addition', icon: '➕', mechanic: 'arithmetic', category: 'Mental Math' },
  { id: 'math-sub', name: 'Mental Subtraction', icon: '➖', mechanic: 'arithmetic', category: 'Mental Math' },
  { id: 'math-mul', name: 'Multiplication Speed', icon: '✖️', mechanic: 'arithmetic', category: 'Mental Math' },
  { id: 'math-div', name: 'Division Challenge', icon: '➗', mechanic: 'arithmetic', category: 'Mental Math' },
  { id: 'math-race', name: 'Arithmetic Race', icon: '🏁', mechanic: 'arithmetic', category: 'Mental Math' },
  { id: 'logic-pyramid', name: 'Number Pyramid', icon: '🔺', mechanic: 'logicgrid', category: 'Logic' },
  { id: 'logic-missing', name: 'Missing Piece', icon: '🧩', mechanic: 'logicgrid', category: 'Logic' },
  { id: 'logic-pattern', name: 'Pattern Completion', icon: '📈', mechanic: 'logicgrid', category: 'Logic' },
  { id: 'logic-domino', name: 'Domino Logic', icon: '🎲', mechanic: 'logicgrid', category: 'Logic' },
  { id: 'logic-deduce', name: 'Deductive Reasoning', icon: '🔎', mechanic: 'logicgrid', category: 'Logic' },
]

const TIERS = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Expert']
const DEFAULT_TOTAL_LEVELS = 100

/**
 * Build lightweight level metadata (id + tier) matching the web app's 5-tier
 * ramp across `total` levels (20 per tier for the default 100).
 * @param {number} [total]
 * @returns {{ id: number, tier: string, tierIndex: number }[]}
 */
function buildLevelMetas(total = DEFAULT_TOTAL_LEVELS) {
  const per = Math.max(1, Math.floor(total / TIERS.length))
  const out = []
  for (let id = 1; id <= total; id++) {
    const tierIndex = Math.min(TIERS.length - 1, Math.floor((id - 1) / per))
    out.push({ id, tier: TIERS[tierIndex], tierIndex })
  }
  return out
}

const ACTIVITY_IDS = new Set(CANONICAL_ACTIVITIES.map((a) => a.id))

module.exports = { CANONICAL_ACTIVITIES, ACTIVITY_IDS, buildLevelMetas, DEFAULT_TOTAL_LEVELS, TIERS }
