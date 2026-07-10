import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  StoreProvider, useStore, unlockedMax, startMusic, stopMusic,
  setMusicVolume, setSfxVolume, setMusicWorld,
} from './state/store'
import { worldForLevel } from './data/worlds'
import { themeFor } from './theme'
import { setNarratorForWorld } from './state/narrator'
import { loadContent, hydrateActivities, prefetchActivities } from './contentService'
import { Capacitor } from '@capacitor/core'

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
  useBackgroundMusic(state.settings.music)

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
    <div className={`app-shell ${big ? 'big-buttons' : ''} ${inGame ? 'in-game' : ''}`}>
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

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
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
      {(showSplash || !ready) && <Splash onDone={() => setShowSplash(false)} />}
      {ready && <Router />}
    </StoreProvider>
  )
}
