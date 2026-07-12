// Tests for content configuration: level→activity, fun facts, activity assets.
'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')
const http = require('node:http')
const express = require('express')
const cookieParser = require('cookie-parser')

const { LevelActivityService } = require('../admin-auth/content-config/level-activity.service')
const { FunFactsService } = require('../admin-auth/content-config/fun-facts.service')
const { AssetsService } = require('../admin-auth/content-config/assets.service')
const { CANONICAL_ACTIVITIES } = require('../admin-auth/content-config/activity-catalog')
const { createAdminAuth } = require('../admin-auth')

// ---- Unit ------------------------------------------------------------------
test('level-activity: config lists 100 levels + activities; assignments validate', () => {
  const svc = new LevelActivityService()
  const cfg = svc.getConfig()
  assert.equal(cfg.levels.length, 100)
  assert.equal(cfg.levels[0].tier, 'Very Easy')
  assert.equal(cfg.levels[99].tier, 'Expert')
  assert.ok(cfg.activities.length >= 20)

  assert.equal(svc.setAssignment(5, 'match3-classic').ok, true)
  assert.equal(svc.assignments()[5], 'match3-classic')
  assert.deepEqual(svc.setAssignment(5, 'no-such-activity'), { ok: false, error: 'unknown_activity' })
  assert.deepEqual(svc.setAssignment(999, 'match3-classic'), { ok: false, error: 'unknown_level' })
  // Clear.
  assert.equal(svc.setAssignment(5, null).ok, true)
  assert.equal(svc.assignments()[5], undefined)
})

test('fun-facts: seeded, and full CRUD works', () => {
  const svc = new FunFactsService()
  assert.ok(svc.list().length >= 3)
  const created = svc.create({ title: 'Octopus Hearts', text: 'An octopus has three hearts!', icon: '🐙', category: 'Animals', imageUrl: 'https://x/y.gif' })
  assert.ok(created.id)
  assert.equal(svc.get(created.id).imageUrl, 'https://x/y.gif')
  const updated = svc.update(created.id, { text: 'Octopuses have three hearts and blue blood.' })
  assert.match(updated.text, /blue blood/)
  assert.equal(svc.remove(created.id), true)
  assert.equal(svc.get(created.id), null)
  assert.equal(svc.remove('missing'), false)
})

test('assets: lists catalogue emojis and applies/clears overrides', () => {
  const svc = new AssetsService()
  const list = svc.list()
  assert.ok(list.length > 0)
  const key = CANONICAL_ACTIVITIES[0].icon
  assert.equal(svc.setOverride(key, 'data:image/png;base64,AAAA').ok, true)
  assert.equal(svc.overrides()[key], 'data:image/png;base64,AAAA')
  assert.deepEqual(svc.setOverride('🚫-not-used', 'https://x').ok, false)
  assert.equal(svc.setOverride(key, null).ok, true)
  assert.equal(svc.overrides()[key], undefined)
})

// ---- HTTP authorization ----------------------------------------------------
function startServer() {
  const admin = createAdminAuth({ silentAudit: true })
  const app = express()
  app.use('/api/admin/content', express.json({ limit: '8mb' }))
  app.use(express.json())
  app.use(cookieParser())
  app.use('/api/admin/auth', admin.router)
  app.use('/api/admin/content', admin.contentConfigRouter)
  app.use((err, _req, res, _next) => res.status(500).json({ error: 'server' }))
  return new Promise((resolve) => {
    const server = http.createServer(app).listen(0, () =>
      resolve({ admin, server, base: `http://127.0.0.1:${server.address().port}` }),
    )
  })
}

function parseCookies(arr) {
  const jar = {}
  for (const line of arr || []) { const [p] = line.split(';'); const i = p.indexOf('='); jar[p.slice(0, i).trim()] = p.slice(i + 1).trim() }
  return jar
}

async function login(base, admin, username, password) {
  const cap = await (await fetch(`${base}/api/admin/auth/captcha`, { method: 'POST' })).json()
  const captchaText = admin.captchaService._store.get(cap.captchaId).answer
  const res = await fetch(`${base}/api/admin/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, captchaId: cap.captchaId, captchaText }),
  })
  const jar = parseCookies(res.headers.getSetCookie ? res.headers.getSetCookie() : [])
  const body = await res.json()
  return { cookie: `bb_admin_session=${jar.bb_admin_session}`, csrf: body.csrfToken }
}

test('HTTP: role gating — ADMIN can set level activity but not fun-facts/assets', async () => {
  const { admin, server, base } = await startServer()
  try {
    const a = await login(base, admin, 'admin', 'admin')
    const hdr = { Cookie: a.cookie, 'Content-Type': 'application/json', 'X-CSRF-Token': a.csrf }

    // ADMIN has LEVEL_ACTIVITY.
    assert.equal((await fetch(`${base}/api/admin/content/levels`, { headers: { Cookie: a.cookie } })).status, 200)
    const setRes = await fetch(`${base}/api/admin/content/levels/3`, {
      method: 'PUT', headers: hdr, body: JSON.stringify({ activityId: 'reflex-tap' }),
    })
    assert.equal(setRes.status, 200)
    assert.equal((await setRes.json()).assignments['3'], 'reflex-tap')

    // ADMIN lacks FUN_FACTS + ASSET_MANAGEMENT.
    assert.equal((await fetch(`${base}/api/admin/content/fun-facts`, { headers: { Cookie: a.cookie } })).status, 403)
    assert.equal((await fetch(`${base}/api/admin/content/assets`, { headers: { Cookie: a.cookie } })).status, 403)
  } finally {
    server.close()
  }
})

test('HTTP: SUPER_ADMIN manages fun-facts (with data-URI image) and assets; CSRF enforced', async () => {
  const { admin, server, base } = await startServer()
  try {
    const su = await login(base, admin, 'superadmin', 'superadmin')
    const hdr = { Cookie: su.cookie, 'Content-Type': 'application/json', 'X-CSRF-Token': su.csrf }

    // Create a fun fact with an uploaded (data URI) image.
    const created = await fetch(`${base}/api/admin/content/fun-facts`, {
      method: 'POST', headers: hdr,
      body: JSON.stringify({ title: 'Bananas are Berries', text: 'Botanically, bananas are berries!', icon: '🍌', imageUrl: 'data:image/gif;base64,R0lGODlh' }),
    })
    assert.equal(created.status, 201)
    const { fact } = await created.json()
    assert.equal(fact.imageUrl, 'data:image/gif;base64,R0lGODlh')

    // CSRF required.
    const noCsrf = await fetch(`${base}/api/admin/content/fun-facts/${fact.id}`, {
      method: 'DELETE', headers: { Cookie: su.cookie },
    })
    assert.equal(noCsrf.status, 403)
    assert.equal((await fetch(`${base}/api/admin/content/fun-facts/${fact.id}`, { method: 'DELETE', headers: hdr })).status, 200)

    // Asset override.
    const key = (await (await fetch(`${base}/api/admin/content/assets`, { headers: { Cookie: su.cookie } })).json()).assets[0].key
    const put = await fetch(`${base}/api/admin/content/assets/${encodeURIComponent(key)}`, {
      method: 'PUT', headers: hdr, body: JSON.stringify({ imageUrl: 'https://cdn.example/x.png' }),
    })
    assert.equal(put.status, 200)

    // Invalid image reference rejected.
    const bad = await fetch(`${base}/api/admin/content/fun-facts`, {
      method: 'POST', headers: hdr,
      body: JSON.stringify({ title: 'X', text: 'Y', imageUrl: 'javascript:alert(1)' }),
    })
    assert.equal(bad.status, 400)
  } finally {
    server.close()
  }
})
