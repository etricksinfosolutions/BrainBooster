import { test } from 'node:test';
import assert from 'node:assert/strict';
import { query, generateApproved } from './logic.js';

const catalog = [
  { id: '1', topic: 'math' }, { id: '2', topic: 'math' }, { id: '3', topic: 'animals' },
];

test('filters by topic and paginates', () => {
  const r = query(catalog, { topic: 'math', page: 0, size: 1 });
  assert.equal(r.total, 2);
  assert.equal(r.items.length, 1);
  assert.equal(r.items[0].topic, 'math');
});

test('generates only quality-approved activities', async () => {
  const items = await generateApproved('math', 4, { seed: 1 });
  assert.equal(items.length, 4);
  for (const a of items) assert.ok(a.options.length >= 3);
});
