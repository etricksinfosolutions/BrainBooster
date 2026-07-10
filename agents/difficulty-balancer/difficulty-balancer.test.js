import { test } from 'node:test';
import assert from 'node:assert/strict';
import { balance, applyDelta } from './index.js';

test('eases a level that is too hard', () => {
  const r = balance({ completions: 40, attempts: 100, abandons: 35 });
  assert.equal(r.action, 'ease');
  assert.equal(r.delta, -1);
});

test('hardens a level that is too easy', () => {
  const r = balance({ completions: 98, attempts: 100, abandons: 1 });
  assert.equal(r.action, 'harden');
  assert.equal(r.delta, 1);
});

test('holds a level in the flow channel', () => {
  const r = balance({ completions: 75, attempts: 100, abandons: 10 });
  assert.equal(r.action, 'hold');
  assert.equal(r.delta, 0);
});

test('applyDelta clamps to [1,5]', () => {
  assert.equal(applyDelta(5, 1), 5);
  assert.equal(applyDelta(1, -1), 1);
  assert.equal(applyDelta(3, 1), 4);
});
