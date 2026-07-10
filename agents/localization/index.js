// Localization Agent
// Translates content strings using an injectable translator. A built-in
// dictionary translator makes it runnable offline/deterministic; pass a real
// `translate(text, locale) => Promise<string>` port (MT / LLM) in production.

const DICT = {
  es: { 'Correct!': '¡Correcto!', 'Try again': 'Inténtalo de nuevo', 'Well done': 'Bien hecho', 'Next': 'Siguiente' },
  hi: { 'Correct!': 'सही!', 'Try again': 'फिर कोशिश करो', 'Well done': 'शाबाश', 'Next': 'अगला' },
  fr: { 'Correct!': 'Correct!', 'Try again': 'Réessaye', 'Well done': 'Bravo', 'Next': 'Suivant' },
};

/** Default dictionary translator: returns the known translation or the source (flagged). */
export function dictionaryTranslator(text, locale) {
  const t = DICT[locale]?.[text];
  return t ?? text;
}

/**
 * Localize a map of strings into a target locale.
 * @param {Record<string,string>} strings
 * @param {string} locale
 * @param {{translate?:Function}} opts
 * @returns {Promise<{locale:string, strings:Record<string,string>, missing:string[]}>}
 */
export async function localize(strings, locale, opts = {}) {
  const translate = opts.translate || dictionaryTranslator;
  const out = {}, missing = [];
  for (const [key, value] of Object.entries(strings)) {
    const translated = await translate(value, locale);
    out[key] = translated;
    if (translated === value && !DICT[locale]?.[value]) missing.push(key);
  }
  return { locale, strings: out, missing };
}

export const SUPPORTED_LOCALES = Object.keys(DICT);
