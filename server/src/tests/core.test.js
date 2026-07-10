// Real unit tests for the API security middleware (auth, admin gate, zod validation).
// Runs under `node --test`; no database connection is opened (pg Pool is lazy).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { z } = require('zod');
const jwt = require('jsonwebtoken');
const { signToken, requireAuth, requireAdmin, validate } = require('../middleware/core');

// Minimal express-style res double.
function mockRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

test('signToken issues a JWT carrying the user id and role', () => {
  const token = signToken({ id: 'u1', role: 'admin' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-only-secret-change-me');
  assert.equal(decoded.sub, 'u1');
  assert.equal(decoded.role, 'admin');
});

test('requireAuth rejects a request with no token', () => {
  const res = mockRes();
  let nexted = false;
  requireAuth({ headers: {} }, res, () => { nexted = true; });
  assert.equal(nexted, false);
  assert.equal(res.statusCode, 401);
});

test('requireAuth accepts a valid Bearer token and attaches req.user', () => {
  const token = signToken({ id: 'u2', role: 'user' });
  const req = { headers: { authorization: `Bearer ${token}` } };
  let nexted = false;
  requireAuth(req, mockRes(), () => { nexted = true; });
  assert.equal(nexted, true);
  assert.equal(req.user.sub, 'u2');
});

test('requireAdmin forbids a non-admin token', () => {
  const token = signToken({ id: 'u3', role: 'user' });
  const res = mockRes();
  let nexted = false;
  requireAdmin({ headers: { authorization: `Bearer ${token}` } }, res, () => { nexted = true; });
  assert.equal(nexted, false);
  assert.equal(res.statusCode, 403);
});

test('requireAdmin allows an admin token', () => {
  const token = signToken({ id: 'u4', role: 'admin' });
  let nexted = false;
  requireAdmin({ headers: { authorization: `Bearer ${token}` } }, mockRes(), () => { nexted = true; });
  assert.equal(nexted, true);
});

test('validate rejects a body that fails the schema with 400', () => {
  const mw = validate(z.object({ email: z.string().email() }));
  const res = mockRes();
  let nexted = false;
  mw({ body: { email: 'not-an-email' } }, res, () => { nexted = true; });
  assert.equal(nexted, false);
  assert.equal(res.statusCode, 400);
});

test('validate passes a valid body and replaces req.body with parsed data', () => {
  const mw = validate(z.object({ name: z.string() }));
  const req = { body: { name: 'Tigo', extra: 'stripped?' } };
  let nexted = false;
  mw(req, mockRes(), () => { nexted = true; });
  assert.equal(nexted, true);
  assert.equal(req.body.name, 'Tigo');
});
