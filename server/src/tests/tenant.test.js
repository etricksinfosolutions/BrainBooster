// Tests for tenant management: TenantService lifecycle + HTTP authorization.
'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')
const http = require('node:http')
const express = require('express')
const cookieParser = require('cookie-parser')

const { BcryptPasswordHasher } = require('../admin-auth/password.hasher')
const { InMemoryTenantProvider } = require('../admin-auth/tenant.provider')
const { AuditService } = require('../admin-auth/audit.service')
const { TenantService, TENANT_STATUSES } = require('../admin-auth/tenant.service')
const { createAdminAuth } = require('../admin-auth')

function buildService() {
  const hasher = new BcryptPasswordHasher(4)
  const audit = new AuditService({ silent: true })
  const service = new TenantService({
    tenantProvider: new InMemoryTenantProvider(),
    passwordHasher: hasher,
    auditService: audit,
  })
  return { service, audit }
}

test('create generates clientId + one-time secret and hashes it (never stored plaintext)', async () => {
  const { service } = buildService()
  const { tenant } = await service.create({ name: 'Acme School', sessionTimeMinutes: 60, scope: ['games', 'content'] })
  assert.match(tenant.clientId, /^tnt_[a-f0-9]{24}$/)
  assert.match(tenant.clientSecret, /^sk_[a-f0-9]{48}$/)
  assert.equal(tenant.status, 'created')
  assert.deepEqual(tenant.scope, ['games', 'content'])
  // Listing never exposes the secret.
  const [listed] = await service.list()
  assert.equal('clientSecret' in listed, false)
  // The stored secret is verifiable (hash round-trip) but not the plaintext.
  assert.equal(await service.verifyCredentials(tenant.clientId, tenant.clientSecret), false) // status !== active
  await service.setStatus(tenant.id, 'active')
  assert.equal(await service.verifyCredentials(tenant.clientId, tenant.clientSecret), true)
  assert.equal(await service.verifyCredentials(tenant.clientId, 'sk_wrong'), false)
})

test('status transitions across the full lifecycle and soft-delete blocks mutation', async () => {
  const { service } = buildService()
  const { tenant } = await service.create({ name: 'Beta', sessionTimeMinutes: 30 })
  for (const status of ['pending', 'active', 'suspended']) {
    const updated = await service.setStatus(tenant.id, status)
    assert.equal(updated.status, status)
  }
  assert.deepEqual(TENANT_STATUSES, ['created', 'pending', 'active', 'suspended', 'deleted'])
  // Soft delete.
  const removed = await service.remove(tenant.id)
  assert.equal(removed.status, 'deleted')
  // Further mutations on a deleted tenant are rejected.
  assert.equal(await service.setStatus(tenant.id, 'active'), null)
  assert.equal(await service.update(tenant.id, { name: 'x' }), null)
  assert.equal(await service.rotateSecret(tenant.id), null)
})

test('rotateSecret returns a new plaintext once and invalidates the old secret', async () => {
  const { service } = buildService()
  const { tenant } = await service.create({ name: 'Gamma', sessionTimeMinutes: 45, status: 'active' })
  const old = tenant.clientSecret
  const rotated = await service.rotateSecret(tenant.id)
  assert.notEqual(rotated.clientSecret, old)
  assert.equal(await service.verifyCredentials(tenant.clientId, old), false)
  assert.equal(await service.verifyCredentials(tenant.clientId, rotated.clientSecret), true)
})

test('update changes name/sessionTime/scope and writes an audit entry', async () => {
  const { service, audit } = buildService()
  const { tenant } = await service.create({ name: 'Delta', sessionTimeMinutes: 20 })
  const updated = await service.update(tenant.id, { name: 'Delta Corp', sessionTimeMinutes: 90, scope: ['analytics'] })
  assert.equal(updated.name, 'Delta Corp')
  assert.equal(updated.sessionTimeMinutes, 90)
  assert.deepEqual(updated.scope, ['analytics'])
  assert.ok(audit.query({ event: 'TENANT_UPDATED' }).length >= 1)
  assert.ok(audit.query({ event: 'TENANT_CREATED' }).length >= 1)
})

// ---- HTTP authorization ----------------------------------------------------
function startServer() {
  const admin = createAdminAuth({ silentAudit: true })
  const app = express()
  app.use(express.json())
  app.use(cookieParser())
  app.use('/api/admin/auth', admin.router)
  app.use('/api/admin/tenants', admin.tenantRouter)
  app.use((err, _req, res, _next) => res.status(500).json({ error: 'server' }))
  return new Promise((resolve) => {
    const server = http.createServer(app).listen(0, () =>
      resolve({ admin, server, base: `http://127.0.0.1:${server.address().port}` }),
    )
  })
}

function parseCookies(arr) {
  const jar = {}
  for (const line of arr || []) {
    const [pair] = line.split(';')
    const i = pair.indexOf('=')
    jar[pair.slice(0, i).trim()] = pair.slice(i + 1).trim()
  }
  return jar
}

async function login(base, admin, username, password) {
  const cap = await (await fetch(`${base}/api/admin/auth/captcha`, { method: 'POST' })).json()
  const captchaText = admin.captchaService._store.get(cap.captchaId).answer
  const res = await fetch(`${base}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, captchaId: cap.captchaId, captchaText }),
  })
  const jar = parseCookies(res.headers.getSetCookie ? res.headers.getSetCookie() : [])
  const body = await res.json()
  return { cookie: `bb_admin_session=${jar.bb_admin_session}`, csrf: body.csrfToken }
}

test('HTTP: SUPER_ADMIN can CRUD tenants; ADMIN is forbidden', async () => {
  const { admin, server, base } = await startServer()
  try {
    // ADMIN cannot even list.
    const asAdmin = await login(base, admin, 'admin', 'admin')
    const denied = await fetch(`${base}/api/admin/tenants`, { headers: { Cookie: asAdmin.cookie } })
    assert.equal(denied.status, 403)

    // SUPER_ADMIN full flow.
    const su = await login(base, admin, 'superadmin', 'superadmin')
    const headers = { Cookie: su.cookie, 'Content-Type': 'application/json', 'X-CSRF-Token': su.csrf }

    const created = await fetch(`${base}/api/admin/tenants`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'North Academy', sessionTimeMinutes: 120, scope: ['games'], status: 'active' }),
    })
    assert.equal(created.status, 201)
    const { tenant } = await created.json()
    assert.ok(tenant.clientSecret) // one-time secret present on create

    // List (no secret) — SUPER_ADMIN.
    const list = await (await fetch(`${base}/api/admin/tenants`, { headers: { Cookie: su.cookie } })).json()
    assert.equal(list.tenants.length, 1)
    assert.equal('clientSecret' in list.tenants[0], false)

    // Mutations require CSRF.
    const noCsrf = await fetch(`${base}/api/admin/tenants/${tenant.id}/status`, {
      method: 'PATCH',
      headers: { Cookie: su.cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'suspended' }),
    })
    assert.equal(noCsrf.status, 403)

    const suspended = await fetch(`${base}/api/admin/tenants/${tenant.id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: 'suspended' }),
    })
    assert.equal((await suspended.json()).tenant.status, 'suspended')

    // Validation rejects a bad session time.
    const bad = await fetch(`${base}/api/admin/tenants`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'X', sessionTimeMinutes: 0 }),
    })
    assert.equal(bad.status, 400)

    // Soft delete.
    const del = await fetch(`${base}/api/admin/tenants/${tenant.id}`, { method: 'DELETE', headers })
    assert.equal((await del.json()).tenant.status, 'deleted')
  } finally {
    server.close()
  }
})
