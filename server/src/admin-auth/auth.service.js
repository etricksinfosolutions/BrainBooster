/**
 * AuthService — orchestrates the login flow using only injected abstractions
 * (UserProvider, PasswordHasher, Captcha, Session, Throttle, Audit). It contains
 * no storage, no framework, and no hardcoded users, so it is trivially unit
 * testable and unaffected by swapping any backing store.
 *
 * Flow: lock check → CAPTCHA → credentials → issue session → audit.
 */

const { AUDIT_EVENTS } = require('./audit.service');
const { permissionsFor } = require('./roles');

/**
 * Stable result codes the controller maps to HTTP responses. Kept coarse on
 * purpose so the client can't distinguish "unknown user" from "bad password".
 */
const RESULT = Object.freeze({
  OK: 'OK',
  CAPTCHA_INVALID: 'CAPTCHA_INVALID',
  CAPTCHA_EXPIRED: 'CAPTCHA_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
});

// A well-formed bcrypt hash of a random value, used to keep verify() timing
// roughly constant when the username does not exist (anti-enumeration).
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO3s7Xv0Q1J1YQ0m1s0Z9rXHqk5m2m0e';

class AuthService {
  /**
   * @param {{
   *   userProvider: { findByUsername: Function, findById: Function },
   *   passwordHasher: import('./password.hasher').PasswordHasher,
   *   captchaService: import('./captcha.service').CaptchaService,
   *   sessionService: import('./session.service').SessionService,
   *   throttleService: import('./throttle.service').LoginThrottleService,
   *   auditService: import('./audit.service').AuditService,
   * }} deps
   */
  constructor(deps) {
    this.users = deps.userProvider;
    this.hasher = deps.passwordHasher;
    this.captcha = deps.captchaService;
    this.sessions = deps.sessionService;
    this.throttle = deps.throttleService;
    this.audit = deps.auditService;
  }

  /**
   * @param {{ username: string, password: string, captchaId: string,
   *   captchaText: string, ip: string, userAgent: string }} input
   * @returns {Promise<{ code: string, session?: object, retryAfterMs?: number }>}
   */
  async login(input) {
    const username = String(input.username || '').trim();
    const ctx = { username, ip: input.ip, userAgent: input.userAgent };

    // 1) Lockout gate — never process a locked account.
    const lock = this.throttle.status(username);
    if (lock.locked) {
      this.audit.log({
        event: AUDIT_EVENTS.LOGIN_FAILURE,
        ...ctx,
        reason: 'account_locked',
      });
      return { code: RESULT.ACCOUNT_LOCKED, retryAfterMs: lock.retryAfterMs };
    }

    // 2) CAPTCHA — server-side, one-time use. Verified BEFORE credentials so we
    //    never touch the password store for un-human traffic.
    const captcha = this.captcha.verify(input.captchaId, input.captchaText);
    if (!captcha.ok) {
      this.audit.log({
        event: AUDIT_EVENTS.LOGIN_FAILURE,
        ...ctx,
        reason: `captcha_${captcha.reason}`,
      });
      return { code: captcha.reason === 'expired' ? RESULT.CAPTCHA_EXPIRED : RESULT.CAPTCHA_INVALID };
    }

    // 3) Credentials — constant-shaped whether or not the user exists.
    const user = await this.users.findByUsername(username);
    const hash = user ? user.passwordHash : DUMMY_HASH;
    const passwordOk = await this.hasher.verify(input.password, hash);

    if (!user || !passwordOk) {
      const result = this.throttle.recordFailure(username);
      this.audit.log({
        event: AUDIT_EVENTS.LOGIN_FAILURE,
        ...ctx,
        role: user ? user.role : undefined,
        reason: 'invalid_credentials',
      });
      if (result.justLocked) {
        this.audit.log({
          event: AUDIT_EVENTS.ACCOUNT_LOCK,
          ...ctx,
          reason: `too_many_attempts`,
          detail: `locked_for_ms:${result.retryAfterMs}`,
        });
      }
      return { code: RESULT.INVALID_CREDENTIALS };
    }

    // 4) Success — reset throttle, create session, audit.
    this.throttle.recordSuccess(username);
    const session = this.sessions.create({
      userId: user.id,
      username: user.username,
      role: user.role,
      ip: input.ip,
      userAgent: input.userAgent,
    });
    this.audit.log({
      event: AUDIT_EVENTS.LOGIN_SUCCESS,
      username: user.username,
      role: user.role,
      ip: input.ip,
      userAgent: input.userAgent,
    });
    return { code: RESULT.OK, session };
  }

  /**
   * Resolve a session id to a live session, sliding the idle window. Used by the
   * auth guard on every protected request.
   * @param {string} sessionId
   * @returns {{ ok: boolean, session?: object, reason?: string }}
   */
  resolveSession(sessionId) {
    const res = this.sessions.validate(sessionId);
    if (!res.ok) return res;
    this.sessions.touch(sessionId);
    return res;
  }

  /** Extend (refresh) a live session. */
  refresh(session, ctx) {
    this.sessions.touch(session.id);
    this.audit.log({
      event: AUDIT_EVENTS.SESSION_REFRESH,
      username: session.username,
      role: session.role,
      ip: ctx && ctx.ip,
      userAgent: ctx && ctx.userAgent,
    });
    return session;
  }

  /** Logout / invalidate. */
  logout(session, ctx) {
    const removed = this.sessions.revoke(session.id);
    this.audit.log({
      event: AUDIT_EVENTS.LOGOUT,
      username: session.username,
      role: session.role,
      ip: ctx && ctx.ip,
      userAgent: ctx && ctx.userAgent,
    });
    return removed;
  }

  /** Public profile shape returned by GET /me. Never includes secrets. */
  profileOf(session) {
    return {
      id: session.userId,
      username: session.username,
      role: session.role,
      permissions: permissionsFor(session.role),
      issuedAt: new Date(session.createdAt).toISOString(),
    };
  }
}

module.exports = { AuthService, RESULT };
