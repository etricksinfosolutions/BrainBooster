/// <reference types="vite/client" />
// ---------------------------------------------------------------------------
// Web-app API authentication (OAuth2 client-credentials).
//
// The game data APIs (/api/content, /api/activities) now require a Bearer token.
// This module exchanges the web-app client credentials for a short-lived access
// token and caches it in memory until shortly before it expires, so every API
// call can attach `Authorization: Bearer <token>`.
//
// SECURITY NOTE: a public browser bundle cannot truly keep a client secret. The
// VITE_WEBAPP_CLIENT_* values are public by nature (like a mobile app's baked-in
// key). For hardened deployments, issue tokens from a first-party backend/proxy
// instead of shipping the secret. See docs/IDENTITY_PLATFORM.md.
// ---------------------------------------------------------------------------

const API_BASE = import.meta.env.VITE_API_BASE || ''
const CLIENT_ID = import.meta.env.VITE_WEBAPP_CLIENT_ID || 'webapp-brainbooster'
const CLIENT_SECRET = import.meta.env.VITE_WEBAPP_CLIENT_SECRET || 'webapp-dev-secret-change-me'

// Refresh this many ms before the token actually expires (clock-skew cushion).
const EXPIRY_MARGIN_MS = 30_000

let cached: { token: string; expiresAt: number } | null = null
let inflight: Promise<string | null> | null = null

/** Returns a valid access token, fetching/refreshing as needed. null when no API
 *  base is configured (offline-first default) or the request fails. */
export async function getAccessToken(now: number = Date.now()): Promise<string | null> {
  if (!API_BASE) return null
  if (cached && cached.expiresAt - EXPIRY_MARGIN_MS > now) return cached.token
  if (inflight) return inflight

  inflight = (async () => {
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 4000)
      const res = await fetch(`${API_BASE}/api/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
        signal: ctrl.signal,
      })
      clearTimeout(timer)
      if (!res.ok) return null
      const data = await res.json()
      if (!data || typeof data.access_token !== 'string') return null
      const ttlMs = (Number(data.expires_in) || 3600) * 1000
      cached = { token: data.access_token, expiresAt: now + ttlMs }
      return cached.token
    } catch {
      return null
    } finally {
      inflight = null
    }
  })()
  return inflight
}

/** Convenience: Authorization header map (empty when no token is available). */
export async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Clears the cached token (e.g. after a 401) so the next call re-authenticates. */
export function clearTokenCache(): void {
  cached = null
}
