// ---------------------------------------------------------------------------
// Brain Booster Kids — screens & shared UI
// ---------------------------------------------------------------------------
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { LEVELS, LevelDef, SKILL_LABEL, Skill, recommendLevel } from '../data/levels'
import {
  useStore, useT, unlockedMax, levelForXp, sfx, speak, randomPraise, unlockCost,
  AVATARS, AVATAR_PRICES, HATS, HAT_PRICES, PREMIUM_AVATARS, PREMIUM_HATS,
  GEM_AVATARS, GEM_AVATAR_PRICES, GEM_HATS, GEM_HAT_PRICES,
} from '../state/store'
import { GAME_REGISTRY } from '../games'
import { MECHANIC_REGISTRY } from '../activities/mechanics'
import { WORLDS, World, worldForLevel, mascotByKey } from '../data/worlds'
import { factsForThemes } from '../data/facts'
import { themeFor, WorldTheme } from '../theme'
import { narrate, welcomeScript, setNarratorForWorld } from '../state/narrator'
import { loadSyncState, connect, disconnect, backupNow, restoreProgress, setAutoSync, label as syncLabel, SyncProvider, SyncState } from '../state/cloudSync'
import { track } from '../analytics'
import { WorldScene } from './scenery'
import { EmojiImg, AnimatedEmoji } from './emoji'
import { AiImage, UiIcon, emblemArtFor, mascotArt, factArtUrl } from './art'
import { ensureHeadroom, prefetchActivities } from '../contentService'
import { prefetchAround } from '../assets/engine'
import { LANGUAGES } from '../i18n'
import { BRAND, SHARE_TEXT, SOCIAL_LINKS, LEGAL_LINKS, supportMailto, providerConfigured } from '../config'
import { Capacitor } from '@capacitor/core'

// --- Mascot -------------------------------------------------------------------
// Tigo the tiger — the official Brain Booster Kids mascot. Friendly, curious
// and always cheering the child on. Hand-drawn SVG so he's crisp at any size,
// works offline and animates (idle sway, blinking, waving, tail wag) via CSS.

export function Mascot({ mood = 'happy', size = 96 }: { mood?: 'happy' | 'cheer' | 'think'; size?: number }) {
  const cheer = mood === 'cheer'
  return (
    <svg className={`mascot mascot-${mood}`} width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Tigo the tiger mascot waving">
      <defs>
        <radialGradient id="tigoBody" cx="50%" cy="26%" r="82%">
          <stop offset="0%" stopColor="#ffb75e" />
          <stop offset="100%" stopColor="#ef8a2c" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="116" rx="24" ry="5" fill="rgba(90,50,20,.16)" />
      {/* wagging tail */}
      <g className="mascot-tail" style={{ transformBox: 'view-box', transformOrigin: '92px 92px' } as any}>
        <path d="M92 92 Q112 84 108 66" stroke="#ef8a2c" strokeWidth="9" fill="none" strokeLinecap="round" />
        <circle cx="108" cy="66" r="5.5" fill="#4a2f1d" />
      </g>
      {/* round ears with soft inner */}
      <circle cx="37" cy="17" r="11" fill="#ef8a2c" />
      <circle cx="83" cy="17" r="11" fill="#ef8a2c" />
      <circle cx="37" cy="17" r="5.5" fill="#ffd9b0" />
      <circle cx="83" cy="17" r="5.5" fill="#ffd9b0" />
      {/* body */}
      <path d="M60 12 C34 12 25 37 25 63 C25 94 40 111 60 111 C80 111 95 94 95 63 C95 37 86 12 60 12 Z" fill="url(#tigoBody)" />
      {/* cream belly */}
      <path d="M60 60 C45 60 38 72 38 85 C38 100 47 108 60 108 C73 108 82 100 82 85 C82 72 75 60 60 60 Z" fill="#fff3df" />
      {/* static arm (left side) */}
      <path d="M27 60 Q13 71 20 89 Q31 81 34 65 Z" fill="#ef8a2c" />
      {/* tiger stripes — forehead + flanks */}
      <g fill="#4a2f1d">
        <path d="M54 13 q2 7 0 11 q-4 -5 -3 -11 z" />
        <path d="M63 12 q2 7 0 12 q-4 -6 -3 -12 z" />
        <path d="M71 15 q2 6 0 10 q-4 -5 -3 -10 z" />
        <path d="M26 46 q9 1 13 8 q-9 2 -13 -2 z" />
        <path d="M27 72 q9 0 12 6 q-8 3 -12 -1 z" />
        <path d="M94 46 q-9 1 -13 8 q9 2 13 -2 z" />
        <path d="M93 72 q-9 0 -12 6 q8 3 12 -1 z" />
      </g>
      {/* big cute eyes with sparkles */}
      <circle cx="48" cy="47" r="12.5" fill="#fff" />
      <circle cx="72" cy="47" r="12.5" fill="#fff" />
      <circle className="mascot-eye" cx="49" cy="49" r="6.6" fill="#3a2415" />
      <circle className="mascot-eye" cx="71" cy="49" r="6.6" fill="#3a2415" />
      <circle cx="52" cy="45" r="2.6" fill="#fff" />
      <circle cx="74" cy="45" r="2.6" fill="#fff" />
      <circle cx="46" cy="52" r="1.4" fill="#fff" opacity=".85" />
      <circle cx="68" cy="52" r="1.4" fill="#fff" opacity=".85" />
      {/* happy eyebrows */}
      <path d="M41 33 Q48 29 55 33" stroke="#8a4d12" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M65 33 Q72 29 79 33" stroke="#8a4d12" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* rosy cheeks */}
      <circle cx="37" cy="58" r="5" fill="#FF8FA8" opacity=".45" />
      <circle cx="83" cy="58" r="5" fill="#FF8FA8" opacity=".45" />
      {/* white muzzle, pink nose, smile */}
      <circle cx="53" cy="63" r="9.5" fill="#fff8ef" />
      <circle cx="67" cy="63" r="9.5" fill="#fff8ef" />
      <path d="M55 56 L65 56 L60 63 Z" fill="#f4738f" />
      {cheer
        ? <path d="M52 68 Q60 80 68 68 Q60 74 52 68 Z" fill="#3a2415" />
        : <path d="M60 63 Q60 69 60 69 M54 69 Q60 75 66 69" stroke="#3a2415" strokeWidth="2.4" fill="none" strokeLinecap="round" />}
      {/* whiskers */}
      <g stroke="#c98d55" strokeWidth="2" strokeLinecap="round">
        <path d="M38 60 L24 57" /><path d="M38 65 L25 67" />
        <path d="M82 60 L96 57" /><path d="M82 65 L95 67" />
      </g>
      {/* round paws with toe beans */}
      <g>
        <ellipse cx="47" cy="107" rx="10" ry="6" fill="#ef8a2c" />
        <ellipse cx="73" cy="107" rx="10" ry="6" fill="#ef8a2c" />
        <path d="M43 104 v5 M47 103 v6 M51 104 v5 M69 104 v5 M73 103 v6 M77 104 v5" stroke="#fff3df" strokeWidth="1.6" strokeLinecap="round" />
      </g>
      {/* waving paw 👋 (pivots at the shoulder) */}
      <g className="mascot-wave" style={{ transformBox: 'view-box', transformOrigin: '88px 58px' } as any}>
        <path d="M88 58 Q104 50 103 33 Q92 39 84 55 Z" fill="#ef8a2c" />
        <circle cx="101" cy="36" r="4.5" fill="#ffd9b0" />
      </g>
    </svg>
  )
}

export function Confetti({ n = 60, palette }: { n?: number; palette?: string[] }) {
  const colors = palette && palette.length ? palette : ['#FFB43A', '#FF6FA5', '#4ECDA5', '#5BA8FF', '#7A5CC8']
  const bits = useMemo(() => Array.from({ length: n }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 0.9, dur: 2 + Math.random() * 1.6,
    color: colors[i % colors.length],
    rot: Math.random() * 360, size: 6 + Math.random() * 8,
  })), [n]) // eslint-disable-line
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <span key={i} style={{
          left: `${b.left}%`, background: b.color, width: b.size, height: b.size * 0.6,
          animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s`, transform: `rotate(${b.rot}deg)`,
        }} />
      ))}
    </div>
  )
}

// --- Character mascots --------------------------------------------------------
// Tigo the tiger is drawn as an SVG (see Mascot). The wider cast of characters
// that greet, guide and cheer across the worlds use AI-generated portraits,
// falling back to animated emoji artwork (then native emoji when offline).

export function Character({ mascotKey, size = 64, mood = 'happy' }: { mascotKey: string; size?: number; mood?: 'happy' | 'cheer' | 'think' }) {
  const m = mascotByKey(mascotKey)
  if (m.key === 'tiger') return <Mascot mood={mood} size={size} />
  return (
    <span className={`character character-${mood}`} style={{ width: size, height: size }} role="img" aria-label={`${m.name} the ${m.species}`}>
      <AiImage src={mascotArt(m.key)!} className="mascot-art" fallback={<AnimatedEmoji emoji={m.emoji} size={size} />} />
    </span>
  )
}

// --- Playful animated background (balloons, clouds, stars) ---------------------

export function Decor() {
  const bits = useMemo(() => {
    const items: { emoji: string; left: number; dur: number; delay: number; size: number; drift: number }[] = []
    const set = ['🎈', '☁️', '⭐', '🌟', '🎈', '☁️', '✨']
    for (let i = 0; i < 9; i++) {
      items.push({
        emoji: set[i % set.length],
        left: (i * 11 + (i % 3) * 5) % 96,
        dur: 14 + (i % 5) * 4,
        delay: (i % 6) * 2.5,
        size: 22 + (i % 4) * 8,
        drift: (i % 2 ? 1 : -1) * (10 + (i % 3) * 8),
      })
    }
    return items
  }, [])
  return (
    <div className="decor" aria-hidden="true">
      {bits.map((b, i) => (
        <span key={i} className="decor-bit" style={{
          left: `${b.left}%`, fontSize: b.size, animationDuration: `${b.dur}s`,
          animationDelay: `${b.delay}s`, ['--drift' as any]: `${b.drift}px`,
        }}>{b.emoji}</span>
      ))}
    </div>
  )
}

/** A quick burst of fireworks/sparkles for big celebrations. */
export function Fireworks({ n = 5 }: { n?: number }) {
  const bursts = useMemo(() => Array.from({ length: n }, (_, i) => ({
    left: 10 + (i * 73) % 80, top: 8 + (i * 37) % 45, delay: (i % 5) * 0.35,
    color: ['#FFB43A', '#FF6FA5', '#4ECDA5', '#5BA8FF', '#7A5CC8'][i % 5],
  })), [n])
  return (
    <div className="fireworks" aria-hidden="true">
      {bursts.map((b, i) => (
        <span key={i} className="firework" style={{ left: `${b.left}%`, top: `${b.top}%`, color: b.color, animationDelay: `${b.delay}s` }}>
          {Array.from({ length: 8 }, (_, k) => <i key={k} style={{ ['--a' as any]: `${k * 45}deg` }} />)}
        </span>
      ))}
    </div>
  )
}

// --- Splash screen (branding) -------------------------------------------------

export function Splash({ onDone }: { onDone: () => void }) {
  // Two-beat brand intro: the etricksGames studio logo animates for ~5 seconds,
  // then the Brain Booster game logo takes over before landing on Home. A tap
  // skips ahead. App also keeps this mounted until the server content has
  // loaded, so it doubles as the "buy time for API" loader.
  const [stage, setStage] = useState<'studio' | 'game'>('studio')
  useEffect(() => {
    const toGame = setTimeout(() => setStage('game'), 5000)
    const done = setTimeout(onDone, 8200)
    return () => { clearTimeout(toGame); clearTimeout(done) }
  }, []) // eslint-disable-line
  const skip = () => (stage === 'studio' ? setStage('game') : onDone())
  return (
    <div className="splash" role="img" aria-label={`${BRAND.studio} — ${BRAND.appName}`} onClick={skip}>
      <Decor />
      {stage === 'studio' ? (
        <div className="splash-inner" key="studio">
          <div className="splash-logo">
            <picture>
              <source srcSet="/etricks-logo.webp" type="image/webp" />
              <img src="/etricks-logo.png" alt={`${BRAND.studio} logo`} width={300} height={300} draggable={false} />
            </picture>
            <span className="splash-shine" aria-hidden="true" />
          </div>
          <p className="splash-presents">{BRAND.studio} presents…</p>
        </div>
      ) : (
        <div className="splash-inner" key="game">
          <div className="splash-game-logo">
            <picture>
              <source srcSet="/brain-booster-logo.webp" type="image/webp" />
              <img src="/brain-booster-logo.png" alt={`${BRAND.appName} logo`} width={320} height={320} draggable={false} />
            </picture>
            <span className="splash-shine" aria-hidden="true" />
          </div>
          <h1 className="splash-title splash-wordmark">{BRAND.appName}</h1>
          <p className="splash-tag">Play • Learn • Grow</p>
          <div className="splash-mascot"><Mascot mood="cheer" size={80} /></div>
          <div className="splash-loader"><span /><span /><span /></div>
          <p className="splash-loading">Loading your adventure…</p>
        </div>
      )}
    </div>
  )
}

// --- Footer banner advertisement ----------------------------------------------
// Anchored to the bottom, never overlaps game content (the app-shell reserves
// space for it), and is skipped entirely for premium users. The every-3-levels
// interstitial (AdBreak) is unchanged.

export function BannerAd() {
  const { state, dispatch } = useStore()
  if (state.profile.premium) return null
  return (
    <div className="banner-ad" role="complementary" aria-label="advertisement">
      {/* PRODUCTION: mount the AdMob/AdSense banner unit here. This placeholder
          keeps the exact reserved height so gameplay never shifts when the real
          ad loads. Hidden automatically for premium users (see guard above). */}
      <span className="banner-ad-tag">Ad</span>
      <span className="banner-ad-body">🎈 Fun learning toys for curious kids!</span>
      <button className="banner-ad-remove" onClick={() => { sfx.tap(); dispatch({ type: 'nav', screen: 'premium' }) }}>Remove ✨</button>
    </div>
  )
}

// --- Brand logos (proper SVG marks, not generic emoji) ------------------------

const TIKTOK_NOTE = 'M28 11 h5 c0.8 3.6 3 5.6 6.6 6 v5 c-2.7 0.1 -5 -0.8 -7 -2.2 v9.7 a8.7 8.7 0 1 1 -8.7 -8.7 c0.8 0 1.6 0.1 2.4 0.3 v5.2 a3.7 3.7 0 1 0 2.7 3.5 z'

export function BrandIcon({ brand }: { brand: string }) {
  switch (brand) {
    case 'youtube':
      return (
        <svg viewBox="0 0 48 48" className="brand-svg" aria-hidden="true">
          <rect x="3" y="12" width="42" height="24" rx="8" fill="#FF0000" />
          <path d="M20 18 L32 24 L20 30 Z" fill="#fff" />
        </svg>
      )
    case 'instagram':
      return (
        <svg viewBox="0 0 48 48" className="brand-svg" aria-hidden="true">
          <defs>
            <linearGradient id="igGrad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#FEDA75" /><stop offset="0.35" stopColor="#FA7E1E" />
              <stop offset="0.6" stopColor="#D62976" /><stop offset="0.82" stopColor="#962FBF" /><stop offset="1" stopColor="#4F5BD5" />
            </linearGradient>
          </defs>
          <rect x="5" y="5" width="38" height="38" rx="11" fill="url(#igGrad)" />
          <rect x="14" y="14" width="20" height="20" rx="6" fill="none" stroke="#fff" strokeWidth="3" />
          <circle cx="24" cy="24" r="6.2" fill="none" stroke="#fff" strokeWidth="3" />
          <circle cx="34" cy="14" r="2.1" fill="#fff" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg viewBox="0 0 48 48" className="brand-svg" aria-hidden="true">
          <rect x="4" y="4" width="40" height="40" rx="11" fill="#010101" />
          <path d={TIKTOK_NOTE} fill="#25F4EE" transform="translate(-1.6,-1.6)" />
          <path d={TIKTOK_NOTE} fill="#FE2C55" transform="translate(1.6,1.6)" />
          <path d={TIKTOK_NOTE} fill="#fff" />
        </svg>
      )
    case 'facebook':
      return (
        <svg viewBox="0 0 48 48" className="brand-svg" aria-hidden="true">
          <rect x="5" y="5" width="38" height="38" rx="11" fill="#1877F2" />
          <path d="M28.5 24 H33 l0.8 -6 H28.5 v-3.4 c0 -1.7 0.8 -2.9 3.2 -2.9 H34 V6.3 C33 6.1 31 5.9 29.2 5.9 c-4.7 0 -7.7 2.8 -7.7 8 v4.1 H16 v6 h5.5 V42 h7 z" fill="#fff" />
        </svg>
      )
    case 'google':
      return (
        <svg viewBox="0 0 48 48" className="brand-svg" aria-hidden="true">
          <path fill="#4285F4" d="M45 24.3c0-1.5-.1-3-.4-4.3H24v8.4h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1C42.6 42.6 45 34.4 45 24.3z" />
          <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.5l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.4 46 24 46z" />
          <path fill="#FBBC05" d="M11.8 28.1c-.4-1.3-.7-2.7-.7-4.1s.3-2.8.7-4.1v-5.7H4.5A22 22 0 0 0 2 24c0 3.6.9 6.9 2.5 9.8l7.3-5.7z" />
          <path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.4 2 8.1 6.9 4.5 14.2l7.3 5.7c1.7-5.2 6.5-9.1 12.2-9.1z" />
        </svg>
      )
    case 'apple':
      return (
        <svg viewBox="0 0 48 48" className="brand-svg" aria-hidden="true">
          <path fill="var(--apple-mark, #000)" d="M33.5 25.4c0-4.3 3.5-6.4 3.7-6.5-2-3-5.2-3.3-6.3-3.4-2.7-.3-5.2 1.6-6.6 1.6-1.3 0-3.4-1.5-5.6-1.5-2.9 0-5.5 1.7-7 4.3-3 5.2-.8 12.9 2.1 17.1 1.4 2.1 3.1 4.4 5.3 4.3 2.1-.1 2.9-1.4 5.5-1.4s3.3 1.4 5.6 1.3c2.3 0 3.8-2.1 5.2-4.2 1.6-2.4 2.3-4.7 2.3-4.9-.1-.1-4.4-1.7-4.4-6.6zM29.3 12.6c1.2-1.4 2-3.4 1.8-5.4-1.7.1-3.8 1.2-5 2.6-1.1 1.2-2 3.2-1.8 5.1 1.9.2 3.8-1 5-2.3z" />
        </svg>
      )
    default:
      return <span className="social-icon">{brand}</span>
  }
}

// --- HUD ------------------------------------------------------------------------

export function Hud({ onHome }: { onHome?: () => void }) {
  const { state, dispatch } = useStore()
  const p = state.profile
  return (
    <header className="hud">
      <button className="hud-avatar" onClick={() => { sfx.tap(); dispatch({ type: 'nav', screen: 'home' }) }} aria-label="home">
        <span className="hud-hat">{p.hat !== '—' ? p.hat : ''}</span>{p.avatar}
      </button>
      <div className="hud-stats">
        <span className="chip chip-coin" title="Coins"><UiIcon name="coin" emoji="🪙" size={18} alt="coins" /> {p.coins}</span>
        <span className="chip chip-diamond" title="Diamonds"><UiIcon name="gem" emoji="💎" size={18} alt="diamonds" /> {p.diamonds}</span>
        <span className="chip chip-xp" title="Brain level"><UiIcon name="brain" emoji="🧠" size={18} alt="brain level" /> Lv {levelForXp(p.xp)}</span>
        <span className="chip chip-streak" title="Daily streak"><UiIcon name="flame" emoji="🔥" size={18} alt="daily streak" /> {p.streak}</span>
      </div>
    </header>
  )
}

// --- Home -------------------------------------------------------------------------

export function Home() {
  const { state, dispatch } = useStore()
  const t = useT()
  const p = state.profile
  const max = unlockedMax(p)
  const rec = recommendLevel(p.skills, max)
  const world = worldForLevel(max)
  const dailyReady = p.dailyBonusDate !== new Date().toISOString().slice(0, 10)
  const totalStars = Object.values(p.starsByLevel).reduce((a, b) => a + b, 0)

  return (
    <div className="screen home">
      <Hud />
      <div className="home-hero">
        <Mascot mood="happy" size={128} />
        <div>
          <p className="hero-hello">{t('hi')} {p.name}! 👋</p>
          <h1 className="hero-title">{t('ready')}</h1>
        </div>
      </div>

      <button className="cta-card" style={{ ['--accent' as any]: world.accent }} onClick={() => { sfx.fanfare(); dispatch({ type: 'start-level', level: LEVELS[max - 1] }) }}>
        <span className="cta-emblem" aria-hidden="true">
          <AiImage src={emblemArtFor(world)} className="emblem-art" fallback={<EmojiImg emoji={world.emoji} size={30} />} />
        </span>
        <span className="cta-world">{world.name}</span>
        <span className="cta-label">{t('continue_adventure')}</span>
        <span className="cta-main">Level {max} · {LEVELS[max - 1].title}</span>
        <span className="cta-tier">{LEVELS[max - 1].tier} · {SKILL_LABEL[LEVELS[max - 1].skill]}</span>
      </button>

      <button className="coach-card" onClick={() => { sfx.tap(); dispatch({ type: 'start-level', level: rec.level }) }}>
        <Mascot mood="think" size={52} />
        <span><strong>{t('boos_pick')}</strong><br /><small>{rec.reason}</small><br /><em>Level {rec.level.id} · {rec.level.title}</em></span>
      </button>

      <nav className="home-grid">
        <button className="tile tile-map" onClick={() => { sfx.tap(); dispatch({ type: 'nav', screen: 'map' }) }}>
          <UiIcon name="map" emoji="🗺️" size={44} /><span>{t('tile_map')}</span><small><EmojiImg emoji="⭐" size={12} /> {totalStars} {t('stars')}</small>
        </button>
        <button className="tile tile-daily" onClick={() => { sfx.tap(); dispatch({ type: 'nav', screen: 'daily' }) }}>
          <UiIcon name="gift" emoji="🎁" size={44} /><span>{t('tile_daily')}</span>{dailyReady && <small className="pulse">✨</small>}
        </button>
        <button className="tile tile-shop" onClick={() => { sfx.tap(); dispatch({ type: 'nav', screen: 'shop' }) }}>
          <UiIcon name="shop" emoji="🛍️" size={44} /><span>{t('tile_shop')}</span>
        </button>
        <button className="tile tile-parents" onClick={() => { sfx.tap(); dispatch({ type: 'nav', screen: 'parents' }) }}>
          <UiIcon name="family" emoji="👨‍👩‍👧" size={44} /><span>{t('tile_parents')}</span>
        </button>
        <button className="tile tile-premium" onClick={() => { sfx.tap(); dispatch({ type: 'nav', screen: 'premium' }) }}>
          <UiIcon name="premium" emoji="✨" size={44} /><span>{p.premium ? t('tile_premium_on') : t('tile_premium')}</span>
        </button>
        <button className="tile tile-settings" onClick={() => { sfx.tap(); dispatch({ type: 'nav', screen: 'settings' }) }}>
          <UiIcon name="settings" emoji="⚙️" size={44} /><span>{t('tile_settings')}</span>
        </button>
      </nav>
      {p.badges.length > 0 && (
        <section className="badge-shelf">
          <h2 className="section-title">Your badges</h2>
          <div className="badge-row">{p.badges.map(b => <span key={b} className="badge-pill">🏅 {b}</span>)}</div>
        </section>
      )}
    </div>
  )
}

// --- Level map -----------------------------------------------------------------------

const MILESTONE_ICON: Record<string, string> = { big: '🎉', chest: '🧰', badge: '🏅', golden: '🏆', champion: '👑' }

// --- Candy-Crush-style adventure trail ---------------------------------------
// One continuous winding path from level 1 at the BOTTOM up through every themed
// region to the final level at the TOP. Nodes sit on a candy rope; each world is
// a coloured band with a ribbon banner and a guide mascot. Content (worlds &
// levels) is server-driven, so the trail grows automatically when levels are
// added remotely.

const ROW_H = 96          // vertical spacing between nodes (px)
const PAD = 54            // top & bottom padding (px)
const AMP = 28            // horizontal swing of the winding path (% of width)
const BOSS_MILESTONES = new Set(['badge', 'golden', 'champion'])

export function LevelMap() {
  const { state, dispatch } = useStore()
  const t = useT()
  const p = state.profile
  const max = unlockedMax(p)
  const currentRef = useRef<HTMLButtonElement>(null)
  const [unlockTarget, setUnlockTarget] = useState<LevelDef | null>(null)

  // The Endless Engine: if the child is nearing the end of the catalogue,
  // generate new worlds on the spot — the adventure never runs out of road.
  const [, setCatalogueTick] = useState(0)
  useEffect(() => { if (ensureHeadroom(max)) setCatalogueTick(n => n + 1) }, [max])
  // Smart download: keep prefetching batches of server activities as the child
  // advances, so the library grows ahead of them without a big upfront download.
  useEffect(() => { prefetchActivities().catch(() => {}) }, [max])

  // Day/night atmosphere: the map subtly matches the child's real time of day.
  const dayPhase = useMemo(() => {
    const h = new Date().getHours()
    return h < 6 ? 'night' : h < 9 ? 'dawn' : h < 17 ? 'day' : h < 20 ? 'dusk' : 'night'
  }, [])

  const { H, nodes } = useMemo(() => {
    const H = PAD * 2 + LEVELS.length * ROW_H
    const nodes = LEVELS.map((l, i) => {
      const x = 50 + Math.sin(i * 0.85) * AMP          // % from left
      const yBottom = PAD + i * ROW_H + ROW_H / 2      // px from bottom
      return { l, i, x, yBottom, y: H - yBottom }      // y = px from top (for the path)
    })
    return { H, nodes }
  }, [LEVELS.length])

  // Winding trail: a smooth curve threading every node (bottom → top).
  const trailPath = useMemo(() => {
    if (!nodes.length) return ''
    let d = `M ${nodes[0].x} ${nodes[0].y}`
    for (let i = 1; i < nodes.length; i++) {
      const a = nodes[i - 1], b = nodes[i]
      const my = (a.y + b.y) / 2
      d += ` C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`   // smooth S-curves
    }
    return d
  }, [nodes])

  // Region bands + signposts, positioned from each world's level span.
  const bands = useMemo(() => WORLDS.map(w => {
    const fi = Math.max(0, w.firstLevel - 1)
    const li = Math.min(nodes.length - 1, w.lastLevel - 1)
    if (!nodes[fi] || !nodes[li]) return null
    const top = nodes[li].y - ROW_H / 2 - 8
    const bottom = nodes[fi].y + ROW_H / 2 + 8
    const done = LEVELS.slice(w.firstLevel - 1, w.lastLevel).filter(l => p.starsByLevel[l.id]).length
    const total = w.lastLevel - w.firstLevel + 1
    const locked = w.firstLevel > max
    return { w, top, height: bottom - top, mid: (top + bottom) / 2, done, total, locked }
  }).filter(Boolean) as { w: World; top: number; height: number; mid: number; done: number; total: number; locked: boolean }[], [nodes, max, p.starsByLevel])

  const worldsExplored = WORLDS.filter(w => max > w.lastLevel).length

  // Smoothly centre the camera on where the child is right now.
  useEffect(() => { currentRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' }) }, [])

  return (
    <div className="screen map-screen">
      <div className="map-sticky">
        <Hud />
        <TitleBar title={`${t('map_title')} 🗺️`} />
        <p className="map-summary">
          <EmojiImg emoji="🧭" size={18} /> {worldsExplored}/{WORLDS.length} {t('worlds_done')}
          <span className="map-summary-dot">·</span>
          <EmojiImg emoji="⭐" size={18} /> {Object.values(p.starsByLevel).reduce((a, b) => a + b, 0)}
        </p>
      </div>

      <div className={`trail phase-${dayPhase}`} style={{ height: H }}>
        {/* illustrated terrain, one scene per world */}
        {bands.map(b => (
          <WorldScene key={b.w.id} world={b.w} style={{ top: b.top, height: b.height }} />
        ))}
        {/* fog over worlds not yet reached */}
        {bands.filter(b => b.locked).map(b => (
          <div key={`f-${b.w.id}`} className="band-fog" style={{ top: b.top, height: b.height }} aria-hidden="true" />
        ))}

        {/* wooden signpost naming each region */}
        {bands.map(b => (
          <div key={`r-${b.w.id}`} className={`signpost ${b.locked ? 'is-locked' : ''}`} style={{ top: b.mid, ['--accent' as any]: b.w.accent }}>
            <span className="signpost-emblem">
              {b.locked
                ? <EmojiImg emoji="🔒" size={24} />
                : <AiImage src={emblemArtFor(b.w)} className="emblem-art" fallback={<EmojiImg emoji={b.w.emoji} size={24} />} />}
            </span>
            <span className="signpost-name">{b.w.name}</span>
            <span className="signpost-progress">{b.done}/{b.total} <EmojiImg emoji="⭐" size={12} /></span>
            {!b.locked && <span className="signpost-guide"><Character mascotKey={b.w.mascot} size={32} /></span>}
          </div>
        ))}

        {/* the winding adventure trail */}
        <svg className="trail-rope" viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" aria-hidden="true">
          <path d={trailPath} className="trail-edge" vectorEffect="non-scaling-stroke" />
          <path d={trailPath} className="trail-fill" vectorEffect="non-scaling-stroke" />
          <path d={trailPath} className="trail-dots" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* level nodes on the trail */}
        {nodes.map(n => {
          const stars = p.starsByLevel[n.l.id] ?? 0
          const locked = n.l.id > max
          const unlockable = locked && n.l.id === max + 1   // the very next locked level can be skip-unlocked
          const isCurrent = n.l.id === max
          const boss = !!n.l.milestone && BOSS_MILESTONES.has(n.l.milestone)
          const accent = worldForLevel(n.l.id).accent
          return (
            <button key={n.l.id} ref={isCurrent ? currentRef : undefined} disabled={locked && !unlockable}
              className={`trail-node ${locked ? 'is-locked' : ''} ${unlockable ? 'is-unlockable' : ''} ${stars ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''} ${n.l.milestone ? 'is-milestone' : ''} ${boss ? 'is-boss' : ''}`}
              style={{ left: `${n.x}%`, bottom: n.yBottom, ['--accent' as any]: accent }}
              aria-label={`Level ${n.l.id} ${n.l.title}${boss ? ' (boss)' : ''}${unlockable ? ` (unlock for ${unlockCost(n.l)} diamonds)` : locked ? ` (${t('locked')})` : ''}`}
              onClick={() => { sfx.tap(); if (unlockable) setUnlockTarget(n.l); else dispatch({ type: 'start-level', level: n.l }) }}>
              {boss && !locked && <span className="node-portal" aria-hidden="true" />}
              <span className="node-num">
                {unlockable ? <EmojiImg emoji="🔓" size={boss ? 30 : 24} />
                  : locked ? <EmojiImg emoji="🔒" size={boss ? 28 : 22} />
                  : n.l.milestone ? <EmojiImg emoji={MILESTONE_ICON[n.l.milestone]} size={boss ? 36 : 28} />
                  : n.l.id}
              </span>
              {unlockable && <span className="node-unlock" aria-hidden="true"><EmojiImg emoji="💎" size={11} />{unlockCost(n.l)}</span>}
              {!locked && <span className="node-stars" aria-hidden="true">
                {[1, 2, 3].map(i => <i key={i} className={i <= stars ? 'on' : ''}>★</i>)}
              </span>}
              {isCurrent && <span className="node-flag" aria-hidden="true"><EmojiImg emoji={p.avatar} size={28} /></span>}
            </button>
          )
        })}
      </div>

      {unlockTarget && (
        <div className="modal-backdrop" role="dialog" aria-label="unlock level" onClick={() => setUnlockTarget(null)}>
          <div className="ad-card unlock-card" onClick={e => e.stopPropagation()}>
            <div className="unlock-emoji">
              <AiImage src={emblemArtFor(worldForLevel(unlockTarget.id))} className="emblem-art unlock-emblem"
                fallback={<EmojiImg emoji={worldForLevel(unlockTarget.id).emoji} size={64} />} />
            </div>
            <h2 className="premium-title">Unlock Level {unlockTarget.id}?</h2>
            <p className="game-meta">Skip ahead with diamonds — or beat Level {unlockTarget.id - 1} to unlock it for free!</p>
            <p className="unlock-cost">Cost <b><EmojiImg emoji="💎" size={16} /> {unlockCost(unlockTarget)}</b> · You have <EmojiImg emoji="💎" size={14} /> {p.diamonds}</p>
            {p.diamonds >= unlockCost(unlockTarget)
              ? <button className="btn btn-primary btn-big" onClick={() => { sfx.coin(); dispatch({ type: 'unlock-level', level: unlockTarget }); const lvl = unlockTarget; setUnlockTarget(null); dispatch({ type: 'start-level', level: lvl }) }}>Unlock &amp; play <EmojiImg emoji="💎" size={16} /> {unlockCost(unlockTarget)}</button>
              : <p className="reward-praise" style={{ fontSize: '1.1rem' }}>Not enough diamonds yet — win some more! 💎</p>}
            <button className="btn btn-ghost" onClick={() => setUnlockTarget(null)}>Maybe later</button>
          </div>
        </div>
      )}
    </div>
  )
}

// Modern mobile-game navigation: no "Home" text button — the child's avatar
// (top-left, in the HUD) is the way back to the Home dashboard. Screen headers
// are just a title.
function TitleBar({ title }: { title: string }) {
  return (
    <div className="backbar">
      <h1 className="backbar-title">{title}</h1>
    </div>
  )
}

// --- World transition (cinematic) ---------------------------------------------
// Entering a new region feels like stepping into a storybook: clouds sweep
// away, the painted world fades in, the region title lands, Tigo cheers and
// this world's narrator welcomes the child. Tap anywhere to skip.

export function WorldIntro({ world, onDone }: { world: World; onDone: () => void }) {
  const { state } = useStore()
  const theme = themeFor(world)
  useEffect(() => {
    // The narrator only ever changes here — on entering a new region.
    setNarratorForWorld(world)
    narrate(welcomeScript(world), state.settings.voice)
    if (state.settings.celebration) sfx.fanfare()
    const t = setTimeout(onDone, 5400)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line
  return (
    <div className="world-intro" style={{ ['--accent' as any]: world.accent }} role="dialog"
      aria-label={`Entering ${world.name}`} onClick={onDone}>
      <img className="world-intro-art" src={theme.art} alt="" draggable={false}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
      <span className="world-intro-veil" aria-hidden="true" />
      <span className="intro-cloud intro-cloud-l" aria-hidden="true" />
      <span className="intro-cloud intro-cloud-r" aria-hidden="true" />
      <div className="world-intro-card">
        <span className="world-intro-emblem">
          <AiImage src={emblemArtFor(world)} className="emblem-art" fallback={<EmojiImg emoji={world.emoji} size={54} />} />
        </span>
        <p className="world-intro-kicker">Chapter {world.index + 1}</p>
        <h1 className="world-intro-title">{world.name}</h1>
        <p className="world-intro-blurb">{world.blurb}</p>
        <div className="world-intro-cast">
          <Mascot mood="cheer" size={96} />
          {world.mascot !== 'tiger' && <Character mascotKey={world.mascot} size={62} mood="cheer" />}
        </div>
      </div>
      <p className="world-intro-skip">Tap to start playing →</p>
    </div>
  )
}

// --- Play ------------------------------------------------------------------------------
// Activities live INSIDE the world: the region's painted artwork fills the
// screen behind gameplay, softly blurred and veiled so challenges stay
// perfectly readable (see .play-bg styles).

function PlayBackdrop({ theme }: { theme: WorldTheme }) {
  const [ok, setOk] = useState(false)
  return (
    <div className={`play-bg ${theme.dark ? 'is-dark' : ''}`} aria-hidden="true">
      <img src={theme.art} alt="" draggable={false} style={{ opacity: ok ? 1 : 0 }}
        onLoad={() => setOk(true)} onError={() => setOk(false)} />
      <span className="play-bg-scrim" />
    </div>
  )
}

export function Play() {
  const { state, dispatch } = useStore()
  const level = state.activeLevel!
  const activity = state.activeActivity
  const world = worldForLevel(level.id)
  const theme = themeFor(world)
  // The Modular Activity Engine picks WHICH kind of game this level plays (for
  // variety); we fall back to the level's built-in kind if none was scheduled.
  const Mechanic = activity ? MECHANIC_REGISTRY[activity.mechanic] : null
  const Game = GAME_REGISTRY[level.kind]
  const title = activity?.name ?? level.title
  const trains = activity?.skill ?? level.skill
  const startRef = useRef(Date.now())
  // Bumping this remounts the active game with a fresh key → clears the current
  // selection and deals a brand-new board/round (the Reset button).
  const [resetN, setResetN] = useState(0)
  // Cinematic world transition when this level lives in a new region.
  const [intro, setIntro] = useState(() => state.profile.lastWorldId !== world.id)
  useEffect(() => {
    if (state.profile.lastWorldId !== world.id) dispatch({ type: 'visit-world', worldId: world.id })
  }, [world.id]) // eslint-disable-line
  // Warm the Asset Engine for this world (and the next one the child is heading
  // toward) so illustrations paint instantly and stay available offline.
  useEffect(() => { prefetchAround(level.id) }, [level.id])
  useEffect(() => { startRef.current = Date.now(); track('level_start', { level: level.id, kind: activity?.mechanic ?? level.kind }) }, [level, activity])
  const finish = (acc: number, meta?: { hintsUsed?: number; seenIds?: string[] }) => {
    const seconds = Math.round((Date.now() - startRef.current) / 1000)
    track('level_complete', { level: level.id, kind: activity?.mechanic ?? level.kind, accuracy: Math.round(acc * 100), hintsUsed: meta?.hintsUsed ?? 0, seconds })
    dispatch({ type: 'complete-level', level, accuracy: acc, seconds, hintsUsed: meta?.hintsUsed, seenIds: meta?.seenIds })
  }
  return (
    <div className={`screen play ${theme.dark ? 'play-dark' : ''}`}>
      <PlayBackdrop theme={theme} />
      <div className="play-top">
        <button className="btn btn-ghost btn-back" aria-label="Back to the adventure map"
          onClick={() => { sfx.tap(); dispatch({ type: 'skip-activity' }); dispatch({ type: 'nav', screen: 'map' }) }}>←</button>
        <div className="play-title">
          <strong>Level {level.id} · {title}</strong>
          <small>{world.emoji} {world.name} · {level.tier} · trains {SKILL_LABEL[trains]}</small>
        </div>
        <button className="btn btn-ghost btn-reset" aria-label="Reset this activity" title="Reset"
          onClick={() => { sfx.tap(); startRef.current = Date.now(); setResetN(n => n + 1) }}>↻</button>
      </div>
      {/* The game mounts only after the transition, so timed challenges and
          sequence previews never run hidden behind the intro. */}
      {!intro && (Mechanic
        ? <Mechanic key={`${level.id}-${activity!.activityId}-${resetN}`} spec={activity!} level={level} onDone={finish} />
        : <Game key={`${level.id}-${resetN}`} level={level} onDone={finish} />)}
      {intro && <WorldIntro world={world} onDone={() => { setIntro(false); startRef.current = Date.now() }} />}
    </div>
  )
}

// --- Reward ------------------------------------------------------------------------------

const MILESTONE_TEXT: Record<string, string> = {
  big: '🎉 Big celebration! 5 levels in a row!',
  chest: '🧰 Treasure chest unlocked!',
  badge: '🏅 Special badge earned!',
  golden: '🏆 GOLDEN TROPHY! Incredible!',
  champion: '👑 MASTER BRAIN CHAMPION!',
}

export function Reward() {
  const { state, dispatch } = useStore()
  const r = state.lastReward!
  const level = LEVELS[r.levelId - 1]
  const world = worldForLevel(level.id)
  const praise = useMemo(randomPraise, [])
  useEffect(() => {
    if (state.settings.celebration) sfx.fanfare()
    speak(praise, state.settings.voice)
  }, []) // eslint-disable-line
  return (
    <div className="screen reward-screen" style={{ ['--accent' as any]: world.accent }}>
      {/* celebration bursts in this world's colours */}
      <Confetti palette={[world.accent, '#FFB43A', '#FF6FA5', '#4ECDA5', '#5BA8FF']} />
      {level.milestone && <Fireworks n={6} />}
      <div className="reward-card">
        <div className="reward-mascot"><Mascot mood="cheer" size={132} /></div>
        <p className="reward-praise">{praise}</p>
        <div className="reward-stars" aria-label={`${r.stars} stars`}>
          {[1, 2, 3].map(i => <span key={i} className={`big-star ${i <= r.stars ? 'is-on' : ''}`} style={{ animationDelay: `${i * 0.18}s` }}><UiIcon name="xp" emoji="⭐" size={44} alt="star" /></span>)}
        </div>
        {level.milestone && <p className="reward-milestone">{MILESTONE_TEXT[level.milestone]}</p>}
        <div className="reward-loot">
          <span className="loot" onAnimationStart={() => state.settings.celebration && sfx.coin()}><UiIcon name="coin" emoji="🪙" size={20} alt="coins" /> +{r.coins}</span>
          {r.diamonds > 0 && <span className="loot"><UiIcon name="gem" emoji="💎" size={20} alt="diamonds" /> +{r.diamonds}</span>}
          <span className="loot"><UiIcon name="xp" emoji="✨" size={20} alt="experience" /> +{r.xp} XP</span>
        </div>
        {(!!r.bonusPerfect || !!r.bonusNoHint) && (
          <div className="reward-bonus">
            {!!r.bonusPerfect && <span className="bonus-chip"><EmojiImg emoji="🎯" size={15} /> Perfect! +{r.bonusPerfect}</span>}
            {!!r.bonusNoHint && <span className="bonus-chip"><EmojiImg emoji="💡" size={15} /> No hints! +{r.bonusNoHint}</span>}
          </div>
        )}
        <button className="btn btn-primary btn-big" onClick={() => { sfx.tap(); dispatch({ type: 'nav', screen: 'fact' }) }}>Continue →</button>
      </div>
    </div>
  )
}

// --- Fun-fact screen (full-screen, between activities) --------------------------------------------

export function FactScreen() {
  const { state, dispatch } = useStore()
  // The fact this level just unlocked — drawn from THIS world's themed facts
  // (ocean facts under the sea, dino facts on Dinosaur Island…). Each level
  // reveals the next fact in the world's collection.
  const world = worldForLevel(state.lastReward?.levelId ?? unlockedMax(state.profile))
  const pool = factsForThemes(themeFor(world).tags)
  const unlocked = Math.max(0, state.profile.factIndex - 1)
  // Defensive: never let an empty fact pool (e.g. server-driven content) NaN a
  // modulo and white-screen the mandatory post-level flow — skip straight on.
  const fact = pool.length ? pool[unlocked % pool.length] : null
  const factIdx = pool.length ? unlocked % pool.length : 0
  useEffect(() => {
    if (!fact) { dispatch({ type: 'dismiss-reward' }); return }
    track('fact_viewed', { category: fact.category })
    speak(`Did you know? ${fact.title}. ${fact.text}`, state.settings.voice)
  }, []) // eslint-disable-line
  if (!fact) return null
  return (
    <div className="screen fact-screen">
      <div className="fact-scene">
        <span className="fact-ring" aria-hidden="true" />
        <div className="fact-badge">
          {/* a unique gen-AI illustration of this exact fact; the animated
              emoji entertains while it generates and covers offline play */}
          <AiImage src={factArtUrl(fact.text, factIdx)} alt={fact.category} className="fact-art"
            fallback={<AnimatedEmoji emoji={fact.icon} size={132} alt={fact.category} />} />
        </div>
        <span className="fact-orbit o1" aria-hidden="true"><EmojiImg emoji="✨" size={26} /></span>
        <span className="fact-orbit o2" aria-hidden="true"><EmojiImg emoji="⭐" size={22} /></span>
        <span className="fact-orbit o3" aria-hidden="true"><EmojiImg emoji="🌟" size={24} /></span>
      </div>
      <p className="fact-kicker"><UiIcon name="brain" emoji="💡" size={17} /> Did you know?</p>
      <p className="fact-cat-big">{fact.category}</p>
      <h2 className="fact-title-big">{fact.title}</h2>
      <p className="fact-text-big">{fact.text}</p>
      <div className="fact-mascot"><Mascot mood="cheer" size={84} /></div>
      <button className="btn btn-primary btn-big fact-continue" onClick={() => { sfx.tap(); dispatch({ type: 'dismiss-reward' }) }}>
        Next level →
      </button>
    </div>
  )
}

// --- Ad break (AdMob placement slot) ----------------------------------------------------------

export function AdBreak() {
  const { state, dispatch } = useStore()
  const [wait, setWait] = useState(3)
  useEffect(() => {
    const t = setInterval(() => setWait(w => Math.max(0, w - 1)), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="modal-backdrop" role="dialog" aria-label="advertisement break">
      <div className="ad-card">
        <p className="ad-label">Advertisement</p>
        {/* PRODUCTION: replace this placeholder with the AdMob interstitial /
            rewarded unit. Native: react-native-google-mobile-ads. Web: AdSense
            H5 games unit. This slot fires after every 3rd completed level and
            never during gameplay. Premium users never reach this component. */}
        <div className="ad-slot">
          <Mascot mood="think" size={72} />
          <p>Your ad appears here.<br /><small>Tigo takes a tiny stretch break 🧘</small></p>
        </div>
        <button className="btn btn-primary" disabled={wait > 0} onClick={() => { sfx.tap(); dispatch({ type: 'dismiss-ad' }) }}>
          {wait > 0 ? `Continue in ${wait}…` : 'Continue →'}
        </button>
        <button className="btn btn-ghost" onClick={() => { sfx.tap(); dispatch({ type: 'nav', screen: 'premium' }); dispatch({ type: 'dismiss-ad' }) }}>
          Remove ads forever — ₹100 ✨
        </button>
      </div>
    </div>
  )
}

// --- Shop ------------------------------------------------------------------------------------------

export function Shop() {
  const { state, dispatch } = useStore()
  const p = state.profile

  // currency: 'coin' spends 🪙, 'gem' spends 💎
  const Item = ({ kind, item, price, currency }: { kind: 'avatar' | 'hat'; item: string; price: number; currency: 'coin' | 'gem' }) => {
    const owned = (kind === 'avatar' ? p.ownedAvatars : p.ownedHats).includes(item)
    const wearing = (kind === 'avatar' ? p.avatar : p.hat) === item
    const premiumOnly = (kind === 'avatar' ? PREMIUM_AVATARS : PREMIUM_HATS).includes(item)
    const balance = currency === 'gem' ? p.diamonds : p.coins
    const buy = () => {
      sfx.tap()
      if (premiumOnly && !p.premium && !owned) { dispatch({ type: 'nav', screen: 'premium' }); return }
      if (owned) { dispatch({ type: kind === 'avatar' ? 'wear-avatar' : 'wear-hat', item }); return }
      if (balance >= price) {
        sfx.coin()
        if (currency === 'gem') dispatch({ type: kind === 'avatar' ? 'buy-avatar-gem' : 'buy-hat-gem', item })
        else dispatch({ type: kind === 'avatar' ? 'buy-avatar' : 'buy-hat', item })
      } else sfx.bad()
    }
    const label = wearing ? 'Wearing ✓' : owned ? 'Wear'
      : premiumOnly && !p.premium ? '✨ Premium'
      : price === 0 ? 'Free' : `${currency === 'gem' ? '💎' : '🪙'} ${price}`
    return (
      <button className={`shop-item ${wearing ? 'is-wearing' : ''} ${currency === 'gem' ? 'is-gem' : ''}`} onClick={buy}>
        <span className="shop-emoji">{item}</span>
        <span className="shop-price">{label}</span>
      </button>
    )
  }
  return (
    <div className="screen">
      <Hud />
      <TitleBar title="Shop 🛍️" />
      <p className="shop-balance">You have <UiIcon name="coin" emoji="🪙" size={18} alt="coins" /> {p.coins} · <UiIcon name="gem" emoji="💎" size={18} alt="diamonds" /> {p.diamonds}</p>
      <div className="econ-note">
        <span><UiIcon name="coin" emoji="🪙" size={16} /> <b>Coins</b> buy avatars &amp; hats — earn them by finishing levels, daily bonus &amp; the spin wheel.</span>
        <span><UiIcon name="gem" emoji="💎" size={16} /> <b>Diamonds</b> unlock tricky levels and buy exclusive Gem items — earn them from milestone levels &amp; daily rewards.</span>
      </div>
      <h2 className="section-title">Avatars</h2>
      <div className="shop-grid">{AVATARS.map(a => <Item key={a} kind="avatar" item={a} price={AVATAR_PRICES[a]} currency="coin" />)}</div>
      <h2 className="section-title">Hats</h2>
      <div className="shop-grid">{HATS.map(h => <Item key={h} kind="hat" item={h} price={HAT_PRICES[h]} currency="coin" />)}</div>
      <h2 className="section-title">💎 Gem Shop <small>exclusive · buy with diamonds</small></h2>
      <div className="shop-grid">
        {GEM_AVATARS.map(a => <Item key={a} kind="avatar" item={a} price={GEM_AVATAR_PRICES[a]} currency="gem" />)}
        {GEM_HATS.map(h => <Item key={h} kind="hat" item={h} price={GEM_HAT_PRICES[h]} currency="gem" />)}
      </div>
    </div>
  )
}

// --- Daily rewards ---------------------------------------------------------------------------------------

const WHEEL = [20, 50, 30, 80, 40, 120, 25, 60]

export function Daily() {
  const { state, dispatch } = useStore()
  const p = state.profile
  const today = new Date().toISOString().slice(0, 10)
  const bonusDone = p.dailyBonusDate === today
  const spinDone = p.spinDate === today
  const [spinning, setSpinning] = useState(false)
  const [won, setWon] = useState<number | null>(null)

  const spin = () => {
    if (spinDone || spinning) return
    sfx.tap(); setSpinning(true)
    const prize = WHEEL[Math.floor(Math.random() * WHEEL.length)]
    setTimeout(() => { setSpinning(false); setWon(prize); sfx.coin(); dispatch({ type: 'spin', coins: prize }) }, 1600)
  }

  return (
    <div className="screen">
      <Hud />
      <TitleBar title="Daily Rewards 🎁" />
      <div className="daily-card">
        <h2 className="section-title"><UiIcon name="flame" emoji="🔥" size={22} alt="streak" /> Streak: {p.streak} day{p.streak === 1 ? '' : 's'}</h2>
        <p className="game-meta">Play every day to keep your streak growing!</p>
      </div>
      <div className="daily-card">
        <h2 className="section-title"><UiIcon name="gift" emoji="🎁" size={22} /> Daily bonus</h2>
        <button className="btn btn-primary btn-big" disabled={bonusDone} onClick={() => { sfx.coin(); dispatch({ type: 'claim-daily' }) }}>
          {bonusDone ? 'Claimed today ✓' : <>Claim <UiIcon name="coin" emoji="🪙" size={18} alt="coins" /> 40 + <UiIcon name="gem" emoji="💎" size={18} alt="diamonds" /> {p.premium ? 2 : 1}{p.premium ? ' (premium!)' : ''}</>}
        </button>
      </div>
      <div className="daily-card">
        <h2 className="section-title"><UiIcon name="wheel" emoji="🎡" size={22} /> Lucky spin</h2>
        <div className={`wheel ${spinning ? 'is-spinning' : ''}`} aria-hidden="true"><UiIcon name="wheel" emoji="🎡" size={72} /></div>
        {won !== null && <p className="reward-praise">You won <UiIcon name="coin" emoji="🪙" size={20} alt="coins" /> {won}!</p>}
        <button className="btn btn-primary" disabled={spinDone || spinning} onClick={spin}>
          {spinDone ? 'Come back tomorrow!' : spinning ? 'Spinning…' : 'Spin! 🎉'}
        </button>
      </div>
    </div>
  )
}

// --- Parent dashboard ---------------------------------------------------------------------------------------

export function Parents() {
  const { state, dispatch } = useStore()
  const p = state.profile
  const [unlockInput, setUnlockInput] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const gate = 7 * 3 // simple parental gate: a math question adults answer instantly

  if (!unlocked) {
    return (
      <div className="screen">
        <Hud /><TitleBar title="For Parents 👨‍👩‍👧" />
        <div className="daily-card">
          <p className="prompt-text">Parental gate: what is 7 × 3?</p>
          <div className="gate-row">
            <input className="gate-input" inputMode="numeric" value={unlockInput} onChange={e => setUnlockInput(e.target.value)} aria-label="answer" />
            <button className="btn btn-primary" onClick={() => Number(unlockInput) === gate ? setUnlocked(true) : sfx.bad()}>Open</button>
          </div>
        </div>
      </div>
    )
  }

  const days = p.days.slice(-7)
  const maxSec = Math.max(60, ...days.map(d => d.seconds))
  const totalLevels = Object.keys(p.starsByLevel).length
  const skillRows = (Object.entries(p.skills) as [Skill, { plays: number; totalAccuracy: number }][])
    .map(([k, v]) => ({ skill: k, avg: v.plays ? v.totalAccuracy / v.plays : 0, plays: v.plays }))
    .sort((a, b) => b.avg - a.avg)

  return (
    <div className="screen">
      <Hud />
      <TitleBar title="For Parents 👨‍👩‍👧" />
      <div className="daily-card">
        <h2 className="section-title">This week's play time</h2>
        <div className="bar-chart" role="img" aria-label="daily play time bar chart">
          {days.length === 0 && <p className="game-meta">No sessions yet — the chart fills in as your child plays.</p>}
          {days.map(d => (
            <div key={d.date} className="bar-col">
              <div className="bar" style={{ height: `${Math.max(6, (d.seconds / maxSec) * 100)}%` }} title={`${Math.round(d.seconds / 60)} min`} />
              <small>{d.date.slice(5)}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="daily-card">
        <h2 className="section-title">Learning score by skill</h2>
        {skillRows.length === 0 && <p className="game-meta">Skill scores appear after the first few levels.</p>}
        {skillRows.map(r => (
          <div key={r.skill} className="skill-row">
            <span className="skill-name">{SKILL_LABEL[r.skill]}</span>
            <div className="skill-track"><div className="skill-fill" style={{ width: `${Math.round(r.avg * 100)}%` }} /></div>
            <span className="skill-pct">{Math.round(r.avg * 100)}%</span>
          </div>
        ))}
      </div>
      <div className="daily-card stat-grid">
        <div><strong>{totalLevels}</strong><small>levels completed</small></div>
        <div><strong>{Object.values(p.starsByLevel).reduce((a, b) => a + b, 0)}</strong><small>stars earned</small></div>
        <div><strong>{p.coins}</strong><small>coins</small></div>
        <div><strong>{p.streak}</strong><small>day streak</small></div>
      </div>
      <div className="daily-card">
        <h2 className="section-title">Child's name</h2>
        <div className="gate-row">
          <input className="gate-input" value={p.name} onChange={e => dispatch({ type: 'set-name', name: e.target.value })} aria-label="child name" />
        </div>
      </div>
    </div>
  )
}

// --- Settings ------------------------------------------------------------------------------------------------------

async function shareApp() {
  sfx.tap()
  const url = typeof location !== 'undefined' ? location.origin : ''
  const data = { title: BRAND.appName, text: SHARE_TEXT, url }
  // Native Android: use the real system share sheet via Capacitor.
  if (Capacitor.isNativePlatform()) {
    try {
      const { Share } = await import('@capacitor/share')
      await Share.share({ title: BRAND.appName, text: SHARE_TEXT, url, dialogTitle: 'Share Brain Booster Kids' })
      return
    } catch { return }
  }
  try {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      await (navigator as any).share(data)
      return
    }
  } catch { return /* user dismissed the native sheet */ }
  // Fallback for browsers without the Web Share API: copy, else open WhatsApp.
  try {
    await navigator.clipboard?.writeText(`${SHARE_TEXT} ${url}`)
    alert('Share text copied — paste it to your friends! 🎉')
  } catch {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${url}`)}`, '_blank', 'noopener')
  }
}

// --- Cloud Sync (settings section) --------------------------------------------

// Provider presentation — copy per the Identity platform spec. `brand` maps to
// a BrandIcon SVG; `desc` is the one-line benefit shown under the CTA.
const AUTH_PROVIDERS: { key: SyncProvider; brand: string; title: string; desc: string }[] = [
  { key: 'google',   brand: 'google',   title: 'Continue with Google',   desc: 'Sync progress across all devices' },
  { key: 'facebook', brand: 'facebook', title: 'Continue with Facebook', desc: 'Play with friends' },
  { key: 'apple',    brand: 'apple',    title: 'Continue with Apple',    desc: 'Private & secure login' },
  { key: 'guest',    brand: 'guest',    title: 'Play Offline',           desc: 'Your progress stays on this device' },
]
const SYNC_BENEFITS = ['Cloud Backup', 'Cross-device Sync', 'Restore Purchases', 'Secure Login']

function CloudSync() {
  const { state } = useStore()
  const [sync, setSync] = useState(() => loadSyncState())
  const [busy, setBusy] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)   // provider that just succeeded → success check
  const run = async (name: string, fn: () => Promise<SyncState>) => {
    sfx.tap(); setBusy(name)
    try {
      const next = await fn()
      setSync(next)
      if (!next.lastError) { setDone(name); sfx.tap(); setTimeout(() => setDone(null), 1400) }
    } finally { setBusy(null) }
  }
  const lastSync = sync.lastSyncAt ? new Date(sync.lastSyncAt).toLocaleString() : 'Never'

  // Signed-in view: account summary + backup/restore/auto-sync controls.
  if (sync.account) {
    return (
      <>
        <h2 className="section-title">☁️ Cloud Sync</h2>
        <div className="auth-signed">
          <span className="auth-signed-badge"><BrandIcon brand={sync.account.provider} /></span>
          <div className="auth-signed-body">
            <strong>{sync.account.displayName}</strong>
            <small>Signed in with {syncLabel(sync.account.provider)}</small>
          </div>
          <button className="auth-signout" onClick={() => run('signout', () => disconnect())}>Sign out</button>
        </div>
        <div className="daily-card">
          <div className="settings-actions">
            <button className="btn btn-primary settings-action" disabled={busy === 'backup'}
              onClick={() => run('backup', () => backupNow({ profile: state.profile, settings: state.settings }))}>
              {busy === 'backup' ? '⏳ Backing up…' : done === 'backup' ? '✅ Backed up!' : '⬆️ Backup Now'}
            </button>
            <button className="btn btn-ghost settings-action" disabled={busy === 'restore'}
              onClick={() => run('restore', async () => (await restoreProgress()).state)}>
              {busy === 'restore' ? '⏳ Restoring…' : done === 'restore' ? '✅ Restored!' : '⬇️ Restore Progress'}
            </button>
          </div>
          <p className="game-meta" style={{ textAlign: 'left' }}>Last sync: {lastSync}</p>
          <button className={`toggle-row ${sync.autoSync ? 'is-on' : ''}`} role="switch" aria-checked={sync.autoSync}
            onClick={() => { sfx.tap(); setSync(setAutoSync(!sync.autoSync)) }}>
            <span><strong>🔄 Automatic Sync</strong><br /><small>Back up in the background as you play</small></span>
            <span className="toggle-pill">{sync.autoSync ? 'On' : 'Off'}</span>
          </button>
          {sync.lastError && <p className="spell-error" style={{ margin: '4px 0 0' }}>⚠️ {sync.lastError}</p>}
        </div>
      </>
    )
  }

  // Signed-out view: the premium sign-in hero.
  return (
    <>
      <h2 className="section-title">☁️ Cloud Sync</h2>
      <div className="auth-hero">
        <div className="auth-hero-head">
          <span className="auth-hero-emoji">🎮</span>
          <h3>Save your adventure</h3>
          <p>Sign in to keep your progress safe and play across all your devices.</p>
        </div>
        <div className="auth-list">
          {AUTH_PROVIDERS.map(p => {
            const soon = p.key !== 'guest' && !providerConfigured(p.key)
            return (
              <button key={p.key} className={`auth-provider auth-${p.key}`} disabled={!!busy}
                aria-label={p.title} onClick={() => run(p.key, () => connect(p.key))}>
                <span className="auth-provider-logo"><BrandIcon brand={p.brand === 'guest' ? '' : p.brand} />{p.brand === 'guest' && <span className="auth-guest-glyph">👤</span>}</span>
                <span className="auth-provider-text">
                  <strong>{p.title}</strong>
                  <small>{p.desc}</small>
                </span>
                <span className="auth-provider-state">
                  {busy === p.key ? <span className="auth-spinner" aria-hidden="true" />
                    : done === p.key ? <span className="auth-check" aria-hidden="true">✓</span>
                    : soon ? <span className="auth-soon">Soon</span>
                    : <span className="auth-chevron" aria-hidden="true">›</span>}
                </span>
              </button>
            )
          })}
        </div>
        <ul className="auth-benefits" aria-label="What you get">
          {SYNC_BENEFITS.map(b => <li key={b}><span className="auth-tick">✔</span>{b}</li>)}
        </ul>
        {sync.lastError && <p className="spell-error auth-error">⚠️ {sync.lastError}</p>}
        <p className="auth-trust">🔒 Secure sign-in · we never post without your permission</p>
      </div>
    </>
  )
}

export function SettingsScreen() {
  const { state, dispatch } = useStore()
  const t = useT()
  const s = state.settings
  const Toggle = ({ k, icon, label, hint }: { k: keyof typeof s; icon: string; label: string; hint: string }) => (
    <button className={`toggle-row ${s[k] ? 'is-on' : ''}`} onClick={() => { sfx.tap(); dispatch({ type: 'set-setting', key: k, value: !s[k] }) }} role="switch" aria-checked={!!s[k]}>
      <span><strong>{icon} {label}</strong><br /><small>{hint}</small></span>
      <span className="toggle-pill">{s[k] ? t('on') : t('off')}</span>
    </button>
  )
  const openUrl = (url: string) => { sfx.tap(); window.open(url, '_blank', 'noopener') }

  return (
    <div className="screen">
      <Hud />
      <TitleBar title={`${t('settings_title')} ⚙️`} />

      {/* Audio */}
      <h2 className="section-title">🔈 {t('audio')}</h2>
      <Toggle k="music" icon="🎵" label={t('music')} hint="Adventure themes for each world" />
      <div className={`slider-row ${s.music ? '' : 'is-off'}`}>
        <span>🎚️ Music volume</span>
        <input type="range" min={0} max={100} value={Math.round(s.musicVolume * 100)} aria-label="Music volume"
          onChange={e => dispatch({ type: 'set-setting', key: 'musicVolume', value: Number(e.target.value) / 100 })} />
        <b>{Math.round(s.musicVolume * 100)}</b>
      </div>
      <Toggle k="sound" icon="🔊" label={t('sound_effects')} hint="Taps and answer sounds" />
      <div className={`slider-row ${s.sound ? '' : 'is-off'}`}>
        <span>🎚️ Sound FX volume</span>
        <input type="range" min={0} max={100} value={Math.round(s.sfxVolume * 100)} aria-label="Sound effects volume"
          onChange={e => dispatch({ type: 'set-setting', key: 'sfxVolume', value: Number(e.target.value) / 100 })} />
        <b>{Math.round(s.sfxVolume * 100)}</b>
      </div>
      <Toggle k="voice" icon="🗣️" label={t('voice_instructions')} hint="Each world's narrator reads questions out loud" />
      <Toggle k="celebration" icon="🎉" label={t('celebration_sounds')} hint="Win fanfare and coin jingles" />
      <Toggle k="notifications" icon="🔔" label={t('notifications')} hint="Daily play reminders and streak nudges" />

      {/* Accessibility */}
      <h2 className="section-title">♿ Accessibility</h2>
      <Toggle k="colorBlind" icon="🎨" label={t('colorblind')} hint="Adds shapes to color games" />
      <Toggle k="bigButtons" icon="🔘" label={t('big_buttons')} hint="Bigger targets for small hands" />

      {/* Cloud account synchronization */}
      <CloudSync />

      {/* Language */}
      <h2 className="section-title">🌐 {t('language')}</h2>
      <div className="lang-grid">
        {LANGUAGES.map(l => (
          <button key={l.code}
            className={`lang-btn ${s.language === l.code ? 'is-active' : ''}`}
            aria-pressed={s.language === l.code}
            onClick={() => { sfx.tap(); dispatch({ type: 'set-setting', key: 'language', value: l.code }) }}>
            <span className="lang-flag">{l.flag}</span>
            <span className="lang-label">{l.label}</span>
          </button>
        ))}
      </div>

      {/* Support & sharing */}
      <h2 className="section-title">💬 {t('support')}</h2>
      <div className="settings-actions">
        <button className="btn btn-primary btn-big settings-action" onClick={() => { sfx.tap(); window.location.href = supportMailto() }}>✉️ {t('contact_support')}</button>
        <button className="btn btn-ghost btn-big settings-action" onClick={shareApp}>📤 {t('share_btn')}</button>
      </div>

      {/* Follow us */}
      <h2 className="section-title">❤️ {t('follow_us')}</h2>
      <div className="social-grid">
        {SOCIAL_LINKS.map(link => (
          <button key={link.key} className="social-card" aria-label={`${link.label} — ${link.cta}`}
            style={{ ['--brand' as string]: link.color }} onClick={() => openUrl(link.url)}>
            <span className="social-card-icon"><BrandIcon brand={link.key} /></span>
            <span className="social-card-text">
              <strong>{link.label}</strong>
              <small>{link.cta}</small>
            </span>
            <span className="social-card-ext" aria-hidden="true">↗</span>
          </button>
        ))}
      </div>

      {/* Legal */}
      <h2 className="section-title">📜 {t('legal')}</h2>
      <div className="settings-actions">
        <button className="btn btn-ghost settings-action" onClick={() => openUrl(LEGAL_LINKS.privacy)}>{t('privacy_policy')} ↗</button>
        <button className="btn btn-ghost settings-action" onClick={() => openUrl(LEGAL_LINKS.terms)}>{t('terms_of_use')} ↗</button>
      </div>

      {/* About / branding */}
      <div className="about-card">
        <Mascot mood="happy" size={64} />
        <strong>🧠 {BRAND.appName}</strong>
        <small>{BRAND.createdBy}</small>
        <small className="about-copyright">{BRAND.copyright}</small>
      </div>
    </div>
  )
}

// --- Premium ---------------------------------------------------------------------------------------------------------

export function Premium() {
  const { state, dispatch } = useStore()
  const p = state.profile
  const [paying, setPaying] = useState(false)
  const buy = () => {
    // PRODUCTION: this hands off to the platform checkout —
    //  Web:     Razorpay Checkout → server verifies signature (server/src/routes/payments.js)
    //  Android: Google Play Billing (react-native-iap)
    //  iOS:     Apple In-App Purchase (react-native-iap)
    // The entitlement is granted only after server-side verification.
    setPaying(true)
    setTimeout(() => { setPaying(false); sfx.fanfare(); dispatch({ type: 'buy-premium' }) }, 1200)
  }
  return (
    <div className="screen">
      <Hud />
      <TitleBar title="Premium ✨" />
      <div className="premium-card">
        <Mascot mood="cheer" size={90} />
        {p.premium ? (
          <>
            <h2 className="premium-title">You are Premium! 👑</h2>
            <p className="game-meta">No ads · exclusive avatars · +50% coins · +25% XP · extra daily diamonds.</p>
          </>
        ) : (
          <>
            <h2 className="premium-title">Go Premium — ₹100</h2>
            <p className="premium-sub">One-time payment. Forever yours.</p>
            <ul className="premium-list">
              <li><EmojiImg emoji="🚫" size={16} /> Zero advertisements</li>
              <li><EmojiImg emoji="🤖" size={16} /> Exclusive avatar &amp; crown</li>
              <li><UiIcon name="coin" emoji="🪙" size={16} /> +50% coins on every level</li>
              <li><UiIcon name="xp" emoji="✨" size={16} /> +25% XP — level up faster</li>
              <li><UiIcon name="gem" emoji="💎" size={16} /> Double daily diamonds</li>
            </ul>
            <button className="btn btn-primary btn-big" disabled={paying} onClick={buy}>
              {paying ? 'Opening secure checkout…' : 'Upgrade for ₹100'}
            </button>
            <p className="premium-note">Payments are handled by Razorpay / Google Play / App Store. Parents complete the purchase.</p>
          </>
        )}
      </div>
    </div>
  )
}
