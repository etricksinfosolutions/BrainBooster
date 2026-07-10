# 🧠 Brain Booster Kids

A premium educational game for children aged **4–12** — memory, logic, math, language, observation, general knowledge, riddles, stories and 30-second quick challenges, wrapped in a joyful toy-box UI with a cheering tiger mascot named **Tigo**.

**100 levels · 14 game types · 5 difficulty tiers · full reward economy · parent dashboard · offline-first PWA.**

## Repository layout

```
brain-booster-kids/
├── apps/web/          # React + TypeScript PWA (the game itself)
│   ├── src/data/      # 100-level generator, riddles, stories, flags, words
│   ├── src/games/     # 14 game components
│   ├── src/components/# Screens: home, map, reward, shop, daily, parents...
│   ├── src/state/     # Store, persistence, audio, speech
│   ├── src/tests/     # Vitest unit tests (reward engine, levels, AI coach)
│   └── public/        # Manifest, icon, offline service worker
├── server/            # Express API: auth, cloud sync, payments, admin
│   └── sql/           # PostgreSQL schema
├── docs/              # Architecture, API, deployment, testing, guides
├── docker-compose.yml # db + api + web in one command
└── .github/workflows/ # CI: type-check, build, test, docker build
```

## Quick start (game only — zero setup)

```bash
cd apps/web
npm install
npm run dev        # → http://localhost:5173
```

The game is **fully playable offline with no backend**: progress, coins, badges and the parent dashboard persist in localStorage. The server adds parent accounts, cross-device sync, real payment verification and the admin panel.

## Full stack

```bash
docker compose up --build
# game    → http://localhost:8080
# API     → http://localhost:4000/api/health
# postgres→ localhost:5432 (schema auto-applied)
```

## Feature map

| Spec item | Where |
|---|---|
| 100+ levels, 5 tiers | `apps/web/src/data/levels.ts` (deterministic generator) |
| 14 game types | `apps/web/src/games/index.tsx` |
| Rewards: stars/coins/diamonds/XP/badges/confetti/voice | `computeReward()` + Reward screen |
| Milestones (5/10/25/50/100) | `milestoneFor()` + celebration UI |
| Avatar shop (avatars + hats, premium exclusives) | Shop screen |
| Daily bonus, streaks, spin wheel | Daily screen |
| Parent dashboard (play time, skill scores, graphs) + parental gate | Parents screen |
| Accessibility: voice, big buttons, colorblind mode, offline | Settings + service worker |
| Ads: 1 per 3 levels, never mid-game, none for premium | `AdBreak` component + store counter |
| Premium ₹100 one-time | Premium screen + `server/src/routes/payments.js` |
| AI adaptive recommendations | `recommendLevel()` — on-device coach |
| Admin panel API | `server/src/routes/admin.js` |
| Security: JWT, bcrypt, rate-limit, zod validation, helmet | `server/src/middleware/core.js` |

## Production status — honest notes

**Ready now:** the PWA (installable, offline, responsive phone→desktop), level engine, reward economy, all 14 games, parent dashboard, tests, Docker, CI.

**Needs your credentials/accounts before store launch:**
- **Payments** — Razorpay signature verification is fully implemented; Play Billing and Apple IAP endpoints are scaffolded with the exact APIs to call documented inline. The client currently simulates checkout.
- **Ads** — the ad-break flow (frequency cap, premium bypass, never-in-gameplay) is implemented with a placeholder ad; swap in the AdMob Web/H5 SDK or native AdMob with your ad unit IDs (see comments in `AdBreak`).
- **Native store builds** — the PWA installs on Android/iOS today (TWA wraps it for Play Store with minimal work). For full native (App Store), wrap with Capacitor — the codebase is plain React with no browser-only architecture decisions that block this.
- **Analytics/notifications** — add Firebase config where noted in `docs/DEPLOYMENT.md`.

See `docs/` for architecture, API reference, deployment, testing, admin and parent guides.
