/**
 * OAuth2 token endpoint (client-credentials grant) + introspection.
 * Mounted at /api/oauth.
 *
 *   POST /oauth/token       grant_type=client_credentials, client auth via HTTP
 *                           Basic header or client_id/client_secret body params.
 *                           → { access_token, token_type, expires_in, scope }
 *   POST /oauth/introspect  { token } → RFC 7662 introspection response
 *
 * These are the bootstrap endpoints, so they are NOT behind the bearer gate.
 */

const express = require('express')
const rateLimit = require('express-rate-limit')
const { clientContext } = require('./guards')

/** Extract client credentials from a Basic auth header or the request body. */
function readClientCredentials(req) {
  const header = req.headers.authorization || ''
  if (header.startsWith('Basic ')) {
    try {
      const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8')
      const i = decoded.indexOf(':')
      if (i !== -1) return { clientId: decoded.slice(0, i), clientSecret: decoded.slice(i + 1) }
    } catch {
      /* fall through to body */
    }
  }
  const body = req.body || {}
  return { clientId: body.client_id, clientSecret: body.client_secret }
}

/** @param {{ oauthService: import('./oauth.service').OAuthService }} deps */
function createOAuthRouter({ oauthService }) {
  const router = express.Router()
  // Accept form-encoded bodies too (standard for OAuth token requests).
  router.use(express.urlencoded({ extended: false }))

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'rate_limited', error_description: 'Too many token requests' },
  })

  router.post('/token', limiter, async (req, res, next) => {
    try {
      const grantType = (req.body && req.body.grant_type) || 'client_credentials'
      if (grantType !== 'client_credentials') {
        return res
          .status(400)
          .json({ error: 'unsupported_grant_type', error_description: 'Only client_credentials is supported' })
      }
      const creds = readClientCredentials(req)
      if (!creds.clientId || !creds.clientSecret) {
        return res
          .status(400)
          .json({ error: 'invalid_request', error_description: 'client_id and client_secret are required' })
      }
      const ctx = clientContext(req)
      const result = await oauthService.issueToken({
        clientId: creds.clientId,
        clientSecret: creds.clientSecret,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      })
      if (!result.ok) {
        res.set('WWW-Authenticate', 'Basic realm="oauth"')
        return res.status(401).json({ error: result.error, error_description: result.description })
      }
      // Tokens must never be cached.
      res.set('Cache-Control', 'no-store')
      res.set('Pragma', 'no-cache')
      return res.json(result.token)
    } catch (err) {
      next(err)
    }
  })

  router.post('/introspect', limiter, (req, res) => {
    const token = (req.body && (req.body.token || req.body.access_token)) || ''
    res.json(oauthService.introspect(token))
  })

  return router
}

module.exports = { createOAuthRouter, readClientCredentials }
