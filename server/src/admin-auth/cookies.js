/**
 * Cookie helpers. Two cookies:
 *  - bb_admin_session : HTTP-only JWT (not readable by JS → XSS-safe).
 *  - bb_admin_csrf    : readable double-submit token for CSRF defence.
 *
 * Uses Express's built-in res.cookie / res.clearCookie (no cookie-signing here;
 * the JWT is already integrity-protected).
 */

const { config } = require('./config');

/** @param {import('express').Response} res */
function setAuthCookies(res, token, csrfToken) {
  const base = {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    path: '/',
    maxAge: config.sessionAbsoluteTtlMs,
  };
  res.cookie(config.cookieName, token, base);
  // CSRF token is intentionally readable by the client so it can echo it back
  // in the X-CSRF-Token header (double-submit pattern).
  res.cookie(config.csrfCookieName, csrfToken, {
    httpOnly: false,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    path: '/',
    maxAge: config.sessionAbsoluteTtlMs,
  });
}

/** @param {import('express').Response} res */
function clearAuthCookies(res) {
  const opts = {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    path: '/',
  };
  res.clearCookie(config.cookieName, opts);
  res.clearCookie(config.csrfCookieName, { ...opts, httpOnly: false });
}

/** Read the session JWT from cookies (preferred) or Authorization header. */
function readToken(req) {
  const fromCookie = req.cookies ? req.cookies[config.cookieName] : undefined;
  if (fromCookie) return fromCookie;
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

module.exports = { setAuthCookies, clearAuthCookies, readToken };
