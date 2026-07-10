# BrainBooster Platform — Folder Structure & Topology

The standalone BrainBooster repository. Independent of Etricks Studios (see
[migration/DEPENDENCY_AUDIT.md](migration/DEPENDENCY_AUDIT.md)).

```
BrainBooster/
├── apps/
│   ├── web/       # React + Vite + Capacitor PWA — the game (shipping)
│   └── admin/     # React + Vite operator portal — content review + metrics
├── server/        # Express + Postgres monolith API (auth, sync, payments, admin)
├── services/      # 5 stateless microservices (extracted capabilities)
│   ├── content-service/         # serve + AI-generate + quality-gate activities
│   ├── leaderboard-service/     # ranked boards
│   ├── analytics-service/       # DAU / retention / funnels
│   ├── recommendation-service/  # per-player next-skill recommendations
│   └── notification-service/    # templated, de-duplicated notifications
├── agents/        # 8 AI agents (rule-based default + injectable LLM seam)
│   ├── content-generator/  personalization/  difficulty-balancer/  analytics/
│   └── quality-review/     curriculum/        localization/         moderation/
├── packages/
│   └── shared/    # logger, env, seeded RNG, health payload
├── database/      # migrations, seed, ER diagram
├── infrastructure/# docker-compose (full), Dockerfiles, k8s, monitoring
├── docs/          # architecture, API, AI, DB, deployment, security, testing…
└── .github/workflows/  # ci.yml (game), platform.yml (agents/services/admin)
```

## Runtime topology
- **Game (web)** runs fully offline; talks to **server** for accounts/sync/payments.
- **server** is the monolith of record. The **services** are additive extractions:
  each owns one capability, exposes `/health`, and can scale independently.
- **agents** are pure libraries the services (and CMS) call; they never invent
  gameplay — only content. Swap the deterministic default for a real LLM by
  passing an `llm`/`translate` port.

## Test & build entry points (repo root)
```bash
npm run test:agents     # node --test agents/**
npm run test:services   # node --test services/**
npm run test:server     # server unit tests
npm run build:web       # game production build
npm run build:admin     # admin production build
```
