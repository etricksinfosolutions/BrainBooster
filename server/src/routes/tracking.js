const router = require('express').Router();
const { z } = require('zod');
const { pool, requireAuth, validate } = require('../middleware/core');

/**
 * User Activity Mapping — cross-device record of what each child did with each
 * activity. The client is offline-first and keeps its own log; this endpoint
 * backs it up and, on a new device, restores it so the scheduler keeps avoiding
 * already-seen content and personalising. The aggregate row is upserted; an
 * append-only event is also logged for later personalisation training.
 */

const event = z.object({
  activityId: z.string().min(1).max(80),
  mechanic: z.string().max(40).optional(),
  outcome: z.enum(['completed', 'skipped']),
  stars: z.number().int().min(0).max(3).optional(),
  hints: z.number().int().min(0).max(50).optional(),
  ms: z.number().int().min(0).max(3_600_000).optional(),
  levelId: z.number().int().min(0).max(100000).optional(),
});

/** POST /api/tracking — record one activity outcome. */
router.post('/', requireAuth, validate(event), async (req, res, next) => {
  const b = req.body;
  const completed = b.outcome === 'completed' ? 1 : 0;
  const skipped = b.outcome === 'skipped' ? 1 : 0;
  try {
    await pool.query(
      `INSERT INTO activity_history
         (user_id, activity_id, plays, completed, skips, hints, best_stars, best_ms, last_level, attempts, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,1, now())
       ON CONFLICT (user_id, activity_id) DO UPDATE SET
         plays      = activity_history.plays + $3,
         completed  = activity_history.completed + $4,
         skips      = activity_history.skips + $5,
         hints      = activity_history.hints + $6,
         best_stars = GREATEST(activity_history.best_stars, $7),
         best_ms    = CASE WHEN $8 > 0 AND (activity_history.best_ms = 0 OR $8 < activity_history.best_ms)
                           THEN $8 ELSE activity_history.best_ms END,
         last_level = $9,
         attempts   = activity_history.attempts + 1,
         updated_at = now()`,
      [req.user.sub, b.activityId, completed, completed, skipped, b.hints || 0, b.stars || 0, b.ms || 0, b.levelId || 0]
    );
    await pool.query(
      `INSERT INTO activity_events (user_id, activity_id, mechanic, outcome, stars, hints, ms, level_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [req.user.sub, b.activityId, b.mechanic || null, b.outcome, b.stars || null, b.hints || null, b.ms || null, b.levelId || null]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

/** GET /api/tracking — the child's activity history (for scheduler restore). */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT activity_id, plays, completed, skips, hints, best_stars, best_ms, last_level, attempts, updated_at
         FROM activity_history WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 2000`,
      [req.user.sub]
    );
    res.json({ history: rows });
  } catch (err) { next(err); }
});

module.exports = router;
