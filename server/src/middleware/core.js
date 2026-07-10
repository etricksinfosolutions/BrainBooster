const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// Single shared pool. DATABASE_URL e.g. postgres://user:pass@db:5432/brainbooster
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';
const JWT_TTL = process.env.JWT_TTL || '2h';

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_TTL });
}

/** Require a valid Bearer token; attaches req.user = { sub, role }. */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Require an admin role on top of a valid token. */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    next();
  });
}

/** Wrap a zod schema into express middleware; rejects invalid bodies with 400. */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid input', details: result.error.flatten().fieldErrors });
    }
    req.body = result.data;
    next();
  };
}

module.exports = { pool, signToken, requireAuth, requireAdmin, validate };
