/**
 * Brain Booster Kids — API server.
 *
 * The PWA is fully offline-first; this server is the cloud companion:
 *  - parent account auth (JWT)
 *  - cross-device progress sync
 *  - premium purchase verification (Razorpay / Play Billing / Apple IAP)
 *  - admin content management (riddles, stories, level tuning)
 *
 * Security: helmet, CORS allow-list, rate limiting, zod input validation,
 * bcrypt password hashing, short-lived JWT access tokens.
 */
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const contentRoutes = require('./routes/content');
const activityRoutes = require('./routes/activities');
const trackingRoutes = require('./routes/tracking');
const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const { createAdminAuth } = require('./admin-auth');

const app = express();
app.disable('x-powered-by');
// Behind a reverse proxy (Docker/nginx) so X-Forwarded-* is honored for client IPs.
app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// Admin-portal authentication/authorization (separate from game user auth).
// Single instance so sessions/audit/throttle state is shared across requests.
const adminAuth = createAdminAuth();

// Default allow-list covers the game PWA and the admin portal in local dev
// (Vite picks 5174 when 5173 is taken; 8081 is the admin Docker port). Override
// with CORS_ORIGINS in production. `credentials: true` is required for the
// admin session cookie to be sent cross-origin.
const allowed = (
  process.env.CORS_ORIGINS ||
  'http://localhost:5173,http://localhost:5174,http://localhost:8081'
).split(',').map((o) => o.trim());
app.use(cors({ origin: allowed, credentials: true }));

// Global limiter + a stricter one for auth endpoints (brute-force protection).
app.use(rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60_000, max: 20 }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'brain-booster-api' }));

// Public, no-auth: the game content the PWA renders itself from.
app.use('/api/content', contentRoutes);
// Public, no-auth: batched activity-type delivery for the Activity Engine.
app.use('/api/activities', activityRoutes);

// Admin portal auth (captcha/login/logout/me/refresh/audit-logs).
app.use('/api/admin/auth', adminAuth.router);

app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
// Authed: the User Activity Mapping (cross-device play history).
app.use('/api/tracking', trackingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Central error handler — never leak stack traces to clients.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.publicMessage || 'Internal server error' });
});

const port = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(port, () => console.log(`Brain Booster API listening on :${port}`));
}
module.exports = app;
