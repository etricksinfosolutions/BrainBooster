const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { pool, signToken, validate } = require('../middleware/core');

const credentials = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
});

/** POST /api/auth/register — create a parent account. */
router.post('/register', validate(credentials), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, role`,
      [email.toLowerCase(), hash]
    );
    if (!rows[0]) return res.status(409).json({ error: 'Email already registered' });
    res.status(201).json({ token: signToken(rows[0]), user: { id: rows[0].id, email: rows[0].email } });
  } catch (err) { next(err); }
});

/** POST /api/auth/login */
router.post('/login', validate(credentials), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = rows[0];
    // Constant-shaped response whether the email exists or not.
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ token: signToken(user), user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) { next(err); }
});

module.exports = router;
