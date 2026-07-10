// ---------------------------------------------------------------------------
// Brain Booster Kids — sprite background removal
//
// flux paints every subject on a flat near-white canvas. This turns that canvas
// into a true transparent alpha channel so a sprite renders as JUST the
// character — no white square, no baked shadow — then tight-crops and centres it.
//
//   raw RGBA ─► border flood-fill (near-white, edge-connected) ─► erode halo
//            ─► feather edge ─► apply alpha ─► trim margins ─► centre ─► WebP
//
// Border-seeded flood fill is the key: it only removes near-white pixels that
// are CONNECTED to the image edge, so interior whites (eyes, a panda's face, a
// swan's body) are preserved — a naive global white-key would punch holes in
// the subject.
// ---------------------------------------------------------------------------
import sharp from 'sharp'

/**
 * @param input  Buffer/path of a source image (any format).
 * @param opts.tol      near-white tolerance (0-255); a pixel is background-like
 *                      when every channel > 255-tol. Default 38.
 * @param opts.size     output square size. Default 384.
 * @param opts.margin   fraction of transparent breathing room around the
 *                      cropped subject (0-0.2). Default 0.04.
 * @returns { webp: Buffer, stats } — stats used by validation.
 */
export async function removeBackground(input, opts = {}) {
  const size = opts.size ?? 384
  const margin = opts.margin ?? 0.04

  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const w = info.width, h = info.height, c = info.channels    // c === 4
  const N = w * h

  // Sample the real background colour from the four corner patches (flux uses
  // white / cream / light-grey — don't assume pure white).
  const cornerSamples = []
  const patch = (x0, y0) => { for (let y = y0; y < y0 + 10; y++) for (let x = x0; x < x0 + 10; x++) { const p = (y * w + x) * c; cornerSamples.push([data[p], data[p + 1], data[p + 2]]) } }
  patch(0, 0); patch(w - 10, 0); patch(0, h - 10); patch(w - 10, h - 10)
  const med = (k) => { const a = cornerSamples.map(s => s[k]).sort((x, y) => x - y); return a[a.length >> 1] }
  const bgc = [med(0), med(1), med(2)]
  const dist = (i) => { const p = i * c; return Math.max(Math.abs(data[p] - bgc[0]), Math.abs(data[p + 1] - bgc[1]), Math.abs(data[p + 2] - bgc[2])) }

  // 1) Border-seeded flood fill over pixels close to the sampled bg colour, so
  //    interior whites (eyes, a panda's face) and light fur are preserved.
  //    Escalate the tolerance until a plausible amount of background is removed
  //    — handles low-contrast cases (a white swan on a grey vignette) without
  //    a high tolerance eating high-contrast subjects.
  let bg = new Uint8Array(N)
  let removed = 0
  for (const tol of (opts.tol != null ? [opts.tol] : [14, 20, 26, 32])) {
    const b = new Uint8Array(N)
    const stack = []
    const seed = (x, y) => { const i = y * w + x; if (!b[i] && dist(i) <= tol) { b[i] = 1; stack.push(i) } }
    for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1) }
    for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y) }
    while (stack.length) {
      const i = stack.pop(), x = i % w, y = (i / w) | 0
      if (x > 0) seed(x - 1, y); if (x < w - 1) seed(x + 1, y)
      if (y > 0) seed(x, y - 1); if (y < h - 1) seed(x, y + 1)
    }
    let cnt = 0; for (let i = 0; i < N; i++) if (b[i]) cnt++
    bg = b; removed = cnt / N
    if (removed >= 0.30) break        // enough background gone — stop escalating
  }

  // 2) Apply as a crisp binary alpha. The trim+resize below anti-aliases the
  //    edge naturally (~3% edge pixels), so no blur is needed — blurring a
  //    binary mask was corrupting interior alpha.
  // 3) Light despill: soften a subject pixel that is BOTH near-white AND touches
  //    the removed background, killing the thin white halo without a global blur.
  const out = Buffer.from(data)
  let subjectPx = 0
  for (let i = 0; i < N; i++) {
    if (bg[i]) { out[i * c + 3] = 0; continue }
    subjectPx++
    if (dist(i) <= 22) {   // subject pixel close to the bg colour = halo candidate
      const x = i % w, y = (i / w) | 0
      const edge = (x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (y > 0 && bg[i - w]) || (y < h - 1 && bg[i + w])
      if (edge) out[i * c + 3] = 90    // fade the bright halo ring
    }
  }

  // 4) Tight-crop transparent margins, centre, add a little breathing room.
  const inner = Math.max(1, Math.round(size * (1 - 2 * margin)))
  const pad = Math.round(size * margin)
  const webp = await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .trim({ threshold: 1 })
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: pad, bottom: size - inner - pad, left: pad, right: size - inner - pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 88, alphaQuality: 100, effort: 4 })
    .toBuffer()

  return { webp, stats: { opaqueRatio: subjectPx / N, removed, bgColor: bgc } }
}
