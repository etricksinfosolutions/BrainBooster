# Admin Guide

## Creating the first admin
1. Register a normal account via `POST /api/auth/register`.
2. Promote it directly in the database:
   ```sql
   UPDATE users SET role='admin' WHERE email='you@example.com';
   ```
3. Log in again to get a token carrying the admin role.

## Managing content
All requests need `Authorization: Bearer <token>`.

**Add a riddle**
```bash
curl -X POST http://localhost:4000/api/admin/riddles \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"question":"What has hands but cannot clap?","options":["A clock","A tree","A fish"],"answerIndex":0,"minTier":0}'
```

**Upload a story**
```bash
curl -X POST http://localhost:4000/api/admin/stories \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"The Kind Ant","pages":["Once upon a time..."],"questions":[{"q":"Who helped?","options":["The ant","The rock"],"answerIndex":0}]}'
```

## Users & premium
- List users: `GET /api/admin/users`
- Grant/revoke premium manually: `PATCH /api/admin/users/:id/premium` with `{"premium":true}` — useful for refunds and support.

## Analytics
`GET /api/admin/analytics` → total users, premium users, revenue (₹).

## Level tuning
Level difficulty lives in code (`apps/web/src/data/levels.ts`, `sizeFor()`), by design: changes are code-reviewed and unit-tested rather than hot-edited. Adjust the per-tier arrays there and ship a release.
