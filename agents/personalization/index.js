// Personalization Agent
// Learns per-skill strengths/weaknesses and engagement from a player's attempt
// history, then recommends the next skill to practise. Pure function of history.

/**
 * @param {Array<{skill:string, correct:boolean, ms:number}>} history
 * @returns {{mastery:Record<string,number>, weakest:string|null, strongest:string|null, engagement:number}}
 */
export function profile(history) {
  const bySkill = {};
  for (const h of history) {
    const s = (bySkill[h.skill] ||= { n: 0, correct: 0, ms: 0 });
    s.n++; s.correct += h.correct ? 1 : 0; s.ms += h.ms || 0;
  }
  const mastery = {};
  for (const [skill, s] of Object.entries(bySkill)) mastery[skill] = s.n ? s.correct / s.n : 0;
  const skills = Object.keys(mastery);
  const weakest = skills.length ? skills.reduce((a, b) => (mastery[a] <= mastery[b] ? a : b)) : null;
  const strongest = skills.length ? skills.reduce((a, b) => (mastery[a] >= mastery[b] ? a : b)) : null;
  // Engagement: fast + consistent answering trends high; long gaps/timeouts trend low.
  const avgMs = history.length ? history.reduce((t, h) => t + (h.ms || 0), 0) / history.length : 0;
  const engagement = Math.max(0, Math.min(1, 1 - avgMs / 20000));
  return { mastery, weakest, strongest, engagement };
}

/** Recommend the next skill: reinforce the weakest below a threshold, else stretch. */
export function recommend(history, { threshold = 0.7 } = {}) {
  const p = profile(history);
  if (p.weakest && p.mastery[p.weakest] < threshold) {
    return { skill: p.weakest, reason: 'reinforce-weakness', mastery: p.mastery[p.weakest] };
  }
  return { skill: p.strongest, reason: 'stretch-strength', mastery: p.strongest ? p.mastery[p.strongest] : 0 };
}
