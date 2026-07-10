# BrainBooster — Dependency Audit

**Date:** 2026-07-11
**Question:** Does the standalone `C:\BrainBooster` repo have any runtime or build dependency on Etricks Studios?

## Verdict: ✅ ZERO runtime/build coupling to the Etricks monorepo.

## Evidence

### 1. No `@etricks/*` package dependencies
`grep -r "@etricks"` across the repo returns **only branding strings**, never an import or dependency:

| Match | File | Kind |
|---|---|---|
| `support@etricksgames.com` | `config.ts`, `content.json` (×3), `server/src/routes/content.js` | Branding (email) |
| `tiktok.com/@etricksgames` | `content.json` (×3) | Branding (social link) |
| `studio: 'EtricksGames'` | `server/src/routes/content.js` | Branding (publisher name) |
| `com.etricksgames.brainboosterkids` | android package id | App identifier |
| `@etricksgames` in `android/.../index-*.js` | one stale build artifact | Regenerated on build |

None are code imports or npm dependencies. `EtricksGames` is the **publisher identity**, not a coupling to the Etricks *platform monorepo*.

### 2. No `@brain-booster/*` cross-package coupling
The old namespace existed only in the 4 manifest/lock files, now renamed to `@brainbooster/*`. The web app and server are **independent npm projects** (no root workspace), each with its own lockfile — neither imports the other.

### 3. Dependency inventory (all public npm)
- **Web:** react, react-dom, vite, vitest, typescript, `@capacitor/*`. (494 packages installed clean.)
- **Server:** express, cors, helmet, jsonwebtoken, bcryptjs, pg, express-rate-limit, zod, dotenv. (103 packages installed clean.)

All dependencies resolve from the public npm registry — no private Etricks registry, no `file:`/`workspace:` links, no path aliases pointing outside the repo.

### 4. Environment / assets / APIs
- No env var references an Etricks service. `.env.example` files are self-contained (DB URL, JWT secret, payment keys).
- Assets are local (`apps/web/public/`, `apps/web/assets/`). No CDN/asset-registry call to Etricks.
- The web client talks only to its own `server/` API (configurable base URL in `config.ts`).

## Remaining coupling: NONE (functional). Branding-only, by choice.
The only Etricks strings are publisher branding, deliberately retained. Rebrand at will — it does not affect independence.
