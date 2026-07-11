import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import { PUBLIC_CONFIG } from './config'
import { configureAuth, signInGuest } from './state/auth'
import { configureAnalytics, trackAppStart, trackNavigation, trackError, flush } from './state/analytics'

const API_BASE = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE || ''

// Identity: point the auth client at the configured backend and ensure a session
// exists (restored from storage, or a fresh guest — offline-safe). See ADR-0018.
configureAuth({ apiBase: API_BASE })
void PUBLIC_CONFIG // config is the single source of truth for the API origin
void signInGuest().catch(() => { /* never block launch on identity */ })

// Analytics: provider-agnostic product event collection. The app depends on THIS,
// never on Firebase. Auto-track app start, navigation, errors, and flush on unload.
// Disable with VITE_ANALYTICS_ENABLED=false (privacy). See ADR-0022 / docs/ANALYTICS.md.
const analyticsEnabled = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ANALYTICS_ENABLED !== 'false'
configureAnalytics({ apiBase: API_BASE, enabled: analyticsEnabled })
if (analyticsEnabled) {
  trackAppStart()
  const w = window as unknown as { addEventListener: (t: string, f: (e: unknown) => void) => void; location: { pathname: string; hash: string } }
  const currentScreen = () => w.location.hash || w.location.pathname || '/'
  w.addEventListener('popstate', () => trackNavigation(currentScreen()))
  w.addEventListener('hashchange', () => trackNavigation(currentScreen()))
  w.addEventListener('error', (e) => trackError((e as { message?: string })?.message ?? 'error', true))
  w.addEventListener('unhandledrejection', () => trackError('unhandledrejection', true))
  w.addEventListener('beforeunload', () => { void flush() })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
