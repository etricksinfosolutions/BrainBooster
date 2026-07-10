// Curriculum Agent
// Builds an ordered learning path for an age group + goal by sequencing skills
// along a prerequisite graph (topological order), gated by age-appropriateness.

const SKILL_GRAPH = {
  counting: { minAge: 4, requires: [] },
  addition: { minAge: 5, requires: ['counting'] },
  subtraction: { minAge: 6, requires: ['counting', 'addition'] },
  multiplication: { minAge: 7, requires: ['addition'] },
  letters: { minAge: 4, requires: [] },
  words: { minAge: 5, requires: ['letters'] },
  reading: { minAge: 6, requires: ['words'] },
  logic: { minAge: 6, requires: ['counting'] },
};

const GOALS = {
  math: ['counting', 'addition', 'subtraction', 'multiplication'],
  literacy: ['letters', 'words', 'reading'],
  reasoning: ['counting', 'logic'],
};

/** Topologically order a set of skills so prerequisites always come first. */
function topoOrder(skills) {
  const out = [], seen = new Set();
  const visit = (s) => {
    if (seen.has(s)) return;
    seen.add(s);
    for (const dep of SKILL_GRAPH[s]?.requires || []) if (skills.has(dep)) visit(dep);
    out.push(s);
  };
  for (const s of skills) visit(s);
  return out;
}

/**
 * @param {{age:number, goal:'math'|'literacy'|'reasoning'}} spec
 * @returns {{path:string[], skipped:string[]}}
 */
export function buildPath({ age, goal }) {
  const wanted = GOALS[goal];
  if (!wanted) throw new Error(`Unknown goal: ${goal}`);
  const eligible = new Set(), skipped = [];
  for (const s of wanted) (age >= SKILL_GRAPH[s].minAge ? eligible.add(s) : skipped.push(s));
  return { path: topoOrder(eligible), skipped };
}

export const GOAL_KEYS = Object.keys(GOALS);
