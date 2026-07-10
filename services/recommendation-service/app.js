import express from 'express';
import { health } from '../../packages/shared/index.js';
import { recommend, profile } from '../../agents/personalization/index.js';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.get('/health', (_req, res) => res.json(health('recommendation-service')));
  app.post('/recommend', (req, res) => {
    const history = Array.isArray(req.body?.history) ? req.body.history : [];
    res.json({ recommendation: recommend(history), profile: profile(history) });
  });
  return app;
}
