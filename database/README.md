# BrainBooster Database

PostgreSQL 15+. Migrations are plain SQL, applied in filename order.

```bash
# apply all migrations
for f in database/migrations/*.sql; do psql "$DATABASE_URL" -f "$f"; done
# seed dev data (never in prod)
psql "$DATABASE_URL" -f database/seed.sql
```

- Schema of record: `database/migrations/`. The legacy `server/sql/schema.sql` is retained for the standalone game-only Docker path and equals `0001_init.sql`.
- ER diagram: [ER.md](ER.md).
- Backup: `pg_dump "$DATABASE_URL" > backup.sql`; restore: `psql "$DATABASE_URL" -f backup.sql`.
