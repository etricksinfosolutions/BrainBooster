// ---------------------------------------------------------------------------
// Brain Booster Kids — emoji rendered as real web images
//
//  <EmojiImg>      → crisp Twemoji SVG artwork served from the jsDelivr CDN.
//  <AnimatedEmoji> → Google's animated Noto emoji (GIF, fonts.gstatic.com).
//
// Both degrade gracefully so the app still works fully offline:
//   animated GIF → static Twemoji SVG → native emoji glyph.
// ---------------------------------------------------------------------------
import React, { useEffect, useState } from 'react'

const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/'
const NOTO_ANIM_BASE = 'https://fonts.gstatic.com/s/e/notoemoji/latest/'

/** Unicode emoji string → joined lowercase hex codepoints. */
function toCodePoints(emoji: string, sep: string): string {
  const out: string[] = []
  for (const ch of emoji) out.push(ch.codePointAt(0)!.toString(16))
  return out.join(sep)
}

// Twemoji filenames drop the FE0F variation selector for non-ZWJ emoji.
const twemojiCode = (emoji: string) =>
  toCodePoints(emoji.includes('\u200d') ? emoji : emoji.replace(/\ufe0f/g, ''), '-')

// Noto animated emoji keep FE0F and join codepoints with underscores.
const notoCode = (emoji: string) => toCodePoints(emoji, '_')

interface EmojiProps {
  emoji: string
  size?: number
  className?: string
  /** Accessible label; omit for purely decorative images. */
  alt?: string
}

/** An emoji drawn as consistent, high-quality image artwork (Twemoji). */
export function EmojiImg({ emoji, size = 24, className = '', alt }: EmojiProps) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [emoji])
  if (failed || !emoji.trim()) {
    return <span className={className} style={{ fontSize: size * 0.86, lineHeight: 1 }} role="img" aria-label={alt}>{emoji}</span>
  }
  return (
    <img
      className={`emoji-img ${className}`}
      src={`${TWEMOJI_BASE}${twemojiCode(emoji)}.svg`}
      width={size} height={size}
      alt={alt ?? ''} aria-hidden={alt ? undefined : true}
      draggable={false} loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

/** An emoji as a looping animated image (Google Noto animated emoji). */
export function AnimatedEmoji({ emoji, size = 96, className = '', alt }: EmojiProps) {
  const [fallback, setFallback] = useState(false)
  useEffect(() => setFallback(false), [emoji])
  if (fallback) return <EmojiImg emoji={emoji} size={size} className={className} alt={alt} />
  return (
    <img
      className={`emoji-img anim-emoji ${className}`}
      src={`${NOTO_ANIM_BASE}${notoCode(emoji)}/512.gif`}
      width={size} height={size}
      alt={alt ?? ''} aria-hidden={alt ? undefined : true}
      draggable={false}
      onError={() => setFallback(true)}
    />
  )
}
