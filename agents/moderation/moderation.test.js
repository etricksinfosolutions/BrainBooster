import { test } from 'node:test';
import assert from 'node:assert/strict';
import { screenUsername, screenText } from './index.js';

test('allows a friendly username', () => {
  assert.equal(screenUsername('TigoFan7').ok, true);
});

test('blocks profanity and impersonation, and suggests an alternative', () => {
  const r = screenUsername('stupidAdmin');
  assert.equal(r.ok, false);
  assert.ok(r.reasons.includes('profanity'));
  assert.ok(r.reasons.includes('impersonation'));
  assert.match(r.suggestion, /^Player\d+$/);
});

test('blocks PII in usernames', () => {
  assert.ok(screenUsername('me@mail.com').reasons.includes('contains-email'));
});

test('screens free text for phone numbers and profanity', () => {
  assert.ok(screenText('call me 555-123-4567').reasons.includes('contains-phone'));
  assert.equal(screenText('I love this game!').ok, true);
});
