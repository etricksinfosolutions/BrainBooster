// Analytics Agent
// Turns a raw event stream into engagement metrics: DAU, retention, and funnel
// conversion. Pure functions over an array of {userId, day, event} records.

const dayOf = (e) => e.day; // day is a YYYY-MM-DD string or integer day-index

/** Distinct active users per day. */
export function activeUsersByDay(events) {
  const map = {};
  for (const e of events) (map[dayOf(e)] ||= new Set()).add(e.userId);
  return Object.fromEntries(Object.entries(map).map(([d, s]) => [d, s.size]));
}

/** D1/DN retention: fraction of a cohort (users first seen on day0) active N days later. */
export function retention(events, day0, n) {
  const firstSeen = {};
  for (const e of events) {
    if (firstSeen[e.userId] === undefined || e.day < firstSeen[e.userId]) firstSeen[e.userId] = e.day;
  }
  const cohort = new Set(Object.entries(firstSeen).filter(([, d]) => d === day0).map(([u]) => u));
  if (cohort.size === 0) return 0;
  const activeOnTarget = new Set(events.filter((e) => e.day === day0 + n).map((e) => e.userId));
  let retained = 0;
  for (const u of cohort) if (activeOnTarget.has(u)) retained++;
  return retained / cohort.size;
}

/** Funnel conversion: fraction of users reaching each step in order. */
export function funnel(events, steps) {
  const byUser = {};
  for (const e of events) (byUser[e.userId] ||= new Set()).add(e.event);
  const users = Object.keys(byUser);
  const total = users.length || 1;
  return steps.map((step) => ({
    step,
    users: users.filter((u) => byUser[u].has(step)).length,
    rate: users.filter((u) => byUser[u].has(step)).length / total,
  }));
}
