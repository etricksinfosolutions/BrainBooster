# Brain Booster Kids — Sprite Style Guide (The Art Bible)

> Every illustrated asset in the game — gameplay tiles, story heroes, rewards,
> avatars, map icons — obeys this document. If two assets look like they came
> from different apps, one of them is wrong. This is the contract the generation
> prompt ([`src/assets/registry.ts`](../src/assets/registry.ts)) encodes and the
> Art Review Agent ([`scripts/art-review.mjs`](../scripts/art-review.mjs)) enforces.

The bar: a parent glancing at any screen thinks *"this is a premium studio game"*,
and a 4-year-old recognizes every character **within one second, from across the
room, before they register the colour.**

---

## 1. The one universe

All art is **one rendering style**: soft 3D Disney-Pixar *toy* characters, as if
every subject were a collectible vinyl figure photographed on the same turntable
under the same light. Not flat 2D. Not painterly. Not realistic. **Chunky, glossy,
rounded toys.**

| Property        | Rule |
|-----------------|------|
| **Camera**      | Three-quarter front view, eye-level, subject facing slightly left-of-centre. Never top-down, never profile, never dramatic angles. |
| **Framing**     | Single subject, centred, filling **60–85%** of the frame. No scenes, no props unless the subject *is* the prop. |
| **Key light**   | One soft key light from the **top-left**, gentle fill, one soft **drop shadow** beneath. Consistent across every asset — this is what makes a pack feel "shot together". |
| **Background**  | **Fully transparent** after processing. The model paints on white; our pipeline cuts it to alpha. Zero background remnants, zero baked shadow rectangle. |
| **Outline**     | Thick, soft, slightly darker-than-fill contour. Reads as a bold silhouette at 48px. |
| **Finish**      | Glossy, soft specular highlight (top-left), smooth surfaces. Toy-like sheen. |

## 2. Proportions — the "cute code"

Cuteness in kids' media is **geometry**, not luck. Every character:

- **Large head** (roughly ⅓–½ of total height).
- **Huge, sparkly eyes** with a bright catchlight. Eyes are the #1 recognition and
  warmth driver — never small, never dead.
- **Small rounded body**, stubby limbs, no sharp points.
- **Exaggerated defining feature** (a shark's fins, a puffer's spikes, an octopus's
  tentacles) pushed 20–30% bigger than life so the **silhouette** is unmistakable.
- **Happy, open expression** — smile or gentle wonder. Never neutral, never scary.

## 3. Silhouette first

A child identifies a character by its **black-shape silhouette** before any detail.
Two characters must never share a silhouette. Design each around one bold shape:

- Round · Tall · Wide · Spiky · Blobby · Domed · Star · Long-eared

The **Family** system (§5) assigns each member a distinct silhouette *on purpose*.

## 4. Colour & contrast

- **Bright, saturated, high-contrast** palettes. Sun-lit, joyful, never muddy or
  desaturated.
- Each character owns a **signature hue** so colour is a *second* recognition cue
  after silhouette (orange fish, blue shark, pink clownfish…).
- Strong figure/ground contrast so the subject pops on any tile background.
- Colour is never the *only* differentiator — the game must stay readable for
  colour-blind children (silhouette carries the meaning).

## 5. Character families

When a world needs several of one kind (fish, dinosaurs, robots), do **not** ship
near-identical variants. Build a **family** where each member has a unique
silhouette + signature colour + personality. The reference family:

| Subject       | Silhouette        | Colour  | Personality           |
|---------------|-------------------|---------|-----------------------|
| Orange fish   | round, small fins | orange  | happy, chubby         |
| Shark         | torpedo, big fins | blue    | big goofy grin        |
| Clownfish     | oval, striped     | pink/white | big curious eyes   |
| Pufferfish    | perfect spiky ball| yellow  | puffed cheeks         |
| Sea turtle    | domed shell       | green   | sleepy, gentle        |
| Octopus       | big head + curls  | purple  | funny wiggly tentacles|

## 6. Quality gate (objective)

Before an asset is accepted it is scored 0–100 by
[`scripts/lib/score.mjs`](../scripts/lib/score.mjs) on **measurable** dimensions:

| Dimension            | What it measures                                   |
|----------------------|----------------------------------------------------|
| Background purity    | corner/edge transparency — no white box, no halo   |
| Silhouette coverage  | subject fills 55–90% of frame (not tiny, not clipped)|
| Silhouette boldness  | compact, rounded outline (not noisy/spindly)       |
| Centering            | subject centroid near frame centre                 |
| Contrast             | punchy internal luminance range                    |
| Colourfulness        | saturated, joyful palette                          |
| Sharpness            | crisp, not blurry (gradient energy)                |
| Detail balance       | bold & simple, not over-detailed AI noise          |

**Accept ≥ 88 / reject below.** Rejected variants are never shown to a child;
the pipeline generates more until one passes or logs the subject for hand-review.

> **Honest limit:** these heuristics prove *production* quality (clean cut-out,
> bold readable shape, consistent light) — the things that actually made our old
> assets look cheap. They cannot judge *anatomy* or *"is this obviously a shark"* —
> that subjective 5% needs a vision model. `score.mjs` exposes a `visionScore()`
> seam (env `VISION_ENDPOINT`) so a Claude/GPT-vision judge can be dropped in to
> cover it; until then those items are flagged for human sign-off, not silently
> passed.

## 7. Definition of done for any new asset

1. Prompt built from the registry (style bible baked in) — never ad-hoc.
2. Generated as **N variants**, auto-scored, **best kept** (`gen:variants`).
3. Background removed to true alpha; tight-cropped; centred.
4. Passes the Art Review Agent (`art:review`) with no CRITICAL issues.
5. Silhouette distinct from every sibling in its family.
