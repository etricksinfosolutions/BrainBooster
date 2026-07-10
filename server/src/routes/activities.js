const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const { pool } = require('../middleware/core');

/**
 * Smart, batched activity delivery for the Modular Activity Engine.
 *
 * The app ships with a built-in catalogue of 100+ activity types and NEVER
 * downloads the whole library. On start it asks for a small batch; as the child
 * progresses it prefetches the next batch in the background. New activities
 * (seasonal events, new mechanics' content) are added server-side — file-backed
 * here for zero-setup dev, or the `activity_templates` table in production —
 * and merged client-side with no app update.
 *
 * GET /api/activities/batch?after=<cursor>&limit=<n>&tier=<t>
 *   → { version, nextCursor, count, types: [ActivityType...] }
 */

const FILE = path.join(__dirname, '..', '..', 'activities.json');
const MAX_LIMIT = 40;

function readFileTypes() {
  try {
    const doc = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return Array.isArray(doc.types) ? doc.types : [];
  } catch { return []; }
}

/**
 * ONE cursor space per deployment — never mixed. When a database is configured
 * the cursor is the table's monotonic `seq`; in dev (no DB) it's the seed-file
 * array index. Falling through from DB to file would reinterpret a `seq` cursor
 * as an array index (wrong pages / duplicates) and could leak dev-seed content
 * into production, so we don't: an empty/absent DB simply returns nothing more.
 */
async function fetchBatch({ after, limit, tier }) {
  if (process.env.DATABASE_URL) {
    try {
      const params = [after, limit];
      let where = 'published AND seq > $1';
      if (Number.isInteger(tier)) { where += ' AND $3 BETWEEN min_tier AND max_tier'; params.push(tier); }
      const { rows } = await pool.query(
        `SELECT seq, doc FROM activity_templates WHERE ${where} ORDER BY seq ASC LIMIT $2`,
        params
      );
      // Empty result = no more activities → advance nothing; the client stops.
      return { types: rows.map(r => r.doc), nextCursor: rows.length ? rows[rows.length - 1].seq : after };
    } catch (err) {
      // Table not migrated yet: serve nothing rather than mixing in dev seeds.
      console.warn('[activities] DB query failed, serving empty batch:', err.message);
      return { types: [], nextCursor: after };
    }
  }
  // Dev: file-backed, deterministic order = array index acts as the cursor.
  let all = readFileTypes();
  if (Number.isInteger(tier)) all = all.filter(a => tier >= (a.minTier ?? 0) && tier <= (a.maxTier ?? 4));
  const page = all.slice(after, after + limit);
  return { types: page, nextCursor: after + page.length };
}

router.get('/batch', async (req, res, next) => {
  try {
    const after = Math.max(0, parseInt(req.query.after, 10) || 0);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const tier = req.query.tier != null ? parseInt(req.query.tier, 10) : undefined;
    const { types, nextCursor } = await fetchBatch({ after, limit, tier: Number.isInteger(tier) ? tier : undefined });
    res.set('Cache-Control', 'public, max-age=120');
    res.json({ version: 1, count: types.length, nextCursor, types });
  } catch (err) { next(err); }
});

module.exports = router;
