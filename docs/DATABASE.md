# BrainBooster Database

PostgreSQL 15+. Full schema, migrations, seed and ER diagram live in
[`database/`](../database). See [database/ER.md](../database/ER.md) for the diagram.

## Tables
| Table | Owner | Purpose |
|---|---|---|
| `users` | server | parent/admin accounts (COPPA: no child accounts) |
| `progress` | server | one JSONB cloud-save snapshot per account |
| `purchases` | server | immutable purchase audit (idempotent on `reference`) |
| `content_riddles`, `content_stories` | server | admin-managed add-on content |
| `leaderboard` | leaderboard-service | best score per user per board |
| `analytics_events` | analytics-service | append-only event stream |
| `generated_activities` | content-service | AI content pending human review |

## Migrations
Plain SQL, filename-ordered, idempotent:
```bash
for f in database/migrations/*.sql; do psql "$DATABASE_URL" -f "$f"; done
```
`0001_init` = shipping tables; `0002_services` = additive service tables (the
monolith ignores them, so applying them is non-breaking).

## Backup / restore
```bash
pg_dump "$DATABASE_URL" > backup.sql
psql   "$DATABASE_URL" -f backup.sql
```
