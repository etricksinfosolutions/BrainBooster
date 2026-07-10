# Security

## Authentication & authorization
- JWT (HS256) issued by the server; `requireAuth` / `requireAdmin` middleware
  (`server/src/middleware/core.js`). Admin routes require `role = admin`.
- Passwords hashed with bcrypt. Tokens carry `{ sub, role }` and expire (`JWT_TTL`).

## Input validation
- All request bodies validated with **zod** via the `validate(schema)` middleware.
  Invalid input → `400` with field errors; parsed data replaces `req.body`.

## Transport & headers
- `helmet` for security headers; `cors` restricted in production; `express-rate-limit`
  on auth/write routes.

## Child safety (COPPA)
- No child accounts — only parent/admin. Child profiles live inside the parent's
  `progress` snapshot.
- The **moderation** agent screens usernames/community text for profanity,
  impersonation and PII (emails/phones) before anything is stored or shown.
- The **quality-review** agent blocks unsafe language in generated content.

## Secrets
- Never commit secrets. `*.env.example` document required vars. k8s reads from the
  `bb-secrets` Secret. Rotate `JWT_SECRET` and DB credentials per environment.

## Payments
- Razorpay signature verification implemented server-side; purchase `reference` is
  unique → verification is idempotent (no replay).

## Reporting
Email `security@brainbooster.example` (placeholder) with details; do not open a
public issue for vulnerabilities.
