/// <reference types="vite/client" />
// ---------------------------------------------------------------------------
// Brain Booster Kids — server-driven content service
// The level catalogue, the themed worlds and the branding are all fetched from
// the server at startup so new levels/worlds can be added remotely with no app
// update. Fetch order:
//   1. the live API            (VITE_API_BASE + /api/content)   ← source of truth
//   2. the bundled content.json (served with the PWA)           ← works offline
//   3. the built-in defaults    (compiled fallback)             ← never blank
// The last good document is cached in localStorage so a returning child always
// has content even with no network.
// ---------------------------------------------------------------------------
import { LEVELS, buildLevelsFor, setLevels } from './data/levels'
import {
  WorldSeed, buildWorlds, setWorlds, DEFAULT_WORLD_SEEDS, DEFAULT_TOTAL_LEVELS,
} from './data/worlds'
import {
  generateWorldSeed, endlessCount, setEndlessCount, LEVELS_PER_GENERATED_WORLD,
} from './data/endless'
import { ServerBranding, applyServerConfig } from './config'
import { mergeActivityTypes } from './activities/catalog'
import { setAssetSource } from './assets/engine'
import { ActivityType } from './activities/types'

export interface ContentDoc {
  version: number
  branding?: ServerBranding
  totalLevels?: number
  worlds: WorldSeed[]
  /** Optional: move illustrated sprites off the live gen-AI service onto a
   *  pre-baked S3/CloudFront asset pack — no app rebuild needed. */
  assets?: { cdnBase?: string }
}

export type ContentSource = 'server' | 'bundled' | 'cache' | 'default'

const CACHE_KEY = 'bbk:content:v1'
// Vite inlines this at build/dev from VITE_API_BASE (.env or environment).
const API_BASE = import.meta.env.VITE_API_BASE || ''

function isValid(doc: any): doc is ContentDoc {
  return doc && Array.isArray(doc.worlds) && doc.worlds.length > 0 &&
    doc.worlds.every((w: any) => w && w.id && w.name && Array.isArray(w.emojis))
}

/** The active document — kept so the endless engine can re-derive the
 *  catalogue whenever it appends generated worlds. */
let activeDoc: ContentDoc | null = null

/** Turns a content document (+ any endless worlds already unlocked on this
 *  device) into the live catalogue + branding. */
export function applyContent(doc: ContentDoc) {
  activeDoc = doc
  rebuildCatalogue()
  applyServerConfig(doc.branding)
  if (doc.assets?.cdnBase) setAssetSource({ kind: 'cdn', base: doc.assets.cdnBase })
}

function rebuildCatalogue() {
  if (!activeDoc) return
  const generated = Array.from({ length: endlessCount() }, (_, i) => generateWorldSeed(i))
  const seeds = [...activeDoc.worlds, ...generated]
  const declared = activeDoc.worlds.reduce((sum, w) => sum + (w.levels ?? 0), 0)
  const authoredTotal = activeDoc.totalLevels || declared || DEFAULT_TOTAL_LEVELS
  const total = authoredTotal + generated.length * LEVELS_PER_GENERATED_WORLD
  const worlds = buildWorlds(seeds, total)
  const realTotal = worlds[worlds.length - 1]?.lastLevel || total
  setWorlds(worlds)
  setLevels(buildLevelsFor(realTotal))
}

// --- Smart activity download -------------------------------------------------
// The app ships a 100+ activity catalogue and never downloads the whole library.
// It pulls a small batch on start and prefetches the next batch in the
// background as the child plays, merging server-authored activities into the
// live catalogue with no app update. Cursor + cache survive offline sessions.

const ACT_CURSOR_KEY = 'bbk:act:cursor:v1'
const ACT_CACHE_KEY = 'bbk:act:cache:v1'
let prefetching = false

function cachedActivities(): ActivityType[] {
  try { return JSON.parse(localStorage.getItem(ACT_CACHE_KEY) || '[]') } catch { return [] }
}

/** Re-applies any activities already downloaded on this device (offline-safe). */
export function hydrateActivities() {
  const cached = cachedActivities()
  if (cached.length) mergeActivityTypes(cached)
}

/** Fetches the next batch of activity types and merges them. Safe to call
 *  repeatedly; no-ops when offline or when the server has nothing new. */
export async function prefetchActivities(limit = 20): Promise<number> {
  if (!API_BASE || prefetching) return 0
  prefetching = true
  try {
    const after = Math.max(0, parseInt(localStorage.getItem(ACT_CURSOR_KEY) || '0', 10) || 0)
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 4000)
    const res = await fetch(`${API_BASE}/api/activities/batch?after=${after}&limit=${limit}`, { signal: ctrl.signal, headers: { accept: 'application/json' } })
    clearTimeout(timer)
    const doc: any = res.ok ? await res.json() : null
    const types: ActivityType[] = doc && Array.isArray(doc.types) ? doc.types.filter((t: any) => t && t.id && t.mechanic) : []
    if (!types.length) return 0
    mergeActivityTypes(types)
    const merged = [...cachedActivities().filter(a => !types.some(t => t.id === a.id)), ...types]
    try {
      localStorage.setItem(ACT_CACHE_KEY, JSON.stringify(merged.slice(-500)))
      localStorage.setItem(ACT_CURSOR_KEY, String(doc.nextCursor ?? after + types.length))
    } catch { /* storage full */ }
    return types.length
  } catch { return 0 }
  finally { prefetching = false }
}

/** The Endless Engine's trigger: keeps at least ~2 worlds of runway ahead of
 *  the child. Returns true when new worlds were generated (callers re-render).
 *  The journey therefore never ends — see data/endless.ts. */
export function ensureHeadroom(maxUnlocked: number): boolean {
  if (!activeDoc) return false
  const runway = LEVELS.length - maxUnlocked
  if (runway >= 2 * LEVELS_PER_GENERATED_WORLD) return false
  const deficit = 2 * LEVELS_PER_GENERATED_WORLD - runway
  setEndlessCount(endlessCount() + Math.ceil(deficit / LEVELS_PER_GENERATED_WORLD))
  rebuildCatalogue()
  return true
}

function cache(doc: ContentDoc) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(doc)) } catch { /* storage full */ }
}
function readCache(): ContentDoc | null {
  try { const raw = localStorage.getItem(CACHE_KEY); const d = raw && JSON.parse(raw); return isValid(d) ? d : null } catch { return null }
}

async function tryFetch(url: string, ms = 2000): Promise<ContentDoc | null> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), ms)
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json' } })
    clearTimeout(timer)
    if (!res.ok) return null
    const doc = await res.json()
    return isValid(doc) ? doc : null
  } catch { return null }
}

/** Loads content from the best available source and activates it. Resolves with
 *  which source won so the UI can surface it (e.g. an offline note). */
export async function loadContent(): Promise<ContentSource> {
  // 1) live API (authoritative — reflects newly added levels immediately). Skip it
  //    entirely when the device is offline so launch never blocks on a doomed fetch
  //    (the offline APK falls straight through to bundled content — no stall).
  const online = typeof navigator === 'undefined' || navigator.onLine !== false
  const fromApi = API_BASE && online ? await tryFetch(`${API_BASE}/api/content`) : null
  if (fromApi) { applyContent(fromApi); cache(fromApi); return 'server' }

  // 2) bundled content.json shipped with the PWA (also updatable by ops/CDN)
  const base = import.meta.env.BASE_URL || '/'
  const fromBundle = await tryFetch(`${base}content.json`)
  if (fromBundle) { applyContent(fromBundle); cache(fromBundle); return 'bundled' }

  // 3) last good cached document
  const cached = readCache()
  if (cached) { applyContent(cached); return 'cache' }

  // 4) compiled-in defaults — the app is never blank
  applyContent({ version: 0, totalLevels: DEFAULT_TOTAL_LEVELS, worlds: DEFAULT_WORLD_SEEDS })
  return 'default'
}
