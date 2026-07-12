/**
 * Brute-force protection, keyed per username.
 *
 * - Max N failed attempts (default 5) → lock for M minutes (default 15).
 * - Counter resets on successful login.
 * - Lock events are surfaced to the caller so they can be audited.
 *
 * In-memory Map now; swap for Redis to make it multi-instance.
 */

const { config } = require('./config');

/** @typedef {{ failures: number, lockedUntil: number }} ThrottleRecord */

class LoginThrottleService {
  /** @param {{ now?: () => number }} [deps] */
  constructor(deps = {}) {
    /** @type {Map<string, ThrottleRecord>} */
    this._store = new Map();
    this._now = deps.now || Date.now;
    this._max = config.maxFailedAttempts;
    this._lockMs = config.lockDurationMs;
  }

  _key(username) {
    return String(username || '').trim().toLowerCase();
  }

  /**
   * @param {string} username
   * @returns {{ locked: boolean, retryAfterMs: number, remaining: number }}
   */
  status(username) {
    const rec = this._store.get(this._key(username));
    if (!rec) return { locked: false, retryAfterMs: 0, remaining: this._max };
    const now = this._now();
    if (rec.lockedUntil > now) {
      return { locked: true, retryAfterMs: rec.lockedUntil - now, remaining: 0 };
    }
    return { locked: false, retryAfterMs: 0, remaining: Math.max(0, this._max - rec.failures) };
  }

  /**
   * Record a failed attempt. Returns whether this failure caused a lock (so the
   * caller can emit a distinct ACCOUNT_LOCK audit event exactly once).
   * @param {string} username
   * @returns {{ locked: boolean, justLocked: boolean, retryAfterMs: number, remaining: number }}
   */
  recordFailure(username) {
    const key = this._key(username);
    const now = this._now();
    const rec = this._store.get(key) || { failures: 0, lockedUntil: 0 };

    // If a prior lock has expired, start a fresh window.
    if (rec.lockedUntil && rec.lockedUntil <= now) {
      rec.failures = 0;
      rec.lockedUntil = 0;
    }

    const wasLocked = rec.lockedUntil > now;
    rec.failures += 1;

    let justLocked = false;
    if (!wasLocked && rec.failures >= this._max) {
      rec.lockedUntil = now + this._lockMs;
      justLocked = true;
    }
    this._store.set(key, rec);

    const locked = rec.lockedUntil > now;
    return {
      locked,
      justLocked,
      retryAfterMs: locked ? rec.lockedUntil - now : 0,
      remaining: Math.max(0, this._max - rec.failures),
    };
  }

  /** Clear the counter after a successful login. */
  recordSuccess(username) {
    this._store.delete(this._key(username));
  }

  /** Test helper: force-clear all state. */
  reset() {
    this._store.clear();
  }
}

module.exports = { LoginThrottleService };
