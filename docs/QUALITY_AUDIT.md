# Brain Booster Kids — Production Quality Audit & Remediation

Status legend: ✅ fixed · 🟡 mitigated / follow-up · ⬜ open (tracked)

This audit paused feature work to bring the app toward production quality. Every
fix below ships with automated verification — the **Level Validation Engine**
(`src/tests/levels.validation.test.ts`, 133 checks) and the **asset validator**
(`scripts/validate-assets.mjs`) — so these defect classes cannot silently return.

## Critical

| # | Issue | Status | Fix / verification |
|---|-------|--------|--------------------|
| C0 | **Regression: gameplay showed generic placeholder blobs** — indistinguishable Memory cards, worse than the original emoji. | ✅ | Reverted to **progressive enhancement**: distinct Twemoji artwork is the always-present baseline; premium baked/gen-AI art upgrades it. No generic placeholder anywhere in gameplay (`Sprite.tsx`; `Placeholder.tsx` deleted). |
| C1 | **Duplicate illustrations** — 6 tokens collapsed to the same subject/slug (🐖/🐷, 💫/🌠, plus 4 dead `_alt` keys) → identical art → ambiguous Memory pairs. | ✅ | Distinct subjects; dead keys removed. Guarded by slug-uniqueness test + validator collision check. |
| C2 | **FactScreen white-screens** the mandatory post-level flow if a fact pool is empty (`unlocked % 0` = NaN). | ✅ | Guard: empty pool → skip fact, dismiss reward (`screens.tsx`). |
| C3 | **"Works offline" is only partly true** — Twemoji baseline & gen-AI both load from CDNs; with no network the baseline falls to the OS native glyph (varies per device). | 🟡 | The bundled premium WebP pack (once baked) is fully local/offline. Follow-up: precache Twemoji SVGs via the service worker for a device-consistent offline baseline before the pack lands. |

## High

| # | Issue | Status | Fix / verification |
|---|-------|--------|--------------------|
| H1 | **Missing Number showed duplicate answer options** at low difficulty (`ans+step === ans+1`). | ✅ | Set-based distinct distractors (`questions.ts`). Caught & verified by the Level Validation Engine's "unambiguous options" check. |
| H2 | **Emoji option buttons have no accessible label** (shadow/pattern/odd-one-out/quick-count, Match-3, sorting, find-difference, quick-tap). | ⬜ | Tracked: thread `alt`/`aria-label` (subject name) into option sprites. |
| H3 | **Splash dismiss is on fixed 5s/8.2s timers**, not gated on content-ready. | ⬜ | Tracked: drive dismissal from the content-ready promise with the timer as max-wait. |

## Medium

| # | Issue | Status |
|---|-------|--------|
| M1 | MCQ (StoryGame) accuracy uses stale state / counts retries → wrong star reward. | ⬜ tracked |
| M2 | Find-the-Difference can be uncompletable when a world's theme pool is tiny (fewer real diffs than the prompt claims). | ⬜ tracked |
| M3 | Board tiles flash empty while CDN images load (no in-tile skeleton). | 🟡 baseline underlay added in `Sprite`; native-glyph zero-cost layer still a follow-up |
| M4 | Several touch targets below the 44px child-friendly minimum (quick-tap, Match-3, find-difference cells). | ⬜ tracked |
| M5 | Only the HUD avatar acts as "back"; secondary screens lack an explicit back/close control. | ⬜ tracked |

## Low

| # | Issue | Status |
|---|-------|--------|
| L1 | Sorting bucket fallback can render a literal `❓` + raw pool key. | ⬜ tracked |
| L2 | Match-3 fallback tile set mixes objects with abstract dots (inconsistent). | ⬜ tracked |
| L3 | Parental gate gives no feedback on a wrong answer. | ⬜ tracked |
| L4 | Splash skip is a `div`, not keyboard-accessible. | ⬜ tracked |
| L5 | Curated banks (riddle/opposites/flags) recycle once exhausted. | 🟡 acceptable for launch |

## Automated quality gates now in place

- **Level Validation Engine** — simulates every level of every world headlessly:
  Memory decks are distinct recognisable subjects; quiz options are unambiguous
  with exactly one answer and no in-level repeats; Match-3 boards have varied
  objects and a guaranteed legal move; stories have a valid illustrated hero and
  3 well-formed questions; generated kinds don't repeat on replay.
- **Asset validator** (`validate:assets`) — coverage, slug collisions, duplicate
  image bytes, banned placeholder filenames, WebP format & min resolution.
  Strict on the release path (`build:prod` / `android:sync`); advisory in CI.
- **CI** (`.github/workflows/ci.yml`) — type-check → tests → build → asset
  validation on every PR.

## What's genuinely solid (keep)

Match-3 never deals a dead board; maze/sliding puzzles are always solvable;
Memory & sorting de-dupe their pools; double-completion guards are consistent;
QuestionRunner accuracy and no-repeat-within-level are correct.
