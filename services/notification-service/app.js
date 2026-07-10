import express from 'express';
import { health } from '../../packages/shared/index.js';
import { render, dedupe, NOTIFICATION_TYPES } from './logic.js';

export function createApp() {
  const app = express();
  app.use(express.json());
  const queue = [];
  app.get('/health', (_req, res) => res.json(health('notification-service')));
  app.get('/types', (_req, res) => res.json({ types: NOTIFICATION_TYPES }));
  app.post('/notify', (req, res) => {
    const { userId, type, data } = req.body || {};
    try {
      const n = { userId, ...render(type, data) };
      queue.push(n);
      res.json({ queued: dedupe(queue).length, notification: n });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
  return app;
}
