import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateActivity, generateBatch, TOPIC_KEYS } from './index.js';

test('generates a well-formed math activity', async () => {
  const a = await generateActivity({ topic: 'math', seed: 42 });
  assert.equal(a.type, 'quiz');
  assert.equal(a.options.length, 4);
  assert.ok(a.answer >= 0 && a.answer < a.options.length);
  assert.equal(a.options[a.answer], String(eval(a.prompt.replace('What is', '').replace('?', ''))));
});

test('is deterministic for a given seed', async () => {
  const a = await generateActivity({ topic: 'animals', seed: 7 });
  const b = await generateActivity({ topic: 'animals', seed: 7 });
  assert.deepEqual(a, b);
});

test('rejects an unknown topic', async () => {
  await assert.rejects(() => generateActivity({ topic: 'nope' }));
});

test('generateBatch returns the requested count', async () => {
  const batch = await generateBatch('math', 5, { seed: 1 });
  assert.equal(batch.length, 5);
  assert.equal(new Set(batch.map((x) => x.id)).size, 5);
});

test('exposes available topics', () => {
  assert.ok(TOPIC_KEYS.includes('math'));
  assert.ok(TOPIC_KEYS.includes('animals'));
});
