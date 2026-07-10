// content-service domain logic (pure, no express) — serve & generate activities.
import { generateBatch } from '../../agents/content-generator/index.js';
import { review } from '../../agents/quality-review/index.js';

/** Filter + paginate an activity catalog. */
export function query(catalog, { topic, page = 0, size = 10 } = {}) {
  const filtered = topic ? catalog.filter((a) => a.topic === topic) : catalog;
  const start = page * size;
  return { total: filtered.length, page, size, items: filtered.slice(start, start + size) };
}

/** Generate a batch and return only quality-approved activities. */
export async function generateApproved(topic, count, opts) {
  const batch = await generateBatch(topic, count, opts);
  return batch.filter((a) => review(a).ok);
}
