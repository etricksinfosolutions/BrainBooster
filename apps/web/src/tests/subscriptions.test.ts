// ---------------------------------------------------------------------------
// Subscriptions client (state/subscriptions.ts) — entitlement caching + gating,
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

import * as subs from '../state/subscriptions'

function signedIn() {
  store.set('bbk:auth:v1', JSON.stringify({ user: { id: 'u1', provider: 'google', isGuest: false, createdAt: 't' }, accessToken: 'acc', refreshToken: 'ref', expiresIn: 900 }))
}
type Handler = (url: string, init?: RequestInit) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>
const mockFetch = (h: Handler) => { (globalThis as unknown as { fetch: unknown }).fetch = vi.fn(h) }
const ok = (obj: unknown) => ({ ok: true, status: 200, json: async () => obj })

beforeEach(() => { store.clear(); subs.configureSubscriptions({ apiBase: 'http://test' }) })

describe('entitlement gating', () => {
  it('has no entitlements before any refresh (never grants locally)', () => {
    expect(subs.isPremium()).toBe(false)
    expect(subs.hasEntitlement('PREMIUM')).toBe(false)
  })

  it('refresh pulls + caches the server entitlement set; gating reads it offline', async () => {
    signedIn()
    mockFetch(async () => ok({ entitlements: ['PREMIUM', 'UNLIMITED_HEARTS'] }))
    await subs.refresh()
    expect(subs.isPremium()).toBe(true)
    expect(subs.hasEntitlement('UNLIMITED_HEARTS')).toBe(true)
    // works with no further network (reads cache)
    mockFetch(async () => { throw new Error('offline') })
    expect(subs.hasEntitlement('PREMIUM')).toBe(true)
  })

  it('refresh without an account is a no-op (guest = no entitlements)', async () => {
    expect(await subs.refresh()).toEqual([])
  })
})

describe('purchase + restore', () => {
  it('purchase posts the receipt and adopts the returned entitlements', async () => {
    signedIn()
    let path = ''
    mockFetch(async (url) => { path = String(url); return ok({ entitlements: ['PREMIUM', 'FINANCE_MASTER'] }) })
    const ent = await subs.purchase('google', JSON.stringify({ productId: 'financemaster.pro.monthly' }))
    expect(path).toBe('http://test/subscriptions/google')
    expect(ent).toContain('FINANCE_MASTER')
    expect(subs.isPremium()).toBe(true)
  })

  it('restore posts and caches the restored entitlements', async () => {
    signedIn()
    mockFetch(async () => ok({ entitlements: ['PREMIUM'] }))
    const ent = await subs.restore('google', ['receipt-1'])
    expect(ent).toContain('PREMIUM')
    expect(subs.isPremium()).toBe(true)
  })
})
