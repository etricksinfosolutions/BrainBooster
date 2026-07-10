# 🎮 Engagement, Content & Monetization

How the "never repeats / stays fresh" system works, how to grow content to
thousands of items with **no code changes**, and the concrete plan for the
pieces that need external accounts or licensed assets.

## ✅ Shipped in this build

### Question Engine — no repeats, 6 escalating difficulties
[`src/data/questions.ts`](../apps/web/src/data/questions.ts)

- Every quiz level serves **6 questions**, difficulty **Very Easy → Expert**.
- Each question has a **stable unique id**; answered ids are stored in
  `profile.seenQuestions` (persisted locally and in the cloud-save snapshot) and
  the engine **never serves a seen question again** until the pool is exhausted.
- Two provider types:
  - **Generative** (math, counting, patterns, number sequences, shadows,
    odd-one-out) → *unlimited* unique questions, so hundreds of levels never
    run dry. This is what guarantees "no repeats in the first 100 levels."
  - **Curated** (riddles, opposites, flags/GK) → drawn from content banks.
- **Add thousands more with zero code change:** append rows to the banks in
  [`content.ts`](../apps/web/src/data/content.ts) / [`facts.ts`](../apps/web/src/data/facts.ts),
  or add entries to `ASSET_POOLS` in `questions.ts`. The engine buckets any bank
  into the 6 difficulty bands automatically. In production these banks are the
  same shape the admin/CMS route (`server/src/routes/content.js`) can serve.

### Also shipped
- **Screen titles** with icons on every game (`GameTitle`, `GAME_HEAD`).
- **Coin hint system** — collapsed bar, 25-coin confirm dialog, "not enough
  coins" nudge (`HintBar`).
- **Coin economy** bonuses — perfect score & no-hints rewards on top of the base
  payout; hints cost coins (a real sink).
- **Post-level facts** — a rotating "Did you know?" card after every level
  ([`facts.ts`](../apps/web/src/data/facts.ts)); each level unlocks the next.
- **Fill-in-the-Blank** rework — place any letter anywhere, **Check** shows
  green/red per position, "❌ Incorrect Spelling", tap red tiles to retry.
- **Shadow matching** — large randomized `ASSET_POOLS` (animals, fruits, veg,
  toys, dinos, vehicles, birds, sea, insects, instruments, sports, household),
  distractors get more similar as difficulty rises.
- **Per-world music** with crossfade + separate Music/SFX volume sliders
  (already in Settings).
- **Analytics** — [`analytics.ts`](../apps/web/src/analytics.ts) buffers events
  (`level_start`, `level_complete`, `hint_used`, `fact_viewed`, …) in
  localStorage; call `drainAnalytics()` and POST to your backend when online.

## 🔜 Needs your accounts / licensed assets (scaffolded, not faked)

These can't be finished without external credentials or binary assets, so they
are **documented with the exact integration steps** rather than stubbed with
fake data.

### Google AdMob (spec #11–12)
1. Add the plugin: `npm i @capacitor-community/admob` then `npx cap sync android`.
2. Put **ad unit ids in the server content doc** (`content.json` → new `ads`
   block) so they load via Remote Config — dev/test/prod without an app update,
   and an `adsEnabled` flag to disable remotely. `applyServerConfig` already
   demonstrates this pattern for branding.
3. Wire a small `ads.ts` service: `showBanner()` (bottom, never over gameplay —
   the `BannerAd` slot already reserves the space), `interstitial()` after each
   level for non-premium users (the every-3-levels `AdBreak` hook is the seam),
   and `rewarded()` granting bonus coins. Enforce the **5 rewarded ads/day → 10
   coins** cap in the store + backend (`rewarded_ad_watched` analytics event is
   ready). Premium users bypass all of it (guard already in `BannerAd`).

### Licensed background music (spec #10)
The current themes are synthesized (zero-asset, offline). To ship **CC0 /
public-domain** orchestral loops per world: drop `home.mp3`, `forest.mp3`, … in
`public/audio/`, and swap the procedural engine's per-world `startMusic` for an
`<audio>`/HualioWebAudio buffer player keyed by `THEME_BY_WORLD` (the crossfade
and volume plumbing stay). Only use tracks whose license permits commercial use.

### Illustrated stories & raster art (spec #3, #14 targets)
This is a zero-asset PWA, so illustrations are crafted SVG/emoji (see the world
scenery + story illustration). For bespoke cartoon art toward the 500-stories /
5,000-questions targets, add an image pipeline (sprite sheets or a CDN with the
strict CSP relaxed for your asset host) and reference art ids from the content
banks — the engine already keys everything by id.

## Adding content (quick reference)

| Want more… | Edit | Notes |
|---|---|---|
| Questions (unlimited) | already generative | math/count/pattern/sequence/shadow |
| Riddles | `content.ts → RIDDLES` | bucketed into 6 difficulties by order |
| Opposites / GK | `content.ts → OPPOSITES`, `FLAGS` | |
| Facts | `facts.ts → FACTS` | shown after levels, cycles |
| Shadow/odd-one-out assets | `questions.ts → ASSET_POOLS` | add a category array |
| Words (spelling) | `content.ts → WORDS` | grouped by length |
