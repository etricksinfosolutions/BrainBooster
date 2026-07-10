// Difficulty Balancer Agent
// Monitors per-level completion/retry/abandon rates and recommends a difficulty
// delta to keep players in the flow channel (target completion ~0.75).

/**
 * @param {{completions:number, attempts:number, abandons:number}} stats
 * @param {{target?:number}} opts
 * @returns {{completionRate:number, abandonRate:number, delta:-1|0|1, action:string}}
 */
export function balance(stats, { target = 0.75 } = {}) {
  const attempts = Math.max(1, stats.attempts);
  const completionRate = stats.completions / attempts;
  const abandonRate = (stats.abandons || 0) / attempts;

  // Too hard: low completion or high abandonment -> ease it.
  if (completionRate < target - 0.15 || abandonRate > 0.3) {
    return { completionRate, abandonRate, delta: -1, action: 'ease' };
  }
  // Too easy: near-perfect completion, no abandonment -> harder.
  if (completionRate > target + 0.15 && abandonRate < 0.05) {
    return { completionRate, abandonRate, delta: 1, action: 'harden' };
  }
  return { completionRate, abandonRate, delta: 0, action: 'hold' };
}

/** Apply a delta to a difficulty tier, clamped to [1,5]. */
export function applyDelta(tier, delta) {
  return Math.max(1, Math.min(5, tier + delta));
}
