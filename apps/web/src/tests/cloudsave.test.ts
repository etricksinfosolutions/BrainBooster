// ---------------------------------------------------------------------------
// Cloud Save client (state/cloudsave.ts) — offline queue + sync contract,
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

import * as cloud from '../state/cloudsave'

const AUTH_KEY = 'bbk:auth:v1'
function signedIn() {
  store.set(AUTH_KEY, JSON.stringify({ user: { id: 'u1', provider: 'google', isGuest: false, createdAt: 't' }, accessToken: 'acc', refreshToken: 'ref', expiresIn: 900 }))
}
type Handler = (url: string, init?: RequestInit) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>
const mockFetch = (h: Handler) => { (globalThis as unknown as { fetch: unknown }).fetch = vi.fn(h) }
const syncRes = (over: Record<string, unknown> = {}) => ({
  ok: true, status: 200,
  json: async () => ({ status: 'applied', conflicts: [], save: { progress: { xp: 10 }, profile: {}, settings: {}, daily: {}, metadata: { version: 1, lastModified: 't' } }, ...over }),
})

beforeEach(() => { store.clear(); cloud.configureCloud({ apiBase: 'http://test', online: true }) })

describe('offline-first', () => {
  it('records changes locally and marks them dirty (works with no network)', () => {
    const s = cloud.recordChange({ progress: { xp: 42 } })
    expect(s.dirty).toBe(true)
    expect((s.save.progress as { xp: number }).xp).toBe(42)
    expect(cloud.syncStatus().dirty).toBe(true)
  })

  it('sync while offline is a no-op — the change stays queued (never lost)', async () => {
    signedIn()
    cloud.configureCloud({ online: false })
    cloud.recordChange({ progress: { xp: 5 } })
    expect(await cloud.sync()).toBeNull()
    expect(cloud.syncStatus().dirty).toBe(true) // still queued
  })

  it('sync without an account is a no-op (guest = local only)', async () => {
    cloud.recordChange({ progress: { xp: 5 } })
    expect(await cloud.sync()).toBeNull()
  })
})

describe('backend sync', () => {
  it('pushes the queued document, adopts the server version, and clears dirty', async () => {
    signedIn()
    let sentBody: Record<string, unknown> = {}
    mockFetch(async (_u, init) => { sentBody = JSON.parse(String(init?.body)); return syncRes({ save: { progress: { xp: 42 }, profile: {}, settings: {}, daily: {}, metadata: { version: 3, lastModified: 't' } } }) })
    cloud.recordChange({ progress: { xp: 42 } })
    const r = await cloud.sync()
    expect(r?.status).toBe('applied')
    expect(sentBody.baseVersion).toBe(0)
    const st = cloud.syncStatus()
    expect(st.dirty).toBe(false)
    expect(st.version).toBe(3) // adopted server version as the new base
    expect(st.lastSyncAt).not.toBeNull()
  })

  it('surfaces merge conflicts to the caller (never silent)', async () => {
    signedIn()
    mockFetch(async () => syncRes({ status: 'merged', conflicts: [{ field: 'settings', resolution: 'last-write-wins' }] }))
    cloud.recordChange({ settings: { language: 'fr' } })
    const r = await cloud.sync()
    expect(r?.status).toBe('merged')
    expect(r?.conflicts.length).toBe(1)
  })

  it('a failed sync keeps the change queued and records the error', async () => {
    signedIn()
    mockFetch(async () => { throw new Error('network down') })
    cloud.recordChange({ progress: { xp: 5 } })
    expect(await cloud.sync()).toBeNull()
    const st = cloud.syncStatus()
    expect(st.dirty).toBe(true)
    expect(st.lastError).toBeTruthy()
  })
})
