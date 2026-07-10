// Content Generator Agent
// Manufactures quiz activities (question + options + answer + hint + explanation)
// from a topic spec. Rule-based and deterministic by default (seeded); accepts an
// optional `llm` port ({ complete(prompt) => Promise<string> }) to swap in a real
// model without changing callers. AI never invents gameplay — only content.
import { seeded } from '../../packages/shared/index.js';

const TOPICS = {
  math: (rng) => {
    const a = 2 + Math.floor(rng() * 8);
    const b = 2 + Math.floor(rng() * 8);
    const answer = a + b;
    const distractors = new Set();
    while (distractors.size < 3) {
      const d = answer + (Math.floor(rng() * 7) - 3);
      if (d !== answer && d > 0) distractors.add(d);
    }
    const options = shuffle([answer, ...distractors], rng);
    return {
      prompt: `What is ${a} + ${b}?`,
      options: options.map(String),
      answer: options.indexOf(answer),
      hint: `Count up from ${a}.`,
      explanation: `${a} + ${b} = ${answer}.`,
    };
  },
  animals: (rng) => {
    const facts = [
      ['Which animal says "moo"?', 'Cow', ['Dog', 'Cat', 'Duck']],
      ['Which animal can fly?', 'Bird', ['Fish', 'Cow', 'Frog']],
      ['Which animal lives in water?', 'Fish', ['Lion', 'Bird', 'Horse']],
    ];
    const [q, correct, wrong] = facts[Math.floor(rng() * facts.length)];
    const options = shuffle([correct, ...wrong], rng);
    return {
      prompt: q, options, answer: options.indexOf(correct),
      hint: 'Think about where the animal lives or the sound it makes.',
      explanation: `The answer is ${correct}.`,
    };
  },
};

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate one activity.
 * @param {{topic:string, seed?:number, difficulty?:number, llm?:{complete:Function}}} spec
 * @returns {Promise<object>} a validated activity payload
 */
export async function generateActivity(spec) {
  const topic = spec.topic || 'math';
  const rng = seeded(spec.seed ?? 1);
  const maker = TOPICS[topic];
  if (!maker) throw new Error(`Unknown topic: ${topic}`);
  const activity = maker(rng);
  return {
    id: `${topic}-${spec.seed ?? 1}`,
    type: 'quiz',
    topic,
    difficulty: spec.difficulty ?? 1,
    ...activity,
    source: spec.llm ? 'llm' : 'rule-based',
  };
}

/** Generate a batch of N distinct activities. */
export async function generateBatch(topic, count, opts = {}) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(await generateActivity({ topic, ...opts, seed: (opts.seed ?? 1) + i }));
  return out;
}

export const TOPIC_KEYS = Object.keys(TOPICS);
