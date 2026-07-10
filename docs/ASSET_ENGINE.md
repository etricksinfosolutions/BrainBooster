# Asset Engine — illustrated game content

Brain Booster Kids renders **zero raw emoji as gameplay art**. Every pictorial
token a child sees in an activity — the octopus in Ocean World's Memory Match,
the carrot they count, the fruit they tap — is a professionally illustrated
sprite in a single, consistent Pixar-style universe, served by the **Asset
Engine**.

Emoji strings are still used *inside the code* as a compact, stable **semantic
key** (`🐙` = "baby octopus"). They are a great universal vocabulary and let
every generator, question bank and world pool stay untouched. But the glyph is
never the asset — it only ever resolves, through the engine, to an
illustration.

```
 content key (emoji)  ─►  Asset Engine  ─►  illustrated sprite
        │                      │
   registry.ts            engine.ts              Sprite.tsx
   subject + prompt     candidate chain +      walk candidates →
   + seed + category    verified cache +       illustrated Placeholder
                        prefetch               (NEVER a raw emoji)
```

## Render pipeline — progressive enhancement, always distinct

Gameplay REQUIRES every object to be distinguishable (a Memory board of identical
blobs is unplayable). So the renderer never shows a generic placeholder. Instead
a distinct, recognisable image is always present and premium art *upgrades* it:

```
 premium baked WebP (bundled /public/sprites, or CDN)   ← the goal: instant, offline
        ▲ upgrades on load          │ onError ↓
 live gen-AI (Pollinations flux)    ← self-heals not-yet-baked keys
        ▲ upgrades on load          │ onError ↓
 distinct Twemoji artwork (per-subject SVG)   ← always-present baseline
```

Every subject has a **unique slug** (guarded by `assets.test.ts` and the asset
validator), so no two tokens ever share one illustration. There is deliberately
**no generic "category placeholder"** in the gameplay path — an earlier version
that used category blobs was a regression (indistinguishable cards) and was
removed. Raw Twemoji is also used, intentionally, for genuinely abstract
decorative glyphs (math signs, title-bar icons) that have no illustrated subject.

### Why emojis were showing (root cause)

The app depended 100% on *live, on-demand* flux generation and shipped no baked
pack. On a fresh/offline session every sprite was unverified, so the loading
underlay (then Twemoji) is what users saw — and a Memory board fires 6-12
concurrent requests, which the free tier answers with HTTP 429/414, leaving most
cards stuck on the fallback. Two fixes: **bundle a pre-baked pack** so sprites
are present and instant, and **remove emoji from the render path** (placeholder
instead).

## Pieces

| File | Role |
|------|------|
| `src/assets/registry.ts` | Maps every content key → subject name, style-consistent prompt, deterministic seed, CDN slug. `ART_STYLE` is the single art direction shared by every asset. `assetManifest()` is the machine-readable catalogue. |
| `src/assets/engine.ts` | `spriteUrl(key)` resolution, in-memory + `localStorage` verified-cache, background `prefetch*` of the current/next world, and the **swappable source** (`setAssetSource`). |
| `src/assets/Sprite.tsx` | The one component every activity draws through. Premium illustration for known subjects; graceful degradation to Twemoji image, then native glyph, so it works offline / on a missing asset. |
| `src/games/index.tsx` → `Gfx` | The single choke point all gameplay imagery routes through. Swapping it to `Sprite` upgraded every activity at once. |

Determinism matters: the same key always yields the same seed → the same
illustration. Memory Match pairs are therefore visually identical, and the CDN
caches exactly one image per subject. Guarded by `src/tests/assets.test.ts`,
which also asserts **every world pool token has a first-class subject** (no
silent fallbacks).

## Two sources, zero rebuilds

The engine resolves a sprite URL from whichever source is active:

- **`genai` (default)** — generated on demand by Pollinations/flux from the
  registry prompt+seed. Deterministic, so the CDN caches each sprite globally
  after the first request. Great for development and instant new worlds.
- **`cdn`** — a pre-baked WebP pack on S3/CloudFront at
  `…/sprites/<slug>.webp`. Fastest, fully controlled, offline-friendly.

Flip between them **server-side, with no app update** via the content document:

```json
{ "version": 42, "worlds": [ … ], "assets": { "cdnBase": "https://dxxxx.cloudfront.net" } }
```

`contentService.applyContent` calls `setAssetSource({ kind:'cdn', base })`.

## Sprites are true transparent cut-outs

flux paints every subject on a flat white/grey canvas. Shipping that as-is looks
like a "white card inside a white card" on a tile. The pipeline
(`scripts/lib/bgremove.mjs`) turns it into a real game sprite:

```
raw RGBA → sample bg colour from corners → border-seeded flood fill
        → adaptive tolerance (escalates for low-contrast whites, e.g. a swan)
        → light edge despill → tight-crop transparent margins → centre → WebP(alpha)
```

Border-seeded flood fill only removes near-bg pixels **connected to the edge**,
so interior whites (eyes, a panda's face, a polar bear's body) survive — a naive
global white-key would punch holes in the subject. It runs inside `gen:sprites`
for new art, and `npm run strip-bg` re-processes an existing pack in place
(offline, no regeneration). The renderer then draws the transparent sprite with
a CSS drop-shadow + ground shadow so it floats above the tile.

Validation (below) rejects any sprite that still has a solid background (too
little transparency), is over-cropped, or lost its subject.

## Baking the production pack (offline pipeline)

```
prompt → flux image → background removal (alpha) → tight-crop → WebP → S3 → CloudFront → registered
```

```bash
npm run gen:sprites          # apps/web/scripts/gen-sprites.mjs
SPACING_MS=6000 npm run gen:sprites   # pace gentler if rate-limited
```

Produces, bundled into the app:

```
public/
  sprite-manifest.json      # key, subject, slug, seed, prompt — the DB seed
  sprites/<slug>.webp       # one illustration per subject (275)
```

The manifest is derived from the **real registry** via esbuild, so the pack can
never drift from what the app requests. Idempotent — re-run to fill any gaps.

> **Rate limits.** Pollinations' keyless tier throttles bursts hard (HTTP
> 429/414). The bake is deliberately sequential with ~4s spacing + long backoff,
> so a full 275-sprite run takes ~40-60 min and may need a re-run to fill
> stragglers. For a fast, reliable bake use a Pollinations API token or generate
> against any image API and drop the WebPs into `public/sprites/<slug>.webp`.

### Validate before shipping (build gate)

```bash
npm run validate:assets            # FAILS if any registry entry lacks a valid WebP
npm run validate:assets:advisory   # report only
```

`build:prod` and `android:sync` run the strict validator first, so a production
build **cannot ship an incomplete pack**. The report lists every missing/broken
sprite and the exact fix (`npm run gen:sprites`). Even so, at runtime a missing
sprite degrades to live gen-AI, then an illustrated placeholder — **never** an
emoji.

### Optional: serve from a CDN instead of bundling

```bash
aws s3 sync apps/web/public/sprites/ s3://bbk-assets/sprites/ --cache-control "public,max-age=31536000,immutable"
```

…front with CloudFront and set `assets.cdnBase` in the content doc. The manifest
is also the seed document for the `illustrations` collection (below) and the
input the admin **AI Content Studio** iterates on.

## Suggested backend schema

The manifest is a direct fit for an `illustrations` collection:

```
illustrations: { assetId, key, worldId, category, subject, slug,
                 prompt, seed, version, storageUrl, thumbUrl, tags[], languages[] }
worlds / assetPacks / activities / stories / questions / rewards / translations
```

Because activities only ever ask the engine for a **key**, adding worlds, packs,
activities or AI-generated content needs **no mobile app change** — new keys map
in the registry (or arrive in the content doc), and the pack is baked and synced.
