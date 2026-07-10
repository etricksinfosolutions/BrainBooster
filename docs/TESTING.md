# Testing Guide

## Unit tests (implemented)

```bash
cd apps/web && npx vitest run
```
18 tests cover the pure core:
- **Level generator** — exactly 100 levels, correct tier boundaries, kind variety per tier, difficulty knobs grow with tier, milestone placement (5/10/25/50/100)
- **Reward engine** — star thresholds, non-zero payouts, premium multipliers, milestone bonuses, tier scaling
- **Adaptive coach** — targets weakest skill, respects unlock ceiling, sane with empty history
- **Seeded RNG** — deterministic, seed-sensitive, range-bounded

## API tests

`node --check` runs in CI for all server files. To add integration tests: spin up the compose db, then use `supertest` against `server/src/index.js` (exported as an app).

## E2E (recommended before store launch)

Playwright happy path: launch dev server → complete level 1 → assert reward screen shows stars/coins → assert level 2 unlocks → complete 3 levels → assert ad break appears → buy premium (simulated) → assert no further ads.

## Accessibility checks

- Toggle **Big buttons** and **Colorblind mode** in Settings; the Simon game switches to distinct shapes.
- Voice: enable and confirm instructions/praise are spoken (speechSynthesis).
- Keyboard: all interactive elements are `<button>`s — tab order works by construction.
- Run Lighthouse: PWA + accessibility audits should both pass on the production build.

## Performance tests

`npm run build` prints bundle sizes; CI fails loudly if the build breaks. Budget: < 100 kB gzipped JS.
