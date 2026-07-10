// ---------------------------------------------------------------------------
// Brain Booster Kids — Asset Engine sprite bake job
//
// Generates one illustrated WebP per content subject in the registry and bakes
// them into public/ so the pack ships bundled with the app (instant + fully
// offline on Android — no runtime dependency on the gen-AI service, which
// rate-limits concurrent requests and would otherwise leave a Memory board
// showing placeholders):
//
//     public/
//       sprite-manifest.json      ← catalogue (key, subject, slug, seed, prompt)
//       sprites/<slug>.webp        ← the illustration the game requests
//
// The manifest is derived from the REAL registry via esbuild, so the pack can
// never drift from what the app requests at runtime. Idempotent — existing
// sprites are skipped, so deleting one and re-running regenerates just it.
//
//   usage:  node scripts/gen-sprites.mjs
// ---------------------------------------------------------------------------
import { mkdirSync, existsSync, writeFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { removeBackground } from './lib/bgremove.mjs'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dir, '../public')
const SPRITES = resolve(OUT, 'sprites')
mkdirSync(SPRITES, { recursive: true })

// --- Load the real manifest from registry.ts (single source of truth) --------
const bundle = await build({
  entryPoints: [resolve(__dir, '../src/assets/registry.ts')],
  bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
})
const mod = await import(
  'data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64')
)
const manifest = mod.assetManifest()
writeFileSync(resolve(OUT, 'sprite-manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`manifest: ${manifest.length} sprites`)

// --- Sequential generation with backoff (free tier throttles concurrency) ----
// Pollinations' keyless tier rate-limits bursts aggressively (429/414). Pace
// gently (~4s spacing) with long backoff so a full 275-sprite bake completes
// over ~40-60 min without tripping the limiter. Idempotent: re-run to fill gaps.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const big = (f) => existsSync(f) && statSync(f).size > 3000
const SPACING = Number(process.env.SPACING_MS || 4000)

let ok = 0, skip = 0, fail = 0
const failed = []
for (const { slug, seed, prompt } of manifest) {
  const out = resolve(SPRITES, `${slug}.webp`)
  if (big(out)) { skip++; continue }
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=384&height=384&seed=${seed}&nologo=true&model=flux`
  let done = false
  for (let i = 1; i <= 7 && !done; i++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 3000) throw new Error('too small')
      // Full sprite pipeline: remove the white canvas → transparent alpha,
      // tight-crop, centre, WebP. A true game sprite, no pasted white square.
      const { webp } = await removeBackground(buf)
      writeFileSync(out, webp)
      ok++; done = true
      console.log(`ok   ${slug}  (${ok + skip}/${manifest.length})`)
      await sleep(SPACING)
    } catch (e) {
      // Pollinations free tier throttles bursts with 414/429/5xx — back off hard.
      const wait = 15000 + i * 10000
      console.log(`retry ${slug} (${i}): ${e.message} — wait ${wait / 1000}s`)
      await sleep(wait)
    }
  }
  if (!done) { fail++; failed.push(slug); console.log(`FAIL ${slug}`) }
}
console.log(`--- done: ${ok} generated, ${skip} skipped, ${fail} failed ---`)
if (failed.length) console.log('failed slugs:', failed.join(', '))
