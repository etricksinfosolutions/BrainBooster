const router = require('express').Router();
const fs = require('fs');
const path = require('path');

/**
 * Public game-content endpoint.
 *
 * The PWA fetches this at startup and renders its level catalogue, themed
 * worlds and branding entirely from what it returns — so new levels/worlds can
 * be added by editing content (here or in an admin tool) with NO app update.
 *
 * The document is served from server/content.json (hot-reloaded on each request
 * so edits go live immediately). In production the admin panel would write this
 * document to the database; the shape is identical.
 */

const CONTENT_PATH = path.join(__dirname, '..', '..', 'content.json');

// Minimal built-in so the endpoint is never empty even if the file is missing.
const FALLBACK = {
  version: 0,
  branding: { appName: 'Brain Booster Kids', studio: 'EtricksGames', supportEmail: 'support@etricksgames.com' },
  totalLevels: 20,
  worlds: [
    { id: 'home', name: 'Home Village', emoji: '🏠', accent: '#7a5cc8', sky: '#f2f0fa', mascot: 'owl',
      blurb: 'Where every adventure begins!', activities: ['Memory', 'Shapes'],
      emojis: ['🧸', '🍼', '🛏️', '🪑', '🕯️', '🧦', '👕', '🥄'], levels: 20 },
  ],
};

function readContent() {
  try {
    const raw = fs.readFileSync(CONTENT_PATH, 'utf8');
    const doc = JSON.parse(raw);
    if (doc && Array.isArray(doc.worlds) && doc.worlds.length) return doc;
  } catch { /* fall through to built-in */ }
  return FALLBACK;
}

/** GET /api/content — the live game content document (public, cacheable). */
router.get('/', (_req, res) => {
  const doc = readContent();
  res.set('Cache-Control', 'public, max-age=300');
  res.json(doc);
});

module.exports = router;
