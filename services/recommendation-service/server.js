import { createApp } from './app.js';
import { env, createLogger } from '../../packages/shared/index.js';
const log = createLogger('recommendation-service');
const port = Number(env('PORT', 4104));
createApp().listen(port, () => log.info('listening', { port }));
