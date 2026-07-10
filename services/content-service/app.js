import express from 'express';
import { health } from '../../packages/shared/index.js';
import { query, generateApproved } from './logic.js';

// In-memory catalog seed; a real deployment reads from content-service DB.
const CATALOG = [];

export function createApp() {
  const app = express();
  app.use(express.json());
  app.get('/health', (_req, res) => res.json(health('content-service')));
  app.get('/activities', (req, res) => {
    const { topic } = req.query;
    res.json(query(CATALOG, { topic, page: Number(req.query.page || 0), size: Number(req.query.size || 10) }));
  });
  app.post('/activities/generate', async (req, res) => {
    const { topic = 'math', count = 5, seed = 1 } = req.body || {};
    const items = await generateApproved(topic, count, { seed });
    CATALOG.push(...items);
    res.json({ generated: items.length, items });
  });
  return app;
}
