import { test } from 'node:test';
import assert from 'node:assert/strict';
// Service re-exports agent behaviour; verify the wiring contract stays intact.
import { activeUsersByDay, funnel } from '../../agents/analytics/index.js';

test('analytics agent is reachable from the service package path', () => {
  const events = [{ userId: 'a', day: 0, event: 'open' }, { userId: 'b', day: 0, event: 'open' }];
  assert.equal(activeUsersByDay(events)[0], 2);
  assert.equal(funnel(events, ['open'])[0].users, 2);
});
