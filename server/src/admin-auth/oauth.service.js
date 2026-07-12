/**
 * OAuth2 client-credentials service.
 *
 * A tenant's { clientId, clientSecret } act like a username/password (HTTP Basic
 * or POST body). On success this issues a signed Bearer JWT access token that
 * carries the tenant's scope + expiry (both sourced from the tenant record), a
 * signature for validation, and standard claims (iss, sub, tid, iat, exp, jti).
 *
 * Depends only on TenantProvider + PasswordHasher + AuditService, so the store
 * is swappable without changing this class.
 */

const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { config } = require('./config')

const AUDIT = Object.freeze({
  TOKEN_ISSUED: 'OAUTH_TOKEN_ISSUED',
  TOKEN_DENIED: 'OAUTH_TOKEN_DENIED',
})

class OAuthService {
  /**
   * @param {{ tenantProvider: object, passwordHasher: import('./password.hasher').PasswordHasher,
   *           auditService: import('./audit.service').AuditService, now?: () => number }} deps
   */
  constructor(deps) {
    this.tenants = deps.tenantProvider
    this.hasher = deps.passwordHasher
    this.audit = deps.auditService
    this._now = deps.now || Date.now
  }

  /**
   * Authenticate client credentials and issue an access token.
   * @param {{ clientId: string, clientSecret: string, ip?: string, userAgent?: string }} input
   * @returns {Promise<{ ok: true, token: object } | { ok: false, error: string, description: string }>}
   */
  async issueToken(input) {
    const clientId = String(input.clientId || '')
    const tenant = await this.tenants.findByClientId(clientId)
    const secretOk = tenant
      ? await this.hasher.verify(input.clientSecret, tenant.clientSecretHash)
      : await this.hasher.verify(input.clientSecret, '$2a$12$0000000000000000000000000000000000000000000000000000')

    if (!tenant || !secretOk) {
      this._audit(AUDIT.TOKEN_DENIED, clientId, input, 'invalid_client')
      return { ok: false, error: 'invalid_client', description: 'Client authentication failed' }
    }
    if (tenant.status !== 'active') {
      this._audit(AUDIT.TOKEN_DENIED, clientId, input, `status_${tenant.status}`)
      return { ok: false, error: 'invalid_client', description: `Client is ${tenant.status}` }
    }

    const nowSec = Math.floor(this._now() / 1000)
    const expiresIn = tenant.sessionTimeMinutes * 60
    const scope = tenant.scope.join(' ')
    const accessToken = jwt.sign(
      {
        scope,
        tid: tenant.id,
        token_type: 'Bearer',
        jti: crypto.randomUUID(),
      },
      config.oauthSecret,
      {
        algorithm: 'HS256',
        issuer: config.oauthIssuer,
        subject: tenant.clientId,
        expiresIn,
      }
    )

    this._audit(AUDIT.TOKEN_ISSUED, clientId, input, `scope:${scope || '-'}`)
    return {
      ok: true,
      token: {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        scope,
        issued_at: nowSec,
      },
    }
  }

  /**
   * Validate a token's signature + expiry.
   * @param {string} token
   * @returns {{ ok: boolean, payload?: object, reason?: string }}
   */
  verifyToken(token) {
    if (typeof token !== 'string' || !token) return { ok: false, reason: 'missing' }
    try {
      const payload = jwt.verify(token, config.oauthSecret, {
        algorithms: ['HS256'],
        issuer: config.oauthIssuer,
      })
      return { ok: true, payload }
    } catch (err) {
      return { ok: false, reason: err && err.name === 'TokenExpiredError' ? 'expired' : 'invalid' }
    }
  }

  /**
   * Optionally confirm the token's tenant is still active (live revocation).
   * @param {string} clientId
   */
  async tenantActive(clientId) {
    const tenant = await this.tenants.findByClientId(clientId)
    return Boolean(tenant && tenant.status === 'active')
  }

  /** RFC 7662-style introspection response. */
  introspect(token) {
    const res = this.verifyToken(token)
    if (!res.ok) return { active: false }
    const p = res.payload
    return {
      active: true,
      client_id: p.sub,
      scope: p.scope,
      token_type: p.token_type,
      exp: p.exp,
      iat: p.iat,
      iss: p.iss,
      jti: p.jti,
      tid: p.tid,
    }
  }

  _audit(event, clientId, ctx, detail) {
    this.audit.log({
      event,
      username: clientId,
      ip: ctx && ctx.ip,
      userAgent: ctx && ctx.userAgent,
      detail,
    })
  }
}

module.exports = { OAuthService, OAUTH_AUDIT: AUDIT }
