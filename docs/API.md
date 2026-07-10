# API Reference

Base URL: `http://localhost:4000/api`
Auth: `Authorization: Bearer <jwt>` (from register/login). Tokens expire in 2 h.

## Health
`GET /health` → `{ ok: true }`

## Auth
### POST /auth/register
Body: `{ "email": "parent@example.com", "password": "min 8 chars" }`
201 → `{ token, user: { id, email } }` · 409 if email taken.

### POST /auth/login
Body: same. 200 → `{ token, user }` · 401 on bad credentials.
Rate limited: 20 requests / 15 min / IP.

## Progress (cloud save)
### PUT /progress (auth)
Body: full snapshot — `{ childName?, coins, diamonds, xp, premium, starsByLevel, badges, skills, playLog }`.
Merges with GREATEST() on coins so stale devices can't erase progress.

### GET /progress (auth)
200 → `{ snapshot, updated_at }` · 404 if no cloud save yet.

## Payments (premium ₹100)
### POST /payments/razorpay/order (auth)
Creates a Razorpay order (requires RAZORPAY_* env). Returns order info for checkout.

### POST /payments/razorpay/verify (auth)
Body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`.
Verifies HMAC-SHA256 signature (timing-safe), records the purchase, sets premium.

### POST /payments/google/verify (auth)
Body: `{ purchaseToken, productId }`. Scaffolded — wire Play Developer API.

### POST /payments/apple/verify (auth)
Body: `{ signedTransaction }`. Scaffolded — wire App Store Server API.

## Admin (role = admin)
- `GET /admin/riddles` · `POST /admin/riddles` `{ question, options[], answerIndex, minTier }` · `DELETE /admin/riddles/:id`
- `POST /admin/stories` `{ title, pages[], questions[] }`
- `GET /admin/users?limit=50`
- `PATCH /admin/users/:id/premium` `{ premium: true|false }`
- `GET /admin/analytics` → `{ totalUsers, premiumUsers, revenueInr }`

## Errors
All errors: `{ "error": "message" }` (+ `details` for validation failures). No stack traces are ever returned.
