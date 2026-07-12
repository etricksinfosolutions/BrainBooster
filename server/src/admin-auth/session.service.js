/**
 * Server-side session store — the source of truth for "is this session still
 * valid?", enabling real logout/invalidation and inactivity timeout on top of a
 * stateless JWT.
 *
 * A session token (JWT) carries the sessionId; every request re-validates the
 * sessionId here. Deleting the record => the token is dead immediately.
 *
 * In-memory Map now; swap for Redis/Postgres by reimplementing this class.
 */

const crypto = require('crypto');
const { config } = require('./config');

/**
 * @typedef {Object} AdminSession
 * @property {string} id
 * @property {string} userId
 * @property {string} username
 * @property {import('./roles').Role} role
 * @property {string} ip
 * @property {string} userAgent
 * @property {number} createdAt
 * @property {number} lastActivityAt
 * @property {string} csrfToken
 */

class SessionService {
  /** @param {{ now?: () => number }} [deps] */
  constructor(deps = {}) {
    /** @type {Map<string, AdminSession>} */
    this._store = new Map();
    this._now = deps.now || Date.now;
    this._absoluteTtl = config.sessionAbsoluteTtlMs;
    this._idleTtl = config.sessionInactivityTtlMs;
  }

  /**
   * @param {{ userId: string, username: string, role: string, ip: string, userAgent: string }} p
   * @returns {AdminSession}
   */
  create(p) {
    const now = this._now();
    /** @type {AdminSession} */
    const session = {
      id: crypto.randomUUID(),
      userId: p.userId,
      username: p.username,
      role: p.role,
      ip: p.ip || 'unknown',
      userAgent: p.userAgent || 'unknown',
      createdAt: now,
      lastActivityAt: now,
      csrfToken: crypto.randomBytes(24).toString('hex'),
    };
    this._store.set(session.id, session);
    return session;
  }

  /**
   * Validate a session id against absolute + idle expiry. Expired sessions are
   * revoked as a side effect so they can't be reused.
   * @param {string} id
   * @returns {{ ok: boolean, session?: AdminSession, reason?: 'missing' | 'expired' | 'idle' }}
   */
  validate(id) {
    const session = typeof id === 'string' ? this._store.get(id) : undefined;
    if (!session) return { ok: false, reason: 'missing' };
    const now = this._now();
    if (now - session.createdAt > this._absoluteTtl) {
      this._store.delete(id);
      return { ok: false, reason: 'expired' };
    }
    if (now - session.lastActivityAt > this._idleTtl) {
      this._store.delete(id);
      return { ok: false, reason: 'idle' };
    }
    return { ok: true, session };
  }

  /** Slide the inactivity window forward. No effect on the absolute cap. */
  touch(id) {
    const session = this._store.get(id);
    if (session) session.lastActivityAt = this._now();
    return session || null;
  }

  /** Explicit logout / invalidation. */
  revoke(id) {
    return this._store.delete(id);
  }

  /** Revoke every session for a user (e.g. password change, forced logout). */
  revokeAllForUser(userId) {
    let n = 0;
    for (const [id, s] of this._store) {
      if (s.userId === userId) {
        this._store.delete(id);
        n++;
      }
    }
    return n;
  }

  size() {
    return this._store.size;
  }
}

module.exports = { SessionService };
