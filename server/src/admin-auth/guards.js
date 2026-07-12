/**
 * Express guards for admin routes, bound to an AuthService instance.
 *
 *   requireSession       — valid, non-expired, non-idle session (cookie or Bearer)
 *   requireRoles(...r)    — RoleGuard: session role ∈ allow-list
 *   requirePermission(p)  — permission check via the authorization layer
 *   csrfProtection        — double-submit / session-token CSRF check for mutations
 *
 * All denials are audited and return sanitized messages (no internals leak).
 */

const { verifySessionToken } = require('./tokens');
const { readToken } = require('./cookies');
const { config } = require('./config');
const { roleAllowed, roleHasPermission } = require('./roles');
const { AUDIT_EVENTS } = require('./audit.service');

/** Best-effort client context for audit records. */
function clientContext(req) {
  const fwd = req.headers['x-forwarded-for'];
  const ip =
    (typeof fwd === 'string' && fwd.split(',')[0].trim()) ||
    (req.socket && req.socket.remoteAddress) ||
    req.ip ||
    'unknown';
  return { ip, userAgent: String(req.headers['user-agent'] || 'unknown') };
}

/** @param {AuthService} authService */
function makeGuards(authService, audit) {
  function requireSession(req, res, next) {
    const token = readToken(req);
    const verified = verifySessionToken(token);
    if (!verified.ok) {
      return res.status(401).json({ error: 'Authentication required', code: 'UNAUTHENTICATED' });
    }
    const resolved = authService.resolveSession(verified.payload.sid);
    if (!resolved.ok) {
      const ctx = clientContext(req);
      audit.log({
        event: AUDIT_EVENTS.SESSION_EXPIRED,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        reason: resolved.reason,
      });
      return res
        .status(401)
        .json({ error: 'Session expired', code: 'SESSION_EXPIRED', reason: resolved.reason });
    }
    req.adminSession = resolved.session;
    next();
  }

  /** RoleGuard factory. Usage: requireRoles(ROLES.SUPER_ADMIN) */
  function requireRoles(...allowed) {
    return function roleGuard(req, res, next) {
      requireSession(req, res, () => {
        const role = req.adminSession.role;
        if (!roleAllowed(role, allowed)) {
          const ctx = clientContext(req);
          audit.log({
            event: AUDIT_EVENTS.ACCESS_DENIED,
            username: req.adminSession.username,
            role,
            ip: ctx.ip,
            userAgent: ctx.userAgent,
            reason: `role_required:${allowed.join('|')}`,
          });
          return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
        }
        next();
      });
    };
  }

  /** PermissionGuard factory. Usage: requirePermission(PERMISSIONS.AUDIT_LOGS) */
  function requirePermission(permission) {
    return function permissionGuard(req, res, next) {
      requireSession(req, res, () => {
        if (!roleHasPermission(req.adminSession.role, permission)) {
          const ctx = clientContext(req);
          audit.log({
            event: AUDIT_EVENTS.ACCESS_DENIED,
            username: req.adminSession.username,
            role: req.adminSession.role,
            ip: ctx.ip,
            userAgent: ctx.userAgent,
            reason: `permission_required:${permission}`,
          });
          return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
        }
        next();
      });
    };
  }

  /**
   * CSRF: mutating requests must echo the session CSRF token in X-CSRF-Token.
   * Because the token lives in the server-side session (not just a cookie), this
   * is stronger than a pure double-submit and immune to cookie fixation.
   * Must run AFTER requireSession.
   */
  function csrfProtection(req, res, next) {
    const header = req.headers['x-csrf-token'];
    const expected = req.adminSession && req.adminSession.csrfToken;
    if (!expected || typeof header !== 'string' || header !== expected) {
      return res.status(403).json({ error: 'Invalid CSRF token', code: 'CSRF' });
    }
    next();
  }

  return { requireSession, requireRoles, requirePermission, csrfProtection, clientContext };
}

module.exports = { makeGuards, clientContext };
