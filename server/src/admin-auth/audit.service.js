/**
 * Audit logging. Records security-relevant events with role, timestamp, IP and
 * user agent. Passwords and CAPTCHA answers are NEVER passed in or stored.
 *
 * Two sinks by default: a structured console line (for log aggregation) and a
 * bounded in-memory ring buffer (queried by the SUPER_ADMIN "Audit Logs"
 * screen). A custom sink (DB writer, SIEM) can be injected without changing
 * callers.
 */

const crypto = require('crypto');
const { config } = require('./config');

/** Canonical event names. */
const AUDIT_EVENTS = Object.freeze({
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  ACCOUNT_LOCK: 'ACCOUNT_LOCK',
  SESSION_REFRESH: 'SESSION_REFRESH',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  ACCESS_DENIED: 'ACCESS_DENIED',
});

// Defensive allow-list of fields we will persist, so a caller can never smuggle
// a password into the audit trail even by accident.
const ALLOWED_FIELDS = ['event', 'username', 'role', 'ip', 'userAgent', 'reason', 'detail'];

/**
 * @typedef {Object} AuditEntry
 * @property {string} id
 * @property {string} timestamp   ISO-8601
 * @property {string} event
 * @property {string} [username]
 * @property {string} [role]
 * @property {string} [ip]
 * @property {string} [userAgent]
 * @property {string} [reason]
 * @property {string} [detail]
 */

class AuditService {
  /** @param {{ now?: () => number, sink?: (e: AuditEntry) => void, silent?: boolean }} [deps] */
  constructor(deps = {}) {
    this._now = deps.now || Date.now;
    this._buffer = [];
    this._max = config.auditBufferSize;
    this._silent = Boolean(deps.silent);
    this._sink = deps.sink || null;
  }

  /**
   * @param {{ event: string } & Partial<AuditEntry>} input
   * @returns {AuditEntry}
   */
  log(input) {
    /** @type {AuditEntry} */
    const entry = {
      id: crypto.randomUUID(),
      timestamp: new Date(this._now()).toISOString(),
      event: input.event,
    };
    for (const field of ALLOWED_FIELDS) {
      if (field === 'event') continue;
      const value = input[field];
      if (value !== undefined && value !== null) entry[field] = String(value);
    }

    this._buffer.push(entry);
    if (this._buffer.length > this._max) this._buffer.shift();

    if (this._sink) {
      try {
        this._sink(entry);
      } catch {
        /* a failing custom sink must not break the auth flow */
      }
    }
    if (!this._silent) {
      // Structured, single-line, password-free.
      // eslint-disable-next-line no-console
      console.info(`[audit] ${JSON.stringify(entry)}`);
    }
    return entry;
  }

  /**
   * Most recent entries first.
   * @param {{ limit?: number, event?: string, username?: string }} [q]
   * @returns {AuditEntry[]}
   */
  query(q = {}) {
    let rows = this._buffer.slice().reverse();
    if (q.event) rows = rows.filter((r) => r.event === q.event);
    if (q.username) {
      const u = String(q.username).toLowerCase();
      rows = rows.filter((r) => (r.username || '').toLowerCase() === u);
    }
    const limit = Math.min(Math.max(1, q.limit || 100), 500);
    return rows.slice(0, limit);
  }

  size() {
    return this._buffer.length;
  }
}

module.exports = { AuditService, AUDIT_EVENTS };
