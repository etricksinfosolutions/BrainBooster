# Deployment Guide

## 1. Web / PWA (fastest path to users)

```bash
cd apps/web && npm install && npm run build   # → dist/
```
Deploy `dist/` to any static host (Netlify, Vercel, S3+CloudFront, nginx). Requirements:
- serve over **HTTPS** (service worker + install prompt need it)
- SPA fallback to `index.html`
- do NOT cache `sw.js` or `index.html`; cache `/assets/*` forever (see `apps/web/nginx.conf`)

Users can then "Add to Home Screen" on Android/iOS — the app installs and works offline.

## 2. Full stack with Docker

```bash
docker compose up --build
```
Brings up PostgreSQL (schema auto-applied), the API on :4000 and the game on :8080.
For production: put both behind a TLS reverse proxy, set a strong `JWT_SECRET`, restrict `CORS_ORIGINS`.

## 3. Google Play (TWA — recommended first)

The PWA already meets installability criteria. Wrap it with Bubblewrap:
```bash
npx @bubblewrap/cli init --manifest https://your-domain/manifest.webmanifest
npx @bubblewrap/cli build
```
Upload the AAB. Add Play Billing by implementing the Digital Goods API in the TWA and finishing `POST /payments/google/verify`.

## 4. App Store (Capacitor)

```bash
cd apps/web && npm i @capacitor/core @capacitor/cli @capacitor/ios
npx cap init "Brain Booster Kids" in.co.etricks.brainboosterkids
npm run build && npx cap add ios && npx cap sync && npx cap open ios
```
Add the `capacitor-plugin-purchase` (or RevenueCat) for IAP and finish `POST /payments/apple/verify`.

## 5. Credentials checklist

| Service | Env / place | Needed for |
|---|---|---|
| Razorpay | `RAZORPAY_KEY_ID/SECRET` in server env | Web premium purchase |
| Play Console | service-account JSON | Android purchase verification |
| App Store Connect | issuer/key IDs | iOS purchase verification |
| AdMob | ad unit IDs in `AdBreak` component | Real ads for free users |
| Firebase (optional) | config in web app | Analytics + push notifications |

## 6. Performance budget

Current production build: **~63 kB gzipped JS + 4 kB CSS** — loads well under 2 s on 3G. Keep it that way: no heavy animation libraries; content is code-split-ready if packs grow.
