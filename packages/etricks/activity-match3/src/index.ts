// ---------------------------------------------------------------------------
// Match-3 board logic (pure, testable) — extracted verbatim from Brain Booster
// (apps/web/src/activities/match3.ts) as the platform's first `activity-*`
// package (see ADR-0012 migration, ADR-0013 naming). Behaviour is UNCHANGED.
//
// Boards are flat arrays of kind-indices (0..kindCount-1). Kept free of React
// so the invariants that matter — no free matches on deal, and ALWAYS at least
// one legal move (never a dead board a child can get stuck on) — are unit
// tested. The renderer (Brain Booster's mechanics.tsx) is a thin shell over it.
// ---------------------------------------------------------------------------

const rand = (k: number) => Math.floor(Math.random() * k)

// --- Gesture geometry (pure, testable) --------------------------------------
// Shared by every input method (tap-swap, swipe, drag, keyboard) so a child can
// move a tile however feels natural. The renderer just translates a pointer /
// key event into (index, direction) and asks these helpers what to swap.

export type Dir = 'up' | 'down' | 'left' | 'right'

/** Dominant-axis direction of a drag/swipe delta (screen coords: +y is down).
 *  Returns null only for a near-zero movement (a tap, not a swipe). */
export function dirFromDelta(dx: number, dy: number, min = 12): Dir | null {
  if (Math.abs(dx) < min && Math.abs(dy) < min) return null
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'right' : 'left'
  return dy > 0 ? 'down' : 'up'
}

/** Board index of the neighbour of `i` in direction `dir`, or null if that
 *  would leave the n×n grid (so an edge swipe is simply ignored, not wrapped). */
export function neighborInDirection(i: number, dir: Dir, n: number): number | null {
  const r = Math.floor(i / n), c = i % n
  if (dir === 'left') return c > 0 ? i - 1 : null
  if (dir === 'right') return c < n - 1 ? i + 1 : null
  if (dir === 'up') return r > 0 ? i - n : null
  return r < n - 1 ? i + n : null   // down
}

/** True when a and b are orthogonally adjacent on the n×n grid. */
export function areAdjacent(a: number, b: number, n: number): boolean {
  const ra = Math.floor(a / n), ca = a % n, rb = Math.floor(b / n), cb = b % n
  return Math.abs(ra - rb) + Math.abs(ca - cb) === 1
}

/** Indices that belong to a horizontal or vertical run of 3+. */
export function findMatches(cells: number[], n: number): Set<number> {
  const matched = new Set<number>()
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const v = cells[r * n + c]
    if (c <= n - 3 && v === cells[r * n + c + 1] && v === cells[r * n + c + 2]) {
      for (let k = c; k < n && cells[r * n + k] === v; k++) matched.add(r * n + k)
    }
    if (r <= n - 3 && v === cells[(r + 1) * n + c] && v === cells[(r + 2) * n + c]) {
      for (let k = r; k < n && cells[k * n + c] === v; k++) matched.add(k * n + c)
    }
  }
  return matched
}

/** Removes matched cells, drops survivors down, refills the top randomly. */
export function collapse(cells: number[], matched: Set<number>, n: number, kindCount: number): number[] {
  const next = cells.slice()
  for (let c = 0; c < n; c++) {
    const survivors: number[] = []
    for (let r = n - 1; r >= 0; r--) { const i = r * n + c; if (!matched.has(i)) survivors.push(cells[i]) }
    for (let r = n - 1, k = 0; r >= 0; r--) next[r * n + c] = k < survivors.length ? survivors[k++] : rand(kindCount)
  }
  return next
}

/** True if ANY single adjacent swap would create a match. */
export function hasLegalMove(cells: number[], n: number): boolean {
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const i = r * n + c
    if (c < n - 1) { const s = cells.slice();[s[i], s[i + 1]] = [s[i + 1], s[i]]; if (findMatches(s, n).size) return true }
    if (r < n - 1) { const s = cells.slice();[s[i], s[i + n]] = [s[i + n], s[i]]; if (findMatches(s, n).size) return true }
  }
  return false
}

/** A board with no free matches AND at least one legal move (never a dead deal). */
export function freshBoard(n: number, kindCount: number): number[] {
  let cells: number[] = []
  let guard = 0
  do {
    cells = Array.from({ length: n * n }, () => rand(kindCount))
    let m = findMatches(cells, n), g2 = 0
    while (m.size && g2++ < 80) { cells = collapse(cells, m, n, kindCount); m = findMatches(cells, n) }
    // If refills leave no legal move, reroll the whole board.
  } while (!hasLegalMove(cells, n) && guard++ < 60)
  return cells
}

export interface SwapResult { cells: number[]; gained: number }

/**
 * Applies a swap of two indices and cascades all resulting matches. Returns
 * null if the swap creates no match (an illegal move — board unchanged). The
 * returned board is guaranteed to still have a legal move (reshuffled if the
 * cascade left it dead), so play can never deadlock.
 */
export function resolveSwap(cells: number[], n: number, i: number, j: number, kindCount: number): SwapResult | null {
  const swapped = cells.slice();
  [swapped[i], swapped[j]] = [swapped[j], swapped[i]]
  if (!findMatches(swapped, n).size) return null
  let cur = swapped, gained = 0, guard = 0
  let m = findMatches(cur, n)
  while (m.size && guard++ < 80) { gained += m.size; cur = collapse(cur, m, n, kindCount); m = findMatches(cur, n) }
  if (!hasLegalMove(cur, n)) cur = freshBoard(n, kindCount)   // never hand back a dead board
  return { cells: cur, gained }
}
