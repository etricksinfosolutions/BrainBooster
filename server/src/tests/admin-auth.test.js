// Comprehensive tests for the admin authentication/authorization system.
// Runs under `node --test`. No database or network dependency (admin-auth is
// fully in-memory; the HTTP tests spin up an ephemeral express app).
'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const cookieParser = require('cookie-parser');

const { ROLES, PERMISSIONS, permissionsFor, roleHasPermission, roleAllowed } = require('../admin-auth/roles');
const { BcryptPasswordHasher } = require('../admin-auth/password.hasher');
const { SeedUserProvider } = require('../admin-auth/user.provider');
const { CaptchaService } = require('../admin-auth/captcha.service');
const { SessionService } = require('../admin-auth/session.service');
const { LoginThrottleService } = require('../admin-auth/throttle.service');
const { AuditService, AUDIT_EVENTS } = require('../admin-auth/audit.service');
const { AuthService, RESULT } = require('../admin-auth/auth.service');
const { createAdminAuth } = require('../admin-auth');

// A controllable clock for deterministic expiry tests.
function fakeClock(start = 1_000_000) {
  let t = start;
  const now = () => t;
  now.advance = (ms) => { t += ms; };
  return now;
}

// ---------------------------------------------------------------------------
// Authorization layer (roles / permissions)
// ---------------------------------------------------------------------------
test('SUPER_ADMIN has every sensitive permission; ADMIN does not', () => {
  assert.ok(roleHasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.ADMIN_MANAGEMENT));
  assert.ok(roleHasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.SYSTEM_MAINTENANCE));
  assert.ok(roleHasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.PLATFORM_SETTINGS));
  // ADMIN must NOT access these.
  assert.equal(roleHasPermission(ROLES.ADMIN, PERMISSIONS.ADMIN_MANAGEMENT), false);
  assert.equal(roleHasPermission(ROLES.ADMIN, PERMISSIONS.PLATFORM_SETTINGS), false);
  assert.equal(roleHasPermission(ROLES.ADMIN, PERMISSIONS.SYSTEM_MAINTENANCE), false);
  // ADMIN keeps its own set.
  assert.ok(roleHasPermission(ROLES.ADMIN, PERMISSIONS.DASHBOARD));
  assert.ok(roleHasPermission(ROLES.ADMIN, PERMISSIONS.GAMES));
});

test('roleAllowed enforces allow-lists and rejects unknown roles', () => {
  assert.ok(roleAllowed(ROLES.ADMIN, [ROLES.ADMIN, ROLES.SUPER_ADMIN]));
  assert.equal(roleAllowed(ROLES.ADMIN, [ROLES.SUPER_ADMIN]), false);
  assert.equal(roleAllowed('PARENT', [ROLES.ADMIN]), false);
  assert.ok(roleAllowed(ROLES.ADMIN, [])); // empty allow-list = any known role
});

test('permissionsFor returns a copy (immutability of source)', () => {
  const a = permissionsFor(ROLES.ADMIN);
  a.push('HACKED');
  assert.equal(permissionsFor(ROLES.ADMIN).includes('HACKED'), false);
});

// ---------------------------------------------------------------------------
// Password hasher abstraction
// ---------------------------------------------------------------------------
test('bcrypt hasher round-trips and rejects wrong/malformed input', async () => {
  const h = new BcryptPasswordHasher(4); // low cost for speed
  const hash = await h.hash('s3cret!');
  assert.ok(hash.startsWith('$2'));
  assert.equal(await h.verify('s3cret!', hash), true);
  assert.equal(await h.verify('wrong', hash), false);
  assert.equal(await h.verify('s3cret!', 'not-a-hash'), false);
  assert.equal(await h.verify(undefined, hash), false);
});

// ---------------------------------------------------------------------------
// UserProvider (seed)
// ---------------------------------------------------------------------------
test('SeedUserProvider exposes only hashed passwords for seed users', async () => {
  const provider = await new SeedUserProvider(new BcryptPasswordHasher(4)).ready();
  const su = await provider.findByUsername('superadmin');
  const ad = await provider.findByUsername('ADMIN'); // case-insensitive
  assert.equal(su.role, ROLES.SUPER_ADMIN);
  assert.equal(ad.role, ROLES.ADMIN);
  assert.ok(su.passwordHash.startsWith('$2'));
  assert.equal(su.password, undefined);
  assert.equal(await provider.findByUsername('nobody'), null);
});

// ---------------------------------------------------------------------------
// CAPTCHA
// ---------------------------------------------------------------------------
test('CAPTCHA verifies once, is one-time-use, and expires', () => {
  const now = fakeClock();
  const c = new CaptchaService({ now });
  const { id, image } = c.issue();
  assert.match(image, /^data:image\/svg\+xml;base64,/);
  const answer = c._store.get(id).answer;

  // Wrong answer consumes the challenge.
  const bad = c.verify(id, 'zzzzz');
  assert.equal(bad.ok, false);
  assert.equal(bad.reason, 'mismatch');
  assert.equal(c.verify(id, answer).reason, 'missing'); // already consumed

  // Fresh challenge, correct answer works exactly once.
  const two = c.issue();
  const ans2 = c._store.get(two.id).answer;
  assert.equal(c.verify(two.id, ans2.toLowerCase()).ok, true); // case-insensitive
  assert.equal(c.verify(two.id, ans2).reason, 'missing');

  // Expiry.
  const three = c.issue();
  const ans3 = c._store.get(three.id).answer;
  now.advance(5 * 60 * 1000 + 1);
  assert.equal(c.verify(three.id, ans3).reason, 'expired');
});

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------
test('sessions enforce idle timeout, absolute cap, and revocation', () => {
  const now = fakeClock();
  const s = new SessionService({ now });
  const sess = s.create({ userId: 'u1', username: 'admin', role: ROLES.ADMIN, ip: '::1', userAgent: 'jest' });
  assert.equal(s.validate(sess.id).ok, true);

  // Idle timeout (default 30m) — advance 31m without touching.
  now.advance(31 * 60 * 1000);
  assert.equal(s.validate(sess.id).reason, 'idle');
  assert.equal(s.validate(sess.id).reason, 'missing'); // revoked on expiry

  // Absolute cap (8h) even with activity.
  const s2 = s.create({ userId: 'u1', username: 'admin', role: ROLES.ADMIN, ip: '::1', userAgent: 'jest' });
  for (let i = 0; i < 20; i++) { now.advance(25 * 60 * 1000); s.touch(s2.id); }
  assert.equal(s.validate(s2.id).reason, 'expired');

  // Explicit revoke.
  const s3 = s.create({ userId: 'u1', username: 'admin', role: ROLES.ADMIN, ip: '::1', userAgent: 'jest' });
  assert.equal(s.revoke(s3.id), true);
  assert.equal(s.validate(s3.id).reason, 'missing');
});

// ---------------------------------------------------------------------------
// Throttle / brute-force lockout
// ---------------------------------------------------------------------------
test('5 failures lock for 15m, success resets, lock auto-expires', () => {
  const now = fakeClock();
  const t = new LoginThrottleService({ now });
  for (let i = 0; i < 4; i++) {
    const r = t.recordFailure('admin');
    assert.equal(r.locked, false);
  }
  const fifth = t.recordFailure('admin');
  assert.equal(fifth.locked, true);
  assert.equal(fifth.justLocked, true);
  assert.equal(t.status('admin').locked, true);

  // justLocked fires only once.
  assert.equal(t.recordFailure('admin').justLocked, false);

  // Auto-expire after 15m.
  now.advance(15 * 60 * 1000 + 1);
  assert.equal(t.status('admin').locked, false);

  // Success clears the counter.
  t.recordFailure('bob');
  t.recordSuccess('bob');
  assert.equal(t.status('bob').remaining, 5);
});

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------
test('audit stores allow-listed fields only and never a password', () => {
  const a = new AuditService({ silent: true });
  a.log({ event: AUDIT_EVENTS.LOGIN_FAILURE, username: 'admin', role: ROLES.ADMIN, ip: '1.2.3.4', userAgent: 'ua', password: 'leak', reason: 'invalid_credentials' });
  const [entry] = a.query({ limit: 1 });
  assert.equal(entry.event, AUDIT_EVENTS.LOGIN_FAILURE);
  assert.equal(entry.username, 'admin');
  assert.equal(entry.ip, '1.2.3.4');
  assert.equal('password' in entry, false); // never persisted
  assert.ok(entry.timestamp && entry.id);
});

// ---------------------------------------------------------------------------
// AuthService end-to-end (with fakes)
// ---------------------------------------------------------------------------
async function buildAuthService(now) {
  const hasher = new BcryptPasswordHasher(4);
  const userProvider = await new SeedUserProvider(hasher).ready();
  const captcha = new CaptchaService({ now });
  const sessions = new SessionService({ now });
  const throttle = new LoginThrottleService({ now });
  const audit = new AuditService({ now, silent: true });
  const auth = new AuthService({
    userProvider, passwordHasher: hasher, captchaService: captcha,
    sessionService: sessions, throttleService: throttle, auditService: audit,
  });
  const solve = () => { const { id } = captcha.issue(); return { captchaId: id, captchaText: captcha._store.get(id).answer }; };
  return { auth, captcha, sessions, throttle, audit, solve };
}

test('login succeeds with valid credentials + CAPTCHA and creates a session', async () => {
  const now = fakeClock();
  const { auth, sessions, audit, solve } = await buildAuthService(now);
  const res = await auth.login({ username: 'superadmin', password: 'superadmin', ...solve(), ip: '::1', userAgent: 'ua' });
  assert.equal(res.code, RESULT.OK);
  assert.equal(res.session.role, ROLES.SUPER_ADMIN);
  assert.equal(sessions.validate(res.session.id).ok, true);
  assert.equal(audit.query({ event: AUDIT_EVENTS.LOGIN_SUCCESS }).length, 1);
});

test('login rejects wrong password and bad/expired CAPTCHA distinctly', async () => {
  const now = fakeClock();
  const { auth, captcha, solve } = await buildAuthService(now);

  // Wrong password (valid captcha).
  assert.equal((await auth.login({ username: 'admin', password: 'nope', ...solve(), ip: '::1', userAgent: 'ua' })).code, RESULT.INVALID_CREDENTIALS);

  // Bad captcha.
  const bad = await auth.login({ username: 'admin', password: 'admin', captchaId: 'missing', captchaText: 'x', ip: '::1', userAgent: 'ua' });
  assert.equal(bad.code, RESULT.CAPTCHA_INVALID);

  // Expired captcha.
  const { id } = captcha.issue();
  const answer = captcha._store.get(id).answer;
  now.advance(6 * 60 * 1000);
  const exp = await auth.login({ username: 'admin', password: 'admin', captchaId: id, captchaText: answer, ip: '::1', userAgent: 'ua' });
  assert.equal(exp.code, RESULT.CAPTCHA_EXPIRED);
});

test('unknown username is indistinguishable from wrong password', async () => {
  const now = fakeClock();
  const { auth, solve } = await buildAuthService(now);
  const res = await auth.login({ username: 'ghost', password: 'whatever', ...solve(), ip: '::1', userAgent: 'ua' });
  assert.equal(res.code, RESULT.INVALID_CREDENTIALS);
});

test('account locks after 5 failed logins and emits a single lock audit', async () => {
  const now = fakeClock();
  const { auth, audit, solve } = await buildAuthService(now);
  for (let i = 0; i < 5; i++) {
    await auth.login({ username: 'admin', password: 'wrong', ...solve(), ip: '::1', userAgent: 'ua' });
  }
  // 6th attempt — even with the CORRECT password — is blocked by the lock.
  const blocked = await auth.login({ username: 'admin', password: 'admin', ...solve(), ip: '::1', userAgent: 'ua' });
  assert.equal(blocked.code, RESULT.ACCOUNT_LOCKED);
  assert.ok(blocked.retryAfterMs > 0);
  assert.equal(audit.query({ event: AUDIT_EVENTS.ACCOUNT_LOCK }).length, 1);
});

// ---------------------------------------------------------------------------
// HTTP integration — real router, cookies, guards, CSRF
// ---------------------------------------------------------------------------
function startServer() {
  const admin = createAdminAuth({ silentAudit: true });
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/admin/auth', admin.router);
  app.use((err, _req, res, _next) => res.status(500).json({ error: 'server' }));
  return new Promise((resolve) => {
    const server = http.createServer(app).listen(0, () => {
      resolve({ admin, server, base: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

function parseCookies(setCookieArr) {
  const jar = {};
  for (const line of setCookieArr || []) {
    const [pair] = line.split(';');
    const idx = pair.indexOf('=');
    jar[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
  }
  return jar;
}

async function loginViaHttp(base, admin, username, password) {
  const capRes = await fetch(`${base}/api/admin/auth/captcha`, { method: 'POST' });
  const { captchaId } = await capRes.json();
  const captchaText = admin.captchaService._store.get(captchaId).answer;
  const res = await fetch(`${base}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, captchaId, captchaText }),
  });
  const jar = parseCookies(res.headers.getSetCookie ? res.headers.getSetCookie() : []);
  return { res, body: await res.json().catch(() => ({})), jar };
}

test('HTTP: full login → me → audit(role guard) → logout lifecycle', async () => {
  const { admin, server, base } = await startServer();
  try {
    // Anonymous access to a protected route is rejected.
    const anon = await fetch(`${base}/api/admin/auth/me`);
    assert.equal(anon.status, 401);

    // SUPER_ADMIN login.
    const { res, body, jar } = await loginViaHttp(base, admin, 'superadmin', 'superadmin');
    assert.equal(res.status, 200);
    assert.equal(body.user.role, ROLES.SUPER_ADMIN);
    assert.ok(body.csrfToken);
    assert.ok(jar.bb_admin_session);
    const cookieHeader = `bb_admin_session=${jar.bb_admin_session}; bb_admin_csrf=${jar.bb_admin_csrf}`;

    // /me with cookie.
    const me = await fetch(`${base}/api/admin/auth/me`, { headers: { Cookie: cookieHeader } });
    assert.equal(me.status, 200);
    assert.equal((await me.json()).user.username, 'superadmin');

    // SUPER_ADMIN can read audit logs.
    const audit = await fetch(`${base}/api/admin/auth/audit-logs`, { headers: { Cookie: cookieHeader } });
    assert.equal(audit.status, 200);
    assert.ok(Array.isArray((await audit.json()).entries));

    // Logout without CSRF header → 403; with it → 200.
    const noCsrf = await fetch(`${base}/api/admin/auth/logout`, { method: 'POST', headers: { Cookie: cookieHeader } });
    assert.equal(noCsrf.status, 403);
    const out = await fetch(`${base}/api/admin/auth/logout`, {
      method: 'POST',
      headers: { Cookie: cookieHeader, 'X-CSRF-Token': body.csrfToken },
    });
    assert.equal(out.status, 200);

    // Session invalidated after logout.
    const after = await fetch(`${base}/api/admin/auth/me`, { headers: { Cookie: cookieHeader } });
    assert.equal(after.status, 401);
  } finally {
    server.close();
  }
});

test('HTTP: ADMIN is forbidden from the SUPER_ADMIN-only audit route', async () => {
  const { admin, server, base } = await startServer();
  try {
    const { jar } = await loginViaHttp(base, admin, 'admin', 'admin');
    const cookieHeader = `bb_admin_session=${jar.bb_admin_session}`;
    const res = await fetch(`${base}/api/admin/auth/audit-logs`, { headers: { Cookie: cookieHeader } });
    assert.equal(res.status, 403);
    assert.equal((await res.json()).code, 'FORBIDDEN');
  } finally {
    server.close();
  }
});

test('HTTP: invalid CAPTCHA blocks login before credential check', async () => {
  const { server, base } = await startServer();
  try {
    const res = await fetch(`${base}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin', captchaId: 'nope', captchaText: 'x' }),
    });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).code, 'CAPTCHA_INVALID');
  } finally {
    server.close();
  }
});
