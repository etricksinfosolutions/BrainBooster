import express from 'express';
import { health } from '../../packages/shared/index.js';
import { createBoard } from './logic.js';

export function createApp(board = createBoard()) {
  const app = express();
  app.use(express.json());
  app.get('/health', (_req, res) => res.json(health('leaderboard-service')));
  app.post('/scores', (req, res) => {
    const { userId, score } = req.body || {};
    if (!userId || typeof score !== 'number') return res.status(400).json({ error: 'userId and numeric score required' });
    res.json({ best: board.submit(userId, score), rank: board.rankOf(userId) });
  });
  app.get('/top', (req, res) => res.json({ top: board.top(Number(req.query.n || 10)) }));
  return app;
}
