// ---------------------------------------------------------------------------
// Brain Booster Kids — Art Review Agent
//
// Autonomous QA for the sprite pack. Walks EVERY registered asset, scores it
// against the style bible (scripts/lib/score.mjs), and detects the concrete
// defects that make a pack look cheap: background remnants, clipped/cropped
// subjects, blurry or over-detailed renders, weak silhouettes, off-centre
// framing, low contrast/colour, duplicates, and STYLE INCONSISTENCY (an asset
// whose brightness/saturation/coverage is a statistical outlier vs the pack —
// i.e. "looks generated from a different prompt").
//
// Output:
//   • console summary ranked worst-first
//   • docs/art-review-report.md      (human report)
//   • docs/art-review-issues.json    (machine list — one entry per defect, ready
//                                      to file as GitHub issues by CI)
//
//   usage:  node scripts/art-review.mjs            # report, exit 0
//           node scripts/art-review.mjs --strict   # exit 1 if any CRITICAL issue
//
// HONEST SCOPE: everything here is measurable image analysis. "Is the anatomy
// right / is it obviously a shark" needs a vision model (score.mjs visionScore
// seam); those assets are reported as needs-human-eye, not silently passed.
// ---------------------------------------------------------------------------
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { scoreSprite, ACCEPT_SCORE } from './lib/score.mjs'

const __dir = dirname(fileURLToPath(import.meta.url))
const SPRITES = resolve(__dir, '../public/sprites')
const DOCS = resolve(__dir, '../../../docs')
const strict = process.argv.includes('--strict')

const bundle = await build({
  entryPoints: [resolve(__dir, '../src/assets/registry.ts')],
  bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
})
const mod = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'))
const manifest = mod.assetManifest()

const issues = []      // { slug, key, subject, severity, dim, message }
const scored = []      // per-asset stats for pack-level outlier analysis
const byHash = new Map()

const add = (a, severity, message, dim = '') => issues.push({ slug: a.slug, key: a.key, subject: a.subject, severity, dim, message })

for (const a of manifest) {
  const file = resolve(SPRITES, `${a.slug}.webp`)
  if (!existsSync(file)) { add(a, 'critical', 'missing sprite file'); continue }
  const bytes = readFileSync(file)
  if (bytes.length < 1500) { add(a, 'critical', `truncated file (${bytes.length}b)`); continue }
  const hash = createHash('sha1').update(bytes).digest('hex')
  if (byHash.has(hash)) add(a, 'critical', `identical image to "${byHash.get(hash)}" (duplicate asset)`, 'duplicate')
  else byHash.set(hash, a.slug)

  try {
    const s = await scoreSprite(bytes)
    scored.push({ a, s })
    const sev = s.score < 70 ? 'critical' : s.score < ACCEPT_SCORE ? 'major' : 'minor'
    for (const f of s.flags) add(a, s.score < 70 ? 'critical' : 'major', f)
    if (s.flags.length === 0 && s.score < ACCEPT_SCORE) add(a, 'minor', `below accept bar (score ${s.score} < ${ACCEPT_SCORE})`, 'score')
    if (s.needsHumanEye) add(a, 'review', 'recognizability/anatomy not machine-verifiable — needs human or vision-model sign-off', 'vision')
    void sev
  } catch (e) {
    add(a, 'critical', `unreadable: ${e.message}`)
  }
}

// --- Pack-level STYLE CONSISTENCY: flag statistical outliers (guide §1). An
// asset shot under a different "light" reads as brightness/saturation/coverage
// far from the pack median → looks like it came from a different app. ---
function medianStats(key) {
  const xs = scored.map((r) => r.s.dims[key]).filter((x) => x != null).sort((p, q) => p - q)
  return xs.length ? xs[xs.length >> 1] : 0
}
const med = { contrast: medianStats('contrast'), colourful: medianStats('colourful'), coverage: medianStats('coverage') }
for (const { a, s } of scored) {
  const off = []
  if (Math.abs(s.dims.contrast - med.contrast) > 45) off.push('contrast')
  if (Math.abs(s.dims.colourful - med.colourful) > 45) off.push('palette')
  if (Math.abs(s.dims.coverage - med.coverage) > 45) off.push('framing')
  if (off.length >= 2) add(a, 'major', `style outlier vs pack (${off.join(', ')}) — looks like a different prompt`, 'consistency')
}

// --- Rank & write outputs ---
const rank = { critical: 0, major: 1, review: 2, minor: 3 }
issues.sort((x, y) => rank[x.severity] - rank[y.severity])
const counts = issues.reduce((m, i) => ((m[i.severity] = (m[i.severity] || 0) + 1), m), {})
const avg = scored.length ? Math.round(scored.reduce((s, r) => s + r.s.score, 0) / scored.length) : 0

console.log('--- Art Review Agent ---')
console.log(`Assets reviewed : ${manifest.length}`)
console.log(`Average score   : ${avg}/100   (accept bar ${ACCEPT_SCORE})`)
console.log(`Issues          : ${issues.length}  (critical ${counts.critical || 0}, major ${counts.major || 0}, review ${counts.review || 0}, minor ${counts.minor || 0})`)
const worst = [...scored].sort((p, q) => p.s.score - q.s.score).slice(0, 15)
console.log('\nLowest-scoring assets:')
for (const { a, s } of worst) console.log(`  ${String(s.score).padStart(3)}  ${a.slug}  ${s.flags[0] ? '— ' + s.flags[0] : ''}`)

// Markdown report
let md = `# Art Review Report\n\n`
md += `> Generated by \`scripts/art-review.mjs\` against the [Sprite Style Guide](SPRITE_STYLE_GUIDE.md).\n\n`
md += `- **Assets reviewed:** ${manifest.length}\n- **Average score:** ${avg}/100 (accept ≥ ${ACCEPT_SCORE})\n`
md += `- **Issues:** ${issues.length} — 🔴 ${counts.critical || 0} critical · 🟠 ${counts.major || 0} major · 🔵 ${counts.review || 0} needs-eye · ⚪ ${counts.minor || 0} minor\n\n`
md += `## Lowest-scoring assets\n\n| Score | Asset | Top issue |\n|--:|---|---|\n`
for (const { a, s } of worst) md += `| ${s.score} | \`${a.slug}\` | ${s.flags[0] || '—'} |\n`
md += `\n## All issues\n\n| Severity | Asset | Dimension | Problem |\n|---|---|---|---|\n`
const emoji = { critical: '🔴', major: '🟠', review: '🔵', minor: '⚪' }
for (const i of issues) md += `| ${emoji[i.severity]} ${i.severity} | \`${i.slug}\` | ${i.dim || '—'} | ${i.message} |\n`
if (existsSync(DOCS)) {
  writeFileSync(resolve(DOCS, 'art-review-report.md'), md)
  writeFileSync(resolve(DOCS, 'art-review-issues.json'), JSON.stringify(issues, null, 2))
  console.log(`\nWrote docs/art-review-report.md and docs/art-review-issues.json`)
}

if (strict && (counts.critical || 0) > 0) {
  console.error(`\nFAIL (--strict): ${counts.critical} critical art issue(s).`)
  process.exit(1)
}
console.log('\nOK.')
