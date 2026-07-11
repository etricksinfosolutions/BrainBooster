export type Dir = 'up' | 'down' | 'left' | 'right';
/** Dominant-axis direction of a drag/swipe delta (screen coords: +y is down).
 *  Returns null only for a near-zero movement (a tap, not a swipe). */
export declare function dirFromDelta(dx: number, dy: number, min?: number): Dir | null;
/** Board index of the neighbour of `i` in direction `dir`, or null if that
 *  would leave the n×n grid (so an edge swipe is simply ignored, not wrapped). */
export declare function neighborInDirection(i: number, dir: Dir, n: number): number | null;
/** True when a and b are orthogonally adjacent on the n×n grid. */
export declare function areAdjacent(a: number, b: number, n: number): boolean;
/** Indices that belong to a horizontal or vertical run of 3+. */
export declare function findMatches(cells: number[], n: number): Set<number>;
/** Removes matched cells, drops survivors down, refills the top randomly. */
export declare function collapse(cells: number[], matched: Set<number>, n: number, kindCount: number): number[];
/** True if ANY single adjacent swap would create a match. */
export declare function hasLegalMove(cells: number[], n: number): boolean;
/** A board with no free matches AND at least one legal move (never a dead deal). */
export declare function freshBoard(n: number, kindCount: number): number[];
export interface SwapResult {
    cells: number[];
    gained: number;
}
/**
 * Applies a swap of two indices and cascades all resulting matches. Returns
 * null if the swap creates no match (an illegal move — board unchanged). The
 * returned board is guaranteed to still have a legal move (reshuffled if the
 * cascade left it dead), so play can never deadlock.
 */
export declare function resolveSwap(cells: number[], n: number, i: number, j: number, kindCount: number): SwapResult | null;
//# sourceMappingURL=index.d.ts.map