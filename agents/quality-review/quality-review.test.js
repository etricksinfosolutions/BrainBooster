import { test } from 'node:test';
import assert from 'node:assert/strict';
import { review, screenBatch } from './index.js';

const good = { prompt: 'What is 2 + 2?', options: ['3', '4', '5', '6'], answer: 1, explanation: '2+2=4.' };

test('approves a well-formed activity', () => {
  const r = review(good);
  assert.equal(r.ok, true);
  assert.equal(r.score, 1);
});

test('rejects out-of-range answers and short prompts', () => {
  const r = review({ prompt: 'no', options: ['a', 'b', 'c'], answer: 9, explanation: 'x' });
  assert.equal(r.ok, false);
  assert.ok(r.issues.includes('answer-out-of-range'));
  assert.ok(r.issues.includes('prompt-too-short'));
});

test('rejects unsafe language', () => {
  const r = review({ prompt: 'Which animal can kill?', options: ['a', 'b', 'c'], answer: 0, explanation: 'x' });
  assert.ok(r.issues.includes('unsafe-language'));
});

test('screenBatch partitions approved vs rejected', () => {
  const { approved, rejected } = screenBatch([good, { prompt: 'x', options: [], answer: 0 }]);
  assert.equal(approved.length, 1);
  assert.equal(rejected.length, 1);
});
