// ---------------------------------------------------------------------------
// Brain Booster Kids — Narration Manager
// Gives every adventure world its own storyteller. Each world is narrated by
// either a friendly female or friendly male voice — chosen deterministically
// from the world's index (so the same world always has the same narrator, and
// the voice only ever changes when the child enters a NEW region). All spoken
// lines in the app route through narrate(), so instructions, praise and
// welcomes all come from the current world's narrator.
// Built on the Web Speech API: zero assets, offline, no-ops when unavailable.
// ---------------------------------------------------------------------------
import { seededRandom } from '../data/levels'

export type NarratorGender = 'female' | 'male'

let voices: SpeechSynthesisVoice[] = []
let currentVoice: SpeechSynthesisVoice | null = null
let currentGender: NarratorGender = 'female'
let currentWorldIndex = 0

function refreshVoices() {
  try { voices = window.speechSynthesis?.getVoices() ?? [] } catch { voices = [] }
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  refreshVoices()
  try {
    // Voices often load asynchronously — re-pick the narrator when they arrive.
    window.speechSynthesis.onvoiceschanged = () => { refreshVoices(); pickVoice(currentGender, currentWorldIndex) }
  } catch { /* voice list unavailable */ }
}

// Name heuristics — the Web Speech API doesn't expose voice gender directly.
const FEMALE_HINTS = [
  'female', 'woman', 'girl', 'samantha', 'victoria', 'zira', 'susan', 'karen',
  'moira', 'tessa', 'veena', 'fiona', 'allison', 'ava', 'serena', 'kate',
  'hazel', 'heera', 'anna', 'emma', 'emily', 'jenny', 'aria', 'michelle',
  'natasha', 'sonia', 'catherine', 'monica', 'alice', 'nora', 'sara', 'lucia',
]
const MALE_HINTS = [
  'male', ' man', 'boy', 'daniel', 'david', 'mark', 'alex', 'fred', 'thomas',
  'oliver', 'rishi', 'george', 'james', 'ryan', 'guy', 'aaron', 'brandon',
  'christopher', 'eric', 'jacob', 'ravi', 'william', 'liam',
]

function classify(v: SpeechSynthesisVoice): NarratorGender | null {
  const n = v.name.toLowerCase()
  if (FEMALE_HINTS.some(h => n.includes(h))) return 'female'
  if (MALE_HINTS.some(h => n.includes(h))) return 'male'
  return null
}

// Higher-quality "storyteller" voices first: modern natural/neural voices sound
// warm and expressive, plain OS voices are the last resort.
const QUALITY_HINTS = ['natural', 'neural', 'premium', 'enhanced', 'google', 'siri', 'aria', 'jenny', 'libby', 'sonia', 'emma', 'ryan', 'guy']
function voiceQuality(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase()
  let score = QUALITY_HINTS.some(h => n.includes(h)) ? 2 : 0
  if (!v.localService) score += 1   // cloud voices are usually the nicer ones
  return score
}

function pickVoice(gender: NarratorGender, seed: number) {
  if (!voices.length) refreshVoices()
  const english = voices.filter(v => (v.lang || '').toLowerCase().startsWith('en'))
  const base = english.length ? english : voices
  const gendered = base.filter(v => classify(v) === gender)
  const pool = (gendered.length ? gendered : base).slice()
  // Prefer the best-sounding storyteller voices, keeping variety within a tier.
  pool.sort((a, b) => voiceQuality(b) - voiceQuality(a))
  const best = pool.filter(v => voiceQuality(v) === voiceQuality(pool[0]))
  currentVoice = best.length ? best[seed % best.length] : (pool.length ? pool[seed % pool.length] : null)
}

/** Deterministic narrator gender for a world — stable per world, varies across
 *  the journey so children keep meeting both storytellers. */
export function narratorGenderForWorld(worldIndex: number): NarratorGender {
  return seededRandom(worldIndex * 31 + 7)() < 0.5 ? 'female' : 'male'
}

/** Switches the narrator when the child enters a world. Returns the persona so
 *  callers can introduce them ("A new storyteller joins you!"). */
export function setNarratorForWorld(world: { index: number }): NarratorGender {
  currentWorldIndex = world.index
  currentGender = narratorGenderForWorld(world.index)
  pickVoice(currentGender, world.index)
  return currentGender
}

// --- Narration queue ---------------------------------------------------------
// The narrator must NEVER be cut off mid-word. Previously every line called
// speechSynthesis.cancel(), so the next question (mounting ~0.85s after a
// correct answer) chopped the celebration down to "Fant…". Instead we let the
// current line finish and queue the next one — keeping only the LATEST pending
// line so rapid play never stacks a backlog. A watchdog self-heals if the
// engine never fires onend (a known cross-browser quirk).
let speaking = false
let pending: string | null = null
let watchdog: ReturnType<typeof setTimeout> | null = null

function clearWatchdog() { if (watchdog) { clearTimeout(watchdog); watchdog = null } }

function finish() {
  speaking = false
  clearWatchdog()
  const next = pending
  pending = null
  if (next != null) speakNow(next)
}

function speakNow(text: string) {
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 1.0          // natural storyteller pace (was 0.78 — too slow)
  u.pitch = currentGender === 'female' ? 1.12 : 1.0
  if (currentVoice) u.voice = currentVoice
  u.onend = finish
  u.onerror = finish
  speaking = true
  // Estimate the spoken duration so a missing onend can't wedge the queue.
  clearWatchdog()
  watchdog = setTimeout(() => { if (speaking) finish() }, 1500 + text.length * 95)
  try { window.speechSynthesis.speak(u) } catch { finish() }
}

/** Speaks with the current world's narrator voice — a lively, natural
 *  storyteller pace. Lines never interrupt each other: the current line plays
 *  to the end, then the most recent queued line speaks. Female narrators sit a
 *  touch brighter, male a touch warmer. */
export function narrate(text: string, enabled: boolean) {
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    if (speaking) { pending = text; return }   // let the current line finish, queue latest
    speakNow(text)
  } catch { /* voice unavailable */ }
}

/** Immediately stop all narration (e.g. leaving a screen). Use sparingly —
 *  normal line-to-line flow should queue, not cancel. */
export function stopNarration() {
  pending = null
  clearWatchdog()
  speaking = false
  try { window.speechSynthesis.cancel() } catch { /* ignore */ }
}

// --- Narration scripts ---------------------------------------------------------

const WELCOME_OPENERS = [
  'A brand new adventure begins:',
  'Here we are —',
  'Ta-daa! Welcome to',
  'Our journey continues in',
]

/** The world-entry announcement the narrator reads during the transition. */
export function welcomeScript(world: { index: number; name: string; blurb: string }): string {
  const opener = WELCOME_OPENERS[Math.abs(world.index) % WELCOME_OPENERS.length]
  const sep = opener.endsWith(':') || opener.endsWith('—') ? ' ' : ' '
  return `${opener}${sep}${world.name}! ${world.blurb} Tigo the tiger is here with you. Let's play!`
}
