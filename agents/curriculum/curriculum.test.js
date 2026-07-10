import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPath, GOAL_KEYS } from './index.js';

test('orders math skills by prerequisite', () => {
  const { path } = buildPath({ age: 8, goal: 'math' });
  assert.deepEqual(path.slice(0, 2), ['counting', 'addition']);
  assert.ok(path.indexOf('addition') < path.indexOf('subtraction'));
  assert.ok(path.indexOf('addition') < path.indexOf('multiplication'));
});

test('skips age-inappropriate skills', () => {
  const { path, skipped } = buildPath({ age: 4, goal: 'math' });
  assert.ok(path.includes('counting'));
  assert.ok(skipped.includes('addition'));
});

test('rejects an unknown goal', () => {
  assert.throws(() => buildPath({ age: 6, goal: 'nope' }));
});

test('exposes goal keys', () => {
  assert.deepEqual(GOAL_KEYS.sort(), ['literacy', 'math', 'reasoning']);
});
