// Tests for the OAuth2 client-credentials layer + Bearer API gate.
'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')
const http = require('node:http')
const express = require('express')
const cookieParser = require('cookie-parser')

const { BcryptPasswordHasher } = require('../admin-auth/password.hasher')
const { InMemoryTenantProvider } = require('../admin-auth/tenant.provider')
const { AuditService } = require('../admin-auth/audit.service')
const { TenantService } = require('../admin-auth/tenant.service')
const { OAuthService } = require('../admin-auth/oauth.service')
const { makeBearerGuard } = require('../admin-auth/bearer.guard')
const { createAdminAuth } = require('../admin-auth')

function build() {
  const hasher = new BcryptPasswordHasher(4)
  const provider = new InMemoryTenantProvider()
  const audit = new AuditService({ silent: true })
  const tenants = new TenantService({ tenantProvider: provider, passwordHasher: hasher, auditService: audit })
  const oauth = new OAuthService({ tenantProvider: provider, passwordHasher: hasher, auditService: audit })
  return { hasher, provider, audit, tenants, oauth }
}

test('issues a signed token carrying scope, expiry, subject and jti from the tenant', async () => {
  const { tenants, oauth } = build()
  await tenants.ensureSeedClient({
    name: 'App', clientId: 'cid-1', clientSecret: 'sec-1', scope: ['content', 'activities'], sessionTimeMinutes: 30,
  })
  const res = await oauth.issueToken({ clientId: 'cid-1', clientSecret: 'sec-1' })
  assert.equal(res.ok, true)
  assert.equal(res.token.token_type, 'Bearer')
  assert.equal(res.token.expires_in, 30 * 60)
  assert.equal(res.token.scope, 'content activities')

  const verified = oauth.verifyToken(res.token.access_token)
  assert.equal(verified.ok, true)
  assert.equal(verified.payload.sub, 'cid-1')
  assert.equal(verified.payload.scope, 'content activities')
  assert.equal(verified.payload.iss, 'brainbooster-oauth')
  assert.ok(verified.payload.exp > verified.payload.iat)
  assert.ok(verified.payload.jti && verified.payload.tid)
})

test('rejects wrong secret, unknown client, and inactive/suspended tenants', async () => {
  const { tenants, oauth } = build()
  await tenants.ensureSeedClient({ name: 'A', clientId: 'cid', clientSecret: 'good', scope: [], sessionTimeMinutes: 10 })

  assert.equal((await oauth.issueToken({ clientId: 'cid', clientSecret: 'bad' })).error, 'invalid_client')
  assert.equal((await oauth.issueToken({ clientId: 'nope', clientSecret: 'x' })).error, 'invalid_client')

  // Suspend → token issuance blocked.
  const created = await tenants.list()
  await tenants.setStatus(created[0].id, 'suspended')
  assert.equal((await oauth.issueToken({ clientId: 'cid', clientSecret: 'good' })).ok, false)
})

test('verifyToken rejects tampered and expired tokens; introspect mirrors it', async () => {
  const jwt = require('jsonwebtoken')
  const { config } = require('../admin-auth/config')
  const { tenants, oauth } = build()
  await tenants.ensureSeedClient({ name: 'A', clientId: 'c', clientSecret: 's', scope: ['content'], sessionTimeMinutes: 1 })
  const { token } = await oauth.issueToken({ clientId: 'c', clientSecret: 's' })

  // Valid token introspects as active.
  assert.equal(oauth.introspect(token.access_token).active, true)

  // Tamper: flip the last signature character → signature no longer verifies.
  const last = token.access_token.slice(-1)
  const tampered = token.access_token.slice(0, -1) + (last === 'A' ? 'B' : 'A')
  assert.equal(oauth.verifyToken(tampered).ok, false)

  // Wrong signing key → invalid.
  const foreign = jwt.sign({ scope: 'content' }, 'a-different-secret', { issuer: config.oauthIssuer, subject: 'c', expiresIn: 60 })
  assert.equal(oauth.verifyToken(foreign).ok, false)

  // Genuinely expired token (signed with the right key but already past exp).
  const expired = jwt.sign({ scope: 'content', token_type: 'Bearer' }, config.oauthSecret, {
    issuer: config.oauthIssuer, subject: 'c', expiresIn: -10,
  })
  assert.equal(oauth.verifyToken(expired).reason, 'expired')
  assert.equal(oauth.introspect(expired).active, false)
})

test('requireBearer guards a route: no token 401, valid token passes, bad scope 403', async () => {
  const { tenants, oauth } = build()
  await tenants.ensureSeedClient({ name: 'A', clientId: 'c', clientSecret: 's', scope: ['content'], sessionTimeMinutes: 10 })
  const { token } = await oauth.issueToken({ clientId: 'c', clientSecret: 's' })
  const requireBearer = makeBearerGuard(oauth)

  const app = express()
  app.get('/open-scope', requireBearer({ scope: 'content' }), (req, res) => res.json({ client: req.client.clientId }))
  app.get('/needs-admin-scope', requireBearer({ scope: 'admin' }), (_req, res) => res.json({ ok: true }))
  const server = http.createServer(app)
  await new Promise((r) => server.listen(0, r))
  const base = `http://127.0.0.1:${server.address().port}`
  try {
    assert.equal((await fetch(`${base}/open-scope`)).status, 401)
    const ok = await fetch(`${base}/open-scope`, { headers: { Authorization: `Bearer ${token.access_token}` } })
    assert.equal(ok.status, 200)
    assert.equal((await ok.json()).client, 'c')
    const forbidden = await fetch(`${base}/needs-admin-scope`, { headers: { Authorization: `Bearer ${token.access_token}` } })
    assert.equal(forbidden.status, 403)
    assert.equal((await forbidden.json()).error, 'insufficient_scope')
  } finally {
    server.close()
  }
})

test('HTTP: /api/oauth/token (Basic + body) works and gates /api/content', async () => {
  const admin = createAdminAuth({ silentAudit: true })
  await admin.seedWebAppClient()
  const app = express()
  app.use(express.json())
  app.use(cookieParser())
  app.use('/api/oauth', admin.oauthRouter)
  app.get('/api/content', admin.requireBearer({ scope: 'content' }), (_req, res) => res.json({ worlds: [] }))
  const server = http.createServer(app)
  await new Promise((r) => server.listen(0, r))
  const base = `http://127.0.0.1:${server.address().port}`
  try {
    // Gated content without a token.
    assert.equal((await fetch(`${base}/api/content`)).status, 401)

    // Token via body params.
    const bodyRes = await fetch(`${base}/api/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'client_credentials', client_id: 'webapp-brainbooster', client_secret: 'webapp-dev-secret-change-me' }),
    })
    assert.equal(bodyRes.status, 200)
    const tok = await bodyRes.json()
    assert.equal(tok.token_type, 'Bearer')

    // Token via HTTP Basic.
    const basic = Buffer.from('webapp-brainbooster:webapp-dev-secret-change-me').toString('base64')
    const basicRes = await fetch(`${base}/api/oauth/token`, {
      method: 'POST',
      headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'client_credentials' }),
    })
    assert.equal(basicRes.status, 200)

    // Content now reachable with the token.
    const content = await fetch(`${base}/api/content`, { headers: { Authorization: `Bearer ${tok.access_token}` } })
    assert.equal(content.status, 200)

    // Bad grant type rejected.
    const badGrant = await fetch(`${base}/api/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'password', client_id: 'x', client_secret: 'y' }),
    })
    assert.equal(badGrant.status, 400)
  } finally {
    server.close()
  }
})
