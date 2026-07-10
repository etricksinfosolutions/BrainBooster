// Quality Review Agent
// Validates AI-generated activities against structural + child-safety rules and
// returns a pass/reject verdict with actionable reasons. This is the publish gate.

const BANNED = ['kill', 'blood', 'gun', 'hate', 'stupid'];

/**
 * @param {object} activity a generated activity payload
 * @returns {{ok:boolean, score:number, issues:string[]}}
 */
export function review(activity) {
  const issues = [];
  if (!activity || typeof activity !== 'object') return { ok: false, score: 0, issues: ['not-an-object'] };
  if (!activity.prompt || activity.prompt.length < 4) issues.push('prompt-too-short');
  if (!Array.isArray(activity.options) || activity.options.length < 3) issues.push('need-3+-options');
  if (activity.options && new Set(activity.options).size !== activity.options.length) issues.push('duplicate-options');
  if (typeof activity.answer !== 'number' || activity.answer < 0 ||
      (activity.options && activity.answer >= activity.options.length)) issues.push('answer-out-of-range');
  const text = `${activity.prompt || ''} ${(activity.options || []).join(' ')}`.toLowerCase();
  if (BANNED.some((w) => text.includes(w))) issues.push('unsafe-language');
  if (!activity.explanation) issues.push('missing-explanation');

  const score = Math.max(0, 1 - issues.length * 0.2);
  return { ok: issues.length === 0, score, issues };
}

/** Partition a batch into approved / rejected. */
export function screenBatch(activities) {
  const approved = [], rejected = [];
  for (const a of activities) (review(a).ok ? approved : rejected).push(a);
  return { approved, rejected };
}
