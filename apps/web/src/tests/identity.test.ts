// ---------------------------------------------------------------------------
// Identity & Community platform — configuration + auth + cloud-save gate
//
// Verifies the REUSABLE identity layer's logic without a live backend: public
// config never leaks secrets, social links are valid & remote-overridable,
// provider gating is correct, Guest login works fully offline, and cloud-save
// operations guard-rail correctly. OAuth network flows (Google/Facebook/Apple)
// need provisioned apps + the server and are covered by the server suite;
// here we prove the client contract and offline-first fallbacks.
// ---------------------------------------------------------------------------
import { describe, it, expect, beforeEach } from 'vitest'

// Minimal localStorage shim so the offline-first sync module persists across
// calls exactly as it does in a browser (node test env has no localStorage).
const store = new Map<string, string>()
;(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: () => null, length: 0,
} as Storage
beforeEach(() => store.clear())
import {
  SOCIAL_LINKS, LEGAL_LINKS, PUBLIC_CONFIG, providerConfigured,
  applyServerConfig, BRAND,
} from '../config'
import { connect, disconnect, backupNow, restoreProgress, loadSyncState, label } from '../state/cloudSync'

const isHttps = (u: string) => /^https:\/\/[^ ]+\.[^ ]+/.test(u)
const isHex = (c: string) => /^#[0-9a-fA-F]{6}$/.test(c)

describe('Public client config never carries secrets (Part 3/7)', () => {
  it('exposes only public, non-secret values', () => {
    const json = JSON.stringify(PUBLIC_CONFIG).toLowerCase()
    for (const banned of ['secret', 'private', 'password', 'jwt', 'apikey', 'api_key']) {
      expect(json.includes(banned), `public config must not contain "${banned}"`).toBe(false)
    }
  })
  it('has an API base and safe defaults', () => {
    expect(PUBLIC_CONFIG.apiBaseUrl).toBeTruthy()
  })
})

describe('Social links are valid and remote-overridable (Part 2/4)', () => {
  it('every social card has key, https url, CTA and a hex brand colour', () => {
    expect(SOCIAL_LINKS.length).toBeGreaterThanOrEqual(4)
    for (const l of SOCIAL_LINKS) {
      expect(isHttps(l.url), `${l.key} url is https`).toBe(true)
      expect(l.cta.length, `${l.key} has a CTA`).toBeGreaterThan(2)
      expect(isHex(l.color), `${l.key} colour is hex`).toBe(true)
    }
  })
  it('legal links are valid https', () => {
    expect(isHttps(LEGAL_LINKS.privacy)).toBe(true)
    expect(isHttps(LEGAL_LINKS.terms)).toBe(true)
  })
  it('a server config update changes a social url/cta/color WITHOUT an app rebuild', () => {
    applyServerConfig({ social: { youtube: { url: 'https://youtube.com/@new', cta: 'New shows!', color: '#123456' } } })
    const yt = SOCIAL_LINKS.find(l => l.key === 'youtube')!
    expect(yt.url).toBe('https://youtube.com/@new')
    expect(yt.cta).toBe('New shows!')
    expect(yt.color).toBe('#123456')
  })
  it('accepts the compact string (url-only) override form too', () => {
    applyServerConfig({ social: { instagram: 'https://instagram.com/etricks2' } })
    expect(SOCIAL_LINKS.find(l => l.key === 'instagram')!.url).toBe('https://instagram.com/etricks2')
  })
  it('applies branding overrides (studio, support) at runtime', () => {
    applyServerConfig({ studio: 'etricksGames' })
    expect(BRAND.studio).toBe('etricksGames')
    expect(BRAND.createdBy).toContain('etricksGames')
  })
})

describe('Provider gating (Part 5)', () => {
  it('guest is always available; unconfigured OAuth providers are gated off', () => {
    expect(providerConfigured('guest')).toBe(true)
    // No VITE_*_CLIENT_ID in the test env → not configured (UI shows "Soon").
    expect(providerConfigured('google')).toBe(PUBLIC_CONFIG.googleClientId !== '')
    expect(providerConfigured('facebook')).toBe(PUBLIC_CONFIG.facebookAppId !== '')
    expect(providerConfigured('apple')).toBe(PUBLIC_CONFIG.appleClientId !== '')
  })
  it('exposes a human label for every provider', () => {
    expect(label('google')).toBe('Google')
    expect(label('guest')).toBe('Guest')
  })
})

describe('Guest login works fully offline (Part 5/6/8)', () => {
  it('connecting as guest returns a guest account with no error', async () => {
    const s = await connect('guest')
    expect(s.account?.provider).toBe('guest')
    expect(s.lastError).toBeNull()
  })
  it('an unconfigured OAuth provider fails gracefully (no crash, clear message)', async () => {
    const s = await connect('google')
    expect(s.account).toBeNull()
    expect(s.lastError).toMatch(/set up|coming soon/i)
  })
  it('disconnect clears the account', async () => {
    await connect('guest')
    const s = await disconnect()
    expect(s.account).toBeNull()
  })
})

describe('Cloud-save guard-rails (Part 6)', () => {
  it('backup without an account tells the user to connect', async () => {
    await disconnect()
    const s = await backupNow({ any: 1 })
    expect(s.lastError).toMatch(/connect/i)
  })
  it('guest backup explains it is device-only (no silent no-op)', async () => {
    await connect('guest')
    const s = await backupNow({ any: 1 })
    expect(s.lastError).toMatch(/device/i)
  })
  it('restore without an account guard-rails instead of throwing', async () => {
    await disconnect()
    const { snapshot } = await restoreProgress()
    expect(snapshot).toBeNull()
  })
})

describe('Offline-first fallback (Part 8)', () => {
  it('loadSyncState always returns a usable default and never a stale error', () => {
    const s = loadSyncState()
    expect(s).toHaveProperty('autoSync')
    expect(s.lastError).toBeNull()
  })
})
