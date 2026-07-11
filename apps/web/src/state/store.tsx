// ---------------------------------------------------------------------------
// Brain Booster Kids — global store
// React context + localStorage persistence (offline-first). In production the
// same shape syncs to the backend (see server/src/routes/progress.js).
// ---------------------------------------------------------------------------
import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { LEVELS, LevelDef, RewardResult, Skill, SkillMap, computeReward } from '../data/levels'
import { PRAISE, ENCOURAGE } from '../data/content'
import { Lang, StringKey, translate } from '../i18n'
import { narrate } from './narrator'
import { pickActivity, specForActivityId } from '../activities/scheduler'
import { ActivitySpec, ActivityLog } from '../activities/types'

// --- Types -------------------------------------------------------------------

export interface Settings {
  sound: boolean          // in-game sound effects (taps, right/wrong)
  music: boolean          // background music loop
  voice: boolean          // spoken instructions
  celebration: boolean    // win fanfare + coin/celebration jingles
  notifications: boolean  // reminders & streak nudges
  musicVolume: number     // 0..1
  sfxVolume: number       // 0..1
  colorBlind: boolean
  bigButtons: boolean
  reducedMotion: boolean   // a11y: suppress non-essential animation/transition
  highContrast: boolean    // a11y: stronger text/border/background contrast
  language: Lang
}

export interface DayLog { date: string; seconds: number; levels: number; coins: number }

export interface Profile {
  name: string
  avatar: string
  hat: string
  ownedAvatars: string[]
  ownedHats: string[]
  coins: number
  diamonds: number
  xp: number
  premium: boolean
  starsByLevel: Record<number, number>   // best stars per level
  badges: string[]
  streak: number
  lastPlayedDate: string
  skills: SkillMap
  days: DayLog[]                          // rolling 30-day log for parent dashboard
  gamesSinceAd: number
  dailyBonusDate: string
  spinDate: string
  gemUnlocked: number                     // highest level unlocked by spending diamonds
  seenQuestions: string[]                  // ids of questions already answered (no-repeat engine)
  seenFacts: string[]                      // titles of "Did you know?" facts already shown (never repeat)
  factIndex: number                        // how many "Did you know?" facts unlocked
  lastWorldId: string                      // last world visited → cinematic intro plays on change
  activityLog: ActivityLog                 // User Activity Mapping — per-activity history
  recentActivities: string[]               // most-recent-first activity ids (no-repeat window)
  recentMechanics: string[]                // most-recent-first mechanics (no back-to-back)
  activityByLevel: Record<number, string>  // pinned activity id per COMPLETED level — same challenge on replay
}

export interface State {
  profile: Profile
  settings: Settings
  screen: Screen
  activeLevel: LevelDef | null
  activeActivity: ActivitySpec | null      // the scheduled activity for activeLevel
  lastReward: (RewardResult & { levelId: number; bonusPerfect?: number; bonusNoHint?: number }) | null
  adBreak: boolean
}

/** Wraps the scheduler so a content hiccup can never break starting a level.
 *  A level the child has ALREADY completed replays its PINNED activity (so the
 *  same challenge kind reappears from the map); only brand-new levels are freshly
 *  scheduled. Falls back to a fresh pick if the pinned activity ever disappears. */
function scheduleActivity(level: LevelDef, p: Profile): ActivitySpec | null {
  try {
    const pinnedId = p.activityByLevel?.[level.id]
    if (pinnedId) {
      const pinned = specForActivityId(level, pinnedId)
      if (pinned) return pinned
    }
    return pickActivity(level, {
      recentActivities: p.recentActivities, recentMechanics: p.recentMechanics,
      activityLog: p.activityLog, skills: p.skills,
    })
  } catch { return null }
}

const dayIndex = () => Math.floor(Date.now() / 864e5)
const EMPTY_ACTIVITY = { plays: 0, completed: 0, skips: 0, stars: 0, hints: 0, bestMs: 0, lastLevel: 0, ts: 0 }

export type Screen =
  | 'home' | 'map' | 'play' | 'reward' | 'fact' | 'shop' | 'parents' | 'settings' | 'premium' | 'daily'

const today = () => new Date().toISOString().slice(0, 10)

// Coin-priced cosmetics ------------------------------------------------------
export const AVATARS = ['🦊','🐼','🦄','🐸','🦁','🐙','🦉','🐨','🐯','🤖','🐵','🐷','🐔','🐝','🐳','🦖']
export const AVATAR_PRICES: Record<string, number> = {
  '🦊': 0, '🐼': 0, '🦄': 150, '🐸': 100, '🦁': 200, '🐙': 250, '🦉': 300, '🐨': 350, '🐯': 400, '🤖': 500,
  '🐵': 120, '🐷': 140, '🐔': 90, '🐝': 110, '🐳': 700, '🦖': 600,
}
export const HATS = ['—','🎩','👑','🧢','🎓','🪖','⛑️','🎀','👒','🎧']
export const HAT_PRICES: Record<string, number> = {
  '—': 0, '🎩': 120, '👑': 400, '🧢': 80, '🎓': 200, '🪖': 150, '⛑️': 150, '🎀': 100, '👒': 130, '🎧': 160,
}
export const PREMIUM_AVATARS = ['🤖']
export const PREMIUM_HATS = ['👑']

// Diamond-priced cosmetics (the Gem Shop) — exclusive, bought with 💎 -----------
export const GEM_AVATARS = ['🐲','🦩','🦚','🦭','🦥','🐉']
export const GEM_AVATAR_PRICES: Record<string, number> = { '🐲': 10, '🦩': 6, '🦚': 7, '🦭': 6, '🦥': 8, '🐉': 12 }
export const GEM_HATS = ['🪄','🤠','🎃']
export const GEM_HAT_PRICES: Record<string, number> = { '🪄': 8, '🤠': 5, '🎃': 4 }

/** Diamonds needed to skip-unlock a locked level (scales gently with tier). */
export function unlockCost(level: LevelDef): number { return 2 + level.tierIndex }

/** Coins to reveal one hint. */
export const HINT_COST = 25
/** Coins to skip the current challenge and move straight to the next level. */
export const SKIP_COST = 100

const defaultProfile: Profile = {
  name: 'Champ', avatar: '🦊', hat: '—',
  ownedAvatars: ['🦊', '🐼'], ownedHats: ['—'],
  coins: 50, diamonds: 0, xp: 0, premium: false,
  starsByLevel: {}, badges: [], streak: 0, lastPlayedDate: '',
  skills: {}, days: [], gamesSinceAd: 0, dailyBonusDate: '', spinDate: '', gemUnlocked: 0,
  seenQuestions: [], seenFacts: [], factIndex: 0, lastWorldId: '',
  activityLog: {}, recentActivities: [], recentMechanics: [], activityByLevel: {},
}

// Configurable audio-mix defaults (#4) — background music is now clearly present
// while sound effects stay crisp on top. User volume settings still override these.
export const AUDIO_DEFAULTS = { musicVolume: 0.85, sfxVolume: 0.9 } as const

const defaultSettings: Settings = {
  sound: true, music: true, voice: true, celebration: true, notifications: true,
  musicVolume: AUDIO_DEFAULTS.musicVolume, sfxVolume: AUDIO_DEFAULTS.sfxVolume, colorBlind: false, bigButtons: false,
  reducedMotion: false, highContrast: false, language: 'en',
}

/**
 * Accessibility shell classes derived from user settings. Kept a pure function
 * (no DOM) so it is unit-testable and reused by the app shell. `reducedMotion`
 * and `highContrast` were declared in the engine's AccessibilityConfig but never
 * consumed by a renderer (see docs/launch/ACCESSIBILITY_AUDIT.md, Gap A1); this
 * wires them for the web player. The CSS also honours the OS
 * `prefers-reduced-motion` media query, so the toggle is an explicit opt-in on
 * top of the system preference.
 */
export function accessibilityClass(settings: Pick<Settings, 'reducedMotion' | 'highContrast'>): string {
  return [settings.reducedMotion && 'reduced-motion', settings.highContrast && 'high-contrast']
    .filter(Boolean).join(' ')
}

// --- Actions -------------------------------------------------------------------

type Action =
  | { type: 'nav'; screen: Screen }
  | { type: 'start-level'; level: LevelDef }
  | { type: 'complete-level'; level: LevelDef; accuracy: number; seconds: number; hintsUsed?: number; seenIds?: string[] }
  | { type: 'use-hint' }
  | { type: 'dismiss-reward' }
  | { type: 'dismiss-ad' }
  | { type: 'buy-avatar'; item: string } | { type: 'buy-hat'; item: string }
  | { type: 'buy-avatar-gem'; item: string } | { type: 'buy-hat-gem'; item: string }
  | { type: 'wear-avatar'; item: string } | { type: 'wear-hat'; item: string }
  | { type: 'set-setting'; key: keyof Settings; value: any }
  | { type: 'set-name'; name: string }
  | { type: 'claim-daily' }
  | { type: 'spin'; coins: number }
  | { type: 'unlock-level'; level: LevelDef }
  | { type: 'buy-premium' }
  | { type: 'visit-world'; worldId: string }
  | { type: 'skip-activity' }
  | { type: 'skip-challenge'; level: LevelDef }
  | { type: 'mark-fact-seen'; key: string }

const BADGE_FOR: Record<string, (l: LevelDef) => string | null> = {
  badge: l => `Star Scout · Level ${l.id}`,
  golden: l => `Golden Trophy · Level ${l.id}`,
  champion: () => 'Master Brain Champion 🏆',
}

function logDay(days: DayLog[], seconds: number, coins: number): DayLog[] {
  const d = today()
  const copy = days.slice(-29)
  const last = copy[copy.length - 1]
  if (last && last.date === d) {
    copy[copy.length - 1] = { ...last, seconds: last.seconds + seconds, levels: last.levels + 1, coins: last.coins + coins }
  } else copy.push({ date: d, seconds, levels: 1, coins })
  return copy
}

function reducer(state: State, action: Action): State {
  const p = state.profile
  switch (action.type) {
    case 'nav': return { ...state, screen: action.screen }
    case 'start-level':
      return { ...state, activeLevel: action.level, activeActivity: scheduleActivity(action.level, p), screen: 'play' }
    case 'skip-activity': {
      const act = state.activeActivity
      if (!act) return state
      const rec = p.activityLog[act.activityId] ?? EMPTY_ACTIVITY
      // Record the skip in the recency windows too, so the scheduler doesn't
      // deterministically re-serve the exact activity the child just backed out
      // of (and so the no-back-to-back mechanic rule also holds across a skip).
      return { ...state, activeActivity: null, profile: { ...p,
        activityLog: { ...p.activityLog, [act.activityId]: { ...rec, skips: rec.skips + 1, ts: dayIndex() } },
        recentActivities: [act.activityId, ...p.recentActivities].slice(0, 24),
        recentMechanics: [act.mechanic, ...p.recentMechanics].slice(0, 8),
      } }
    }
    case 'skip-challenge': {
      // Pay coins to skip a challenge and jump straight to the next level. The
      // skipped level is credited a single star (just enough to unlock the next
      // one) so the adventure keeps moving; the child can always replay it later
      // for the full reward. No-op if they can't afford it.
      if (p.coins < SKIP_COST) return state
      const level = action.level
      const act = state.activeActivity
      const prevStars = p.starsByLevel[level.id] ?? 0
      let activityLog = p.activityLog, recentActivities = p.recentActivities, recentMechanics = p.recentMechanics
      let activityByLevel = p.activityByLevel
      if (act) {
        const rec = activityLog[act.activityId] ?? EMPTY_ACTIVITY
        activityLog = { ...activityLog, [act.activityId]: { ...rec, skips: rec.skips + 1, ts: dayIndex() } }
        recentActivities = [act.activityId, ...recentActivities].slice(0, 24)
        recentMechanics = [act.mechanic, ...recentMechanics].slice(0, 8)
        activityByLevel = { ...activityByLevel, [level.id]: act.activityId }
      }
      const skipped: Profile = {
        ...p, coins: p.coins - SKIP_COST,
        starsByLevel: { ...p.starsByLevel, [level.id]: Math.max(prevStars, 1) },
        activityLog, recentActivities, recentMechanics, activityByLevel,
      }
      // Advance to the next level (clamped to the catalogue) and start playing it.
      const next = LEVELS.find(l => l.id === level.id + 1) ?? level
      return { ...state, profile: skipped, activeLevel: next, activeActivity: scheduleActivity(next, skipped), screen: 'play' }
    }
    case 'complete-level': {
      const { level, accuracy, seconds, hintsUsed = 0, seenIds } = action
      const act = state.activeActivity
      const reward = computeReward(level, accuracy, { premium: p.premium })
      // Bonus coins that reward mastery (encourages replay without hints).
      const bonusPerfect = accuracy >= 0.999 ? 20 + level.tierIndex * 5 : 0
      const bonusNoHint = hintsUsed === 0 ? 10 : 0
      const coinsGain = reward.coins + bonusPerfect + bonusNoHint
      const prevStars = p.starsByLevel[level.id] ?? 0
      // Skill practice is credited to the ACTIVITY the child actually played
      // (the scheduler may have served a memory game on a "logic" level), so
      // personalisation and the parent dashboard reflect real practice.
      const trainedSkill = act?.skill ?? level.skill
      const skills: SkillMap = { ...p.skills }
      const s = skills[trainedSkill] ?? { plays: 0, totalAccuracy: 0 }
      skills[trainedSkill] = { plays: s.plays + 1, totalAccuracy: s.totalAccuracy + accuracy }
      // User Activity Mapping: record what happened with this activity.
      let activityLog = p.activityLog, recentActivities = p.recentActivities, recentMechanics = p.recentMechanics
      if (act) {
        const rec = activityLog[act.activityId] ?? EMPTY_ACTIVITY
        const ms = seconds * 1000
        activityLog = { ...activityLog, [act.activityId]: {
          ...rec, plays: rec.plays + 1, completed: rec.completed + 1,
          stars: Math.max(rec.stars, reward.stars), hints: rec.hints + hintsUsed,
          bestMs: rec.bestMs ? Math.min(rec.bestMs, ms) : ms, lastLevel: level.id, ts: dayIndex(),
        } }
        recentActivities = [act.activityId, ...recentActivities].slice(0, 24)
        recentMechanics = [act.mechanic, ...recentMechanics].slice(0, 8)
      }
      // Pin the activity this level was cleared with, so revisiting it from the
      // adventure map always replays the SAME challenge kind (never re-rolled).
      const activityByLevel = act
        ? { ...p.activityByLevel, [level.id]: act.activityId }
        : p.activityByLevel
      const badgeMaker = level.milestone ? BADGE_FOR[level.milestone] : undefined
      const newBadge = badgeMaker ? badgeMaker(level) : null
      const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
      const streak = p.lastPlayedDate === today() ? p.streak : p.lastPlayedDate === yesterday ? p.streak + 1 : 1
      const gamesSinceAd = p.premium ? 0 : p.gamesSinceAd + 1
      const seenQuestions = seenIds && seenIds.length
        ? [...new Set([...p.seenQuestions, ...seenIds])].slice(-800)   // remember the last 800 answered
        : p.seenQuestions
      return {
        ...state,
        screen: 'reward',
        lastReward: { ...reward, coins: coinsGain, levelId: level.id, bonusPerfect, bonusNoHint },
        adBreak: !p.premium && gamesSinceAd >= 3,
        profile: {
          ...p,
          coins: p.coins + coinsGain,
          diamonds: p.diamonds + reward.diamonds,
          xp: p.xp + reward.xp,
          starsByLevel: { ...p.starsByLevel, [level.id]: Math.max(prevStars, reward.stars) },
          badges: newBadge && !p.badges.includes(newBadge) ? [...p.badges, newBadge] : p.badges,
          skills, streak, lastPlayedDate: today(),
          days: logDay(p.days, seconds, coinsGain),
          gamesSinceAd: gamesSinceAd >= 3 ? 0 : gamesSinceAd,
          seenQuestions,
          factIndex: p.factIndex + 1,
          activityLog, recentActivities, recentMechanics, activityByLevel,
        },
      }
    }
    case 'use-hint':
      return p.coins >= HINT_COST ? { ...state, profile: { ...p, coins: p.coins - HINT_COST } } : state
    case 'dismiss-reward': return { ...state, screen: 'map' } // ad overlay (adBreak) renders on top of the map
    case 'dismiss-ad': return { ...state, adBreak: false }
    case 'buy-avatar': {
      const cost = AVATAR_PRICES[action.item] ?? 0
      if (p.coins < cost || p.ownedAvatars.includes(action.item)) return state
      return { ...state, profile: { ...p, coins: p.coins - cost, ownedAvatars: [...p.ownedAvatars, action.item], avatar: action.item } }
    }
    case 'buy-hat': {
      const cost = HAT_PRICES[action.item] ?? 0
      if (p.coins < cost || p.ownedHats.includes(action.item)) return state
      return { ...state, profile: { ...p, coins: p.coins - cost, ownedHats: [...p.ownedHats, action.item], hat: action.item } }
    }
    case 'buy-avatar-gem': {
      const cost = GEM_AVATAR_PRICES[action.item] ?? 0
      if (p.diamonds < cost || p.ownedAvatars.includes(action.item)) return state
      return { ...state, profile: { ...p, diamonds: p.diamonds - cost, ownedAvatars: [...p.ownedAvatars, action.item], avatar: action.item } }
    }
    case 'buy-hat-gem': {
      const cost = GEM_HAT_PRICES[action.item] ?? 0
      if (p.diamonds < cost || p.ownedHats.includes(action.item)) return state
      return { ...state, profile: { ...p, diamonds: p.diamonds - cost, ownedHats: [...p.ownedHats, action.item], hat: action.item } }
    }
    case 'unlock-level': {
      const lvl = action.level
      // Only the very next locked level can be skip-unlocked, and only with enough diamonds.
      if (lvl.id !== unlockedMax(p) + 1 || p.diamonds < unlockCost(lvl)) return state
      return { ...state, profile: { ...p, diamonds: p.diamonds - unlockCost(lvl), gemUnlocked: Math.max(p.gemUnlocked, lvl.id) } }
    }
    case 'wear-avatar': return p.ownedAvatars.includes(action.item) ? { ...state, profile: { ...p, avatar: action.item } } : state
    case 'wear-hat': return p.ownedHats.includes(action.item) ? { ...state, profile: { ...p, hat: action.item } } : state
    case 'set-setting': return { ...state, settings: { ...state.settings, [action.key]: action.value } }
    case 'mark-fact-seen': {
      const seen = state.profile.seenFacts ?? []
      if (seen.includes(action.key)) return state
      return { ...state, profile: { ...state.profile, seenFacts: [...seen, action.key].slice(-1000) } }
    }
    case 'set-name': return { ...state, profile: { ...p, name: action.name.slice(0, 14) } }
    case 'claim-daily': {
      if (p.dailyBonusDate === today()) return state
      return { ...state, profile: { ...p, dailyBonusDate: today(), coins: p.coins + 40, diamonds: p.diamonds + (p.premium ? 2 : 1) } }
    }
    case 'spin': {
      if (p.spinDate === today()) return state
      return { ...state, profile: { ...p, spinDate: today(), coins: p.coins + action.coins } }
    }
    case 'buy-premium':
      return { ...state, profile: { ...p, premium: true, ownedAvatars: [...new Set([...p.ownedAvatars, ...PREMIUM_AVATARS])], ownedHats: [...new Set([...p.ownedHats, ...PREMIUM_HATS])] } }
    case 'visit-world':
      return p.lastWorldId === action.worldId ? state : { ...state, profile: { ...p, lastWorldId: action.worldId } }
  }
}

// --- Persistence ---------------------------------------------------------------

const KEY = 'bbk:v1'

function load(): State {
  const base: State = { profile: defaultProfile, settings: defaultSettings, screen: 'home', activeLevel: null, activeActivity: null, lastReward: null, adBreak: false }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return base
    const saved = JSON.parse(raw)
    return { ...base, profile: { ...defaultProfile, ...saved.profile }, settings: { ...defaultSettings, ...saved.settings } }
  } catch { return base }
}

// --- Audio + voice (Web Audio API — zero-asset, offline, tiny) -------------------

let ctx: AudioContext | null = null
function getCtx(): AudioContext | null {
  try {
    ctx = ctx ?? new (window.AudioContext || (window as any).webkitAudioContext)()
    return ctx
  } catch { return null }
}

// Sound effects share one bus so a single SFX-volume knob controls them all.
let sfxBus: GainNode | null = null
let sfxVol: number = AUDIO_DEFAULTS.sfxVolume
function getSfxBus(c: AudioContext): GainNode {
  if (!sfxBus) { sfxBus = c.createGain(); sfxBus.gain.value = sfxVol; sfxBus.connect(c.destination) }
  return sfxBus
}
export function setSfxVolume(v: number) {
  sfxVol = Math.max(0, Math.min(1, v))
  if (sfxBus && ctx) sfxBus.gain.setValueAtTime(sfxVol, ctx.currentTime)
}

function tone(freq: number, dur = 0.12, type: OscillatorType = 'sine', when = 0, gain = 0.08) {
  const c = getCtx(); if (!c) return
  try {
    const o = c.createOscillator(); const g = c.createGain()
    o.type = type; o.frequency.value = freq
    g.gain.setValueAtTime(gain, c.currentTime + when)
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + when + dur)
    o.connect(g); g.connect(getSfxBus(c))
    o.start(c.currentTime + when); o.stop(c.currentTime + when + dur + 0.02)
  } catch { /* audio unavailable */ }
}

export const sfx = {
  tap: () => tone(520, 0.06, 'triangle'),
  good: () => { tone(660, 0.1, 'sine'); tone(880, 0.12, 'sine', 0.09); tone(1320, 0.16, 'sine', 0.2) },
  // A clear "invalid" buzzer — two quick descending tones so a wrong tap is unmistakable.
  bad: () => { tone(240, 0.14, 'sawtooth', 0, 0.05); tone(160, 0.2, 'sawtooth', 0.12, 0.05) },
  coin: () => { tone(988, 0.07, 'square', 0, 0.05); tone(1319, 0.12, 'square', 0.07, 0.05) },
  fanfare: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.18, 'triangle', i * 0.11, 0.07)),
}

// Haptics — a short device vibration so a wrong answer is FELT as well as heard
// (works in the Android WebView / Capacitor and on the mobile web; a no-op where
// the Vibration API is absent). Deliberately independent of the sound setting so
// the "that's not right" cue still reaches a child who has muted the game.
export const haptics = {
  // A short ~30ms tick on a wrong answer so a child FEELS the mistake (#7). Fires in
  // sync with the invalid sound + visual shake; gated by the caller's sound setting.
  wrong: () => { try { navigator.vibrate?.(30) } catch { /* unsupported */ } },
  tap: () => { try { navigator.vibrate?.(12) } catch { /* unsupported */ } },
  win: () => { try { navigator.vibrate?.([0, 30, 40, 30, 40, 60]) } catch { /* unsupported */ } },
}

// --- Adventure music — a distinct ambient theme per world, crossfaded ------------
// Everything is synthesized live (zero audio files, fully offline). Each world
// gets its own key, tempo, timbre and gentle ambience (birdsong, ocean swells,
// soft wind, magical sparkles) so travelling to a new world changes the mood.
const MIDI = (n: number) => 440 * Math.pow(2, (n - 69) / 12)

type Ambience = 'birds' | 'ocean' | 'wind' | 'twinkle' | 'none'
interface Theme {
  root: number; scale: number[]; step: number
  lead: OscillatorType; leadDur: number; leadPeak: number
  notes: number[]                 // scale-degree indices, -1 = rest
  bass: number[]; bassType: OscillatorType
  pad: boolean; ambience: Ambience
  drums?: boolean                 // soft tribal drums (jungle / dinosaur worlds)
  bed?: 'ocean' | 'wind'          // looping filtered-noise ambience bed
}
const P = [0, 2, 4, 7, 9]         // major pentatonic — always sweet for kids
const THEMES: Record<string, Theme> = {
  village: { root: 60, scale: P, step: 0.28, lead: 'triangle', leadDur: 0.9, leadPeak: 0.05,
    notes: [0, 2, 4, 2, 4, -1, 3, -1, 2, 4, 5, 4, 2, -1, 0, -1], bass: [0, 3, 4, 0], bassType: 'sine', pad: false, ambience: 'birds' },
  forest: { root: 62, scale: P, step: 0.30, lead: 'sine', leadDur: 1.0, leadPeak: 0.045,
    notes: [4, -1, 2, -1, 0, 2, 4, -1, 3, -1, 5, -1, 4, 2, 0, -1], bass: [0, 4, 3, 0], bassType: 'sine', pad: false, ambience: 'birds' },
  dino: { root: 53, scale: P, step: 0.25, lead: 'triangle', leadDur: 0.7, leadPeak: 0.055,
    notes: [0, 0, 2, 0, 4, -1, 0, -1, 2, 2, 4, 2, 0, -1, -1, -1], bass: [0, 0, 3, 4], bassType: 'triangle', pad: false, ambience: 'none', drums: true },
  jungle: { root: 55, scale: [0, 3, 5, 7, 10], step: 0.26, lead: 'triangle', leadDur: 0.8, leadPeak: 0.045,
    notes: [0, -1, 2, 0, 3, -1, 2, -1, 0, 2, 3, 2, 0, -1, -1, -1], bass: [0, 0, 3, 4], bassType: 'triangle', pad: false, ambience: 'birds', drums: true },
  sea: { root: 60, scale: P, step: 0.36, lead: 'sine', leadDur: 1.7, leadPeak: 0.04,
    notes: [4, -1, -1, 2, -1, -1, 0, -1, 2, -1, -1, 4, -1, -1, -1, -1], bass: [0, 3, 4, 3], bassType: 'sine', pad: true, ambience: 'ocean', bed: 'ocean' },
  snow: { root: 72, scale: P, step: 0.34, lead: 'sine', leadDur: 0.5, leadPeak: 0.04,
    notes: [4, -1, 2, -1, 0, -1, 2, -1, 4, -1, 5, -1, 4, -1, -1, -1], bass: [0, 4, 3, 0], bassType: 'sine', pad: true, ambience: 'wind', bed: 'wind' },
  desert: { root: 59, scale: [0, 2, 3, 5, 7, 8, 10], step: 0.27, lead: 'triangle', leadDur: 0.85, leadPeak: 0.05,
    notes: [0, 2, 3, 2, 5, -1, 3, -1, 2, 3, 5, 3, 2, -1, 0, -1], bass: [0, 5, 3, 0], bassType: 'sine', pad: false, ambience: 'wind', bed: 'wind' },
  castle: { root: 60, scale: [0, 2, 4, 5, 7, 9, 11], step: 0.30, lead: 'sine', leadDur: 1.2, leadPeak: 0.045,
    notes: [0, 2, 4, 4, 5, -1, 4, -1, 2, 4, 6, 4, 4, -1, 2, -1], bass: [0, 5, 3, 4], bassType: 'sine', pad: true, ambience: 'twinkle' },
  candy: { root: 67, scale: P, step: 0.22, lead: 'square', leadDur: 0.6, leadPeak: 0.026,
    notes: [0, 2, 4, 2, 5, 4, 2, -1, 0, 2, 4, 2, 7, 5, 4, -1], bass: [0, 3, 4, 3], bassType: 'sine', pad: false, ambience: 'twinkle' },
  space: { root: 60, scale: [0, 2, 4, 6, 8, 10], step: 0.40, lead: 'sine', leadDur: 1.8, leadPeak: 0.04,
    notes: [0, -1, 3, -1, 5, -1, 3, -1, 4, -1, 2, -1, 0, -1, -1, -1], bass: [0, 3, 5, 3], bassType: 'sine', pad: true, ambience: 'twinkle' },
}

let master: GainNode | null = null   // music volume
let fade: GainNode | null = null     // start/stop envelope
let busA: GainNode | null = null
let busB: GainNode | null = null
let activeBus: 'A' | 'B' = 'A'
let musicVol: number = AUDIO_DEFAULTS.musicVolume
let musicTimer: ReturnType<typeof setTimeout> | null = null
let musicOn = false
let musicStep = 0
let nextNoteTime = 0
let curTheme = 'village'

function bus(): GainNode | null { return activeBus === 'A' ? busA : busB }

// --- ambience beds — looping filtered noise (waves, wind), one per theme -------
let noiseBuf: AudioBuffer | null = null
function getNoiseBuffer(c: AudioContext): AudioBuffer {
  if (noiseBuf) return noiseBuf
  const len = c.sampleRate * 2
  noiseBuf = c.createBuffer(1, len, c.sampleRate)
  const data = noiseBuf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  return noiseBuf
}

interface Bed { src: AudioBufferSourceNode; lfo: OscillatorNode | null }
let activeBed: Bed | null = null

function startBed(kind: Theme['bed'], dest: GainNode | null): Bed | null {
  if (!ctx || !kind || !dest) return null
  try {
    const src = ctx.createBufferSource()
    src.buffer = getNoiseBuffer(ctx); src.loop = true
    const filter = ctx.createBiquadFilter()
    const g = ctx.createGain()
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    if (kind === 'ocean') {           // deep swells that rise and fall like surf
      filter.type = 'lowpass'; filter.frequency.value = 340
      g.gain.value = 0.05; lfo.frequency.value = 0.13; lfoGain.gain.value = 0.035
    } else {                          // airy, distant wind
      filter.type = 'bandpass'; filter.frequency.value = 700; filter.Q.value = 0.5
      g.gain.value = 0.025; lfo.frequency.value = 0.07; lfoGain.gain.value = 0.015
    }
    lfo.connect(lfoGain); lfoGain.connect(g.gain); lfo.start()
    src.connect(filter); filter.connect(g); g.connect(dest)
    src.start()
    return { src, lfo }
  } catch { return null }
}

function stopBed(bed: Bed | null, delay = 1.6) {
  if (!bed || !ctx) return
  try { bed.src.stop(ctx.currentTime + delay); bed.lfo?.stop(ctx.currentTime + delay) } catch { /* already stopped */ }
}

/** Soft hand-drum thump: a sine with a quick pitch drop (jungle/dino worlds). */
function drum(dest: GainNode, freq: number, time: number, dur: number, peak: number) {
  if (!ctx) return
  const o = ctx.createOscillator(); const g = ctx.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(freq * 2.2, time)
  o.frequency.exponentialRampToValueAtTime(freq, time + Math.min(0.08, dur * 0.5))
  g.gain.setValueAtTime(0.0001, time)
  g.gain.exponentialRampToValueAtTime(peak, time + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur)
  o.connect(g); g.connect(dest)
  o.start(time); o.stop(time + dur + 0.03)
}

// --- Modern dance-pop groove kit (kids love a bouncy beat) ---------------------
// A punchy kick, snappy clap and crisp hat, all synthesised from noise/sine so
// the app stays asset-free and offline. Layered under every world's melody to
// give the whole game an upbeat, contemporary pulse.
const GROOVE = 0.82   // tempo multiplier (<1 = livelier); melodies keep their shape

/** Punchy dance kick — deep sine with a fast pitch drop and click. */
function kick(dest: GainNode, time: number, peak: number) {
  if (!ctx) return
  const o = ctx.createOscillator(); const g = ctx.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(150, time)
  o.frequency.exponentialRampToValueAtTime(48, time + 0.09)
  g.gain.setValueAtTime(0.0001, time)
  g.gain.exponentialRampToValueAtTime(peak, time + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, time + 0.22)
  o.connect(g); g.connect(dest); o.start(time); o.stop(time + 0.26)
}

/** Short filtered-noise burst — used for hats (high) and claps (band). */
function noiseHit(dest: GainNode, time: number, dur: number, peak: number, type: BiquadFilterType, freq: number, q = 0.8) {
  if (!ctx) return
  const src = ctx.createBufferSource(); src.buffer = getNoiseBuffer(ctx)
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, time)
  g.gain.exponentialRampToValueAtTime(peak, time + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur)
  src.connect(f); f.connect(g); g.connect(dest)
  src.start(time); src.stop(time + dur + 0.02)
}
const hat = (dest: GainNode, time: number, peak: number) => noiseHit(dest, time, 0.03, peak, 'highpass', 8000)
const clap = (dest: GainNode, time: number, peak: number) => noiseHit(dest, time, 0.13, peak, 'bandpass', 1700, 1.1)

function mnote(dest: GainNode, freq: number, time: number, dur: number, type: OscillatorType, peak: number) {
  if (!ctx) return
  const o = ctx.createOscillator(); const g = ctx.createGain()
  o.type = type; o.frequency.value = freq
  g.gain.setValueAtTime(0.0001, time)
  g.gain.exponentialRampToValueAtTime(peak, time + Math.min(0.08, dur * 0.2))
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur)
  o.connect(g); g.connect(dest)
  o.start(time); o.stop(time + dur + 0.03)
}

function scheduleStep(th: Theme, dest: GainNode, step: number, time: number) {
  const sd = th.step * GROOVE          // livelier grid, melodies keep their shape
  const s = step % 16                   // position in the 16-step bar

  // --- Lead melody — each world keeps its own catchy hook ---
  const degree = th.notes[step % th.notes.length]
  if (degree >= 0) {
    const oct = th.scale[degree % th.scale.length] + 12 * Math.floor(degree / th.scale.length)
    mnote(dest, MIDI(th.root + oct), time, sd * th.leadDur, th.lead, th.leadPeak)
  }

  // --- Bouncy synth bass — eighth notes with an octave "boom-bounce" ---
  const chord = th.bass[Math.floor(step / 4) % th.bass.length]
  const rootDeg = th.scale[chord % th.scale.length]
  if (s % 2 === 0) {
    const onBeat = s % 4 === 0                     // low root on the beat, bounce above it
    mnote(dest, MIDI(th.root - 12 + rootDeg + (onBeat ? 0 : 12)), time, sd * 1.4, th.bassType, onBeat ? 0.075 : 0.05)
  }

  // --- Soft chord pad (pad worlds only), tucked under the beat ---
  if (th.pad && s % 8 === 0) {
    mnote(dest, MIDI(th.root + th.scale[0]), time, sd * 7.5, 'sine', 0.016)
    mnote(dest, MIDI(th.root + th.scale[2 % th.scale.length]), time, sd * 7.5, 'sine', 0.014)
  }

  // --- Modern dance-pop groove on EVERY world (the part kids bop to) ---
  if (s % 4 === 0) kick(dest, time, 0.13)                          // four-on-the-floor
  if (s === 14) kick(dest, time, 0.09)                             // pickup into the next bar
  if (s === 4 || s === 12) clap(dest, time, 0.055)                 // backbeat clap
  if (s % 2 === 1) hat(dest, time, s % 4 === 3 ? 0.03 : 0.02)      // offbeat hats, accented
  if (s === 7 || s === 15) hat(dest, time + sd * 0.5, 0.016)       // tiny 16th flourish
  if (th.drums && (s === 6 || s === 10)) drum(dest, s === 6 ? 96 : 78, time, 0.12, 0.04) // tom accents

  // --- Ambience sparkles/whispers (kept, but subtle so the beat leads) ---
  if (th.ambience === 'birds' && s % 6 === 2) {
    mnote(dest, MIDI(84 + (s % 3) * 3), time + 0.05, 0.06, 'sine', 0.02)
  } else if (th.ambience === 'ocean' && s % 8 === 0) {
    mnote(dest, MIDI(th.root - 24), time, sd * 7, 'sine', 0.04) // wave swell
  } else if (th.ambience === 'wind' && s % 8 === 2) {
    mnote(dest, MIDI(th.root + 19), time, sd * 6, 'triangle', 0.01) // airy whisper
  } else if (th.ambience === 'twinkle' && s % 5 === 1) {
    mnote(dest, MIDI(90 + (s % 4) * 2), time + 0.05, 0.5, 'sine', 0.018) // sparkle
  }
}

function musicLoop() {
  if (!musicOn || !ctx) return
  const th = THEMES[curTheme] || THEMES.village
  const dest = bus()
  while (dest && nextNoteTime < ctx.currentTime + 0.3) {
    scheduleStep(th, dest, musicStep, nextNoteTime)
    musicStep++
    nextNoteTime += th.step * GROOVE
  }
  musicTimer = setTimeout(musicLoop, 70)
}

function buildGraph(c: AudioContext) {
  if (master) return
  fade = c.createGain(); fade.gain.value = 0.0001; fade.connect(c.destination)
  master = c.createGain(); master.gain.value = musicVol; master.connect(fade)
  busA = c.createGain(); busA.gain.value = 1; busA.connect(master)
  busB = c.createGain(); busB.gain.value = 0; busB.connect(master)
}

export function setMusicVolume(v: number) {
  musicVol = Math.max(0, Math.min(1, v))
  if (master && ctx) master.gain.setValueAtTime(musicVol, ctx.currentTime)
}

/** Crossfades to a music theme key (resolved by the World Theme Engine — see
 *  theme.ts). No-op if the theme is already playing. Never stops abruptly:
 *  the old world's music and ambience fade out as the new ones fade in. */
export function setMusicWorld(key: string) {
  if (!THEMES[key]) key = 'village'
  if (key === curTheme || !ctx || !busA || !busB) { curTheme = key; return }
  const now = ctx.currentTime
  const from = activeBus === 'A' ? busA : busB
  const to = activeBus === 'A' ? busB : busA
  from.gain.cancelScheduledValues(now); to.gain.cancelScheduledValues(now)
  from.gain.setValueAtTime(from.gain.value, now); from.gain.linearRampToValueAtTime(0, now + 1.4)
  to.gain.setValueAtTime(to.gain.value, now); to.gain.linearRampToValueAtTime(1, now + 1.4)
  activeBus = activeBus === 'A' ? 'B' : 'A'   // new notes schedule into the incoming bus
  curTheme = key
  if (musicOn) {                              // swap the ambience bed with the crossfade
    stopBed(activeBed)
    activeBed = startBed(THEMES[key].bed, to)
  }
}

export function startMusic() {
  const c = getCtx(); if (!c || musicOn) return
  const begin = () => {
    if (musicOn) return
    buildGraph(c)
    musicOn = true
    fade!.gain.cancelScheduledValues(c.currentTime)
    fade!.gain.setValueAtTime(0.0001, c.currentTime)
    fade!.gain.exponentialRampToValueAtTime(1, c.currentTime + 1.4) // gentle fade-in
    stopBed(activeBed, 0.1)
    activeBed = startBed((THEMES[curTheme] || THEMES.village).bed, bus())
    nextNoteTime = c.currentTime + 0.1
    musicLoop()
  }
  if (c.state === 'suspended') c.resume().then(begin).catch(() => {})
  else begin()
}

export function stopMusic() {
  if (!musicOn) return
  musicOn = false
  if (musicTimer) { clearTimeout(musicTimer); musicTimer = null }
  stopBed(activeBed, 0.5)
  activeBed = null
  if (fade && ctx) {
    const now = ctx.currentTime
    fade.gain.cancelScheduledValues(now)
    fade.gain.setValueAtTime(Math.max(fade.gain.value, 0.0001), now)
    fade.gain.exponentialRampToValueAtTime(0.0001, now + 0.5) // gentle fade-out
  }
}

/** All in-game speech goes through the Narration Manager, so instructions and
 *  praise are read by the current world's narrator (see state/narrator.ts). */
export function speak(text: string, enabled: boolean) {
  narrate(text, enabled)
}

export const randomPraise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)]
export const randomEncourage = () => ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]

// --- Context ---------------------------------------------------------------------

const StoreCtx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined as any, load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ profile: state.profile, settings: state.settings })) } catch { /* full */ }
  }, [state.profile, state.settings])
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const v = useContext(StoreCtx)
  if (!v) throw new Error('useStore outside provider')
  return v
}

/** Returns a translator bound to the user's chosen language. */
export function useT(): (key: StringKey) => string {
  const { state } = useStore()
  const lang = state.settings.language
  return (key: StringKey) => translate(lang, key)
}

export function unlockedMax(profile: Profile): number {
  let max = 1
  for (const l of LEVELS) { if (profile.starsByLevel[l.id]) max = Math.max(max, l.id + 1) }
  // …or however far the child has skip-unlocked with diamonds. Catalogue length
  // is server-driven and may exceed 100.
  return Math.min(Math.max(max, profile.gemUnlocked || 0), LEVELS.length)
}

export function levelForXp(xp: number) { return Math.floor(Math.sqrt(xp / 25)) + 1 }
