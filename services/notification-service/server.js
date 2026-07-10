import { createApp } from './app.js';
import { env, createLogger } from '../../packages/shared/index.js';
const log = createLogger('notification-service');
const port = Number(env('PORT', 4105));
createApp().listen(port, () => log.info('listening', { port }));
