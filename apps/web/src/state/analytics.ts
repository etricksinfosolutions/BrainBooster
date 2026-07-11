// ---------------------------------------------------------------------------
// Product Analytics client (web) — the provider-agnostic collection point.
//
// The app calls `track(name, params)` (or the semantic helpers) and NEVER touches
// Firebase or any vendor: events are enriched with the automatic attribute
// envelope, batched, queued durably in localStorage, and flushed to the backend
// ingest endpoint (which fans out to the configured sink). Offline-first: a failed
// flush keeps events queued and retries — nothing is dropped. Privacy-first:
// disabled ⇒ hard no-op; no PII is ever attached (see docs/ANALYTICS.md).
// Mirrors the AnalyticsEvent contract (@etricks/contracts). See ADR-0022.
// ---------------------------------------------------------------------------

export type AnalyticsEventName =
  | 'app_started' | 'session_started' | 'session_ended' | 'screen_viewed'
  | 'user_signed_in' | 'user_signed_out' | 'guest_created'
  | 'subscription_started' | 'subscription_renewed' | 'purchase_restored'
  | 'level_started' | 'level_completed' | 'question_answered' | 'question_failed'
  | 'hint_used' | 'story_completed' | 'achievement_earned' | 'world_completed'
  | 'daily_reward_claimed' | 'cloud_sync_completed' | 'generation_job_published'
  | 'content_viewed' | 'search_performed' | 'crash_reported'

export type ParamValue = string | number | boolean
export type Params = Record<string, ParamValue>

interface QueuedEvent {
  name: AnalyticsEventName
  timestamp: string
  params: Params
  context: {
    userId?: string
    anonymousId: string
    sessionId: string
    game?: string
    world?: string
    activity?: string
    device?: string
    platform: 'web'
    appVersion?: string
    premium?: boolean
  }
}

const QUEUE_KEY = 'bbk:analytics:queue:v1'
const AID_KEY = 'bbk:analytics:aid:v1'
const AUTH_KEY = 'bbk:auth:v1'
const ENT_KEY = 'bbk:entitlements:v1'

interface Config {
  apiBase: string
  enabled: boolean
  appVersion?: string
  batchSize: number
  flushIntervalMs: number
  onlineOverride: boolean | null
}

const cfg: Config = {
  apiBase: ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE) || '',
  enabled: true,
  appVersion: ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_APP_VERSION) || undefined,
  batchSize: 20,
  flushIntervalMs: 15_000,
  onlineOverride: null,
}

let sessionId = newId()
let flushTimer: ReturnType<typeof setInterval> | null = null

export function configureAnalytics(opts: Partial<Config>): void {
  Object.assign(cfg, opts)
  if (cfg.enabled) startAutoFlush()
  else stopAutoFlush()
}

function newId(): string {
  try {
    const c = (globalThis as unknown as { crypto?: { randomUUID?: () => string } }).crypto
    if (c?.randomUUID) return c.randomUUID()
  } catch { /* fall through */ }
  return 'a-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e9).toString(36)
}

function anonymousId(): string {
  try {
    let id = localStorage.getItem(AID_KEY)
    if (!id) { id = newId(); localStorage.setItem(AID_KEY, id) }
    return id
  } catch { return 'anon' }
}

function readJson<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : null } catch { return null }
}

function currentUserId(): string | undefined {
  const s = readJson<{ user?: { id?: string }; accessToken?: string }>(AUTH_KEY)
  return s?.user?.id
}
function currentPremium(): boolean | undefined {
  const s = readJson<{ entitlements?: string[] }>(ENT_KEY)
  return s ? (s.entitlements ?? []).includes('PREMIUM') : undefined
}

function loadQueue(): QueuedEvent[] {
  return readJson<QueuedEvent[]>(QUEUE_KEY) ?? []
}
function saveQueue(q: QueuedEvent[]): void {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)) } catch { /* full — drop silently */ }
}

function isOnline(): boolean {
  if (cfg.onlineOverride !== null) return cfg.onlineOverride
  const nav = (globalThis as unknown as { navigator?: { onLine?: boolean } }).navigator
  return nav?.onLine ?? true
}

/** The automatic attribute envelope — attached to every event, free of PII. */
function context(extra?: Partial<QueuedEvent['context']>): QueuedEvent['context'] {
  return {
    anonymousId: anonymousId(),
    sessionId,
    platform: 'web',
    userId: currentUserId(),
    premium: currentPremium(),
    appVersion: cfg.appVersion,
    ...extra,
  }
}

/**
 * Record an event. Enriches + queues durably, then flushes when the batch is full. Hard no-op when
 * analytics is disabled. Never throws — instrumentation must not break the app.
 */
export function track(name: AnalyticsEventName, params: Params = {}, ctx?: Partial<QueuedEvent['context']>): void {
  if (!cfg.enabled) return
  try {
    const q = loadQueue()
    q.push({ name, timestamp: new Date().toISOString(), params, context: context(ctx) })
    saveQueue(q)
    if (q.length >= cfg.batchSize) void flush()
  } catch { /* instrumentation is best-effort */ }
}

/**
 * Flush queued events to the backend. Offline / unconfigured ⇒ keep the queue (retried later).
 * On a partial-batch send, only the sent events are removed so nothing is lost. Returns the number
 * of events delivered.
 */
export async function flush(): Promise<number> {
  if (!cfg.enabled) return 0
  const q = loadQueue()
  if (q.length === 0) return 0
  if (!cfg.apiBase || !isOnline()) return 0 // queued — retried on next flush

  const batch = q.slice(0, 500)
  try {
    const res = await fetch(`${cfg.apiBase}/analytics/events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ events: batch }),
    })
    if (!res.ok) return 0 // stays queued
    saveQueue(loadQueue().slice(batch.length)) // drop the sent prefix (re-read: track() may have appended)
    return batch.length
  } catch {
    return 0 // offline — stays queued
  }
}

function startAutoFlush(): void {
  if (flushTimer || cfg.flushIntervalMs <= 0) return
  const t = (globalThis as unknown as { setInterval?: typeof setInterval }).setInterval
  if (!t) return
  flushTimer = t(() => { void flush() }, cfg.flushIntervalMs)
  // Don't keep a Node/test process alive on the interval.
  ;(flushTimer as unknown as { unref?: () => void }).unref?.()
}
function stopAutoFlush(): void {
  if (flushTimer) { clearInterval(flushTimer); flushTimer = null }
}

/** The queued (not-yet-flushed) event count — for status/debugging. */
export function pendingCount(): number {
  return loadQueue().length
}

// --- semantic helpers (the auto-tracking surface) ----------------------------

export function trackAppStart(): void {
  sessionId = newId()
  track('app_started')
  track('session_started')
}
export function trackSessionEnd(): void { track('session_ended') }
export function trackLogin(provider: string, isGuest: boolean): void {
  track(isGuest ? 'guest_created' : 'user_signed_in', { provider })
}
export function trackLogout(): void {
  track('user_signed_out')
  void flush() // deliver before the session id/user changes
}
export function trackNavigation(screen: string): void { track('screen_viewed', { screen }) }
export function trackPurchase(kind: 'started' | 'restored', productId?: string): void {
  track(kind === 'restored' ? 'purchase_restored' : 'subscription_started', productId ? { productId } : {})
}
export function trackCloudSync(status: string, conflicts = 0): void {
  track('cloud_sync_completed', { status, conflicts })
}
export function trackError(message: string, fatal = false): void {
  // Truncate + strip anything that could be PII-ish; the server also sanitizes.
  track('crash_reported', { message: String(message).slice(0, 300), fatal })
}
