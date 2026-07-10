// ---------------------------------------------------------------------------
// Match-3 interaction & board-safety gate (Part 7)
//
// Every input method — tap-to-swap, swipe (any direction), drag, keyboard —
// funnels through two pure helpers: dirFromDelta (gesture → direction) and
// neighborInDirection (tile + direction → target), then resolveSwap. Testing
// those deterministically proves swipe-left/right/up/down, tap-swap and drag
// all resolve to the correct swap, invalid moves are rejected, and the board
// can never soft-lock.
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest'
import {
  dirFromDelta, neighborInDirection, areAdjacent,
  freshBoard, resolveSwap, findMatches, hasLegalMove,
} from '../activities/match3'

describe('Gesture direction detection (forgiving, dominant-axis)', () => {
  it('maps a swipe delta to the right direction', () => {
    expect(dirFromDelta(40, 3)).toBe('right')
    expect(dirFromDelta(-40, 3)).toBe('left')
    expect(dirFromDelta(3, 40)).toBe('down')
    expect(dirFromDelta(3, -40)).toBe('up')
  })
  it('ignores a tiny movement (that is a tap, not a swipe)', () => {
    expect(dirFromDelta(4, 5)).toBeNull()
    expect(dirFromDelta(0, 0)).toBeNull()
  })
  it('picks the dominant axis on a diagonal', () => {
    expect(dirFromDelta(30, 12)).toBe('right')
    expect(dirFromDelta(12, 30)).toBe('down')
  })
})

describe('Neighbour resolution — swipe/arrow lands on the correct tile', () => {
  const n = 5
  it('returns the adjacent index in each direction (centre tile)', () => {
    const c = 12 // row 2, col 2
    expect(neighborInDirection(c, 'left', n)).toBe(11)
    expect(neighborInDirection(c, 'right', n)).toBe(13)
    expect(neighborInDirection(c, 'up', n)).toBe(7)
    expect(neighborInDirection(c, 'down', n)).toBe(17)
    expect(areAdjacent(c, 13, n)).toBe(true)
  })
  it('returns null at the board edge (edge swipe is ignored, not wrapped)', () => {
    expect(neighborInDirection(0, 'left', n)).toBeNull()
    expect(neighborInDirection(0, 'up', n)).toBeNull()
    expect(neighborInDirection(4, 'right', n)).toBeNull()
    expect(neighborInDirection(24, 'down', n)).toBeNull()
    // a wrapped move must never read as adjacent
    expect(areAdjacent(4, 5, n)).toBe(false)
  })
})

describe('Swap resolution — valid swaps score, invalid ones are rejected', () => {
  const n = 5
  // Swapping (0,2)=1 with the tile below it (1,2)=0 completes the top row 0,0,0.
  const board = [
    0, 0, 1, 2, 2,
    2, 2, 0, 1, 1,
    1, 0, 2, 0, 2,
    0, 1, 0, 1, 0,
    2, 0, 1, 2, 1,
  ]
  it('a swipe-up/down that forms a line clears it and scores', () => {
    const from = 7 // (1,2)
    const up = neighborInDirection(from, 'up', n)!  // → 2, forms the match
    const res = resolveSwap(board, n, from, up, 3)
    expect(res).not.toBeNull()
    expect(res!.gained).toBeGreaterThan(0)
  })
  it('a swap that forms no line is rejected (invalid move → shake, no change)', () => {
    const res = resolveSwap(board, n, 0, 1, 3) // top-left pair, no match
    expect(res).toBeNull()
  })
})

describe('No soft-locks — the board always offers a legal move', () => {
  it('freshly dealt boards have a legal move and no free matches, every time', () => {
    for (let t = 0; t < 40; t++) {
      const b = freshBoard(5, 4)
      expect(findMatches(b, 5).size).toBe(0)
      expect(hasLegalMove(b, 5)).toBe(true)
    }
  })
  it('after a cascade, resolveSwap never hands back a dead board', () => {
    const b = freshBoard(6, 5)
    // try many random adjacent swaps; any that resolve must stay playable
    for (let i = 0; i < b.length; i++) {
      for (const d of ['right', 'down'] as const) {
        const j = neighborInDirection(i, d, 6)
        if (j == null) continue
        const res = resolveSwap(b, 6, i, j, 5)
        if (res) expect(hasLegalMove(res.cells, 6)).toBe(true)
      }
    }
  })
})
