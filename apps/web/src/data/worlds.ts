// ---------------------------------------------------------------------------
// Brain Booster Kids — adventure worlds
// The 100 levels are grouped into 15 themed worlds the child travels through.
// Each world has its own scenery, accent colour, guide mascot and a pool of
// themed emoji that flows into the games (memory, patterns, counting…) so the
// challenges feel like they belong to that place.
// ---------------------------------------------------------------------------

export interface Mascot {
  key: string
  name: string
  emoji: string
  species: string
}

// Recurring characters that accompany children across the journey. Tigo the
// tiger is the official Brain Booster Kids mascot — he welcomes players,
// introduces worlds, celebrates wins and hands out hints everywhere.
export const MASCOTS: Mascot[] = [
  { key: 'tiger',    name: 'Tigo',   emoji: '🐯', species: 'Brave Little Tiger' },
  { key: 'panda',    name: 'Pip',    emoji: '🐼', species: 'Happy Panda' },
  { key: 'fox',      name: 'Rusty',  emoji: '🦊', species: 'Little Fox' },
  { key: 'elephant', name: 'Ellie',  emoji: '🐘', species: 'Friendly Elephant' },
  { key: 'dino',     name: 'Dot',    emoji: '🦕', species: 'Cute Dinosaur' },
  { key: 'dragon',   name: 'Sparky', emoji: '🐲', species: 'Baby Dragon' },
  { key: 'robot',    name: 'Bolt',   emoji: '🤖', species: 'Robot Buddy' },
  { key: 'parrot',   name: 'Coco',   emoji: '🦜', species: 'Pirate Parrot' },
]

/** Old content documents used 'owl' for the lead mascot slot — map it to Tigo. */
const LEGACY_MASCOT: Record<string, string> = { owl: 'tiger' }

export const mascotByKey = (key: string): Mascot =>
  MASCOTS.find(m => m.key === (LEGACY_MASCOT[key] ?? key)) ?? MASCOTS[0]

export interface World {
  index: number            // 0-based order in the journey
  id: string
  name: string
  emoji: string
  accent: string           // themed accent colour
  sky: string              // soft themed background tint
  mascot: string           // mascot key that guides this world
  blurb: string
  activities: string[]     // themed activity flavour (shown on the world card)
  emojis: string[]         // themed content pool used by the games
  firstLevel: number       // inclusive
  lastLevel: number        // inclusive
  terrain?: string         // scenery terrain override (Endless Engine worlds)
  artPrompt?: string       // gen-AI backdrop prompt (Endless Engine worlds)
  emblemPrompt?: string    // gen-AI emblem prompt (Endless Engine worlds)
  themes?: string[]        // content theme tags override (see theme engine)
  music?: string           // music theme key override (see theme engine)
}

export interface WorldSeed {
  id: string; name: string; emoji: string; accent: string; sky: string
  mascot: string; blurb: string; activities: string[]; emojis: string[]
  levels?: number          // how many levels this world spans (server-driven)
  terrain?: string; artPrompt?: string; emblemPrompt?: string
  themes?: string[]; music?: string
}

const SEEDS: WorldSeed[] = [
  { id: 'home', name: 'Home Village', emoji: '🏠', accent: '#7a5cc8', sky: '#f2f0fa', mascot: 'tiger',
    blurb: 'Where every adventure begins!', activities: ['Household objects', 'Memory cards', 'Shapes', 'Family puzzles'],
    emojis: ['🧸','🍼','🛏️','🪑','🕯️','🧦','👕','🥄','🍽️','🧹','🪥','📺','🔑','🪀','🧵','🎈'] },
  { id: 'forest', name: 'Green Forest', emoji: '🌳', accent: '#2fa981', sky: '#eaf7ef', mascot: 'fox',
    blurb: 'Tall trees and friendly animals.', activities: ['Animals', 'Trees', 'Birds', 'Hidden objects'],
    emojis: ['🦊','🦉','🐻','🦌','🐿️','🍄','🌲','🐺','🦔','🪺','🐛','🍂','🐦','🦇','🌰','🐜'] },
  { id: 'countryside', name: 'Countryside', emoji: '🌾', accent: '#e09420', sky: '#fbf3e2', mascot: 'panda',
    blurb: 'Sunny farms and happy animals.', activities: ['Farm animals', 'Vegetables', 'Counting', 'Matching'],
    emojis: ['🐄','🐔','🐖','🐑','🚜','🌻','🥕','🌽','🐴','🐓','🥚','🍅','🐐','🧺','🐝','🌾'] },
  { id: 'river', name: 'River Crossing', emoji: '🌊', accent: '#5ba8ff', sky: '#e9f3ff', mascot: 'elephant',
    blurb: 'Hop across the rushing river!', activities: ['Frogs & fish', 'Boats', 'Stepping stones', 'Water puzzles'],
    emojis: ['🐸','🦆','🐟','🛶','🪵','🐢','🦫','💧','🎣','🌉','🦢','🪨','🐊','🦭','🐌','🌿'] },
  { id: 'tropical', name: 'Tropical Island', emoji: '🏝️', accent: '#2fa981', sky: '#e6f7f0', mascot: 'panda',
    blurb: 'Palm trees and colourful birds.', activities: ['Parrots', 'Coconuts', 'Island puzzles', 'Memory'],
    emojis: ['🥥','🦜','🐒','🌴','🍍','🦎','🏖️','🐚','🦩','🌺','🍌','🦚','🐠','🥭','🌸','🦥'] },
  { id: 'beach', name: 'Beach Island', emoji: '🏖️', accent: '#f5b93e', sky: '#fdf4e0', mascot: 'fox',
    blurb: 'Sandcastles and splashy waves.', activities: ['Sea shells', 'Crabs', 'Beach games', 'Counting'],
    emojis: ['🏄','🐚','🦀','🌊','⛱️','🏐','🩴','🐙','🦑','🍦','🪁','🏖️','🐡','🧴','🪸','🌅'] },
  { id: 'ocean', name: 'Deep Ocean', emoji: '🐬', accent: '#2a7fc0', sky: '#e4f1fc', mascot: 'tiger',
    blurb: 'Dive into the coral kingdom!', activities: ['Sea creatures', 'Coral puzzles', 'Bubble counting', 'Memory'],
    emojis: ['🐬','🐳','🐠','🐟','🦈','🐙','🦀','🦞','🐚','🪸','🦑','🐡','🦭','🫧','🐢','⚓'] },
  { id: 'pirate', name: 'Pirate Island', emoji: '🏴‍☠️', accent: '#9a6b3a', sky: '#f7efdf', mascot: 'parrot',
    blurb: 'Ahoy! Hunt for hidden treasure.', activities: ['Treasure hunts', 'Map puzzles', 'Counting coins', 'Memory'],
    emojis: ['🏴‍☠️','⚓','🗺️','💰','🦜','⛵','🔭','💎','🪙','🏝️','🗝️','⚔️','🧭','🛶','🐚','👑'] },
  { id: 'volcano', name: 'Volcano Island', emoji: '🌋', accent: '#e5484d', sky: '#fdeceb', mascot: 'dragon',
    blurb: 'Hot rocks and glowing lava!', activities: ['Lava puzzles', 'Rocks', 'Brave challenges', 'Memory'],
    emojis: ['🌋','🔥','🪨','💥','🦖','🌡️','⛰️','🧨','🐉','☄️','🕳️','🪔','♨️','🧱','🟥','🟠'] },
  { id: 'dino', name: 'Dinosaur Island', emoji: '🦕', accent: '#2fa981', sky: '#ecf6ea', mascot: 'dino',
    blurb: 'Roar with the dinosaurs!', activities: ['Dinosaur matching', 'Fossil puzzles', 'Find the eggs', 'Memory'],
    emojis: ['🦕','🦖','🥚','🦴','🌿','🐊','🦎','🌋','🦕','🐢','🌴','🪨','🥩','🐾','🌾','🥚'] },
  { id: 'bridges', name: 'Giant Bridges', emoji: '🌉', accent: '#5d43a4', sky: '#efecfa', mascot: 'elephant',
    blurb: 'Cross the mighty bridges.', activities: ['Vehicles', 'Building', 'Traffic puzzles', 'Logic'],
    emojis: ['🌉','🚗','🚙','🚌','🏗️','🚧','🚦','🛣️','🚚','🚕','🏙️','🚁','🛺','🚲','⛽','🚏'] },
  { id: 'snow', name: 'Snow Mountains', emoji: '🏔️', accent: '#5ba8ff', sky: '#eef6ff', mascot: 'panda',
    blurb: 'Frosty peaks and playful penguins.', activities: ['Snowflakes', 'Penguins', 'Ice puzzles', 'Memory'],
    emojis: ['❄️','⛄','🐧','🏔️','🎿','🧊','🐻‍❄️','🦭','🧣','🛷','🌨️','⛷️','🏂','🧤','☃️','🥶'] },
  { id: 'desert', name: 'Desert Adventure', emoji: '🏜️', accent: '#e09420', sky: '#fbf1df', mascot: 'fox',
    blurb: 'Sandy dunes and hidden treasures.', activities: ['Camels', 'Cactus', 'Sand puzzles', 'Counting'],
    emojis: ['🐫','🌵','☀️','🦂','🏜️','🐍','🦎','🪨','🏺','🐪','🌴','🪱','🦔','⛺','🧭','💎'] },
  { id: 'magic', name: 'Magic Kingdom', emoji: '🏰', accent: '#ff6fa5', sky: '#fdeef5', mascot: 'dragon',
    blurb: 'Castles, unicorns and sparkles!', activities: ['Castles', 'Unicorns', 'Magic puzzles', 'Memory'],
    emojis: ['🏰','🐉','🧙','🦄','👑','🗡️','✨','🧚','🍄','🔮','🐴','🛡️','💫','🎠','🌟','🪄'] },
  { id: 'magicforest', name: 'Magic Forest', emoji: '🍄', accent: '#9b59d0', sky: '#f3ecfb', mascot: 'fox',
    blurb: 'Glowing mushrooms and fairy lights.', activities: ['Fairy puzzles', 'Glowing plants', 'Hidden sprites', 'Memory'],
    emojis: ['🍄','🧚','✨','🦋','🌸','🫎','🌙','💫','🐇','🌿','🦉','🕯️','🌺','🐌','⭐','🪄'] },
  { id: 'robot', name: 'Robot City', emoji: '🤖', accent: '#4a90d9', sky: '#eaf2fc', mascot: 'robot',
    blurb: 'Beep boop! A city of helpful robots.', activities: ['Robot logic', 'Gear puzzles', 'Circuit patterns', 'Memory'],
    emojis: ['🤖','⚙️','🔩','🔧','💡','🔋','🛠️','📡','🖥️','🕹️','🔌','🧲','🚦','🏭','💾','📟'] },
  { id: 'space', name: 'Space Station', emoji: '🚀', accent: '#5d43a4', sky: '#ecebf7', mascot: 'tiger',
    blurb: 'Blast off to the stars!', activities: ['Planets', 'Rockets', 'Aliens', 'Constellation memory'],
    emojis: ['🚀','🛰️','👨‍🚀','🌍','🪐','⭐','🛸','☄️','🌟','👽','🔭','🌠','🌌','💫','🌑','🚉'] },
  { id: 'moon', name: 'Moon Base', emoji: '🌙', accent: '#5ba8ff', sky: '#eef2fb', mascot: 'elephant',
    blurb: 'Bounce around on the moon.', activities: ['Craters', 'Aliens', 'Moon buggies', 'Galaxy matching'],
    emojis: ['🌙','🌚','🛸','👽','🌟','🪐','🚀','🌑','⭐','🌕','🪨','👾','🛰️','☄️','🌌','🔦'] },
  { id: 'mars', name: 'Mars Mission', emoji: '👽', accent: '#d0603a', sky: '#fbeae4', mascot: 'robot',
    blurb: 'Explore the red planet!', activities: ['Rover puzzles', 'Crater counting', 'Alien friends', 'Memory'],
    emojis: ['👽','🛸','🚀','🔴','🪨','🛰️','👾','🌡️','⛰️','🤖','📡','🌌','☄️','🔭','⭐','🏜️'] },
  { id: 'galaxy', name: 'Galaxy Adventure', emoji: '🌌', accent: '#7a5cc8', sky: '#eeeafb', mascot: 'dragon',
    blurb: 'Sail the sea of stars!', activities: ['Galaxies', 'Comets', 'Aliens', 'Star memory'],
    emojis: ['🌌','⭐','🌠','🪐','☄️','👽','🛸','✨','🌟','💫','🌛','🚀','👾','🔮','💠','🌈'] },
  { id: 'future', name: 'Future City', emoji: '🌆', accent: '#16a2b8', sky: '#e6f6f9', mascot: 'robot',
    blurb: 'Flying cars and sky gardens!', activities: ['Invention puzzles', 'Flying cars', 'Sky mazes', 'Memory'],
    emojis: ['🌆','🚁','🛩️','🏙️','💡','🚄','🌉','🛰️','🔬','🧪','🎆','🚟','🏗️','📱','💠','🌐'] },
  { id: 'timetravel', name: 'Time Travel', emoji: '⏰', accent: '#b07be0', sky: '#f2ecfb', mascot: 'tiger',
    blurb: 'The grand finale — through time itself!', activities: ['History puzzles', 'Clock counting', 'Era matching', 'Memory'],
    emojis: ['⏰','🕰️','⌛','🦖','🏰','🚀','⚙️','🌀','📜','🗿','🎩','🔮','🏺','💫','🕹️','👑'] },
]

/** Assigns level ranges to a list of world seeds. If a seed declares its own
 *  `levels` count those are honoured (and summed to the total); otherwise the
 *  `total` levels are split as evenly as possible. Both the seed list and the
 *  total are server-driven, so worlds/levels can be added by editing content. */
export function buildWorlds(seeds: WorldSeed[], total: number): World[] {
  const n = seeds.length
  const out: World[] = []
  const hasExplicit = seeds.some(s => typeof s.levels === 'number')
  let cursor = 1
  for (let i = 0; i < n; i++) {
    const seed = seeds[i]
    let take: number
    if (hasExplicit) {
      take = Math.max(1, seed.levels ?? Math.round((total - (cursor - 1)) / (n - i)))
    } else {
      take = Math.round((total - (cursor - 1)) / (n - i))
    }
    const firstLevel = cursor
    const lastLevel = i === n - 1 ? total : Math.min(total, cursor + take - 1)
    out.push({ index: i, ...seed, firstLevel, lastLevel })
    cursor = lastLevel + 1
    if (cursor > total) { // ran out of levels — remaining worlds collapse onto the last
      for (let k = i + 1; k < n; k++) out.push({ index: k, ...seeds[k], firstLevel: total, lastLevel: total })
      break
    }
  }
  return out
}

/** The active journey. Seeded with the built-in 15 worlds and replaced at
 *  startup by the server content document (see contentService). */
export let WORLDS: World[] = buildWorlds(SEEDS, 100)

export function setWorlds(next: World[]) { WORLDS = next }

/** Default seeds + total, used as the offline fallback content. */
export const DEFAULT_WORLD_SEEDS = SEEDS
export const DEFAULT_TOTAL_LEVELS = 100

export function worldForLevel(levelId: number): World {
  return WORLDS.find(w => levelId >= w.firstLevel && levelId <= w.lastLevel) ?? WORLDS[0]
}

/** Themed emoji pool for whatever world a level belongs to. */
export function themeEmojis(levelId: number): string[] {
  return (worldForLevel(levelId).emojis && worldForLevel(levelId).emojis.length)
    ? worldForLevel(levelId).emojis
    : ['⭐', '🎈', '🍬', '🌟', '🎁']
}
