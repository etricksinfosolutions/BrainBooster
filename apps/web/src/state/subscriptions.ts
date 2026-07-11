// ---------------------------------------------------------------------------
// Subscriptions & Entitlements client (web).
//
// The server is the sole authority on entitlements (they originate only from
// verified purchases). This client caches the server's entitlement set locally
// so gating works offline, but NEVER grants access on its own — `hasEntitlement`
// reflects the last server truth, and the backend re-checks via EntitlementGuard.
// Purchases/restores go to the server for verification. Mirrors the subscription
// contract (@etricks/contracts). See ADR-0021.
// ---------------------------------------------------------------------------
import { currentSession } from './auth'
import { trackPurchase } from './analytics'

export type BillingProvider = 'google' | 'apple' | 'web'
export interface EntitlementsSnapshot { entitlements: string[]; fetchedAt: number }

const KEY = 'bbk:entitlements:v1'
let API_BASE = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE) || ''

export function configureSubscriptions(opts: { apiBase?: string }): void {
  if (opts.apiBase !== undefined) API_BASE = opts.apiBase
}

function loadSnapshot(): EntitlementsSnapshot {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as EntitlementsSnapshot
  } catch { /* ignore */ }
  return { entitlements: [], fetchedAt: 0 }
}
function save(entitlements: string[]): void {
  try { localStorage.setItem(KEY, JSON.stringify({ entitlements, fetchedAt: Date.now() })) } catch { /* full */ }
}
function token(): string | null {
  const t = currentSession()?.accessToken
  return t && t !== 'local' ? t : null
}
async function api(path: string, init: RequestInit = {}): Promise<Response | null> {
  const t = token()
  if (!API_BASE || !t) return null
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${t}`, ...(init.headers as Record<string, string> | undefined) },
  })
}

/** The last-known entitlement set (from cache) — usable offline. */
export function entitlements(): string[] {
  return loadSnapshot().entitlements
}

/**
 * Centralized gating: does the user possess entitlement Y? Reads the cached server truth. Never
 * asks "did they buy X?". The server independently enforces the same on protected routes.
 */
export function hasEntitlement(key: string): boolean {
  return loadSnapshot().entitlements.includes(key)
}

export function isPremium(): boolean {
  return hasEntitlement('PREMIUM')
}

/** Pull the authoritative entitlement set from the server and cache it. No-op offline/unauth. */
export async function refresh(): Promise<string[]> {
  const res = await api('/subscriptions/entitlements').catch(() => null)
  if (!res || !res.ok) return entitlements() // offline → last-known
  const body = (await res.json()) as { entitlements: string[] }
  save(body.entitlements)
  return body.entitlements
}

/** Submit a purchase receipt for server verification, then adopt the resulting entitlements. */
export async function purchase(provider: BillingProvider, receipt: string): Promise<string[]> {
  const res = await api(`/subscriptions/${provider}`, { method: 'POST', body: JSON.stringify({ receipt }) })
  if (!res || !res.ok) throw new Error('purchase verification failed')
  const body = (await res.json()) as { entitlements: string[] }
  save(body.entitlements)
  trackPurchase('started')
  return body.entitlements
}

/** Restore purchases (cross-device / reinstall). */
export async function restore(provider: BillingProvider, receipts: string[] = []): Promise<string[]> {
  const res = await api('/subscriptions/restore', { method: 'POST', body: JSON.stringify({ provider, receipts }) })
  if (!res || !res.ok) return entitlements()
  const body = (await res.json()) as { entitlements: string[] }
  save(body.entitlements)
  trackPurchase('restored')
  return body.entitlements
}
