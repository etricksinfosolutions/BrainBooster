import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBoard } from './logic.js';

test('keeps only a user best and ranks descending', () => {
  const b = createBoard();
  b.submit('a', 100);
  b.submit('a', 50); // ignored, lower
  b.submit('b', 120);
  b.submit('c', 80);
  const top = b.top(2);
  assert.equal(top[0].userId, 'b');
  assert.equal(top[0].rank, 1);
  assert.equal(top[1].userId, 'a');
  assert.equal(b.rankOf('c'), 3);
  assert.equal(b.size(), 3);
});
