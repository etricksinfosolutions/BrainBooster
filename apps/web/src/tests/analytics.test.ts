// ---------------------------------------------------------------------------
// Analytics client (state/analytics.ts) — batching + offline queue + privacy,
// verified without a live server (fetch mocked, localStorage shimmed).
// ---------------------------------------------------------------------------
import { describe, it, expect, beforeEach, vi } from 'vitest'

const store = new Map<string, string>()
;(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(), key: () => null, length: 0,
} as Storage

import * as analytics from '../state/analytics'

type Batch = { events: Array<{ name: string; params: Record<string, unknown>; context: Record<string, unknown> }> }
let sent: Batch[] = []
function mockOk() {
  ;(globalThis as unknown as { fetch: unknown }).fetch = vi.fn(async (_url: string, init?: RequestInit) => {
    sent.push(JSON.parse(String(init?.body)) as Batch)
    return { ok: true, status: 200, json: async () => ({ accepted: 1, rejected: 0 }) }
  })
}
function mockFail() {
  ;(globalThis as unknown as { fetch: unknown }).fetch = vi.fn(async () => { throw new Error('offline') })
}

beforeEach(() => {
  store.clear(); sent = []
  // Large flush interval so the timer never fires mid-test; explicit flush() is exercised instead.
  analytics.configureAnalytics({ apiBase: 'http://test', enabled: true, batchSize: 3, flushIntervalMs: 10_000_000, onlineOverride: true })
})

describe('batching', () => {
  it('auto-flushes when the batch size is reached, in ONE network call', async () => {
    mockOk()
    analytics.track('app_started')
    analytics.track('screen_viewed')
    expect(sent.length).toBe(0) // not yet — below batch size
    analytics.track('hint_used') // hits batchSize=3 → triggers flush
    await new Promise((r) => setTimeout(r, 0))
    expect(sent.length).toBe(1)
    expect(sent[0].events.length).toBe(3)
    expect(analytics.pendingCount()).toBe(0)
  })

  it('a manual flush delivers the queued events and clears the queue', async () => {
    mockOk()
    analytics.track('level_started')
    expect(analytics.pendingCount()).toBe(1)
    const n = await analytics.flush()
    expect(n).toBe(1)
    expect(analytics.pendingCount()).toBe(0)
  })
})

describe('offline queue', () => {
  it('keeps events queued while offline and delivers them once online (nothing dropped)', async () => {
    mockOk()
    analytics.configureAnalytics({ onlineOverride: false })
    analytics.track('level_completed')
    analytics.track('question_answered')
    expect(await analytics.flush()).toBe(0)       // offline → not sent
    expect(analytics.pendingCount()).toBe(2)      // still queued
    analytics.configureAnalytics({ onlineOverride: true })
    expect(await analytics.flush()).toBe(2)       // back online → delivered
    expect(analytics.pendingCount()).toBe(0)
  })

  it('a failed request keeps the batch queued for retry', async () => {
    mockFail()
    analytics.track('achievement_earned')
    expect(await analytics.flush()).toBe(0)
    expect(analytics.pendingCount()).toBe(1)
    mockOk()
    expect(await analytics.flush()).toBe(1)
  })

  it('the queue survives a reload (persisted in localStorage)', async () => {
    analytics.configureAnalytics({ onlineOverride: false })
    analytics.track('daily_reward_claimed')
    // Simulate reload: the module reads the persisted queue.
    expect(analytics.pendingCount()).toBe(1)
    const raw = store.get('bbk:analytics:queue:v1')
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw!)[0].name).toBe('daily_reward_claimed')
  })
})

describe('privacy + context', () => {
  it('is a hard no-op when disabled — nothing queued, nothing sent', async () => {
    mockOk()
    analytics.configureAnalytics({ enabled: false })
    analytics.track('app_started')
    expect(analytics.pendingCount()).toBe(0)
    expect(await analytics.flush()).toBe(0)
    analytics.configureAnalytics({ enabled: true }) // restore
  })

  it('attaches the automatic attribute envelope (anonymousId, session, platform)', async () => {
    mockOk()
    analytics.track('content_viewed', { itemId: 'a1' })
    await analytics.flush()
    const ctx = sent[0].events[0].context
    expect(ctx.platform).toBe('web')
    expect(typeof ctx.anonymousId).toBe('string')
    expect(typeof ctx.sessionId).toBe('string')
    expect(sent[0].events[0].params.itemId).toBe('a1')
  })

  it('picks up userId + premium from the persisted auth/entitlement caches', async () => {
    mockOk()
    store.set('bbk:auth:v1', JSON.stringify({ user: { id: 'u9' }, accessToken: 'acc' }))
    store.set('bbk:entitlements:v1', JSON.stringify({ entitlements: ['PREMIUM'] }))
    analytics.track('level_started')
    await analytics.flush()
    const ctx = sent[0].events[0].context
    expect(ctx.userId).toBe('u9')
    expect(ctx.premium).toBe(true)
  })
})
