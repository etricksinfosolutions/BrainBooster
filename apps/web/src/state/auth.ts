// ---------------------------------------------------------------------------
// Identity client — talks to the eTricks Identity Platform (backend /auth/*).
//
// Backend-backed with an offline-first fallback: guest login always works even
// with no network (the app is offline-first), and a persisted session is
// restored on launch. Providers (Google/Apple) require the backend. This mirrors
// the backend AuthSession contract (see @etricks/contracts / ADR-0018); the DTO
// is duplicated locally as plain types to keep the web bundle dependency-free.
// ---------------------------------------------------------------------------
import { trackLogin, trackLogout } from './analytics'

export type AuthProvider = 'guest' | 'google' | 'apple'

export interface AuthUser {
  id: string
  provider: AuthProvider
  displayName?: string
  isGuest: boolean
  createdAt: string
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
  expiresIn: number
  refreshToken: string
}

const KEY = 'bbk:auth:v1'

// Identity backend origin. Reuses the app-wide VITE_API_BASE. Empty ⇒ offline
// (guest works locally; providers are unavailable until a backend is configured).
let API_BASE = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE) || ''

/** Override the backend origin (app boot passes the configured base; tests inject a fake). */
export function configureAuth(opts: { apiBase?: string }): void {
  if (opts.apiBase !== undefined) API_BASE = opts.apiBase
}

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AuthSession) : null
  } catch { return null }
}

function saveSession(s: AuthSession | null): void {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s))
    else localStorage.removeItem(KEY)
  } catch { /* storage full / unavailable */ }
}

/** The current signed-in account, or null. Synchronous — reads the persisted session. */
export function currentUser(): AuthUser | null {
  return loadSession()?.user ?? null
}

export function currentSession(): AuthSession | null {
  return loadSession()
}

export function isAuthenticated(): boolean {
  return loadSession() !== null
}

function newId(): string {
  try {
    const c = (globalThis as unknown as { crypto?: { randomUUID?: () => string } }).crypto
    if (c?.randomUUID) return c.randomUUID()
  } catch { /* fall through */ }
  return 'local-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e9).toString(36)
}

/** A device-local guest session — the offline-first fallback when there is no backend. */
function localGuestSession(): AuthSession {
  const id = newId()
  return {
    user: { id, provider: 'guest', isGuest: true, createdAt: new Date().toISOString() },
    accessToken: 'local',
    refreshToken: 'local',
    expiresIn: 0,
  }
}

async function authFetch(path: string, init: RequestInit & { token?: string } = {}): Promise<Response> {
  const { token, headers, ...rest } = init
  return fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string> | undefined),
    },
  })
}

/**
 * Sign in as a guest. Uses the backend when configured; falls back to a local
 * guest session offline so play is never blocked. Idempotent-ish: an existing
 * session is returned rather than creating a duplicate.
 */
export async function signInGuest(): Promise<AuthSession> {
  const existing = loadSession()
  if (existing) return existing
  if (API_BASE) {
    try {
      const res = await authFetch('/auth/guest', { method: 'POST' })
      if (res.ok) {
        const s = (await res.json()) as AuthSession
        saveSession(s)
        trackLogin('guest', true)
        return s
      }
    } catch { /* offline → fall back */ }
  }
  const local = localGuestSession()
  saveSession(local)
  trackLogin('guest', true)
  return local
}

/**
 * Sign in with Google/Apple through the backend. If the current session is a
 * guest, it is upgraded in place (account migration) so progress carries over.
 * Requires a configured backend.
 */
export async function signInWithProvider(provider: 'google' | 'apple', credential: string): Promise<AuthSession> {
  if (!API_BASE) throw new Error(`${provider} sign-in needs a configured backend`)
  const current = loadSession()
  const link = current?.user.isGuest === true && current.accessToken !== 'local'
  const res = await authFetch(`/auth/${provider}`, {
    method: 'POST',
    token: link ? current!.accessToken : undefined,
    body: JSON.stringify({ credential, link }),
  })
  if (!res.ok) throw new Error(`${provider} sign-in failed (HTTP ${res.status})`)
  const s = (await res.json()) as AuthSession
  saveSession(s)
  trackLogin(provider, false)
  return s
}

/** Refresh the session (token rotation). Returns null if it cannot (clears session). */
export async function refresh(): Promise<AuthSession | null> {
  const s = loadSession()
  if (!API_BASE || !s || s.refreshToken === 'local') return s
  try {
    const res = await authFetch('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: s.refreshToken }),
    })
    if (res.ok) {
      const next = (await res.json()) as AuthSession
      saveSession(next)
      return next
    }
    // Refresh token rejected → session is dead.
    saveSession(null)
    return null
  } catch {
    return s // offline: keep the cached session
  }
}

/** Fetch the authoritative account from the backend (validates the access token). */
export async function me(): Promise<AuthUser | null> {
  const s = loadSession()
  if (!API_BASE || !s || s.accessToken === 'local') return s?.user ?? null
  try {
    const res = await authFetch('/auth/me', { token: s.accessToken })
    if (res.ok) return (await res.json()) as AuthUser
    if (res.status === 401) {
      // Access token expired — try a refresh once.
      const refreshed = await refresh()
      return refreshed?.user ?? null
    }
    return null
  } catch {
    return s.user // offline
  }
}

/** Log out: revoke the refresh token (best-effort) and clear the local session. */
export async function logout(): Promise<void> {
  const s = loadSession()
  if (API_BASE && s && s.refreshToken !== 'local') {
    try {
      await authFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: s.refreshToken }),
      })
    } catch { /* best-effort */ }
  }
  trackLogout()
  saveSession(null)
}
