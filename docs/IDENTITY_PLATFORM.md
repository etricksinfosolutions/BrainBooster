# etricksGames Identity & Community Platform

A reusable Identity + Cloud-Save + Community layer intended to serve **every**
etricksGames title (Brain Booster Kids first). No game-specific logic lives in
the identity modules — a game plugs in a snapshot serializer and a config doc.

This document is honest about **what is built and verified** vs **what needs
provisioning** (registered OAuth apps, a running DB), so nobody ships assuming a
flow works when only its seam exists.

---

## Module map (reusable, game-agnostic)

| Concern            | File                                   | Status |
|--------------------|----------------------------------------|--------|
| Public config      | `apps/web/src/config.ts`               | ✅ built |
| Auth providers     | `apps/web/src/state/cloudSync.ts`      | ✅ Guest; 🟡 OAuth seams |
| Cloud save         | `apps/web/src/state/cloudSync.ts` + server `/api/progress` | ✅ backend store; 🟡 client upload wiring |
| Remote config      | `apps/web/src/contentService.ts` + server `/api/content` | ✅ built (file-backed) |
| UI (Cloud Sync)    | `apps/web/src/components/screens.tsx` `CloudSync` | ✅ built |
| UI (Social)        | `screens.tsx` social cards + `BrandIcon` | ✅ built |
| Tests              | `apps/web/src/tests/identity.test.ts`  | ✅ 16 passing |
| Server security    | `server/src/middleware/core.js`, `index.js` | ✅ helmet/CORS/JWT/rate-limit |

## Part 3 & 7 — Configuration & Security

**Secrets never reach the client.** The only client-side config is
`PUBLIC_CONFIG` (API origin, CDN origin, and *public* OAuth client IDs — never
secrets). Enforced by a test that greps the serialized public config for
`secret|private|password|jwt|apikey`.

Server security already in place (verified via source):
- `helmet()`, `x-powered-by` off, 100kb JSON limit.
- CORS allow-list from `CORS_ORIGINS`, `credentials: true`.
- Global rate-limit 120/min + stricter auth limiter 20/15min.
- JWT (HS256) via `JWT_SECRET`; `requireAuth`/`requireAdmin`.
- `zod` body validation; central error handler hides stack traces.
- bcrypt(12) password hashing.

**Env contract** — `apps/web/.env.example` (public, `VITE_`-prefixed) and
`server/.env.example` (secret). Never commit real values.

🟡 **Gaps to close for full Part 7:** refresh-token rotation + short-lived access
tokens (today: single 2h JWT), and secure httpOnly cookie option (today: Bearer
token in storage — acceptable for a Capacitor app, but rotation is the priority).

## Part 4 — App configuration (remote config)

The client downloads config at startup from `GET /api/content` and applies it via
`applyServerConfig()`, overriding branding, **social links (url + CTA + colour)**,
and legal URLs **with no app rebuild** (verified by test). This is real remote
config today, **file-backed** (`server/content.json`).

🟡 **To satisfy the "AppConfiguration table" ask** (feature flags, maintenance
mode, min-app-version, remote config): add an `app_config` table + `GET
/api/config` endpoint and merge it into the same `applyServerConfig` path. The
client seam already exists (`ServerBranding`); extend it with `featureFlags`,
`maintenanceMode`, `minAppVersion`. This is a DB migration + one endpoint — not a
client change.

## Part 5 — Authentication architecture

One provider-agnostic interface (`SyncProvider = google|facebook|apple|guest`,
extensible to `email|phone|etricks-id`) resolving to a single internal profile.
- **Guest**: fully working, offline, no account.
- **Google/Facebook/Apple**: seams present; gated by `providerConfigured()` — the
  UI shows **"Soon"** until a public client ID is configured, so no broken flow
  ever ships. Wiring each = provider SDK → id_token → `POST /api/auth/<provider>`
  (server verifies the token, upserts the user, returns a JWT). The server today
  implements email/password auth + JWT; the social verify routes are the
  remaining server work.

## Part 6 — Cloud save & conflict resolution

Backend store exists: `PUT/GET /api/progress` persists a jsonb snapshot and merges
coins via `GREATEST`. Client `backupNow`/`restoreProgress` guard-rail correctly
(no account / guest → clear message, never a silent no-op — verified by tests).

**Conflict policy (design):** each snapshot carries `updatedAt` + `deviceId`.
On restore, if remote `updatedAt` > local → offer **Newest** automatically; if
they diverge within a small window (both edited offline) → **Ask User** with a
"Keep this device / Use cloud" prompt. Coins/XP take the max (already server-side)
so a merge never loses currency.

## Part 8 — UI polish (built)

Cloud Sync: floating hero, glassmorphism card, provider rows with hover-lift +
press-scale, **loading spinner**, **success check**, "Soon" chips, benefits grid,
trust line. Social: brand-coloured cards with hover glow, icon bounce, press
ripple, external-link glyph. All respect `prefers-reduced-motion`.

## Part 10 — Reuse across titles

To adopt in another etricksGames title: (1) ship the same `config.ts` /
`cloudSync.ts`; (2) provide a game-specific snapshot serializer to `backupNow`;
(3) point `VITE_API_BASE` at the shared identity server; (4) supply that game's
`content.json`. No identity code references Brain Booster Kids.

## What is proven vs pending (no illusions)

- ✅ Verified now: public-config safety, social link validity + remote override,
  provider gating, Guest login, cloud-save guard-rails, offline fallback (16
  tests), premium UI, `tsc` + build clean.
- 🟡 Needs provisioning/backend work: real Google/Facebook/Apple OAuth (registered
  apps + server verify routes), client→`/api/progress` upload wiring, refresh-token
  rotation, `app_config` DB table for flags/maintenance/min-version.
