// ---------------------------------------------------------------------------
// Brain Booster Kids — Cloud Account Sync
//
// Backs up the whole player profile (coins, XP, achievements, unlocked worlds,
// progress, settings, downloaded content, activity history, streak, rewards)
// so switching devices restores everything. The client is offline-first, so
// sync is best-effort and never blocks play.
//
// Providers (Google / Facebook / Apple / Guest) are behind one interface. The
// bodies here are STUBS with clearly-marked seams — real OAuth needs the app
// registrations you provision (client IDs), then each connect() swaps in the
// provider SDK and posts to the existing Express server (/api/auth, /api/progress,
// /api/tracking). Guest works fully today (local-only, no account).
// ---------------------------------------------------------------------------

export type SyncProvider = 'google' | 'facebook' | 'apple' | 'guest'

export interface SyncAccount {
  provider: SyncProvider
  displayName: string
  connectedAt: number
}

export interface SyncState {
  account: SyncAccount | null
  autoSync: boolean
  lastSyncAt: number | null
  lastError: string | null
}

const KEY = 'bbk:sync:v1'

export function loadSyncState(): SyncState {
  try {
    const raw = localStorage.getItem(KEY)
    // lastError is transient UI state — never restore a stale error, or it would
    // re-surface on every Settings visit long after the child dismissed it.
    if (raw) return { autoSync: true, lastSyncAt: null, account: null, ...JSON.parse(raw), lastError: null }
  } catch { /* ignore */ }
  return { account: null, autoSync: true, lastSyncAt: null, lastError: null }
}

function save(s: SyncState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* full */ }
}

/**
 * Connects a cloud account.
 * TODO(oauth): wire the real provider SDK here —
 *   google:   Google Identity Services → id_token → POST /api/auth/google
 *   facebook: Facebook Login SDK       → access_token → POST /api/auth/facebook
 *   apple:    Sign in with Apple       → identity_token → POST /api/auth/apple
 * On success the server returns a JWT we store for /api/progress + /api/tracking.
 * 'guest' needs no network and is available today.
 */
export async function connect(provider: SyncProvider): Promise<SyncState> {
  const s = loadSyncState()
  if (provider === 'guest') {
    const next: SyncState = { ...s, account: { provider, displayName: 'Guest', connectedAt: Date.now() }, lastError: null }
    save(next); return next
  }
  // Real OAuth not yet configured — surface a clear, non-scary state.
  const next: SyncState = { ...s, lastError: `${label(provider)} sign-in isn't set up yet — coming soon!` }
  save(next); return next
}

export async function disconnect(): Promise<SyncState> {
  const s = loadSyncState()
  const next: SyncState = { ...s, account: null }
  save(next); return next
}

/**
 * Uploads the current snapshot to the cloud.
 * TODO(server): with a JWT present, PUT /api/progress + POST /api/tracking.
 * Returns the updated sync state (with lastSyncAt / lastError).
 */
export async function backupNow(_snapshot: unknown): Promise<SyncState> {
  const s = loadSyncState()
  if (!s.account) {
    const next = { ...s, lastError: 'Connect an account to back up to the cloud.' }
    save(next); return next
  }
  if (s.account.provider === 'guest') {
    const next = { ...s, lastError: 'Guest progress is saved on this device only — connect Google, Apple or Facebook to sync across devices.' }
    save(next); return next
  }
  // TODO(server): real upload. Optimistically record the sync for now.
  const next: SyncState = { ...s, lastSyncAt: Date.now(), lastError: null }
  save(next); return next
}

/** Restores the latest cloud snapshot (GET /api/progress + /api/tracking). */
export async function restoreProgress(): Promise<{ state: SyncState; snapshot: unknown | null }> {
  const s = loadSyncState()
  if (!s.account || s.account.provider === 'guest') {
    const msg = s.account?.provider === 'guest'
      ? 'Guest progress is on this device only — connect an account to restore from another device.'
      : 'Connect an account to restore from the cloud.'
    const next = { ...s, lastError: msg }
    save(next); return { state: next, snapshot: null }
  }
  // TODO(server): real download + merge into the store.
  const next: SyncState = { ...s, lastSyncAt: Date.now(), lastError: null }
  save(next); return { state: next, snapshot: null }
}

export function setAutoSync(on: boolean): SyncState {
  const next = { ...loadSyncState(), autoSync: on }
  save(next); return next
}

export function label(p: SyncProvider): string {
  return p === 'google' ? 'Google' : p === 'facebook' ? 'Facebook' : p === 'apple' ? 'Apple' : 'Guest'
}
