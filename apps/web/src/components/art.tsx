// ---------------------------------------------------------------------------
// Brain Booster Kids — generative-AI artwork
//
// The adventure map's painted world backdrops, signpost emblems and mascot
// portraits are AI-generated (Pollinations / flux) at build time and shipped
// as static assets under /public/art. Fun-fact illustrations are generated
// on the fly from the fact's text (deterministic seed → stable, CDN-cached).
//
// <AiImage> renders any of them safely: it shows a fallback (emoji artwork)
// until the image loads and keeps the fallback permanently if it never does,
// so the app still works offline or if an asset is missing.
// ---------------------------------------------------------------------------
import React, { useEffect, useState } from 'react'
import { EmojiImg } from './emoji'

export const worldArt = (id: string) => `/art/world-${id}.jpg`
export const emblemArt = (id: string) => `/art/emblem-${id}.jpg`
/** Tigo the tiger stays a hand-drawn SVG (see Mascot); everyone else has a portrait. */
export const mascotArt = (key: string): string | null =>
  (key === 'tiger' || key === 'owl' ? null : `/art/mascot-${key}.jpg`)
/** UI icons that replace emoji across the HUD, home, daily and reward screens. */
export const uiIcon = (name: string) => `/art/icon-${name}.jpg`

/** Live gen-AI image URL (Pollinations flux). Deterministic seed → stable, CDN-cached. */
export function pollinationsUrl(prompt: string, width: number, height: number, seed: number): string {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`
}

const GEN_BG_STYLE = 'cute 3d render, kids mobile game art, soft pastel colors, dreamy soft light, adorable, high quality, no text'
const GEN_ICON_STYLE = 'cute 3d game icon, one single object centered, glossy, soft pastel colors, kids game badge, plain background, no text'

/** Seed for an endless world's art, derived from its `gen-N` id. */
const genSeed = (id: string) => 1000 + (parseInt(id.slice(4), 10) || 0)

/** Backdrop for any world: shipped asset for authored worlds, live gen-AI for
 *  worlds created by the Endless Engine (which carry their own art prompt). */
export function worldArtFor(world: { id: string; artPrompt?: string }): string {
  if (world.artPrompt) return pollinationsUrl(`${world.artPrompt}, ${GEN_BG_STYLE}`, 512, 640, genSeed(world.id))
  return worldArt(world.id)
}

/** Signpost emblem for any world — same shipped/generated split as above. */
export function emblemArtFor(world: { id: string; emblemPrompt?: string }): string {
  if (world.emblemPrompt) return pollinationsUrl(`${world.emblemPrompt}, ${GEN_ICON_STYLE}`, 384, 384, genSeed(world.id))
  return emblemArt(world.id)
}

/** Runtime gen-AI illustration for a fun fact. */
export function factArtUrl(text: string, seed: number): string {
  const prompt = `cute colorful children's storybook illustration, kids encyclopedia art, soft pastel colors, friendly, no text: ${text}`
  return pollinationsUrl(prompt, 512, 512, 100 + seed)
}

interface AiImageProps {
  src: string
  alt?: string
  className?: string
  /** Shown while loading and kept forever if the image fails (offline-safe). */
  fallback?: React.ReactNode
}

/** A small round AI-generated interface icon with emoji fallback. */
export function UiIcon({ name, emoji, size = 22, alt }: { name: string; emoji: string; size?: number; alt?: string }) {
  return (
    <span className="ui-icon" style={{ width: size, height: size }}>
      <AiImage src={uiIcon(name)} alt={alt} fallback={<EmojiImg emoji={emoji} size={size} alt={alt} />} />
    </span>
  )
}

export function AiImage({ src, alt = '', className = '', fallback }: AiImageProps) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  useEffect(() => setState('loading'), [src])
  if (state === 'error') return <>{fallback ?? null}</>
  return (
    <span className={`ai-img ${state === 'loading' ? 'is-loading' : ''} ${className}`}>
      <img
        src={src} alt={alt} draggable={false}
        style={{ opacity: state === 'ok' ? 1 : 0 }}
        onLoad={() => setState('ok')}
        onError={() => setState('error')}
      />
      {state === 'loading' && <span className="ai-img-fallback">{fallback}</span>}
    </span>
  )
}
