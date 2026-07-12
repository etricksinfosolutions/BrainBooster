/**
 * Bearer-token API guard. Validates an OAuth client-credentials access token
 * (signature + expiry via OAuthService), optionally enforces required scopes,
 * and attaches req.client = { clientId, tenantId, scope[] }.
 *
 * Usage:
 *   app.use('/api/content', requireBearer(), contentRoutes)
 *   router.get('/x', requireBearer({ scope: 'content' }), handler)
 *
 * With { verifyActive: true } it also confirms the tenant is still active on
 * every request (live revocation), at the cost of a provider lookup.
 */

function makeBearerGuard(oauthService) {
  /**
   * @param {{ scope?: string | string[], verifyActive?: boolean }} [opts]
   */
  return function requireBearer(opts = {}) {
    const required = opts.scope ? (Array.isArray(opts.scope) ? opts.scope : [opts.scope]) : []

    return async function bearerGuard(req, res, next) {
      const header = req.headers.authorization || ''
      const token = header.startsWith('Bearer ') ? header.slice(7) : null
      if (!token) {
        res.set('WWW-Authenticate', 'Bearer realm="api"')
        return res.status(401).json({ error: 'unauthorized', error_description: 'Bearer token required' })
      }

      const verified = oauthService.verifyToken(token)
      if (!verified.ok) {
        res.set('WWW-Authenticate', `Bearer error="invalid_token"`)
        return res
          .status(401)
          .json({ error: 'invalid_token', error_description: `Token ${verified.reason}` })
      }

      const payload = verified.payload
      const tokenScopes = String(payload.scope || '').split(' ').filter(Boolean)

      if (required.length && !required.every((s) => tokenScopes.includes(s))) {
        return res
          .status(403)
          .json({ error: 'insufficient_scope', error_description: `Requires scope: ${required.join(' ')}` })
      }

      if (opts.verifyActive) {
        const active = await oauthService.tenantActive(payload.sub)
        if (!active) {
          return res
            .status(401)
            .json({ error: 'invalid_token', error_description: 'Client is no longer active' })
        }
      }

      req.client = { clientId: payload.sub, tenantId: payload.tid, scope: tokenScopes }
      next()
    }
  }
}

module.exports = { makeBearerGuard }
