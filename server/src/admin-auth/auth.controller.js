/**
 * Admin auth HTTP controller (Express router). Mounted at /api/admin/auth.
 *
 * Endpoints:
 *   POST /captcha     — issue a fresh CAPTCHA challenge
 *   POST /login       — username + password + CAPTCHA → session cookie
 *   POST /logout      — invalidate session (auth + CSRF)
 *   GET  /me          — current user profile + permissions (auth)
 *   POST /refresh     — slide the session's idle window (auth + CSRF)
 *   GET  /permissions — permissions for the current role (auth)
 *   GET  /audit-logs  — recent audit entries (SUPER_ADMIN via AUDIT_LOGS perm)
 *
 * Never uses alert(), never returns stack traces, never logs passwords.
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { RESULT } = require('./auth.service');
const { setAuthCookies, clearAuthCookies } = require('./cookies');
const { signSessionToken } = require('./tokens');
const { permissionsFor, PERMISSIONS } = require('./roles');
const { clientContext } = require('./guards');

const loginSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
  captchaId: z.string().min(1).max(64),
  captchaText: z.string().min(1).max(16),
});

/** Map an AuthService result code to an HTTP status + safe message. */
const RESULT_HTTP = {
  [RESULT.CAPTCHA_INVALID]: { status: 400, error: 'CAPTCHA is incorrect', code: 'CAPTCHA_INVALID' },
  [RESULT.CAPTCHA_EXPIRED]: { status: 400, error: 'CAPTCHA has expired', code: 'CAPTCHA_EXPIRED' },
  [RESULT.INVALID_CREDENTIALS]: {
    status: 401,
    error: 'Invalid username or password',
    code: 'INVALID_CREDENTIALS',
  },
  [RESULT.ACCOUNT_LOCKED]: {
    status: 429,
    error: 'Too many failed attempts. Try again later.',
    code: 'ACCOUNT_LOCKED',
  },
};

function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: 'Invalid input', code: 'VALIDATION', details: parsed.error.flatten().fieldErrors });
    }
    req.body = parsed.data;
    next();
  };
}

/**
 * @param {{ authService: import('./auth.service').AuthService,
 *           auditService: import('./audit.service').AuditService,
 *           guards: ReturnType<import('./guards').makeGuards> }} deps
 */
function createAuthRouter({ authService, auditService, guards }) {
  const router = express.Router();
  const { requireSession, requirePermission, csrfProtection } = guards;

  // IP-level limiter complements the per-username lockout (defence in depth).
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests', code: 'RATE_LIMITED' },
  });

  // POST /captcha — issue a challenge.
  router.post('/captcha', loginLimiter, (_req, res) => {
    const { id, image, expiresInMs } = authService.captcha.issue();
    res.json({ captchaId: id, image, expiresInMs });
  });

  // POST /login.
  router.post('/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
    try {
      const ctx = clientContext(req);
      const result = await authService.login({
        username: req.body.username,
        password: req.body.password,
        captchaId: req.body.captchaId,
        captchaText: req.body.captchaText,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      });

      if (result.code !== RESULT.OK) {
        const mapped = RESULT_HTTP[result.code] || RESULT_HTTP[RESULT.INVALID_CREDENTIALS];
        const body = { error: mapped.error, code: mapped.code };
        if (result.retryAfterMs) body.retryAfterMs = result.retryAfterMs;
        return res.status(mapped.status).json(body);
      }

      const token = signSessionToken(result.session);
      setAuthCookies(res, token, result.session.csrfToken);
      return res.json({
        user: authService.profileOf(result.session),
        csrfToken: result.session.csrfToken,
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /me.
  router.get('/me', requireSession, (req, res) => {
    res.json({ user: authService.profileOf(req.adminSession) });
  });

  // GET /permissions.
  router.get('/permissions', requireSession, (req, res) => {
    res.json({ role: req.adminSession.role, permissions: permissionsFor(req.adminSession.role) });
  });

  // POST /refresh — extend idle window, re-issue cookie.
  router.post('/refresh', requireSession, csrfProtection, (req, res) => {
    const ctx = clientContext(req);
    authService.refresh(req.adminSession, ctx);
    const token = signSessionToken(req.adminSession);
    setAuthCookies(res, token, req.adminSession.csrfToken);
    res.json({ user: authService.profileOf(req.adminSession), csrfToken: req.adminSession.csrfToken });
  });

  // POST /logout.
  router.post('/logout', requireSession, csrfProtection, (req, res) => {
    const ctx = clientContext(req);
    authService.logout(req.adminSession, ctx);
    clearAuthCookies(res);
    res.json({ ok: true });
  });

  // GET /audit-logs — SUPER_ADMIN only (AUDIT_LOGS permission).
  router.get('/audit-logs', requirePermission(PERMISSIONS.AUDIT_LOGS), (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    res.json({ entries: auditService.query({ limit, event: req.query.event, username: req.query.username }) });
  });

  return router;
}

module.exports = { createAuthRouter, loginSchema };
