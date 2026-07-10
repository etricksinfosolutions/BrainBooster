import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localize, dictionaryTranslator, SUPPORTED_LOCALES } from './index.js';

test('translates known strings via the dictionary', async () => {
  const r = await localize({ a: 'Correct!', b: 'Next' }, 'es');
  assert.equal(r.strings.a, '¡Correcto!');
  assert.equal(r.strings.b, 'Siguiente');
  assert.equal(r.missing.length, 0);
});

test('flags untranslated strings as missing', async () => {
  const r = await localize({ a: 'Unknown phrase' }, 'es');
  assert.deepEqual(r.missing, ['a']);
});

test('accepts an injected translator port', async () => {
  const upper = (t) => t.toUpperCase();
  const r = await localize({ a: 'hello' }, 'xx', { translate: upper });
  assert.equal(r.strings.a, 'HELLO');
});

test('exposes supported locales', () => {
  assert.ok(SUPPORTED_LOCALES.includes('es'));
  assert.equal(dictionaryTranslator('Next', 'hi'), 'अगला');
});
