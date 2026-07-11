// ---------------------------------------------------------------------------
// Brain Booster Kids — app configuration (EtricksGames)
// Branding, support, social and legal links. These are seeded with sensible
// defaults and then OVERRIDDEN at runtime by the server content document (see
// contentService.applyServerConfig) so everything can be changed server-side
// without shipping a new app build.
// ---------------------------------------------------------------------------

export const BRAND = {
  appName: 'Brain Booster Kids',
  studio: 'EtricksGames',
  // The cross-game player account / cloud-save identity, à la "Supercell ID".
  // One etricksEmpire ID carries a child's progress across every EtricksGames title.
  id: 'etricksEmpire ID',
  createdBy: 'An EtricksGames Production',
  copyright: '© 2026 EtricksGames. All Rights Reserved.',
  supportEmail: 'support@etricksgames.com',
  supportSubject: 'Brain Booster Kids Support',
}

export let SHARE_TEXT =
  'My kids are enjoying Brain Booster Kids by EtricksGames! It has fun puzzles, ' +
  'memory games, riddles, stories, and brain activities. Download it and let your ' +
  'child learn while having fun!'

// Public client configuration. Only NON-SECRET values ever reach the client —
// secrets (OAuth client secrets, JWT/session keys, private keys) live solely on
// the server (see docs/IDENTITY_PLATFORM.md). These are read from Vite's
// build-time env (import.meta.env, VITE_-prefixed = intentionally public) with
// safe defaults, then further overridable at runtime by the server content doc.
const ENV = (import.meta as unknown as { env?: Record<string, string> }).env ?? {}
export const PUBLIC_CONFIG = {
  // Reuses the app-wide VITE_API_BASE origin (see contentService) so there is one
  // source of truth; empty origin = same-origin '/api'.
  apiBaseUrl: (ENV.VITE_API_BASE || '') + '/api',
  cdnBaseUrl: ENV.VITE_CDN_BASE_URL || '',
  // Public OAuth client IDs are safe to ship (the *secret* is not); empty = that
  // provider is not configured yet and the UI shows "coming soon" instead of a
  // broken flow.
  googleClientId: ENV.VITE_GOOGLE_CLIENT_ID || '',
  facebookAppId: ENV.VITE_FACEBOOK_APP_ID || '',
  appleClientId: ENV.VITE_APPLE_CLIENT_ID || '',
}

/** Whether a real OAuth flow is provisioned for a provider (public id present). */
export function providerConfigured(p: string): boolean {
  return p === 'google' ? !!PUBLIC_CONFIG.googleClientId
    : p === 'facebook' ? !!PUBLIC_CONFIG.facebookAppId
    : p === 'apple' ? !!PUBLIC_CONFIG.appleClientId
    : p === 'guest'
}

// Configurable — updated from the server content doc; edit there (or here) to
// point at the real EtricksGames handles. `cta` and `color` drive the premium
// social cards; both are remote-overridable so marketing can retune without a
// new app build.
export interface SocialLink { key: string; label: string; icon: string; url: string; cta: string; color: string }
export const SOCIAL_LINKS: SocialLink[] = [
  { key: 'youtube',   label: 'YouTube',   icon: '▶️', cta: 'Watch new videos',    color: '#FF0000', url: 'https://www.youtube.com/@EtricksGames' },
  { key: 'instagram', label: 'Instagram', icon: '📸', cta: 'Behind the scenes',   color: '#D62976', url: 'https://www.instagram.com/etricksgames' },
  { key: 'tiktok',    label: 'TikTok',    icon: '🎵', cta: 'Fun challenges',       color: '#010101', url: 'https://www.tiktok.com/@etricksgames' },
  { key: 'facebook',  label: 'Facebook',  icon: '👍', cta: 'Join our community',   color: '#1877F2', url: 'https://www.facebook.com/etricksgames' },
]

export const LEGAL_LINKS = {
  privacy: 'https://etricksgames.com/brain-booster-kids/privacy',
  terms: 'https://etricksgames.com/brain-booster-kids/terms',
}

/** Shape of the `branding` block inside the server content document. */
export interface ServerBranding {
  appName?: string
  studio?: string
  supportEmail?: string
  shareText?: string
  // key -> url (compact form) OR { url, cta, color } (full form). Both let the
  // server retune social cards with no app rebuild.
  social?: Partial<Record<string, string | { url?: string; cta?: string; color?: string }>>
  legal?: { privacy?: string; terms?: string }
}

/** Applies server-provided branding overrides in place so every importer of
 *  BRAND / SOCIAL_LINKS / LEGAL_LINKS immediately sees the new values. */
export function applyServerConfig(b?: ServerBranding) {
  if (!b) return
  if (b.appName) BRAND.appName = b.appName
  if (b.studio) {
    BRAND.studio = b.studio
    BRAND.createdBy = `An ${b.studio} Production`
    BRAND.copyright = `© 2026 ${b.studio}. All Rights Reserved.`
  }
  if (b.supportEmail) BRAND.supportEmail = b.supportEmail
  if (b.shareText) SHARE_TEXT = b.shareText
  if (b.social) {
    for (const link of SOCIAL_LINKS) {
      const v = b.social[link.key]
      if (!v) continue
      if (typeof v === 'string') link.url = v
      else {
        if (v.url) link.url = v.url
        if (v.cta) link.cta = v.cta
        if (v.color) link.color = v.color
      }
    }
  }
  if (b.legal?.privacy) LEGAL_LINKS.privacy = b.legal.privacy
  if (b.legal?.terms) LEGAL_LINKS.terms = b.legal.terms
}

/** Builds a mailto: link to support, pre-filled with a subject and optional
 *  device/app diagnostics that help the team reproduce issues. */
export function supportMailto(): string {
  const body =
    `\n\n\n--- Please describe your issue above this line ---\n` +
    `App: ${BRAND.appName} (${BRAND.studio}) v1.0.0\n` +
    (typeof navigator !== 'undefined' ? `Device: ${navigator.userAgent}\n` : '') +
    (typeof navigator !== 'undefined' && navigator.language ? `Language: ${navigator.language}\n` : '')
  return `mailto:${BRAND.supportEmail}?subject=${encodeURIComponent(BRAND.supportSubject)}&body=${encodeURIComponent(body)}`
}
