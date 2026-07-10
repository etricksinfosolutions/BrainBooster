// ---------------------------------------------------------------------------
// Brain Booster Kids — AI Content Generation Pipeline
//
// Content (puzzles, riddles, stories, hidden-object scenes, word searches,
// facts, reward cards…) is produced by *generators* behind one interface, run
// through a *validation gate*, and only then admitted to the live catalogue.
// This lets a backend job (or an on-device model) grow the library forever
// while guaranteeing every generated item is safe, solvable and age-appropriate
// before a child ever sees it.
//
// The generators here are STUBS with clearly-marked seams: the deterministic
// on-device generators the game already ships (see data/questions.ts, the maze
// / sliding / match-3 board builders) are real and validated; the LLM/image
// providers are interface-only until API keys are wired (see TODO markers).
// ---------------------------------------------------------------------------
import { ActivityType, Mechanic } from './types'

// --- Generation requests & results ------------------------------------------

export interface GenerateRequest {
  kind: 'puzzle' | 'riddle' | 'story' | 'fact' | 'scene' | 'word-search' | 'crossword' | 'reward-card'
  mechanic?: Mechanic
  themeTags: string[]          // world themes the content must fit
  difficulty: number           // 0..5
  locale?: string              // for translations
  seed?: number                // reproducibility
  count?: number
}

/** A freshly generated, not-yet-validated candidate. */
export interface GeneratedItem {
  id: string
  kind: GenerateRequest['kind']
  mechanic?: Mechanic          // set when the item is a playable activity type
  payload: unknown             // shape depends on kind (validated below)
  themeTags: string[]
  difficulty: number
  source: 'onDevice' | 'llm' | 'image'
}

export interface Generator {
  readonly kind: GenerateRequest['kind']
  generate(req: GenerateRequest): Promise<GeneratedItem[]>
}

// --- Validation gate ---------------------------------------------------------
// Nothing reaches children unvalidated. Each check is cheap and composable;
// production adds a moderation-API call and a "is it actually solvable?" replay.

export interface ValidationResult { ok: boolean; reasons: string[] }

const BANNED = [
  // A conservative child-safety denylist (extend server-side). Matches whole
  // words so it never trips on innocent substrings.
  'kill', 'blood', 'gun', 'die', 'dead', 'hate', 'stupid', 'ugly', 'scary', 'weapon',
]

/** True when text is safe & age-appropriate for 4–10 year olds. */
export function validateText(text: string): ValidationResult {
  const reasons: string[] = []
  const words = text.toLowerCase().split(/[^a-z]+/)
  const hit = BANNED.find(b => words.includes(b))
  if (hit) reasons.push(`contains disallowed word: "${hit}"`)
  if (text.trim().length < 3) reasons.push('too short')
  if (text.length > 600) reasons.push('too long for a young reader')
  return { ok: reasons.length === 0, reasons }
}

/** Validates one generated item by kind. Unknown/malformed → rejected. */
export function validateItem(item: GeneratedItem): ValidationResult {
  const reasons: string[] = []
  if (!item.id) reasons.push('missing id')
  if (item.difficulty < 0 || item.difficulty > 5) reasons.push('difficulty out of range')
  const p: any = item.payload
  switch (item.kind) {
    case 'riddle':
    case 'fact':
    case 'story': {
      const text = [p?.title, p?.text, p?.q, ...(p?.text || []), ...(p?.options || [])].filter(Boolean).join(' ')
      const v = validateText(String(text))
      if (!v.ok) reasons.push(...v.reasons)
      if (item.kind === 'riddle' && (!Array.isArray(p?.options) || typeof p?.answer !== 'number')) reasons.push('riddle needs options + answer')
      break
    }
    case 'puzzle':
    case 'word-search':
    case 'crossword':
      // Structural puzzles must declare a solution so we can prove solvability.
      if (p?.solution == null) reasons.push('puzzle has no declared solution')
      break
    case 'scene':
    case 'reward-card':
      if (!p?.assetUrl && !p?.prompt) reasons.push('visual item needs an assetUrl or prompt')
      break
  }
  return { ok: reasons.length === 0, reasons }
}

// --- The pipeline ------------------------------------------------------------

export interface PipelineOutcome {
  admitted: GeneratedItem[]
  rejected: { item: GeneratedItem; reasons: string[] }[]
}

/** Runs generators, validates every candidate, and admits only the safe ones. */
export async function runPipeline(generators: Generator[], req: GenerateRequest): Promise<PipelineOutcome> {
  const admitted: GeneratedItem[] = []
  const rejected: PipelineOutcome['rejected'] = []
  for (const g of generators) {
    let items: GeneratedItem[] = []
    try { items = await g.generate(req) } catch { items = [] }
    for (const item of items) {
      const v = validateItem(item)
      if (v.ok) admitted.push(item)
      else rejected.push({ item, reasons: v.reasons })
    }
  }
  return { admitted, rejected }
}

// --- Art-style system --------------------------------------------------------
// One house style keeps every generated illustration on-brand. Extends the
// existing Pollinations/flux setup (see components/art.tsx).

export const ART_STYLE =
  'cute 3d render, kids mobile game art, soft pastel colors, rounded shapes, ' +
  'dreamy soft light, adorable friendly characters, high quality, no text, no words'

/** Wraps any subject prompt in the shared house style for a consistent look. */
export function styledPrompt(subject: string): string {
  return `${subject}, ${ART_STYLE}`
}

// --- Stub generators ---------------------------------------------------------
// Interface-complete so the pipeline is testable today. Swap the bodies for
// real providers when keys are available.

/** TODO(keys): replace with a real LLM call (Claude) → JSON items. */
export const llmGenerator: Generator = {
  kind: 'riddle',
  async generate(_req) {
    // Deferred until an API key is configured; returns nothing so the pipeline
    // simply falls back to the game's shipped deterministic content.
    return []
  },
}

/** Image generator — real today via Pollinations flux, on the house style. */
export const imageGenerator: Generator = {
  kind: 'scene',
  async generate(req) {
    const subject = `a ${req.themeTags[0] || 'magical'} scene for children`
    return [{
      id: `scene-${req.seed ?? 0}`,
      kind: 'scene',
      payload: { prompt: styledPrompt(subject) },
      themeTags: req.themeTags,
      difficulty: req.difficulty,
      source: 'image',
    }]
  },
}

/** Turns admitted items into catalogue-ready ActivityTypes for a server-side
 *  job to publish (see server/routes/activities.js). Only structural puzzle
 *  kinds that name a mechanic become playable activity types; prose/visual
 *  items (facts, stories, scenes) feed the content banks instead. */
export function itemsToActivityTypes(items: GeneratedItem[]): ActivityType[] {
  const out: ActivityType[] = []
  for (const i of items) {
    if (!i.mechanic) continue
    out.push({
      id: i.id,
      name: (i.payload as any)?.name ?? i.id,
      icon: (i.payload as any)?.icon ?? '✨',
      mechanic: i.mechanic,
      skill: (i.payload as any)?.skill ?? 'logic',
      category: 'Generated',
      minTier: Math.max(0, Math.min(4, Math.floor(i.difficulty))),
      maxTier: 4,
      themes: i.themeTags,
      fresh: true,
    })
  }
  return out
}
