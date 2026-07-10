import { createApp } from './app.js';
import { env, createLogger } from '../../packages/shared/index.js';
const log = createLogger('analytics-service');
const port = Number(env('PORT', 4103));
createApp().listen(port, () => log.info('listening', { port }));
