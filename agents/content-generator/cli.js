import { generateBatch, TOPIC_KEYS } from './index.js';
const topic = process.argv[2] || 'math';
const count = Number(process.argv[3] || 3);
if (!TOPIC_KEYS.includes(topic)) { console.error(`Usage: node cli.js <${TOPIC_KEYS.join('|')}> [count]`); process.exit(1); }
generateBatch(topic, count).then((b) => console.log(JSON.stringify(b, null, 2)));
