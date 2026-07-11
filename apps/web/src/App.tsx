import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  StoreProvider, useStore, unlockedMax, startMusic, stopMusic,
  setMusicVolume, setSfxVolume, setMusicWorld, accessibilityClass,
} from './state/store'
import { worldForLevel } from './data/worlds'
import { themeFor } from './theme'
import { setNarratorForWorld } from './state/narrator'
import { loadContent, hydrateActivities, prefetchActivities } from './contentService'
import { Capacitor } from '@capacitor/core'
// Launch splash art — sourced directly from apps/web/assets (bundled by Vite):
// splash.png = eTricks Games studio logo, logo.png = Brain Booster game logo.
import egLogo from '../assets/splash.png'
import bbLogo from '../assets/logo.png'

// Native (Android) niceties: hand off from the native splash to the app and
// tint the status bar. No-ops on the web.
function useNativeShell() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    import('@capacitor/splash-screen').then(({ SplashScreen }) => SplashScreen.hide().catch(() => {})).catch(() => {})
    import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
      StatusBar.setBackgroundColor({ color: '#efe9fb' }).catch(() => {})
    }).catch(() => {})
  }, [])
}
import {
  Home, LevelMap, Play, Reward, FactScreen, Shop, Parents, SettingsScreen, Premium, Daily,
  AdBreak, Splash, Decor, BannerAd,
} from './components/screens'

// Plays the cheerful background loop whenever the Music setting is on. Browsers
// block audio until the child first taps, so we also arm a one-time gesture.
function useBackgroundMusic(enabled: boolean) {
  useEffect(() => {
    if (!enabled) { stopMusic(); return }
    startMusic() // works instantly if the audio context is already unlocked
    const kick = () => startMusic()
    window.addEventListener('pointerdown', kick, { once: true })
    return () => window.removeEventListener('pointerdown', kick)
  }, [enabled])
}

function Router() {
  const { state } = useStore()
  const big = state.settings.bigButtons
  const a11y = accessibilityClass(state.settings)
  useBackgroundMusic(state.settings.music)

  // Screen readers announce content in the child's chosen language.
  useEffect(() => { document.documentElement.lang = state.settings.language }, [state.settings.language])

  // Live volume knobs.
  useEffect(() => { setMusicVolume(state.settings.musicVolume) }, [state.settings.musicVolume])
  useEffect(() => { setSfxVolume(state.settings.sfxVolume) }, [state.settings.sfxVolume])

  // The World Theme Engine drives everything world-specific: music, narrator
  // and the UI palette all follow the world the child is currently in.
  const world = state.activeLevel
    ? worldForLevel(state.activeLevel.id)
    : worldForLevel(unlockedMax(state.profile))
  const theme = useMemo(() => themeFor(world), [world])
  // Crossfade the soundtrack — music never stops abruptly between worlds.
  useEffect(() => { setMusicWorld(theme.music) }, [theme.music])
  // Each region has its own storyteller (friendly male or female narrator).
  useEffect(() => { setNarratorForWorld(world) }, [world.index]) // eslint-disable-line
  // Re-tint the whole interface with the world's palette.
  useEffect(() => {
    const root = document.documentElement.style
    root.setProperty('--sky', theme.sky)
    root.setProperty('--accent', theme.accent)
  }, [theme.sky, theme.accent])
  // Decorative floaties and the banner ad are hidden during focused gameplay so
  // the challenge always stays the primary focus of the screen.
  const inGame = state.screen === 'play'
  return (
    <div className={`app-shell ${big ? 'big-buttons' : ''} ${inGame ? 'in-game' : ''} ${a11y}`}>
      {!inGame && <Decor />}
      {state.screen === 'home' && <Home />}
      {state.screen === 'map' && <LevelMap />}
      {state.screen === 'play' && state.activeLevel && <Play />}
      {state.screen === 'reward' && state.lastReward && <Reward />}
      {state.screen === 'fact' && <FactScreen />}
      {state.screen === 'shop' && <Shop />}
      {state.screen === 'parents' && <Parents />}
      {state.screen === 'settings' && <SettingsScreen />}
      {state.screen === 'premium' && <Premium />}
      {state.screen === 'daily' && <Daily />}
      {state.adBreak && state.screen !== 'play' && state.screen !== 'reward' && state.screen !== 'fact' && <AdBreak />}
      {!inGame && <BannerAd />}
    </div>
  )
}

// One launch splash, two phases: the eTricks Games studio logo ("presents…") then
// the Brain Booster game logo — a single animated sequence, not two screens. It
// holds on the game logo until content is ready, then hands off to the app.
function LaunchSequence({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const [phase, setPhase] = useState<'company' | 'game'>('company')
  const [leaving, setLeaving] = useState(false)

  // Preload the game logo during the company phase so the crossfade never flashes.
  useEffect(() => { const img = new Image(); img.src = bbLogo }, [])

  // Company logo → game logo after a short beat.
  useEffect(() => {
    const t = setTimeout(() => setPhase('game'), 4000)
    return () => clearTimeout(t)
  }, [])

  // On the game logo, leave once content is ready (min dwell 1.5s, hard cap 4.5s).
  useEffect(() => {
    if (phase !== 'game') return
    const t0 = Date.now()
    const id = setInterval(() => {
      const el = Date.now() - t0
      if ((ready && el >= 1500) || el >= 4500) {
        clearInterval(id); setLeaving(true); setTimeout(onDone, 550)
      }
    }, 120)
    return () => clearInterval(id)
  }, [phase, ready, onDone])

  return (
    <div className={`launch ${leaving ? 'is-leaving' : ''}`}>
      <div className="launch-rays" aria-hidden="true" />
      <div className="launch-sparkles" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>
      {phase === 'company' ? (
        <div className="launch-stage" key="company" role="img" aria-label="eTricks Games presents">
          <img className="launch-logo eg" src={egLogo} alt="" draggable={false} />
          <div className="launch-presents">ETRICKS GAMES PRESENTS...</div>
        </div>
      ) : (
        <div className="launch-stage" key="game" role="img" aria-label="Brain Booster">
          <img className="launch-logo bb" src={bbLogo} alt="" draggable={false} />
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [launching, setLaunching] = useState(true)   // the two-phase launch splash
  const [ready, setReady] = useState(false)   // becomes true once server content is applied
  const started = useRef(false)
  useNativeShell()

  useEffect(() => {
    if (started.current) return
    started.current = true
    // Fetch the level/world/branding content from the server while the splash
    // is on screen, so the whole app renders from server-driven data.
    hydrateActivities()   // re-apply activities already downloaded on this device
    loadContent()
      .then(src => console.info(`[content] loaded from: ${src}`))
      .catch(() => { /* defaults already active */ })
      .finally(() => {
        setReady(true)
        // Smart download: pull the first batch of server activities in the
        // background; more are prefetched as the child progresses.
        prefetchActivities().catch(() => {})
      })
  }, [])

  return (
    <StoreProvider>
      {launching && <LaunchSequence ready={ready} onDone={() => setLaunching(false)} />}
      {!launching && <Router />}
    </StoreProvider>
  )
}
