import express from 'express';
import { health } from '../../packages/shared/index.js';
import { activeUsersByDay, retention, funnel } from '../../agents/analytics/index.js';

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));
  const events = [];
  app.get('/health', (_req, res) => res.json(health('analytics-service')));
  app.post('/events', (req, res) => {
    const batch = Array.isArray(req.body) ? req.body : [req.body];
    events.push(...batch);
    res.json({ ingested: batch.length, total: events.length });
  });
  app.get('/metrics/dau', (_req, res) => res.json(activeUsersByDay(events)));
  app.get('/metrics/retention', (req, res) =>
    res.json({ value: retention(events, Number(req.query.day0 || 0), Number(req.query.n || 1)) }));
  app.post('/metrics/funnel', (req, res) => res.json({ funnel: funnel(events, req.body?.steps || []) }));
  return app;
}
