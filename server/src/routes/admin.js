const router = require('express').Router();
const { z } = require('zod');
const { pool, requireAdmin, validate } = require('../middleware/core');

/**
 * Admin panel API. A minimal React admin UI can sit on top of these, or use
 * any API client. All routes require role='admin' (set manually in the DB
 * for the first admin: UPDATE users SET role='admin' WHERE email=...).
 */

// --- Content: riddles ---------------------------------------------------------
const riddle = z.object({
  question: z.string().min(5).max(500),
  options: z.array(z.string().max(80)).min(2).max(6),
  answerIndex: z.number().int().min(0),
  minTier: z.number().int().min(0).max(4).default(0),
});

router.get('/riddles', requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM content_riddles ORDER BY id');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/riddles', requireAdmin, validate(riddle), async (req, res, next) => {
  try {
    const { question, options, answerIndex, minTier } = req.body;
    if (answerIndex >= options.length) return res.status(400).json({ error: 'answerIndex out of range' });
    const { rows } = await pool.query(
      'INSERT INTO content_riddles (question, options, answer_index, min_tier) VALUES ($1,$2,$3,$4) RETURNING *',
      [question, JSON.stringify(options), answerIndex, minTier]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/riddles/:id', requireAdmin, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM content_riddles WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// --- Content: stories ----------------------------------------------------------
const story = z.object({
  title: z.string().min(2).max(120),
  pages: z.array(z.string().max(600)).min(1).max(20),
  questions: z.array(z.object({
    q: z.string().max(300),
    options: z.array(z.string().max(120)).min(2).max(4),
    answerIndex: z.number().int().min(0),
  })).min(1).max(8),
});

router.post('/stories', requireAdmin, validate(story), async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'INSERT INTO content_stories (title, body) VALUES ($1, $2) RETURNING *',
      [req.body.title, JSON.stringify(req.body)]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// --- Users & premium ------------------------------------------------------------
router.get('/users', requireAdmin, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const { rows } = await pool.query(
      'SELECT id, email, role, premium, created_at FROM users ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.patch(
  '/users/:id/premium',
  requireAdmin,
  validate(z.object({ premium: z.boolean() })),
  async (req, res, next) => {
    try {
      await pool.query('UPDATE users SET premium = $1 WHERE id = $2', [req.body.premium, req.params.id]);
      res.json({ ok: true });
    } catch (err) { next(err); }
  }
);

// --- Analytics -------------------------------------------------------------------
router.get('/analytics', requireAdmin, async (_req, res, next) => {
  try {
    const [users, premium, purchases] = await Promise.all([
      pool.query('SELECT count(*)::int AS n FROM users'),
      pool.query('SELECT count(*)::int AS n FROM users WHERE premium'),
      pool.query('SELECT coalesce(sum(amount_paise),0)::bigint AS paise FROM purchases'),
    ]);
    res.json({
      totalUsers: users.rows[0].n,
      premiumUsers: premium.rows[0].n,
      revenueInr: Number(purchases.rows[0].paise) / 100,
    });
  } catch (err) { next(err); }
});

module.exports = router;
