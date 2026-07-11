// ---------------------------------------------------------------------------
// Brain Booster Kids — Asset Engine
//
// Resolves a content key (an emoji token) to a professionally illustrated
// sprite in the game's single art universe, and manages caching & prefetch so
// activities load instantly and keep working offline.
//
//        content key  ─►  Asset Engine  ─►  illustrated sprite URL
//                              │
//              ┌───────────────┼────────────────┐
//         resolve()        prefetch()      persistent cache
//        (URL + seed)   (warm upcoming     (localStorage of
//                        world packs)       verified URLs)
//
// SOURCE is swappable. Today assets are generated on demand by a gen-AI image
// service (Pollinations / flux) using the unified prompt+seed from the
// registry — deterministic, so the CDN caches each sprite globally after the
// first request. Point ASSET_SOURCE at an S3/CloudFront bucket later (assets
// pre-baked as /sprites/<slug>.webp) with ZERO changes to any activity: the
// mobile app never bundles or hard-codes images.
// ---------------------------------------------------------------------------
import { promptFor, seedFor, slugFor } from './registry'
import { themeEmojis, WORLDS, worldForLevel } from '../data/worlds'

// --- Source configuration ----------------------------------------------------

export type AssetSource =
  | { kind: 'genai' }                 // live gen-AI (Pollinations flux)
  | { kind: 'cdn'; base: string }     // pre-baked WebP on S3/CloudFront

// Where pre-baked sprites live off the app origin. By default the pack is
// BUNDLED in public/sprites (instant + fully offline — the whole point of the
// bake job), so it's always the first thing we try. A server-set CDN overrides
// the base without an app rebuild (see contentService).
let ASSET_SOURCE: AssetSource = { kind: 'genai' }
export function setAssetSource(src: AssetSource) { ASSET_SOURCE = src }

const GENAI_BASE = 'https://image.pollinations.ai/prompt/'
const SPRITE_PX = 384   // square sprite resolution requested from the generator

// --- Resolution --------------------------------------------------------------

/** Bundled/CDN pre-baked sprite URL for a key. */
function bakedUrl(key: string): string {
  const base = ASSET_SOURCE.kind === 'cdn' ? ASSET_SOURCE.base.replace(/\/$/, '') : ''
  return `${base}/sprites/${slugFor(key)}.webp`
}

/** Live gen-AI sprite URL for a key. */
function genaiUrl(key: string): string {
  const prompt = encodeURIComponent(promptFor(key))
  return `${GENAI_BASE}${prompt}?width=${SPRITE_PX}&height=${SPRITE_PX}` +
    `&seed=${seedFor(key)}&nologo=true&model=flux`
}

const candCache = new Map<string, string[]>()

/** Ordered list of sprite URLs to try for a key, best first:
 *    1. the pre-baked WebP (bundled locally, or on the configured CDN)
 *    2. live gen-AI as a self-healing fallback for not-yet-baked subjects
 *       (e.g. Endless-Engine worlds invented on-device).
 *  The renderer walks this list, then an illustrated placeholder — never an
 *  emoji. Memoised so the browser serves one cached image per subject. */
// Live gen-AI is OFF by default. In a shipped build it means an external HTTP
// request to an image generator PER sprite — slow, blocks nothing visually (the
// distinct Twemoji baseline shows immediately) but churns the network and stalls
// image-heavy activity screens. Games rely on the bundled baked pack + the
// offline Twemoji baseline. Ops can opt back in for on-device invented worlds.
let allowLiveGen = false
export function setAllowLiveGen(on: boolean) { allowLiveGen = on; candCache.clear() }

export function spriteCandidates(key: string): string[] {
  const hit = candCache.get(key)
  if (hit) return hit
  const list = allowLiveGen ? [bakedUrl(key), genaiUrl(key)] : [bakedUrl(key)]
  candCache.set(key, list)
  return list
}

/** The primary (best) sprite URL — the bundled/CDN asset. Used for prefetch. */
export function spriteUrl(key: string): string {
  return spriteCandidates(key)[0]
}

// --- Persistent "verified" cache --------------------------------------------
// We remember which sprites have successfully loaded at least once so the
// renderer can show the illustration immediately on repeat visits (and know it
// is safe offline) instead of waiting to re-probe. Bounded + resilient to a
// disabled/full localStorage.

const LS_KEY = 'bbk.assets.verified.v1'
const verified = new Set<string>()

function loadVerified() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) for (const k of JSON.parse(raw) as string[]) verified.add(k)
  } catch { /* private mode / disabled storage — degrade silently */ }
}
loadVerified()

let saveTimer: ReturnType<typeof setTimeout> | null = null
function persistVerified() {
  if (saveTimer) return
  saveTimer = setTimeout(() => {
    saveTimer = null
    try {
      // Keep the newest ~600 entries so storage never grows unbounded.
      const arr = [...verified].slice(-600)
      localStorage.setItem(LS_KEY, JSON.stringify(arr))
    } catch { /* ignore */ }
  }, 400)
}

export function isVerified(key: string): boolean { return verified.has(key) }
export function markVerified(key: string) {
  if (!verified.has(key)) { verified.add(key); persistVerified() }
}

// --- Prefetch ----------------------------------------------------------------
// Warm the browser/CDN cache for a set of keys in the background (idle-time,
// throttled) so gameplay never blocks on a first paint. Used to prefetch the
// current world plus the next world the child is heading toward.

const prefetched = new Set<string>()

function warm(key: string) {
  if (prefetched.has(key)) return
  prefetched.add(key)
  const img = new Image()
  img.decoding = 'async'
  img.onload = () => markVerified(key)
  img.src = spriteUrl(key)
}

/** Prefetch an explicit list of content keys, spread across idle frames so we
 *  never hog the main thread or hammer the network. */
export function prefetchKeys(keys: string[]) {
  const todo = keys.filter(k => !prefetched.has(k))
  if (!todo.length) return
  const schedule = (fn: () => void) =>
    (typeof requestIdleCallback === 'function' ? requestIdleCallback(fn) : setTimeout(fn, 200))
  let i = 0
  const pump = () => {
    const end = Math.min(i + 4, todo.length)   // 4 sprites per idle slice
    for (; i < end; i++) warm(todo[i])
    if (i < todo.length) schedule(pump)
  }
  schedule(pump)
}

/** Prefetch the asset pack for a world (its themed content pool). */
export function prefetchWorld(levelId: number) {
  prefetchKeys(themeEmojis(levelId))
}

/** Prefetch the world a level is in, plus the *next* world, so travelling
 *  onward is instant. Call when a level screen opens. */
export function prefetchAround(levelId: number) {
  prefetchWorld(levelId)
  const w = worldForLevel(levelId)
  const next = WORLDS.find(x => x.index === w.index + 1)
  if (next) prefetchKeys(next.emojis)
}
