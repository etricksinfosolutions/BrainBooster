import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profile, recommend } from './index.js';

const history = [
  { skill: 'math', correct: true, ms: 3000 },
  { skill: 'math', correct: false, ms: 5000 },
  { skill: 'reading', correct: true, ms: 2000 },
  { skill: 'reading', correct: true, ms: 2500 },
];

test('computes per-skill mastery', () => {
  const p = profile(history);
  assert.equal(p.mastery.math, 0.5);
  assert.equal(p.mastery.reading, 1);
  assert.equal(p.weakest, 'math');
  assert.equal(p.strongest, 'reading');
});

test('recommends reinforcing the weakest skill below threshold', () => {
  const r = recommend(history, { threshold: 0.7 });
  assert.equal(r.skill, 'math');
  assert.equal(r.reason, 'reinforce-weakness');
});

test('recommends stretching when all skills are strong', () => {
  const strong = [{ skill: 'math', correct: true, ms: 1000 }, { skill: 'reading', correct: true, ms: 1000 }];
  assert.equal(recommend(strong).reason, 'stretch-strength');
});

test('engagement is between 0 and 1', () => {
  const p = profile(history);
  assert.ok(p.engagement >= 0 && p.engagement <= 1);
});
