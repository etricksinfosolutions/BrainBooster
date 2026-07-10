// ---------------------------------------------------------------------------
// Brain Booster Kids — lightweight, offline-first analytics (spec #13)
// Events are buffered in localStorage and can be flushed to the backend when
// online (POST /api/analytics). No third-party SDK, no PII — just gameplay
// signals used to understand engagement and drop-off.
// ---------------------------------------------------------------------------
export interface AnalyticsEvent { name: string; props?: Record<string, any>; ts: number }

const KEY = 'bbk:analytics:v1'
const MAX = 800

export type EventName =
  | 'level_start' | 'level_complete' | 'question_wrong' | 'hint_used'
  | 'coins_earned' | 'coins_spent' | 'story_complete' | 'fact_viewed'
  | 'ad_impression' | 'rewarded_ad_watched' | 'level_dropoff'

/** Record a gameplay event (safe no-op if storage is unavailable). */
export function track(name: EventName, props?: Record<string, any>) {
  try {
    const buf: AnalyticsEvent[] = JSON.parse(localStorage.getItem(KEY) || '[]')
    buf.push({ name, props, ts: Date.now() })
    localStorage.setItem(KEY, JSON.stringify(buf.slice(-MAX)))
  } catch { /* storage full / unavailable */ }
}

/** Returns and clears the buffered events (call before POSTing to the backend). */
export function drainAnalytics(): AnalyticsEvent[] {
  try {
    const buf: AnalyticsEvent[] = JSON.parse(localStorage.getItem(KEY) || '[]')
    localStorage.removeItem(KEY)
    return buf
  } catch { return [] }
}
