// ---------------------------------------------------------------------------
// Brain Booster Kids — World Theme Engine
// One resolver turns ANY world (authored, server-driven or endless-generated)
// into a complete immersion theme: terrain, content tags (stories/facts),
// music theme, question pools, painted backdrop, palette and narration line.
// Every field falls back from explicit seed data → per-id defaults → terrain
// defaults, so adding a future world needs NO application-code changes: give
// its seed a terrain (and optionally tags/music) and everything else follows.
// ---------------------------------------------------------------------------
import { World } from './data/worlds'
import { worldArtFor } from './components/art'

export type Terrain =
  | 'meadow' | 'forest' | 'farm' | 'river' | 'island' | 'sea' | 'volcano'
  | 'dino' | 'canyon' | 'snow' | 'desert' | 'castle' | 'space' | 'moon' | 'galaxy'

/** The full, resolved identity of one adventure world. */
export interface WorldTheme {
  terrain: Terrain
  tags: string[]        // content theme tags → themed stories & fun facts
  music: string         // music theme key (see the World Music Engine in store)
  pools: string[]       // ASSET_POOLS keys that flavour generated questions
  art: string           // painted backdrop URL (activity screens + transitions)
  accent: string        // world accent colour → buttons, nodes, highlights
  sky: string           // world sky tint → app background re-tints per world
  dark: boolean         // dark-art world (space, volcano…) → chrome adapts
  welcome: string       // narrator welcome line for the world transition
}

// --- terrain resolution -------------------------------------------------------

const TERRAIN_BY_ID: Record<string, Terrain> = {
  home: 'meadow', forest: 'forest', countryside: 'farm', river: 'river',
  tropical: 'island', beach: 'sea', ocean: 'sea', pirate: 'island',
  volcano: 'volcano', dino: 'dino', bridges: 'canyon', snow: 'snow',
  desert: 'desert', magic: 'castle', magicforest: 'forest', robot: 'space',
  space: 'space', moon: 'moon', mars: 'desert', galaxy: 'galaxy',
  future: 'space', timetravel: 'galaxy',
}

export function terrainFor(w: World): Terrain {
  return (w.terrain as Terrain) || TERRAIN_BY_ID[w.id] || 'meadow'
}

// --- content theme tags (stories + facts) -------------------------------------

const TAGS_BY_ID: Record<string, string[]> = {
  home: ['home', 'farm'],
  forest: ['forest'],
  countryside: ['farm', 'home'],
  river: ['river', 'forest'],
  tropical: ['island', 'jungle'],
  beach: ['beach', 'ocean'],
  ocean: ['ocean'],
  pirate: ['pirate', 'ocean', 'island'],
  volcano: ['volcano', 'dino'],
  dino: ['dino', 'jungle'],
  bridges: ['city'],
  snow: ['snow'],
  desert: ['desert'],
  magic: ['magic'],
  magicforest: ['magic', 'forest'],
  robot: ['robot', 'city'],
  space: ['space'],
  moon: ['space'],
  mars: ['space', 'robot'],
  galaxy: ['space', 'magic'],
  future: ['city', 'robot'],
  timetravel: ['time', 'magic'],
}

const TAGS_BY_TERRAIN: Record<Terrain, string[]> = {
  meadow: ['home', 'farm'], forest: ['forest'], farm: ['farm'],
  river: ['river'], island: ['island', 'beach'], sea: ['ocean'],
  volcano: ['volcano'], dino: ['dino'], canyon: ['city', 'desert'],
  snow: ['snow'], desert: ['desert'], castle: ['magic'],
  space: ['space'], moon: ['space'], galaxy: ['space'],
}

// --- music theme keys ----------------------------------------------------------

const MUSIC_BY_ID: Record<string, string> = {
  home: 'village', countryside: 'village', forest: 'forest', bridges: 'forest',
  magicforest: 'castle', dino: 'jungle', volcano: 'dino',
  river: 'sea', tropical: 'sea', beach: 'sea', ocean: 'sea', pirate: 'sea',
  desert: 'desert', mars: 'desert', snow: 'snow',
  magic: 'castle', timetravel: 'castle',
  space: 'space', moon: 'space', galaxy: 'space', robot: 'space', future: 'space',
}

const MUSIC_BY_TERRAIN: Record<Terrain, string> = {
  meadow: 'village', farm: 'village', forest: 'forest', canyon: 'forest',
  river: 'sea', island: 'sea', sea: 'sea', volcano: 'dino', dino: 'jungle',
  snow: 'snow', desert: 'desert', castle: 'castle',
  space: 'space', moon: 'space', galaxy: 'space',
}

// --- question flavour pools (keys into questions.ASSET_POOLS) ------------------

const POOLS_BY_TAG: Record<string, string[]> = {
  home: ['household', 'toys'], farm: ['vegetables', 'fruits', 'animals'],
  forest: ['animals', 'birds', 'insects'], river: ['sea', 'birds', 'insects'],
  island: ['fruits', 'birds', 'sea'], beach: ['sea', 'fruits'], ocean: ['sea'],
  pirate: ['sea', 'toys'], volcano: ['dinos'], dino: ['dinos', 'animals'],
  city: ['vehicles', 'household'], snow: ['animals', 'cartoon'],
  desert: ['animals', 'cartoon'], magic: ['cartoon', 'toys'],
  robot: ['vehicles', 'toys'], space: ['cartoon', 'vehicles'],
  time: ['household', 'cartoon'], candy: ['fruits', 'cartoon'],
  crystal: ['cartoon'], jungle: ['animals', 'birds', 'insects'],
}

const DARK_TERRAINS = new Set<Terrain>(['space', 'moon', 'galaxy', 'volcano'])

/** Resolves the complete immersion theme for a world. Pure and cheap. */
export function themeFor(world: World): WorldTheme {
  const terrain = terrainFor(world)
  const tags = (world.themes && world.themes.length ? world.themes : undefined)
    ?? TAGS_BY_ID[world.id]
    ?? TAGS_BY_TERRAIN[terrain]
  const music = world.music || MUSIC_BY_ID[world.id] || MUSIC_BY_TERRAIN[terrain]
  const pools = [...new Set(tags.flatMap(t => POOLS_BY_TAG[t] ?? []))]
  return {
    terrain, tags, music,
    pools: pools.length ? pools : ['animals', 'fruits', 'toys', 'cartoon'],
    art: worldArtFor(world),
    accent: world.accent,
    sky: world.sky,
    dark: DARK_TERRAINS.has(terrain),
    welcome: `Welcome to ${world.name}! ${world.blurb}`,
  }
}
