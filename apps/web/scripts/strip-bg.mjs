// ---------------------------------------------------------------------------
// Brain Booster Kids — batch background stripper
//
// Runs the background-removal pipeline over every already-baked sprite in
// public/sprites, in place, turning white-canvas assets into true transparent
// game sprites. Offline — no image regeneration, so it is not rate-limited.
// Idempotent + resumable: sprites already stripped are skipped, so it is safe
// to re-run (e.g. after Windows Defender transiently locks a file).
//
//   usage:  node scripts/strip-bg.mjs
// ---------------------------------------------------------------------------
import { readdirSync, writeFileSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { removeBackground } from './lib/bgremove.mjs'

// Avoid libvips holding file handles / caches — the cause of transient
// "UNKNOWN open" errors when many files are touched in a row on Windows.
sharp.cache(false)
sharp.concurrency(1)

const SPRITES = resolve(dirname(fileURLToPath(import.meta.url)), '../public/sprites')
const files = readdirSync(SPRITES).filter(f => f.endsWith('.webp'))
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

/** Read a file to a Buffer, retrying through transient AV file locks. */
function readRetry(file, tries = 6) {
  for (let i = 0; ; i++) {
    try { return readFileSync(file) } catch (e) { if (i >= tries) throw e }
    // busy-wait a beat (sync context)
    const t = Date.now() + 180; while (Date.now() < t) { /* spin */ }
  }
}
function writeRetry(file, buf, tries = 6) {
  for (let i = 0; ; i++) {
    try { return writeFileSync(file, buf) } catch (e) { if (i >= tries) throw e }
    const t = Date.now() + 180; while (Date.now() < t) { /* spin */ }
  }
}

// Already clean = little OPAQUE near-background colour remains (no white box).
async function alreadyClean(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const c = info.channels, total = info.width * info.height
  const bgc = [data[0], data[1], data[2]]
  let boxy = 0
  for (let i = 0; i < total; i++) {
    const p = i * c
    if (data[p + 3] < 200) continue
    if (Math.max(Math.abs(data[p] - bgc[0]), Math.abs(data[p + 1] - bgc[1]), Math.abs(data[p + 2] - bgc[2])) < 26) boxy++
  }
  return boxy / total < 0.04
}

let done = 0, skip = 0
const flagged = []
for (const f of files) {
  const file = resolve(SPRITES, f)
  try {
    const buf = readRetry(file)
    if (await alreadyClean(buf)) { skip++; continue }
    const { webp, stats } = await removeBackground(buf)
    if (stats.opaqueRatio > 0.85) flagged.push(`${f} (bg barely removed, opaque ${stats.opaqueRatio.toFixed(2)})`)
    if (stats.opaqueRatio < 0.06) flagged.push(`${f} (subject nearly gone, opaque ${stats.opaqueRatio.toFixed(2)})`)
    writeRetry(file, webp)
    done++
    if (done % 25 === 0) { console.log(`  …${done} processed`); await sleep(50) }
  } catch (e) {
    flagged.push(`${f} (error: ${e.message})`)
  }
}
console.log(`--- strip-bg done: ${done} processed, ${skip} already clean, ${flagged.length} flagged ---`)
if (flagged.length) { console.log('flagged:'); for (const x of flagged) console.log('  ⚠ ' + x) }
