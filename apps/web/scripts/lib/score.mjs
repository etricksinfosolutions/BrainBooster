// ---------------------------------------------------------------------------
// Brain Booster Kids — objective sprite quality scorer
//
// Scores a processed (transparent, cropped) sprite 0..100 on the MEASURABLE
// dimensions of the style guide (docs/SPRITE_STYLE_GUIDE.md §6): a clean cut-out,
// a bold well-framed silhouette, punchy contrast, joyful colour, crisp (not
// blurry) rendering, and bold-not-noisy detail. These are exactly the properties
// that made the old pack look like cheap AI stickers — so raising this score
// raises perceived quality in the way that matters.
//
// HONEST SCOPE: heuristics cannot judge anatomy or "is this obviously a shark".
// That subjective ~5% is left to a vision model via the visionScore() seam
// (env VISION_ENDPOINT). Without it, scoreSprite() returns heuristic-only and
// flags `needsHumanEye: true` so nothing subjective is silently passed.
// ---------------------------------------------------------------------------
import sharp from 'sharp'

const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x))
// Map a value to 0..1 with a soft ramp: 0 below `lo`, 1 above `hi`, linear between.
const ramp = (v, lo, hi) => clamp((v - lo) / (hi - lo))
// Reward a value for being INSIDE [lo,hi], falling off outside it.
const band = (v, lo, hi, soft = (hi - lo) * 0.5) =>
  v < lo ? clamp(1 - (lo - v) / soft) : v > hi ? clamp(1 - (v - hi) / soft) : 1

/**
 * @returns {
 *   score: 0..100 weighted composite,
 *   dims: { <name>: 0..100 } per-dimension,
 *   flags: string[] human-readable problems,
 *   needsHumanEye: boolean  (true when no vision model verified recognizability)
 * }
 */
export async function scoreSprite(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const w = info.width, h = info.height, c = info.channels, N = w * h

  // --- Alpha / silhouette geometry ---
  let opaque = 0, edgeAlpha = 0
  let minX = w, minY = h, maxX = 0, maxY = 0
  let cx = 0, cy = 0
  let perimeter = 0            // subject pixels touching a transparent pixel
  // Border transparency: a clean cut-out has an almost-empty 1px frame.
  let borderPx = 0, borderTransp = 0
  for (let i = 0; i < N; i++) {
    const x = i % w, y = (i / w) | 0
    const a = data[i * c + 3]
    const onBorder = x === 0 || y === 0 || x === w - 1 || y === h - 1
    if (onBorder) { borderPx++; if (a < 24) borderTransp++ }
    if (a < 24) continue
    opaque++; cx += x; cy += y
    if (x < minX) minX = x; if (x > maxX) maxX = x
    if (y < minY) minY = y; if (y > maxY) maxY = y
    // perimeter: opaque pixel with a transparent 4-neighbour
    const t = (j) => data[j * c + 3] < 24
    if ((x > 0 && t(i - 1)) || (x < w - 1 && t(i + 1)) || (y > 0 && t(i - w)) || (y < h - 1 && t(i + w))) perimeter++
    if (a > 24 && a < 232) edgeAlpha++
  }
  if (opaque === 0) return { score: 0, dims: {}, flags: ['empty sprite (no subject)'], needsHumanEye: false }
  cx /= opaque; cy /= opaque
  const bboxW = (maxX - minX + 1) / w, bboxH = (maxY - minY + 1) / h
  const coverage = Math.max(bboxW, bboxH)         // how much of the frame the subject spans
  const fillArea = opaque / N

  // --- Colour / contrast / sharpness over OPAQUE pixels only ---
  let sum = 0, sum2 = 0, sat = 0, grad = 0, gradN = 0, hiDetail = 0
  const lumAt = (j) => 0.299 * data[j * c] + 0.587 * data[j * c + 1] + 0.114 * data[j * c + 2]
  for (let i = 0; i < N; i++) {
    if (data[i * c + 3] < 24) continue
    const r = data[i * c], g = data[i * c + 1], b = data[i * c + 2]
    const l = 0.299 * r + 0.587 * g + 0.114 * b
    sum += l; sum2 += l * l
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
    sat += mx === 0 ? 0 : (mx - mn) / mx
    // horizontal gradient vs right neighbour (both opaque) → sharpness/detail
    const x = i % w
    if (x < w - 1 && data[(i + 1) * c + 3] >= 24) {
      const d = Math.abs(l - lumAt(i + 1)); grad += d; gradN++
      if (d > 40) hiDetail++
    }
  }
  const mean = sum / opaque
  const contrast = Math.sqrt(Math.max(0, sum2 / opaque - mean * mean)) // luma stddev 0..~128
  const saturation = sat / opaque                                      // 0..1
  const sharpness = gradN ? grad / gradN : 0                           // mean |Δluma|
  const detailRatio = gradN ? hiDetail / gradN : 0                     // fraction of strong edges
  // Silhouette compactness: perimeter² / area. A round bold shape ≈ low; a
  // spindly/noisy AI blob ≈ high. Circle ≈ 4π·... normalized so ~1 = very bold.
  const compactness = (4 * Math.PI * opaque) / (perimeter * perimeter || 1)

  // --- Dimension scores (0..1) ---
  const dims01 = {
    bgPurity:    borderPx ? borderTransp / borderPx : 0,          // clean frame
    coverage:    band(coverage, 0.55, 0.92),                      // fills frame, not clipped/tiny
    boldness:    ramp(compactness, 0.10, 0.55),                   // round bold silhouette
    centering:   1 - clamp(Math.hypot(cx - w / 2, cy - h / 2) / (w * 0.5)),
    contrast:    band(contrast, 34, 80, 34),                      // punchy, not flat/blown
    colourful:   band(saturation, 0.32, 0.85, 0.32),              // joyful, not muddy/neon
    sharpness:   ramp(sharpness, 6, 22),                          // crisp, not blurry
    detail:      band(detailRatio, 0.05, 0.22, 0.12),             // bold, not noisy AI detail
    clean:       1 - clamp(edgeAlpha / opaque / 0.12),            // few half-alpha halo pixels
  }
  const WEIGHTS = {
    bgPurity: 0.16, coverage: 0.14, boldness: 0.14, centering: 0.08,
    contrast: 0.12, colourful: 0.12, sharpness: 0.12, detail: 0.08, clean: 0.04,
  }
  let score01 = 0
  for (const k in WEIGHTS) score01 += WEIGHTS[k] * dims01[k]
  const score = Math.round(score01 * 100)

  const dims = {}
  for (const k in dims01) dims[k] = Math.round(dims01[k] * 100)

  const flags = []
  if (dims.bgPurity < 80) flags.push(`background remnant / halo on frame edge (${dims.bgPurity})`)
  if (coverage < 0.5) flags.push(`subject too small / over-cropped (${(coverage * 100) | 0}% of frame)`)
  if (coverage >= 0.985 && borderTransp / borderPx < 0.6) flags.push('subject clipped at frame edge')
  if (dims.boldness < 55) flags.push('weak / noisy silhouette (not a bold rounded toy)')
  if (dims.contrast < 55) flags.push('flat, low-contrast rendering')
  if (dims.colourful < 55) flags.push('muddy / desaturated palette')
  if (dims.sharpness < 55) flags.push('blurry / soft focus')
  if (dims.detail < 55) flags.push('over-detailed AI noise (not bold & simple)')

  const vision = await visionScore(input).catch(() => null)
  if (vision) {
    dims.recognizable = vision.recognizable
    if (vision.flags) flags.push(...vision.flags)
  }

  return {
    score, dims, flags,
    needsHumanEye: !vision,
    geom: { coverage: +coverage.toFixed(3), fillArea: +fillArea.toFixed(3), compactness: +compactness.toFixed(3) },
  }
}

/**
 * Optional vision-model judge for the subjective ~5% heuristics can't see
 * (recognizability, anatomy, "does this read as the intended subject").
 * Plug a Claude/GPT-vision endpoint via env VISION_ENDPOINT; it should accept a
 * PNG/WebP and return { recognizable: 0..100, flags?: string[] }. Absent → null,
 * and scoreSprite() marks the asset needsHumanEye so nothing is silently passed.
 */
export async function visionScore(_input) {
  if (!process.env.VISION_ENDPOINT) return null
  // Intentionally minimal seam — wired by whoever provisions the vision key.
  // (Left unimplemented rather than faked: an honest gate beats a fake 95%.)
  return null
}

/** The accept bar from the style guide (§6). */
export const ACCEPT_SCORE = Number(process.env.ACCEPT_SCORE || 88)
