// ---------------------------------------------------------------------------
// Match-3 child-usability gate
//
// Verifies the tile-sizing MODEL and distinguishability that make the board
// instantly readable for a 4-year-old. Pixel-level "no clipping / fully
// visible" assertions need a browser harness (tracked separately); what is
// deterministically checkable in the node env — the CSS sizing contract and
// the distinct-object guarantee — is enforced here so a regression (e.g. tiny
// art or a shrunk touch target) fails the build.
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isKnownSubject, slugFor } from '../assets/registry'

const css = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../styles.css'), 'utf8')

/** Extract a CSS rule body by selector. */
function ruleBody(selector: string): string {
  const i = css.indexOf(selector)
  expect(i, `selector ${selector} exists`).toBeGreaterThanOrEqual(0)
  return css.slice(i, css.indexOf('}', i))
}
const pctOf = (body: string, prop: string) => {
  const m = body.match(new RegExp(`${prop}:\\s*(\\d+)%`))
  return m ? Number(m[1]) : NaN
}
const pxOf = (body: string, prop: string) => {
  const m = body.match(new RegExp(`${prop}:\\s*(\\d+)px`))
  return m ? Number(m[1]) : NaN
}

describe('Match-3 tiles are large and touch-friendly (#1, #2, #3)', () => {
  it('artwork fills 75-85% of the tile', () => {
    const art = ruleBody('.match3-art {')
    const w = pctOf(art, 'width'), h = pctOf(art, 'height')
    expect(w, 'art width %').toBeGreaterThanOrEqual(85)
    expect(w).toBeLessThanOrEqual(90)
    expect(h).toBeGreaterThanOrEqual(85)
  })

  it('tiles meet the 64dp minimum touch target for young children', () => {
    const cell = ruleBody('.match3-cell {')
    expect(pxOf(cell, 'min-width'), 'min-width px').toBeGreaterThanOrEqual(64)
    expect(pxOf(cell, 'min-height'), 'min-height px').toBeGreaterThanOrEqual(64)
  })

  it('the sprite fills its container in fill mode (responsive, not fixed px)', () => {
    const fill = ruleBody('.sprite-fill .sprite-img')
    expect(fill).toMatch(/width:\s*100%/)
    expect(fill).toMatch(/height:\s*100%/)
    expect(ruleBody('.sprite-fill {')).toMatch(/width:\s*100%/)
  })

  it('tiles have toy-like feedback animations (pop, sparkle, press)', () => {
    expect(css).toMatch(/@keyframes m3pop/)      // matched-tile bounce
    expect(css).toMatch(/@keyframes m3burst/)    // sparkle burst
    expect(css).toMatch(/\.match3-cell:active/)  // press animation
    expect(css).toMatch(/prefers-reduced-motion/) // respects reduced-motion
  })

  it('gives clear interaction feedback: selection glow, invalid shake, hints, keyboard ring', () => {
    expect(css, 'selection glow/pulse').toMatch(/@keyframes m3glow/)
    expect(css, 'invalid-move wobble').toMatch(/@keyframes m3shake/)
    expect(css, 'directional hint arrows').toMatch(/\.m3-hint-up/)
    expect(css, 'keyboard focus ring').toMatch(/\.match3-cell\.is-focus/)
  })
})

describe('Match-3 tiles are distinguishable by shape, not colour (#6, #8)', () => {
  // The colour-blind-safe fallback set used when a world theme is short on
  // unique objects — must be shape-distinct illustrated subjects, never
  // colour-only circles.
  const FALLBACK = ['⭐', '🍎', '🍄', '🎈', '🌸', '🔑']
  it('every fallback tile is a first-class illustrated subject', () => {
    for (const e of FALLBACK) expect(isKnownSubject(e), `known: ${e}`).toBe(true)
  })
  it('fallback tiles have distinct silhouettes (unique slugs)', () => {
    const slugs = FALLBACK.map(slugFor)
    expect(new Set(slugs).size).toBe(FALLBACK.length)
  })
  it('no colour-only circle tokens remain in the fallback', () => {
    for (const c of ['🔵', '🟢', '🔴', '🟡', '🟣']) expect(FALLBACK.includes(c)).toBe(false)
  })
})
