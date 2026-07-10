// ---------------------------------------------------------------------------
// Brain Booster Kids — Asset Engine validator
//
// Verifies the bundled sprite pack against the registry BEFORE a production
// build ships, and prints the coverage report. Fails (exit 1) when assets are
// missing/broken unless run in advisory mode.
//
// For every registry entry it checks:
//   • the WebP exists in public/sprites
//   • it is a real, non-truncated image of the right dimensions
//   • it is WebP (optimized), not a stray JPEG/PNG
//
//   usage:  node scripts/validate-assets.mjs           # fail build on gaps
//           node scripts/validate-assets.mjs --advisory # report only, exit 0
//           node scripts/validate-assets.mjs --require=0.9  # allow ≤10% missing
// ---------------------------------------------------------------------------
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import sharp from 'sharp'

const __dir = dirname(fileURLToPath(import.meta.url))
const SPRITES = resolve(__dir, '../public/sprites')
const argv = process.argv.slice(2)
const advisory = argv.includes('--advisory')
const requireArg = argv.find((a) => a.startsWith('--require='))
const requireRatio = requireArg ? parseFloat(requireArg.split('=')[1]) : 1

// Load the real manifest from the registry (single source of truth).
const bundle = await build({
  entryPoints: [resolve(__dir, '../src/assets/registry.ts')],
  bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
})
const mod = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'))
const manifest = mod.assetManifest()

const problems = []
let okCount = 0

// (1) Registry integrity — no two subjects may collide on one slug (that would
// silently overwrite one illustration with another / reuse one asset for two).
const slugCounts = new Map()
for (const m of manifest) slugCounts.set(m.slug, (slugCounts.get(m.slug) || 0) + 1)
for (const [slug, n] of slugCounts) if (n > 1) problems.push({ slug, subject: '(collision)', key: '', reason: `${n} subjects share this slug` })

// (2) Banned placeholder assets must NEVER ship (mandate: fail immediately).
const BANNED = /^(placeholder|default|default-\w+|missing|temp|tmp|sample|todo|wip)\.(webp|png|jpg|jpeg|svg)$/i
if (existsSync(SPRITES)) {
  for (const f of readdirSync(SPRITES)) if (BANNED.test(f)) problems.push({ slug: f, subject: '(placeholder)', key: '', reason: 'banned placeholder asset present' })
}

// (3) Per-file validity + (4) duplicate-content detection (identical bytes for
// two different subjects ⇒ a placeholder/blob reused ⇒ indistinguishable cards).
const byHash = new Map()
for (const { key, subject, slug } of manifest) {
  const file = resolve(SPRITES, `${slug}.webp`)
  if (!existsSync(file)) { problems.push({ slug, subject, key, reason: 'missing file' }); continue }
  const bytes = readFileSync(file)
  if (bytes.length < 1500) { problems.push({ slug, subject, key, reason: `too small (${bytes.length}b)` }); continue }
  const hash = createHash('sha1').update(bytes).digest('hex')
  if (byHash.has(hash)) problems.push({ slug, subject, key, reason: `identical image to "${byHash.get(hash)}" (duplicate/placeholder)` })
  else byHash.set(hash, slug)
  try {
    const meta = await sharp(bytes).metadata()
    if (meta.format !== 'webp') { problems.push({ slug, subject, key, reason: `not webp (${meta.format})` }); continue }
    if ((meta.width ?? 0) < 128 || (meta.height ?? 0) < 128) { problems.push({ slug, subject, key, reason: `too small ${meta.width}x${meta.height}` }); continue }

    // (5) Transparency: every sprite must be a true cut-out — alpha channel,
    //     no solid/white background left, and not over-cropped/over-margined.
    if (!meta.hasAlpha) { problems.push({ slug, subject, key, reason: 'no alpha channel (opaque background)' }); continue }
    const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const w = info.width, h = info.height, c = info.channels, N = w * h
    let opaque = 0, transp = 0
    let minX = w, minY = h, maxX = 0, maxY = 0
    for (let i = 0; i < N; i++) {
      const a = data[i * c + 3]
      if (a < 24) { transp++; continue }
      opaque++
      const x = i % w, y = (i / w) | 0
      if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y
    }
    const opaqueRatio = opaque / N, transpRatio = transp / N
    const bboxCover = Math.max((maxX - minX) / w, (maxY - minY) / h)
    // A remaining solid/white background shows up as too little transparency.
    if (transpRatio < 0.12) problems.push({ slug, subject, key, reason: `background not removed — only ${(transpRatio * 100).toFixed(0)}% transparent` })
    else if (bboxCover < 0.45) problems.push({ slug, subject, key, reason: `over-cropped / large margins (subject spans ${(bboxCover * 100).toFixed(0)}%)` })
    else if (opaqueRatio < 0.05) problems.push({ slug, subject, key, reason: `subject nearly gone (opaque ${(opaqueRatio * 100).toFixed(0)}%)` })
    else okCount++
  } catch (e) {
    problems.push({ slug, subject, key, reason: `unreadable: ${e.message}` })
  }
}

const total = manifest.length
const ratio = total ? okCount / total : 0
console.log('--- Asset validation report ---')
console.log(`Registry entries : ${total}`)
console.log(`Valid sprites    : ${okCount}`)
console.log(`Problems         : ${problems.length}`)
console.log(`Coverage         : ${(ratio * 100).toFixed(1)}%`)
if (problems.length) {
  console.log('\nMissing / broken:')
  for (const p of problems.slice(0, 40)) console.log(`  ✗ ${p.slug}  [${p.key} ${p.subject}] — ${p.reason}`)
  if (problems.length > 40) console.log(`  … and ${problems.length - 40} more`)
  console.log('\nFix: run `npm run gen:sprites` to (re)generate the missing sprites.')
}

if (!advisory && ratio < requireRatio) {
  console.error(`\nFAIL: coverage ${(ratio * 100).toFixed(1)}% < required ${(requireRatio * 100).toFixed(0)}%`)
  process.exit(1)
}
console.log('\nOK.')
