# Development Guide

## Prerequisites
- Node.js ≥ 20, npm ≥ 9
- (optional) Docker + Docker Compose, PostgreSQL 15+ for the full stack
- Repo must live on a case/symlink-friendly filesystem (NTFS/APFS/ext4)

## Quick start — game only (zero backend)
```bash
cd apps/web && npm install && npm run dev   # http://localhost:5173
```

## Admin portal
```bash
cd apps/admin && npm install --no-workspaces && npm run dev   # http://localhost:5174
# set VITE_API_BASE to your API server (see .env.example)
```

## Server
```bash
cd server && npm install && npm run dev     # needs DATABASE_URL + JWT_SECRET
```

## Services & agents
```bash
node --test "agents/**/*.test.js"           # agent tests
node --test "services/**/*.test.js"         # service tests
node services/leaderboard-service/server.js # run one service (PORT env)
```

## Full stack
```bash
docker compose -f infrastructure/docker-compose.full.yml up --build
```

## Conventions
- Agents/services: ESM, dependency-free where possible; pure logic in `logic.js`,
  transport in `app.js`, entrypoint in `server.js`. Tests are `*.test.js` (node:test).
- The game (`apps/web`) is TypeScript + React; keep it framework-light and offline-first.
- Don't add an npm dependency to an agent unless the capability genuinely needs it.

## Gotchas
- On slow/Windows hosts, killed test runs can orphan `node` processes and starve the
  CPU (looks like a hang). Clear them: `Get-Process node | Stop-Process -Force`.
