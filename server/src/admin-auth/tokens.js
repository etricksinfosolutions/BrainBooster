/**
 * JWT helpers for admin sessions. The token is a thin integrity wrapper around a
 * server-side session id — the SessionService remains the authority on validity
 * (so logout/expiry are real, not just "wait for the JWT to lapse").
 */

const jwt = require('jsonwebtoken');
const { config } = require('./config');

const ISSUER = 'brainbooster-admin';

/**
 * @param {{ id: string, userId: string, role: string }} session
 * @returns {string}
 */
function signSessionToken(session) {
  return jwt.sign(
    { sid: session.id, sub: session.userId, role: session.role },
    config.jwtSecret,
    {
      issuer: ISSUER,
      // The JWT lifetime tracks the absolute session cap; the store still
      // enforces idle timeout and revocation.
      expiresIn: Math.floor(config.sessionAbsoluteTtlMs / 1000),
    }
  );
}

/**
 * @param {string} token
 * @returns {{ ok: boolean, payload?: { sid: string, sub: string, role: string } }}
 */
function verifySessionToken(token) {
  if (typeof token !== 'string' || token.length === 0) return { ok: false };
  try {
    const payload = jwt.verify(token, config.jwtSecret, { issuer: ISSUER });
    return { ok: true, payload };
  } catch {
    return { ok: false };
  }
}

module.exports = { signSessionToken, verifySessionToken, ISSUER };
