/**
 * Admin-auth configuration. All tunables live here (env-overridable) so no magic
 * numbers leak into the services. Times are milliseconds unless suffixed.
 *
 * This module is intentionally free of side effects and safe to import from tests.
 */

function intEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

const config = {
  // The admin portal signs its own tokens; falls back to the shared secret so a
  // single JWT_SECRET still works in simple deployments.
  jwtSecret:
    process.env.ADMIN_JWT_SECRET ||
    process.env.JWT_SECRET ||
    'dev-only-admin-secret-change-me',

  // Session lifetimes.
  sessionAbsoluteTtlMs: intEnv('ADMIN_SESSION_TTL_MS', 8 * HOUR), // hard cap: 8h
  sessionInactivityTtlMs: intEnv('ADMIN_SESSION_IDLE_MS', 30 * MINUTE), // idle logout

  // CAPTCHA.
  captchaTtlMs: intEnv('ADMIN_CAPTCHA_TTL_MS', 5 * MINUTE),
  captchaLength: intEnv('ADMIN_CAPTCHA_LENGTH', 5),

  // Brute-force protection (per username).
  maxFailedAttempts: intEnv('ADMIN_MAX_FAILED', 5),
  lockDurationMs: intEnv('ADMIN_LOCK_MS', 15 * MINUTE),

  // Audit ring-buffer size kept in memory for the Audit Logs screen.
  auditBufferSize: intEnv('ADMIN_AUDIT_BUFFER', 1000),

  // OAuth2 client-credentials (tenant clientId/secret → Bearer access token).
  oauthSecret:
    process.env.OAUTH_JWT_SECRET ||
    process.env.JWT_SECRET ||
    'dev-only-oauth-secret-change-me',
  oauthIssuer: process.env.OAUTH_ISSUER || 'brainbooster-oauth',

  // Deterministic seed client for the web app (so the browser build has stable
  // credentials to exchange for a token). NOTE: a public SPA cannot truly hide a
  // secret — for hardened production, proxy token issuance through a backend.
  webAppClient: {
    name: 'BrainBooster Web App',
    clientId: process.env.WEBAPP_CLIENT_ID || 'webapp-brainbooster',
    clientSecret: process.env.WEBAPP_CLIENT_SECRET || 'webapp-dev-secret-change-me',
    scope: (process.env.WEBAPP_SCOPE || 'content,activities').split(',').map((s) => s.trim()).filter(Boolean),
    sessionTimeMinutes: intEnv('WEBAPP_SESSION_MIN', 60),
  },

  // Cookie names + flags.
  cookieName: 'bb_admin_session',
  csrfCookieName: 'bb_admin_csrf',
  // Secure cookies in production; relaxed on localhost so dev works over http.
  cookieSecure: process.env.NODE_ENV === 'production',
  // Different localhost ports are same-site, so 'lax' is enough and safer than 'none'.
  cookieSameSite: process.env.ADMIN_COOKIE_SAMESITE || 'lax',
};

module.exports = { config, MINUTE, HOUR };
