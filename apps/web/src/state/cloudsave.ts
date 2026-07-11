// ---------------------------------------------------------------------------
// Cloud Save client (web) — offline-first sync against the backend /cloud/* API.
//
// Local-first: every change is written to localStorage immediately and works
// offline; a pending "dirty" flag marks unsynced changes. sync() pushes the
// document to the server (which merges deterministically) when authenticated
// and online, retries on the next call after failure, and never drops progress.
// Guests are local-only; on guest→registered upgrade, pushLocalToAccount()
// uploads the local save to the account. Mirrors the CloudSave contract
// (@etricks/contracts). See ADR-0020.
// ---------------------------------------------------------------------------
import { currentSession } from './auth'
import { trackCloudSync } from './analytics'

export interface SaveDoc {
  profile: Record<string, unknown>
  progress: Record<string, unknown>
  settings: Record<string, unknown>
  daily: Record<string, unknown>
  metadata: { lastModified: string; device?: string }
}

export interface LocalCloud {
  save: SaveDoc
  /** The server version this local doc is based on (0 = never synced). */
  baseVersion: number
  dirty: boolean
  lastSyncAt: number | null
  lastError: string | null
}

const KEY = 'bbk:cloudsave:v1'
let API_BASE = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE) || ''
let onlineOverride: boolean | null = null

export function configureCloud(opts: { apiBase?: string; online?: boolean }): void {
  if (opts.apiBase !== undefined) API_BASE = opts.apiBase
  if (opts.online !== undefined) onlineOverride = opts.online
}

function emptyDoc(): SaveDoc {
  return { profile: {}, progress: {}, settings: {}, daily: {}, metadata: { lastModified: new Date().toISOString() } }
}

function load(): LocalCloud {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as LocalCloud
  } catch { /* ignore */ }
  return { save: emptyDoc(), baseVersion: 0, dirty: false, lastSyncAt: null, lastError: null }
}

function persist(s: LocalCloud): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* full */ }
}

export function currentCloud(): LocalCloud {
  return load()
}

function isOnline(): boolean {
  if (onlineOverride !== null) return onlineOverride
  const nav = (globalThis as unknown as { navigator?: { onLine?: boolean } }).navigator
  return nav?.onLine ?? true
}

/** Apply a local change (merged shallowly into the document) — always succeeds, even offline. */
export function recordChange(patch: Partial<SaveDoc>): LocalCloud {
  const s = load()
  const save: SaveDoc = {
    ...s.save,
    ...patch,
    profile: { ...s.save.profile, ...(patch.profile ?? {}) },
    progress: { ...s.save.progress, ...(patch.progress ?? {}) },
    settings: { ...s.save.settings, ...(patch.settings ?? {}) },
    daily: { ...s.save.daily, ...(patch.daily ?? {}) },
    metadata: { ...s.save.metadata, lastModified: new Date().toISOString() },
  }
  const next = { ...s, save, dirty: true }
  persist(next)
  return next
}

function token(): string | null {
  const t = currentSession()?.accessToken
  return t && t !== 'local' ? t : null
}

/**
 * Push the local document to the server and adopt the authoritative result. No-op (leaves the
 * change queued) when unauthenticated or offline. Returns the sync outcome, or null if queued.
 */
export async function sync(force = false): Promise<{ status: string; conflicts: unknown[] } | null> {
  const s = load()
  if (!force && !s.dirty) return { status: 'up-to-date', conflicts: [] }
  const t = token()
  if (!API_BASE || !t || !isOnline()) return null // queued — retried on the next sync

  try {
    const res = await fetch(`${API_BASE}/cloud/sync`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${t}` },
      body: JSON.stringify({ baseVersion: s.baseVersion, data: s.save }),
    })
    if (!res.ok) {
      persist({ ...s, lastError: `sync failed (HTTP ${res.status})` })
      return null
    }
    const body = (await res.json()) as { status: string; save: SaveDoc & { metadata: { version: number } }; conflicts: unknown[] }
    const { version, ...meta } = body.save.metadata
    persist({
      save: { ...body.save, metadata: meta },
      baseVersion: version,
      dirty: false,
      lastSyncAt: Date.now(),
      lastError: null,
    })
    trackCloudSync(body.status, (body.conflicts ?? []).length)
    return { status: body.status, conflicts: body.conflicts ?? [] }
  } catch {
    persist({ ...s, lastError: 'offline — will retry' })
    return null // stays dirty/queued
  }
}

/** After a guest upgrades to a real account, force-push the local save to the account. */
export async function pushLocalToAccount(): Promise<void> {
  await sync(true)
}

export interface SyncStatus {
  online: boolean
  dirty: boolean
  lastSyncAt: number | null
  lastError: string | null
  version: number
}

export function syncStatus(): SyncStatus {
  const s = load()
  return { online: isOnline(), dirty: s.dirty, lastSyncAt: s.lastSyncAt, lastError: s.lastError, version: s.baseVersion }
}
