// leaderboard-service domain logic (pure) — an in-memory ranked board.
export function createBoard() {
  const scores = new Map(); // userId -> best score
  return {
    submit(userId, score) {
      const best = scores.get(userId) ?? -Infinity;
      if (score > best) scores.set(userId, score);
      return scores.get(userId);
    },
    top(n = 10) {
      return [...scores.entries()]
        .map(([userId, score]) => ({ userId, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, n)
        .map((row, i) => ({ rank: i + 1, ...row }));
    },
    rankOf(userId) {
      const ordered = this.top(Infinity);
      const found = ordered.find((r) => r.userId === userId);
      return found ? found.rank : null;
    },
    size() { return scores.size; },
  };
}
