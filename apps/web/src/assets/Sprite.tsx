// ---------------------------------------------------------------------------
// Brain Booster Kids — <Sprite>
//
// The one component every activity uses to draw pictorial content. It renders a
// DISTINCT, RECOGNISABLE illustration of the subject at all times, upgrading to
// premium art when it's available — progressive enhancement, never a generic
// placeholder:
//
//     premium baked WebP / gen-AI   (Asset Engine — the goal)
//              ▲ upgrades
//     distinct recognisable artwork  (Twemoji SVG — always available, offline)
//
// Why not a generic "category placeholder"? Because gameplay REQUIRES every
// object to be distinguishable — a Memory board of identical blobs is unplayable.
// The Twemoji baseline is a complete, distinct, per-subject illustrated set, so
// a child always sees *the right object* (a specific octopus, banana, rocket),
// instantly and offline, and it seamlessly becomes the premium 3D asset once the
// baked pack / gen-AI has produced it. There is deliberately no indistinct
// fallback anywhere in the gameplay path.
// ---------------------------------------------------------------------------
import React, { useEffect, useRef, useState } from 'react'
import { EmojiImg } from '../components/emoji'
import { spriteCandidates, isVerified, markVerified } from './engine'
import { isKnownSubject, subjectFor, slugFor } from './registry'

interface SpriteProps {
  /** Content key (emoji token) — the stable semantic id. */
  token: string
  size?: number
  className?: string
  /** Accessible label; omit for decorative art. */
  alt?: string
  /** Fill the parent element responsively (object scales to its container)
   *  instead of a fixed px size — used for game tiles so the illustration is
   *  large and legible at any board/screen size. */
  fill?: boolean
}

/** Detailed warning when premium art can't load and we hold the baseline. */
function warnDowngrade(key: string, candidates: string[]) {
  if (!import.meta.env.DEV) return
  // eslint-disable-next-line no-console
  console.warn(
    '[AssetEngine] premium illustration unavailable — showing distinct baseline art\n' +
    `  token:      ${key}\n` +
    `  subject:    ${subjectFor(key)}\n` +
    `  assetId:    ${slugFor(key)}\n` +
    `  tried:      ${candidates.join('  |  ')}\n` +
    '  action:     run `npm run gen:sprites` to bake the premium pack',
  )
}

export function Sprite({ token, size = 40, className = '', alt, fill }: SpriteProps) {
  const key = token
  if (!key || !key.trim()) return null
  // Abstract glyphs (math signs, title-bar icons) have no illustrated subject —
  // a crisp Twemoji image is the correct rendering for those decorative UI bits.
  // Content tokens are known subjects and get the premium upgrade chain.
  if (!isKnownSubject(key)) {
    return fill
      ? <span className={`sprite sprite-fill ${className}`}><EmojiImg emoji={key} size={size} alt={alt} /></span>
      : <EmojiImg emoji={key} size={size} alt={alt} />
  }
  return <IllustratedSprite key={key} token={key} size={size} className={className} alt={alt} fill={fill} />
}

function IllustratedSprite({ token, size = 40, className = '', alt, fill }: SpriteProps) {
  const key = token
  const candidates = spriteCandidates(key)              // [baked, gen-AI]
  const [ci, setCi] = useState(0)                        // current premium source
  const [premium, setPremium] = useState<'trying' | 'ok' | 'gave-up'>(
    () => (isVerified(key) ? 'ok' : 'trying'),
  )
  const warned = useRef(false)

  useEffect(() => {
    setCi(0)
    setPremium(isVerified(key) ? 'ok' : 'trying')
    warned.current = false
  }, [key])

  // The always-present distinct baseline (also the accessible label carrier).
  const baseline = <EmojiImg emoji={key} size={size} alt={alt} />
  const wrapCls = `sprite ${fill ? 'sprite-fill' : ''} ${premium === 'ok' ? 'is-ready' : 'is-loading'} ${className}`
  const wrapStyle = fill ? undefined : { width: size, height: size }

  // Premium art gave up → hold the distinct baseline (never a generic blob).
  if (premium === 'gave-up') return <span className={wrapCls} style={wrapStyle}>{baseline}</span>

  const onError = () => {
    if (ci < candidates.length - 1) setCi(ci + 1)        // baked → gen-AI
    else {
      if (!warned.current) { warned.current = true; warnDowngrade(key, candidates) }
      setPremium('gave-up')
    }
  }

  return (
    <span className={wrapCls} style={wrapStyle}>
      <img
        className="sprite-img"
        src={candidates[ci]}
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        loading="lazy"
        style={{ opacity: premium === 'ok' ? 1 : 0 }}
        onLoad={() => { markVerified(key); setPremium('ok') }}
        onError={onError}
      />
      {/* Distinct baseline underneath until premium art is confirmed — the child
          always sees the correct object, never a blank box or generic blob. */}
      {premium !== 'ok' && <span className="sprite-fallback">{baseline}</span>}
    </span>
  )
}
