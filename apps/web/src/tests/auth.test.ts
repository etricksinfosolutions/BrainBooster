// ---------------------------------------------------------------------------
// Identity client (state/auth.ts) — verifies the backend-backed auth contract
// and the offline-first fallback without a live server (fetch is mocked).
// ---------------------------------------------------------------------------
import { describe, it, expect, beforeEach, vi } from 'vitest'

// localStorage shim (node test env has none) — same approach as identity.test.
const store = new Map<string, string>()
;(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: () => null, length: 0,
} as Storage

import * as auth from '../state/auth'

type Handler = (url: string, init?: RequestInit) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>
function mockFetch(handler: Handler) {
  ;(globalThis as unknown as { fetch: unknown }).fetch = vi.fn(handler)
}
const jsonRes = (obj: unknown, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => obj })
const SESSION = (over: Record<string, unknown> = {}) => ({
  user: { id: 'u1', provider: 'guest', isGuest: true, createdAt: 't' },
  accessToken: 'acc', refreshToken: 'ref', expiresIn: 900, ...over,
})

beforeEach(() => { store.clear(); auth.configureAuth({ apiBase: 'http://test' }) })

describe('offline-first guest', () => {
  it('falls back to a local guest session when no backend is configured', async () => {
    auth.configureAuth({ apiBase: '' })
    const s = await auth.signInGuest()
    expect(s.user.isGuest).toBe(true)
    expect(s.accessToken).toBe('local')
    expect(auth.isAuthenticated()).toBe(true)
  })
  it('falls back to a local guest when the backend is unreachable', async () => {
    mockFetch(async () => { throw new Error('network down') })
    const s = await auth.signInGuest()
    expect(s.user.isGuest).toBe(true)
    expect(s.accessToken).toBe('local')
  })
})

describe('backend-backed identity', () => {
  it('guest sign-in POSTs /auth/guest, persists, and does not duplicate', async () => {
    const calls: Array<[string, string | undefined]> = []
    mockFetch(async (url, init) => { calls.push([url, init?.method]); return jsonRes(SESSION()) })
    const s = await auth.signInGuest()
    expect(calls[0]).toEqual(['http://test/auth/guest', 'POST'])
    expect(s.accessToken).toBe('acc')
    const again = await auth.signInGuest()
    expect(again.user.id).toBe('u1')
    expect(calls.length).toBe(1) // existing session reused
  })

  it('provider sign-in links the guest (migration) and persists the upgraded session', async () => {
    mockFetch(async () => jsonRes(SESSION({ accessToken: 'guest-acc' })))
    await auth.signInGuest()
    let sentBody: Record<string, unknown> = {}
    mockFetch(async (_url, init) => {
      sentBody = JSON.parse(String(init?.body))
      return jsonRes(SESSION({ user: { id: 'u1', provider: 'google', isGuest: false, createdAt: 't' }, accessToken: 'g-acc' }))
    })
    const s = await auth.signInWithProvider('google', 'cred-xyz')
    expect(sentBody.link).toBe(true)
    expect(sentBody.credential).toBe('cred-xyz')
    expect(s.user.provider).toBe('google')
    expect(s.user.isGuest).toBe(false)
  })

  it('refresh rotates and persists the new session', async () => {
    mockFetch(async () => jsonRes(SESSION({ refreshToken: 'ref1' })))
    await auth.signInGuest()
    mockFetch(async () => jsonRes(SESSION({ refreshToken: 'ref2', accessToken: 'acc2' })))
    const s = await auth.refresh()
    expect(s?.refreshToken).toBe('ref2')
    expect(auth.currentSession()?.accessToken).toBe('acc2')
  })

  it('refresh clears the session when the refresh token is rejected', async () => {
    mockFetch(async () => jsonRes(SESSION()))
    await auth.signInGuest()
    mockFetch(async () => jsonRes({}, 401))
    expect(await auth.refresh()).toBeNull()
    expect(auth.isAuthenticated()).toBe(false)
  })

  it('logout revokes and clears the session', async () => {
    let logoutCalled = false
    mockFetch(async (url) => {
      if (String(url).endsWith('/auth/logout')) { logoutCalled = true; return jsonRes({ ok: true }) }
      return jsonRes(SESSION())
    })
    await auth.signInGuest()
    await auth.logout()
    expect(logoutCalled).toBe(true)
    expect(auth.isAuthenticated()).toBe(false)
  })
})
