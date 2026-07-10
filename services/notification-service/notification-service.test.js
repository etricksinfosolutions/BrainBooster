import { test } from 'node:test';
import assert from 'node:assert/strict';
import { render, dedupe, NOTIFICATION_TYPES } from './logic.js';

test('renders a streak notification', () => {
  const n = render('streak', { days: 5 });
  assert.match(n.body, /5-day streak/);
});

test('throws on unknown notification type', () => {
  assert.throws(() => render('nope'));
});

test('dedupes same user+type', () => {
  const out = dedupe([
    { userId: 'a', type: 'streak' }, { userId: 'a', type: 'streak' }, { userId: 'a', type: 'daily-bonus' },
  ]);
  assert.equal(out.length, 2);
});

test('exposes all notification types', () => {
  assert.ok(NOTIFICATION_TYPES.includes('parent-report'));
});
