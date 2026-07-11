// Asset Engine guarantees: every gameplay token maps to a first-class
// illustrated subject (the game can never fall back to a bare emoji as its
// primary art), and sprites are deterministic so Memory Match pairs are
// visually identical and the CDN caches one image per subject.
import { describe, it, expect } from 'vitest'
import { WORLDS, MASCOTS } from '../data/worlds'
import { MEMORY_EMOJI, FRUITS, NOT_FRUITS } from '../data/content'
import { isKnownSubject, promptFor, seedFor, subjectFor, categoryFor, slugFor, assetManifest, ART_STYLE } from '../assets/registry'
import { spriteUrl, spriteCandidates, setAllowLiveGen } from '../assets/engine'

describe('Asset Engine registry', () => {
  it('has a first-class illustrated subject for every world content token', () => {
    const unmapped: string[] = []
    for (const w of WORLDS) for (const e of w.emojis) if (!isKnownSubject(e)) unmapped.push(`${w.id}:${e}`)
    expect(unmapped).toEqual([])
  })

  it('covers mascots and the shared reward/quick-tap pools', () => {
    const pools = [MASCOTS.map(m => m.emoji), MEMORY_EMOJI, FRUITS, NOT_FRUITS].flat()
    for (const e of pools) expect(isKnownSubject(e), `unmapped: ${e}`).toBe(true)
  })

  it('bakes the single art direction into every prompt', () => {
    expect(promptFor('🐙')).toContain('octopus')
    expect(promptFor('🐙')).toContain(ART_STYLE)
  })

  it('is deterministic — same token always yields the same seed, url and subject', () => {
    expect(seedFor('🐙')).toBe(seedFor('🐙'))
    expect(spriteUrl('🐙')).toBe(spriteUrl('🐙'))
    expect(subjectFor('🐙')).toBe(subjectFor('🐙'))
    // Distinct subjects get distinct art.
    expect(spriteUrl('🐙')).not.toBe(spriteUrl('🦀'))
  })

  it('resolves the bundled baked sprite only by default — no live external gen-AI', () => {
    // Live gen-AI is OFF by default so a shipped build never fires an external
    // image-generation request per sprite (the offline Twemoji baseline covers the
    // rest). The bundled baked pack is the sole network candidate.
    const c = spriteCandidates('🐙')
    expect(c[0]).toBe(`/sprites/${slugFor('🐙')}.webp`)   // bundled pack
    expect(c.length).toBe(1)
    expect(c.some((u) => u.includes('image.pollinations.ai'))).toBe(false)
  })

  it('opts into gen-AI self-heal only when explicitly enabled', () => {
    setAllowLiveGen(true)
    try {
      const c = spriteCandidates('🐙')
      expect(c[0]).toBe(`/sprites/${slugFor('🐙')}.webp`)
      expect(c[c.length - 1]).toContain('image.pollinations.ai')
      expect(c.length).toBeGreaterThanOrEqual(2)
    } finally {
      setAllowLiveGen(false)
    }
  })

  it('gives every subject a UNIQUE slug — no two tokens share one illustration', () => {
    const bySlug = new Map<string, string[]>()
    for (const e of assetManifest()) {
      const arr = bySlug.get(e.slug) ?? []
      arr.push(e.key); bySlug.set(e.slug, arr)
    }
    const collisions = [...bySlug.entries()].filter(([, keys]) => keys.length > 1)
    expect(collisions, `slug collisions: ${JSON.stringify(collisions)}`).toEqual([])
  })

  it('classifies every content token into a placeholder category', () => {
    const cats = new Set(['animal', 'food', 'plant', 'vehicle', 'space', 'character', 'object'])
    for (const w of WORLDS) for (const e of w.emojis) expect(cats.has(categoryFor(e))).toBe(true)
    expect(categoryFor('🐙')).toBe('animal')
    expect(categoryFor('🍎')).toBe('food')
    expect(categoryFor('🚀')).toBe('vehicle')
  })
})
