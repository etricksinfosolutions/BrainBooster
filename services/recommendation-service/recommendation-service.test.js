import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recommend } from '../../agents/personalization/index.js';

test('recommendation agent is reachable and returns a skill', () => {
  const r = recommend([{ skill: 'math', correct: false, ms: 4000 }]);
  assert.equal(r.skill, 'math');
  assert.ok(['reinforce-weakness', 'stretch-strength'].includes(r.reason));
});
