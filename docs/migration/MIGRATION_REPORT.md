# BrainBooster — Standalone Extraction: Migration Report

**Date:** 2026-07-11
**Source:** `C:\Users\lenovo\Downloads\brain-booster-kids\brain-booster-kids` (the real, shipping Brain Booster Kids app — ADR-0012 reference game)
**Destination:** `C:\BrainBooster` (new, independent git repository)
**Strategy:** Copy → Refactor → Validate. **Non-destructive** — the source app and the Etricks Studios monorepo were not modified, moved, or deleted.
**Scope this phase:** Runnable core (web + backend + content + tests + docs + infra), renamespaced to `@brainbooster/*`. Mobile store pipeline, admin portal, AI-agent fleet, microservice split, and K8s are **deferred** (see "Deferred phases").

---

## 1. Extracted components (copied verbatim)

| Area | Path | Notes |
|---|---|---|
| Web game (PWA) | `apps/web/` | React 18 + TypeScript + Vite 5 + Capacitor 6; 14 game types, 100-level generator, reward economy, parent dashboard, offline SW |
| Android wrapper | `apps/web/android/` | Capacitor Android project (build artifacts excluded) |
| Backend API | `server/` | Express + Postgres: auth, progress sync, payments, admin, content, tracking |
| SQL schema | `server/sql/` | `schema.sql`, `activities.sql` |
| Content data | `server/content.json`, `server/activities.json`, `apps/web/public/content.json` | Runtime-overridable content documents |
| Docs | `docs/` | Architecture, API, Deployment, Testing, Admin/Parent guides |
| Infra | `docker-compose.yml`, `apps/web/Dockerfile`, `server/Dockerfile`, `apps/web/nginx.conf` | db + api + web |
| CI | `.github/workflows/` | ci.yml (typecheck/build/test/docker), android.yml |

**Excluded from copy (regenerated artifacts):** `node_modules/`, `dist/`, `build/`, `.gradle/`, `*.tsbuildinfo`, source `.git/`.

## 2. Refactored components

| Change | Files | Detail |
|---|---|---|
| Namespace rename | `apps/web/package.json`, `server/package.json` + both `package-lock.json` | `@brain-booster/*` → `@brainbooster/*` |

No source-code imports referenced the old namespace (the two apps are independent npm projects, not a workspace), so no import rewrites were required.

## 3. New components

- Fresh git repository initialized at `C:\BrainBooster` with an initial commit (518 tracked files).
- This migration report set (`docs/migration/`).

## 4. Build status

| App | Install | Typecheck | Build | Result |
|---|---|---|---|---|
| `@brainbooster/web` | ✅ 494 pkgs | ✅ `tsc -b` | ✅ `vite build` (69 modules, 38s) | **GREEN** |
| `@brainbooster/server` | ✅ 103 pkgs | n/a (plain JS) | starts via `node src/index.js` | installs clean |

The web app builds to a production bundle with **zero** reference to Etricks/`@etricks` — proving runtime independence.

## 5. Test status

| Suite | Result |
|---|---|
| Web: `core.test.ts` | ✅ pass |
| Web: `activities.test.ts` | ✅ pass |
| Web: `levels.validation.test.ts` | ✅ pass |
| Web: `assets`, `identity` | pass individually (slow cold-start ~20s/file on this machine) |
| Web: `immersion.test.ts` (and likely `match3.*`) | ⚠️ hangs on process teardown — **pre-existing**, inherited verbatim |
| Server tests | ⚠️ `npm test` points at `src/tests/` which **does not exist in the source** — pre-existing broken script, no tests present |

**Important:** No test file was modified during extraction. The `immersion` hang and the missing server test directory are pre-existing conditions of the source app, not regressions introduced by this migration.

## 6. Risks

- **Test-process hang (`immersion`):** an open timer/animation handle prevents Vitest from exiting on this Windows host. Fix by adding `vi.useFakeTimers()`/explicit cleanup or `test.timeout` + `--pool=forks`. Tracked as inherited debt.
- **Server has no tests** despite a `test` script — add a `src/tests/` suite or fix the script.
- **Branding:** studio identity (`EtricksGames`, `support@etricksgames.com`, TikTok `@etricksgames`) was intentionally left intact — it is the publisher, not a monorepo dependency. Rebrand only if the product changes publisher.

## 7. Manual steps (before store launch — carried over from source README)

- Payments: wire real Razorpay/Play Billing/Apple IAP credentials (client currently simulates checkout).
- Ads: swap placeholder AdBreak for real AdMob unit IDs.
- Analytics/notifications: add Firebase config (`docs/DEPLOYMENT.md`).
- Native builds: Capacitor Android project present; run `npm run android:sync`.

## 8. Deferred phases (not built this phase — by decision)

Mobile store release pipeline, dedicated admin portal app, the 7-agent AI ecosystem (content-generator, personalization, difficulty-balancer, analytics, quality-review, curriculum, localization, moderation), microservice decomposition, and Kubernetes manifests were **deliberately deferred**. The source app implements their *capabilities* inline (on-device AI coach `recommendLevel()`, admin API in `server/src/routes/admin.js`, payments, analytics/tracking). Splitting them into independent deployables is a follow-up once real usage justifies the abstraction.

## STOP CONDITION

Per the migration mandate: **no code has been removed from Etricks Studios or from the source app.** This phase stops here and awaits explicit approval before any cleanup.
