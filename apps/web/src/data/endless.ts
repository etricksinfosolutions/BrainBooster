// ---------------------------------------------------------------------------
// Brain Booster Kids — the Endless Engine
// Brain Booster is not a 100-level game: when a child nears the end of the
// authored catalogue, this module deterministically generates brand-new worlds
// (name, palette, terrain, mascot, activity flavour, themed content pool and
// gen-AI art prompts) so the journey continues forever. World N is always the
// same world for every child (seeded), which keeps cloud saves and family
// devices consistent, while the art itself is AI-generated at runtime.
// ---------------------------------------------------------------------------
import { WorldSeed } from './worlds'

/** Extra fields generated worlds carry (flow through buildWorlds untouched). */
export interface GeneratedSeed extends WorldSeed {
  terrain: string
  artPrompt: string
  emblemPrompt: string
}

export const LEVELS_PER_GENERATED_WORLD = 5

interface Biome {
  name: string; emoji: string; accent: string; sky: string; terrain: string
  mascot: string; blurb: string; activities: string[]; emojis: string[]
  art: string; emblem: string
  themes?: string[]        // content theme tags (stories/facts)
  music?: string           // music theme key override
}

/** Biome templates the generator cycles through; each visit past the first
 *  becomes "… II", "… III" with fresh AI art (different seed per world index). */
const BIOMES: Biome[] = [
  { name: 'Candy Kingdom', emoji: '🍭', accent: '#e86aa6', sky: '#fdeef6', terrain: 'castle', mascot: 'panda', themes: ['candy', 'magic'], music: 'candy',
    blurb: 'A land made entirely of sweets!',
    activities: ['Candy counting', 'Sweet patterns', 'Lollipop logic', 'Memory'],
    emojis: ['🍭','🍬','🧁','🍩','🍪','🎂','🍫','🍰','🍦','🥞','🍧','🍮','🍯','🫧','⭐','🌈'],
    art: 'candy kingdom, lollipop trees, chocolate river, gingerbread houses, cotton candy clouds',
    emblem: 'swirly rainbow lollipop' },
  { name: 'Crystal Caves', emoji: '💎', accent: '#5b7fd4', sky: '#ecf0fb', terrain: 'canyon', mascot: 'dragon', themes: ['crystal', 'magic'], music: 'castle',
    blurb: 'Caves that sparkle with gems!',
    activities: ['Gem counting', 'Crystal patterns', 'Cave riddles', 'Memory'],
    emojis: ['💎','🔮','⛏️','🪨','✨','🦇','💠','🌟','🏮','🗿','⚒️','🕯️','🧭','💍','🔦','🪙'],
    art: 'magical crystal cave, giant glowing gemstones, underground lake, sparkling minerals',
    emblem: 'sparkling purple crystal cluster' },
  { name: 'Cloud Kingdom', emoji: '☁️', accent: '#6fb3e8', sky: '#eef6fd', terrain: 'castle', mascot: 'tiger', themes: ['magic'],
    blurb: 'Bounce between castles in the sky!',
    activities: ['Cloud counting', 'Rainbow patterns', 'Sky riddles', 'Memory'],
    emojis: ['☁️','🌈','🎈','🪁','🕊️','⭐','🌞','🦅','🎐','💫','🌤️','🪂','🧚','🌟','🫧','👼'],
    art: 'kingdom in the clouds, floating castles on fluffy clouds, rainbow bridges, hot air balloons',
    emblem: 'fluffy cloud with rainbow' },
  { name: 'Jungle Ruins', emoji: '🛕', accent: '#3f9d4e', sky: '#ebf6ea', terrain: 'forest', mascot: 'fox', themes: ['jungle', 'forest'], music: 'jungle',
    blurb: 'Ancient temples hide old secrets.',
    activities: ['Temple puzzles', 'Vine counting', 'Ruin riddles', 'Memory'],
    emojis: ['🛕','🐒','🦎','🌿','🗿','🏺','🐍','🦜','🌴','🪶','🍌','🔦','🗝️','🧭','💰','🪷'],
    art: 'ancient jungle temple ruins, mossy stone statues, hanging vines, monkeys, golden idol',
    emblem: 'ancient golden temple statue' },
  { name: 'Rainbow Reef', emoji: '🪸', accent: '#20a4a0', sky: '#e7f8f7', terrain: 'sea', mascot: 'tiger', themes: ['ocean'],
    blurb: 'The most colourful place under the sea!',
    activities: ['Fish counting', 'Coral patterns', 'Bubble riddles', 'Memory'],
    emojis: ['🪸','🐠','🐟','🦑','🐚','🦀','🐬','🫧','🌊','🐡','🦞','⚓','🧜','🐳','💠','⭐'],
    art: 'rainbow coral reef underwater, colorful tropical fish parade, friendly mermaid, treasure',
    emblem: 'colorful coral with tropical fish' },
  { name: 'Dragon Peaks', emoji: '🐉', accent: '#c0574f', sky: '#fbecea', terrain: 'volcano', mascot: 'dragon', themes: ['magic', 'volcano'],
    blurb: 'Baby dragons soar over misty peaks.',
    activities: ['Dragon counting', 'Flame patterns', 'Mountain riddles', 'Memory'],
    emojis: ['🐉','🐲','🔥','⛰️','🥚','🏔️','✨','🪶','🛡️','⚔️','🏹','💎','🌋','🦅','🌫️','⭐'],
    art: 'misty dragon mountains, cute baby dragons flying, dragon nests on cliffs, waterfalls',
    emblem: 'cute baby dragon on mountain peak' },
  { name: 'Mushroom Valley', emoji: '🍄', accent: '#c86fbf', sky: '#faeefa', terrain: 'forest', mascot: 'panda', themes: ['magic', 'forest'],
    blurb: 'A valley of giant friendly mushrooms.',
    activities: ['Mushroom counting', 'Spore patterns', 'Valley riddles', 'Memory'],
    emojis: ['🍄','🐌','🦔','🐛','🌸','✨','🐞','🦋','🌿','💧','🐸','🪲','🌼','🐝','🌙','⭐'],
    art: 'valley of giant colorful mushrooms, tiny doors in mushroom stems, glowing spores, snails',
    emblem: 'giant spotted mushroom house' },
  { name: 'Sky Pirates', emoji: '⛵', accent: '#8a6d3a', sky: '#f8f1e2', terrain: 'canyon', mascot: 'parrot', themes: ['pirate', 'city'], music: 'sea',
    blurb: 'Flying ships and windy adventures!',
    activities: ['Ship counting', 'Wind patterns', 'Pirate riddles', 'Memory'],
    emojis: ['⛵','🏴‍☠️','🎈','⚓','🪁','🧭','💰','🦜','☁️','🗺️','🔭','⚙️','🪙','🌪️','⭐','👑'],
    art: 'flying pirate ships with balloons sailing between clouds, sky islands, wind turbines',
    emblem: 'flying pirate ship with balloon sails' },
  { name: 'Frozen Palace', emoji: '❄️', accent: '#5ba8d4', sky: '#edf6fb', terrain: 'snow', mascot: 'tiger', themes: ['snow', 'magic'],
    blurb: 'An ice palace that glitters like stars.',
    activities: ['Snowflake counting', 'Ice patterns', 'Frost riddles', 'Memory'],
    emojis: ['❄️','⛄','🏰','🧊','🦌','🐧','✨','🛷','🌨️','🏔️','🎿','🧣','⭐','🦭','🌟','💠'],
    art: 'glittering ice palace, frozen fountains, aurora sky, ice sculptures of animals',
    emblem: 'shining ice castle tower' },
  { name: 'Dino Beach', emoji: '🦖', accent: '#5fae4f', sky: '#eef7e9', terrain: 'dino', mascot: 'dino', themes: ['dino', 'beach'],
    blurb: 'Dinosaurs on holiday by the sea!',
    activities: ['Dino counting', 'Shell patterns', 'Beach riddles', 'Memory'],
    emojis: ['🦖','🦕','🏖️','🐚','🌴','🥥','⛱️','🌊','🦴','🥚','🩴','🍉','🏐','🐢','🌺','⭐'],
    art: 'cute dinosaurs playing on a tropical beach, dino building sandcastle, surfing dinosaur',
    emblem: 'baby dinosaur with beach ball' },
]

const NUMERALS = ['II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

/** Deterministically builds generated-world N (0-based). */
export function generateWorldSeed(n: number): GeneratedSeed {
  const biome = BIOMES[n % BIOMES.length]
  const visit = Math.floor(n / BIOMES.length)
  const name = visit === 0 ? biome.name : `${biome.name} ${NUMERALS[Math.min(visit - 1, NUMERALS.length - 1)]}`
  return {
    id: `gen-${n}`,
    name, emoji: biome.emoji, accent: biome.accent, sky: biome.sky,
    mascot: biome.mascot, blurb: biome.blurb,
    activities: biome.activities, emojis: biome.emojis,
    levels: LEVELS_PER_GENERATED_WORLD,
    terrain: biome.terrain,
    artPrompt: biome.art,
    emblemPrompt: biome.emblem,
    themes: biome.themes,
    music: biome.music,
  }
}

// --- persistence — how many endless worlds this device has unlocked ----------
const ENDLESS_KEY = 'bbk:endless:v1'

export function endlessCount(): number {
  try { return Math.max(0, parseInt(localStorage.getItem(ENDLESS_KEY) || '0', 10) || 0) } catch { return 0 }
}

export function setEndlessCount(n: number) {
  try { localStorage.setItem(ENDLESS_KEY, String(n)) } catch { /* storage full */ }
}
