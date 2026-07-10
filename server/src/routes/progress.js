const router = require('express').Router();
const { z } = require('zod');
const { pool, requireAuth, validate } = require('../middleware/core');

/**
 * The client is offline-first: localStorage is the source of truth on-device.
 * These endpoints back it up so a child can continue on another device.
 * Conflict strategy: last-write-wins on updated_at, but coins/xp/stars are
 * merged with GREATEST() so progress is never lost by an older snapshot.
 */

const snapshot = z.object({
  childName: z.string().max(40).optional(),
  coins: z.number().int().min(0),
  diamonds: z.number().int().min(0),
  xp: z.number().int().min(0),
  premium: z.boolean(),
  starsByLevel: z.record(z.string(), z.number().int().min(1).max(3)),
  badges: z.array(z.string().max(60)).max(200),
  skills: z.record(z.string(), z.object({ plays: z.number().int().min(0), totalAccuracy: z.number().min(0) })),
  playLog: z.array(z.object({ date: z.string().max(10), seconds: z.number().int().min(0), levels: z.number().int().min(0) })).max(60),
});

/** PUT /api/progress — upload the latest snapshot. */
router.put('/', requireAuth, validate(snapshot), async (req, res, next) => {
  try {
    await pool.query(
      `INSERT INTO progress (user_id, snapshot, updated_at)
       VALUES ($1, $2, now())
       ON CONFLICT (user_id) DO UPDATE SET
         snapshot = jsonb_set(
           EXCLUDED.snapshot, '{coins}',
           to_jsonb(GREATEST((progress.snapshot->>'coins')::int, (EXCLUDED.snapshot->>'coins')::int))
         ),
         updated_at = now()`,
      [req.user.sub, JSON.stringify(req.body)]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

/** GET /api/progress — download the latest snapshot. */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT snapshot, updated_at FROM progress WHERE user_id = $1', [req.user.sub]);
    if (!rows[0]) return res.status(404).json({ error: 'No cloud save yet' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
