import { createApp } from './app.js';
import { env, createLogger } from '../../packages/shared/index.js';
const log = createLogger('leaderboard-service');
const port = Number(env('PORT', 4102));
createApp().listen(port, () => log.info('listening', { port }));
