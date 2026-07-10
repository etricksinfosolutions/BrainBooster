// ---------------------------------------------------------------------------
// Brain Booster Kids — variant-and-score sprite baker
//
// The quality upgrade over gen-sprites.mjs: instead of trusting ONE shot per
// subject, generate several variants (different seeds), run each through the full
// transparent-cutout pipeline, score them objectively (scripts/lib/score.mjs),
// and keep ONLY the best — provided it clears the accept bar. This is how a
// studio ships: shoot many, pick the hero. Rejected variants never reach a child.
//
//   usage:
//     node scripts/gen-variants.mjs                  # whole registry
//     node scripts/gen-variants.mjs 🐟 🦈 🐠 🐡 🐢 🐙 # only these subjects (proof batch)
//     VARIANTS=8 ACCEPT_SCORE=88 node scripts/gen-variants.mjs
//     FORCE=1 ...                                    # re-bake even if a good sprite exists
//
// Idempotent: a subject whose existing sprite already scores >= accept is skipped
// unless FORCE=1. Paced for Pollinations' free tier (rate-limits bursts).
// ---------------------------------------------------------------------------
import { mkdirSync, existsSync, writeFileSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { removeBackground } from './lib/bgremove.mjs'
import { scoreSprite, ACCEPT_SCORE } from './lib/score.mjs'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dir, '../public')
const SPRITES = resolve(OUT, 'sprites')
mkdirSync(SPRITES, { recursive: true })

const VARIANTS = Number(process.env.VARIANTS || 6)
const SPACING = Number(process.env.SPACING_MS || 4000)
const FORCE = process.env.FORCE === '1'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Load the real manifest from the registry (single source of truth).
const bundle = await build({
  entryPoints: [resolve(__dir, '../src/assets/registry.ts')],
  bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
})
const mod = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'))
let manifest = mod.assetManifest()
writeFileSync(resolve(OUT, 'sprite-manifest.json'), JSON.stringify(manifest, null, 2))

// Optional subject filter (by emoji key) for a fast proof batch.
const wanted = process.argv.slice(2)
if (wanted.length) manifest = manifest.filter((m) => wanted.includes(m.key))
console.log(`variant bake: ${manifest.length} subjects × up to ${VARIANTS} variants  (accept ≥ ${ACCEPT_SCORE})`)

async function fetchVariant(prompt, seed) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=512&height=512&seed=${seed}&nologo=true&model=flux`
  for (let i = 1; i <= 4; i++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 3000) throw new Error('too small')
      return buf
    } catch (e) {
      const wait = 12000 + i * 8000
      console.log(`   retry seed ${seed} (${i}): ${e.message} — wait ${wait / 1000}s`)
      await sleep(wait)
    }
  }
  return null
}

const results = []
for (const { key, slug, seed, prompt } of manifest) {
  const out = resolve(SPRITES, `${slug}.webp`)
  // Skip if the current sprite already clears the bar (unless FORCE).
  if (!FORCE && existsSync(out) && statSync(out).size > 3000) {
    try {
      const s = await scoreSprite(readFileSync(out))
      if (s.score >= ACCEPT_SCORE) { console.log(`skip  ${slug}  (already ${s.score})`); results.push({ slug, score: s.score, kept: 'existing' }); continue }
    } catch { /* fall through and re-bake */ }
  }

  let best = null
  for (let v = 0; v < VARIANTS; v++) {
    const vseed = (seed + v * 7919) % 1000000            // deterministic spread of seeds
    const raw = await fetchVariant(prompt, vseed)
    if (!raw) continue
    try {
      const { webp } = await removeBackground(raw)
      const s = await scoreSprite(webp)
      console.log(`   ${slug}  variant ${v + 1}/${VARIANTS}  seed ${vseed}  → ${s.score}${s.flags.length ? '  (' + s.flags[0] + ')' : ''}`)
      if (!best || s.score > best.score) best = { webp, score: s.score, seed: vseed, flags: s.flags }
      if (best.score >= 97) break                         // clearly excellent — stop early
    } catch (e) {
      console.log(`   ${slug}  variant ${v + 1} processing failed: ${e.message}`)
    }
    await sleep(SPACING)
  }

  if (best && best.score >= ACCEPT_SCORE) {
    writeFileSync(out, best.webp)
    console.log(`ok    ${slug}  → kept best ${best.score}`)
    results.push({ slug, score: best.score, kept: 'new' })
  } else if (best) {
    // Nothing cleared the bar — keep the best we have but flag for human review
    // rather than shipping a bad asset silently.
    writeFileSync(out, best.webp)
    console.log(`WARN  ${slug}  → best only ${best.score} (< ${ACCEPT_SCORE}); FLAGGED for hand-review: ${best.flags.join('; ')}`)
    results.push({ slug, score: best.score, kept: 'below-bar', flags: best.flags })
  } else {
    console.log(`FAIL  ${slug}  → no variant generated (network / rate limit)`)
    results.push({ slug, score: 0, kept: 'none' })
  }
}

const kept = results.filter((r) => r.kept === 'new').length
const flagged = results.filter((r) => r.kept === 'below-bar')
console.log(`\n--- variant bake done: ${kept} newly kept, ${results.filter(r => r.kept === 'existing').length} already good, ${flagged.length} below bar, ${results.filter(r => r.kept === 'none').length} failed ---`)
if (flagged.length) console.log('below-bar (hand-review):', flagged.map((f) => `${f.slug}(${f.score})`).join(', '))
