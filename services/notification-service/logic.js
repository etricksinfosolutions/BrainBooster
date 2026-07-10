// notification-service domain logic (pure) — build & de-duplicate notifications.
const TEMPLATES = {
  streak: (d) => `🔥 ${d.days}-day streak! Play today to keep it going.`,
  'daily-bonus': () => '🎁 Your daily bonus is ready!',
  'level-unlock': (d) => `⭐ New world unlocked: ${d.world}!`,
  'parent-report': (d) => `📊 ${d.child}'s weekly report is ready.`,
};

/** Render a notification from a template + data. Throws on unknown type. */
export function render(type, data = {}) {
  const t = TEMPLATES[type];
  if (!t) throw new Error(`Unknown notification type: ${type}`);
  return { type, body: t(data), ts: data.ts ?? null };
}

/** Collapse duplicates (same user+type within a batch) so we never spam. */
export function dedupe(notifications) {
  const seen = new Set(), out = [];
  for (const n of notifications) {
    const key = `${n.userId}:${n.type}`;
    if (seen.has(key)) continue;
    seen.add(key); out.push(n);
  }
  return out;
}

export const NOTIFICATION_TYPES = Object.keys(TEMPLATES);
