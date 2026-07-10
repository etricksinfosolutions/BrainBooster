// @brainbooster/shared — tiny cross-cutting utilities shared by services and agents.
// Deliberately dependency-free so every service/agent can consume it without install cost.

/** Structured JSON logger. Usage: const log = createLogger('content-service'); log.info('up', {port}). */
export function createLogger(scope) {
  const emit = (level, msg, meta) =>
    console.log(JSON.stringify({ t: new Date().toISOString(), level, scope, msg, ...(meta || {}) }));
  return {
    info: (m, meta) => emit('info', m, meta),
    warn: (m, meta) => emit('warn', m, meta),
    error: (m, meta) => emit('error', m, meta),
  };
}

/** Read a config value from env with a typed default. */
export function env(key, fallback) {
  const v = process.env[key];
  return v === undefined || v === '' ? fallback : v;
}

/** Deterministic seeded PRNG (mulberry32) — reproducible content/agent output without Math.random. */
export function seeded(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard health payload used by every service's /health route. */
export function health(service, version = '1.0.0') {
  return { service, version, status: 'ok', ts: new Date().toISOString() };
}
