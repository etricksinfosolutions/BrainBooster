# Architecture

## Overview

Brain Booster Kids is an offline-first PWA with an optional cloud companion API.

```
┌────────────────────────────────────────────────────┐
│                    Client (PWA)                    │
│  React 18 + TypeScript + Vite                      │
│                                                    │
│  ┌──────────┐  ┌───────────┐  ┌────────────────┐  │
│  │ Screens  │←→│  Store    │←→│ localStorage   │  │
│  │ (UI)     │  │ (reducer) │  │ (bbk:v1)       │  │
│  └────┬─────┘  └─────┬─────┘  └────────────────┘  │
│       │              │                             │
│  ┌────▼─────┐  ┌─────▼─────┐  ┌────────────────┐  │
│  │ 14 Games │  │ Level     │  │ Service Worker │  │
│  │          │  │ Engine    │  │ (offline)      │  │
│  └──────────┘  └───────────┘  └────────────────┘  │
└──────────────────────┬─────────────────────────────┘
                       │ HTTPS (optional)
┌──────────────────────▼─────────────────────────────┐
│                 API (Express)                      │
│  auth · progress sync · payments · admin           │
│  helmet · CORS · rate-limit · zod · JWT · bcrypt   │
└──────────────────────┬─────────────────────────────┘
                       │
                ┌──────▼──────┐
                │ PostgreSQL  │
                │ users,      │
                │ progress,   │
                │ purchases,  │
                │ content_*   │
                └─────────────┘
```

## Key decisions

**Offline-first.** Children play in cars, on flights, in low-connectivity homes. All 100 levels, all content (riddles, stories, flags, words) and the reward economy ship in the bundle (~63 kB gzipped JS). The server is strictly additive: accounts, sync, payment verification, content packs.

**Deterministic level generator.** Rather than hand-authoring 100 JSON files, `buildLevels()` derives each level from its number: tier = `⌊(id−1)/20⌋`, game kind from a per-tier rotation of 20 kinds, and a per-kind difficulty knob (`sizeFor`) that scales pairs/sequence length/number ranges/word length by tier. Content selection inside a game uses `seededRandom(levelId)` — the same level always plays the same, which is fair and testable.

**Reward engine as a pure function.** `computeReward(level, accuracy, {premium})` → stars/coins/diamonds/xp. Pure and unit-tested; milestone bonuses (levels 5/10/25/50/100) and the premium multiplier live here, not scattered in UI code.

**On-device "AI coach".** `recommendLevel(skills, unlockedMax)` tracks per-skill accuracy (memory/logic/math/language/observation/knowledge/speed) and recommends the highest unlocked level training the weakest skill. No server round-trip, no child data leaves the device unless a parent enables sync.

**State: single reducer + localStorage.** One `useReducer` store with every state transition as an action (`complete-level`, `buy-avatar`, `claim-daily`, ...). Persisted on every change under `bbk:v1`. This shape maps 1:1 to the cloud snapshot in `progress.snapshot` (jsonb), so sync is a straight upload/download.

**Ads that respect children.** A counter (`gamesSinceAd`) increments on level completion; at 3 the AdBreak overlay renders after the reward screen — never during gameplay. Premium short-circuits the counter entirely.

**COPPA/child-safety posture.** Children have no accounts; parents do. Parent dashboard sits behind a parental gate (multiplication question). No third-party trackers in the core game.

## Frontend module graph

```
main.tsx → App.tsx → store.tsx (context)
                   ↘ screens.tsx → games/index.tsx → data/levels.ts → data/content.ts
```

## Scaling path

- Content packs: admin uploads riddles/stories → clients fetch `/api/content` deltas and cache them; the bundled set remains the offline floor.
- Native: wrap with Capacitor (iOS/Android). The web codebase avoids browser-exclusive APIs except speechSynthesis/WebAudio, both of which have Capacitor equivalents.
- Leaderboards: add a `scores` table + endpoint; client already tracks XP.
