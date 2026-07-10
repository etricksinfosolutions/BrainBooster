import { createApp } from './app.js';
import { env, createLogger } from '../../packages/shared/index.js';
const log = createLogger('content-service');
const port = Number(env('PORT', 4101));
createApp().listen(port, () => log.info('listening', { port }));
