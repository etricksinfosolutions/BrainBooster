import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activeUsersByDay, retention, funnel } from './index.js';

const events = [
  { userId: 'a', day: 0, event: 'open' },
  { userId: 'a', day: 0, event: 'play' },
  { userId: 'b', day: 0, event: 'open' },
  { userId: 'a', day: 1, event: 'open' },
  { userId: 'c', day: 1, event: 'open' },
];

test('counts distinct active users per day', () => {
  const d = activeUsersByDay(events);
  assert.equal(d[0], 2);
  assert.equal(d[1], 2);
});

test('computes D1 retention for the day-0 cohort', () => {
  // cohort day0 = {a,b}; active on day1 = {a,c}; retained = {a} => 0.5
  assert.equal(retention(events, 0, 1), 0.5);
});

test('computes funnel conversion in order', () => {
  const f = funnel(events, ['open', 'play']);
  assert.equal(f[0].users, 3);
  assert.equal(f[1].users, 1);
  assert.ok(f[1].rate < f[0].rate);
});
