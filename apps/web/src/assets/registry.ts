// ---------------------------------------------------------------------------
// Brain Booster Kids — Asset Registry
//
// The heart of the Asset Engine. Historically every game used raw Unicode
// emoji as content ("🐙", "🍎", "⭐"). We keep the emoji string as a compact,
// stable *semantic key* — it is a great universal vocabulary and lets every
// generator / question bank stay untouched — but the emoji glyph is NEVER the
// asset a child sees. Instead each key resolves here to:
//
//    • a human-readable subject name  ("baby octopus")
//    • a fully-styled generation prompt in ONE consistent art universe
//    • a deterministic seed so the same key ALWAYS renders the identical
//      illustration (essential for Memory Match, where a pair must look alike)
//
// Adding a new world's asset pack = adding entries to SUBJECTS. Anything not
// mapped still resolves through a sensible fallback, so coverage is total and
// the app can never fall back to a bare emoji as its primary art.
// ---------------------------------------------------------------------------

// The single art direction shared by every illustration in the game — the
// "style bible" from docs/SPRITE_STYLE_GUIDE.md compressed into one prompt tail.
// Appended to every prompt so all assets read as ONE studio's toys: same camera,
// same light, same chunky Disney-Pixar proportions, same glossy finish. This is
// the highest-leverage lever on perceived quality — every character is born from
// it. Kept tight (~1 line) to stay well under URL limits.
export const ART_STYLE =
  'Disney-Pixar 3D toy character, big round head, huge sparkly eyes with ' +
  'catchlights, small chunky body, bold clear silhouette, thick soft outline, ' +
  'three-quarter front view eye-level, bright saturated high-contrast colors, ' +
  'soft top-left key light, glossy, gentle soft shadow, adorable happy ' +
  'expression, centered, plain flat white background, no text, no watermark'

// Per-subject art direction: a distinct SILHOUETTE + personality + signature
// palette so no two characters are confusable (§3/§5 of the style guide). This
// is layered between the subject noun and the global style, and is what turns a
// pile of look-alike "fish" into a readable FAMILY. Keyed by the same content
// emoji; anything without an explicit hint falls back to a category-family hint
// (hintFor). Adding a hint does NOT change the asset slug (filenames are stable),
// so hints can be tuned and re-baked freely.
const HINTS: Record<string, string> = {
  // — Ocean family — each a unique silhouette + signature colour (guide §5) —
  '🐟': 'round chubby body, tiny fins, cheerful smile, bright orange',
  '🦈': 'big goofy grin, oversized fins, chunky torpedo body, friendly, sky blue',
  '🐠': 'oval body with bold white stripes, big curious eyes, wide fins, pink and white clownfish',
  '🐡': 'perfectly round spiky ball body, puffed-up cheeks, tiny fins, sunny yellow',
  '🐢': 'big domed green shell, stubby legs, sleepy gentle smile',
  '🐙': 'huge round head, eight wiggly curly tentacles, goofy grin, purple',
  '🐬': 'sleek curved body, playful leaping pose, big smile, aqua blue dolphin',
  '🐳': 'giant rounded body, tiny water spout on top, gentle eyes, deep blue whale',
  '🦑': 'long pointed head, big eyes, dangly tentacles, coral red squid',
  '🦭': 'smooth blubbery body, big whiskers, flippers, shiny grey seal',
  '🦀': 'wide flat body, two big raised claws, googly eyes on stalks, bright red crab',
  '🦞': 'long segmented body, huge front claws, curled tail, orange-red lobster',
  '🦐': 'small curved body, tiny legs, long antennae, pink shrimp',
  // — Forest & farm faces get strong personality so tiles are distinct —
  '🦊': 'pointy ears, bushy tail, sly happy grin, bright orange fox',
  '🦉': 'big round eyes, tufted ears, plump feathered body, wise little owl',
  '🐻': 'big rounded ears, chubby body, warm friendly smile, brown bear',
  '🐷': 'round pink snout, curly tail, chubby cheeks, happy pig',
  '🐸': 'wide smile, big bulging eyes on top, round green body, cheerful frog',
  '🦆': 'round fluffy body, tiny orange beak, big eyes, yellow duckling',
}

/** Art-direction hint for a subject: its explicit silhouette/personality/palette
 *  if defined, otherwise a family default derived from its category so EVERY
 *  asset still gets toy-like, bold-silhouette direction (never a bare noun). */
export function hintFor(key: string): string {
  if (HINTS[key]) return HINTS[key]
  switch (categoryFor(key)) {
    case 'animal':    return 'expressive happy face, one bold unique silhouette, chunky and toy-like'
    case 'character': return 'big friendly eyes, heroic cute pose, one clear bold silhouette'
    case 'food':      return 'glossy and appetizing, simple bold rounded shape, cute'
    case 'plant':     return 'lush and rounded, cheerful, bold simple silhouette'
    case 'vehicle':   return 'chunky toy vehicle, rounded edges, cute headlight eyes, glossy'
    case 'space':     return 'glowing and magical, bold rounded shape, sparkly'
    default:          return 'clean bold rounded shape, glossy toy-like, cute'
  }
}

// key (emoji) -> descriptive subject. Grouped by asset pack / world for easy
// extension. Ordered roughly by world so future editors find neighbours fast.
const SUBJECTS: Record<string, string> = {
  // — Characters / mascots —
  '🐯': 'brave baby tiger cub', '🐼': 'happy baby panda', '🦊': 'cute little fox',
  '🐘': 'friendly baby elephant', '🦕': 'cute green baby dinosaur', '🐲': 'cute baby dragon',
  '🤖': 'cute friendly robot buddy', '🦜': 'colorful pirate parrot',

  // — Home Village —
  '🧸': 'cuddly teddy bear', '🍼': 'baby milk bottle', '🛏️': 'cozy bed',
  '🪑': 'wooden chair', '🕯️': 'lit candle', '🧦': 'pair of socks', '👕': 't-shirt',
  '🥄': 'spoon', '🍽️': 'plate with fork and knife', '🧹': 'broom', '🪥': 'toothbrush',
  '📺': 'television', '🔑': 'golden key', '🪀': 'yo-yo', '🧵': 'spool of thread',
  '🎈': 'red party balloon', '🏠': 'cozy little house',

  // — Green / Enchanted Forest —
  '🦉': 'wise little owl', '🐻': 'friendly brown bear', '🦌': 'gentle deer',
  '🐿️': 'cute squirrel', '🍄': 'red spotted mushroom', '🌲': 'pine tree',
  '🐺': 'friendly grey wolf', '🦔': 'cute hedgehog', '🪺': "bird's nest with eggs",
  '🐛': 'green caterpillar', '🍂': 'autumn leaves', '🐦': 'little songbird',
  '🦇': 'cute bat', '🌰': 'acorn', '🐜': 'ant', '🌳': 'big leafy tree',
  '🌸': 'cherry blossom flower', '🌺': 'hibiscus flower', '🌿': 'green leafy sprig',
  '🫎': 'friendly moose', '🐇': 'white bunny rabbit', '🌙': 'crescent moon',
  '🐌': 'cute snail', '🐝': 'happy honeybee', '🦋': 'colorful butterfly',
  '🧚': 'tiny fairy', '🪄': 'magic wand', '🌾': 'wheat stalk',

  // — Countryside / Farm —
  '🐄': 'spotted cow', '🐔': 'hen', '🐖': 'pink pig', '🐑': 'fluffy sheep',
  '🚜': 'red tractor', '🌻': 'sunflower', '🥕': 'carrot', '🌽': 'corn cob',
  '🐴': 'brown pony', '🐓': 'rooster', '🥚': 'egg', '🍅': 'tomato',
  '🐐': 'goat', '🧺': 'picnic basket',

  // — River Crossing —
  '🐸': 'green frog', '🦆': 'yellow duckling', '🐟': 'orange fish', '🛶': 'canoe',
  '🪵': 'wooden log', '🐢': 'sea turtle', '🦫': 'beaver', '💧': 'water droplet',
  '🎣': 'fishing rod', '🌉': 'suspension bridge', '🦢': 'graceful swan',
  '🪨': 'grey rock', '🐊': 'friendly crocodile',

  // — Tropical / Beach Island —
  '🥥': 'coconut', '🐒': 'playful monkey', '🌴': 'palm tree', '🍍': 'pineapple',
  '🦎': 'green lizard', '🏖️': 'sandy beach with umbrella', '🐚': 'spiral seashell',
  '🦩': 'pink flamingo', '🍌': 'banana', '🦚': 'peacock', '🐠': 'tropical fish',
  '🥭': 'mango', '🦥': 'sleepy sloth', '🏄': 'surfer on a wave', '🌊': 'ocean wave',
  '⛱️': 'beach umbrella', '🏐': 'volleyball', '🩴': 'flip-flop sandal',
  '🍦': 'ice cream cone', '🪁': 'kite', '🐡': 'pufferfish', '🧴': 'sunscreen bottle',
  '🪸': 'coral', '🌅': 'sunrise over the sea',

  // — Deep Ocean —
  '🐬': 'friendly dolphin', '🐳': 'blue whale', '🦈': 'friendly shark',
  '🐙': 'baby octopus', '🦀': 'red crab', '🦞': 'lobster', '🦑': 'squid',
  '🦭': 'cute seal', '🫧': 'bubbles', '⚓': 'ship anchor',

  // — Pirate Island —
  '🏴‍☠️': 'pirate flag', '🗺️': 'treasure map', '💰': 'bag of gold coins',
  '⛵': 'sailboat', '🔭': 'telescope', '💎': 'sparkling gem', '🪙': 'gold coin',
  '🏝️': 'desert island', '🗝️': 'old treasure key', '⚔️': 'crossed swords',
  '🧭': 'compass', '👑': 'golden crown', '🗡️': 'sword',

  // — Volcano Island —
  '🌋': 'erupting volcano', '🔥': 'flame', '💥': 'burst', '🦖': 'friendly T-Rex',
  '🌡️': 'thermometer', '⛰️': 'rocky mountain', '🧨': 'firecracker', '🐉': 'baby dragon',
  '☄️': 'comet', '🕳️': 'cave hole', '🪔': 'oil lamp', '♨️': 'steam vent',
  '🧱': 'brick', '🟥': 'red gem', '🟠': 'orange gem',

  // — Dinosaur Island —
  '🦴': 'dinosaur bone', '🥩': 'meat', '🐾': 'paw prints',

  // — Giant Bridges / City Roads —
  '🚗': 'red car', '🚙': 'blue SUV', '🚌': 'yellow school bus', '🏗️': 'crane',
  '🚧': 'road barrier', '🚦': 'traffic light', '🛣️': 'highway road', '🚚': 'delivery truck',
  '🚕': 'taxi', '🏙️': 'city skyline', '🚁': 'helicopter', '🛺': 'auto rickshaw',
  '🚲': 'bicycle', '⛽': 'fuel pump', '🚏': 'bus stop', '🌆': 'city at dusk',
  '🚄': 'bullet train', '🚟': 'monorail', '📱': 'smartphone', '💠': 'blue diamond',
  '🌐': 'globe', '🚉': 'train station', '🛩️': 'small airplane', '🔬': 'microscope',
  '🧪': 'test tube', '🎆': 'firework',

  // — Snow Mountains —
  '❄️': 'snowflake', '⛄': 'snowman', '🐧': 'penguin', '🏔️': 'snowy mountain',
  '🎿': 'skis', '🧊': 'ice cube', '🐻‍❄️': 'polar bear', '🧣': 'winter scarf',
  '🛷': 'sled', '🌨️': 'snow cloud', '⛷️': 'skier', '🏂': 'snowboarder',
  '🧤': 'winter mittens', '☃️': 'snowman with scarf', '🥶': 'cold shivering face',

  // — Desert —
  '🐫': 'two-hump camel', '🌵': 'cactus', '☀️': 'bright sun', '🦂': 'scorpion',
  '🏜️': 'sandy desert', '🐍': 'friendly snake', '🏺': 'clay pot', '🐪': 'camel',
  '🪱': 'worm', '⛺': 'camping tent',

  // — Castle / Fantasy —
  '🏰': 'fairytale castle', '🧙': 'friendly wizard', '🦄': 'magical unicorn',
  '✨': 'sparkles', '🔮': 'crystal ball', '🛡️': 'shield', '💫': 'swirl of sparkle stars',
  '🎠': 'carousel horse', '🌟': 'glowing star',

  // — Space —
  '🚀': 'rocket ship', '🛰️': 'satellite', '👨‍🚀': 'astronaut', '🌍': 'planet Earth',
  '🪐': 'ringed planet Saturn', '⭐': 'yellow star', '🛸': 'flying saucer UFO',
  '👽': 'friendly green alien', '🌠': 'shooting star', '🌌': 'starry galaxy',
  '🌑': 'dark planet', '🌚': 'new moon face', '🌕': 'full moon', '👾': 'space invader alien',
  '🔦': 'flashlight', '🔴': 'red planet Mars', '🌛': 'crescent moon face', '🌈': 'rainbow',

  // — Robot Factory —
  '⚙️': 'metal gear', '🔩': 'nut and bolt', '🔧': 'wrench', '💡': 'light bulb',
  '🔋': 'battery', '🛠️': 'hammer and wrench', '📡': 'satellite dish', '🖥️': 'computer monitor',
  '🕹️': 'joystick', '🔌': 'power plug', '🧲': 'magnet', '🏭': 'factory', '💾': 'floppy disk',
  '📟': 'pager',

  // — Time Machine —
  '⏰': 'alarm clock', '🕰️': 'mantel clock', '⌛': 'hourglass', '🌀': 'swirling portal',
  '📜': 'ancient scroll', '🗿': 'stone head statue', '🎩': 'magician top hat',

  // — Universal reward / fruit / celebration —
  '🍎': 'red apple', '🍇': 'bunch of purple grapes', '🍉': 'watermelon slice',
  '🍓': 'strawberry', '🍑': 'peach', '🥝': 'kiwi slice', '🎁': 'wrapped gift box',
  '⚽': 'soccer ball', '🎉': 'party popper', '🎊': 'confetti ball', '🍩': 'donut',
  '🍬': 'wrapped candy', '🐶': 'puppy dog', '🐱': 'kitten',
  '🦁': 'lion cub', '🐷': 'happy pig face', '🐵': 'monkey face',
  '🐞': 'ladybug', '🎺': 'trumpet', '📚': 'stack of books', '✏️': 'pencil',

  // — Rewards / goals surfaced in gameplay (maze goal, prizes) —
  '🏆': 'gold trophy cup', '🥇': 'gold medal', '🥈': 'silver medal', '🥉': 'bronze medal',
  '🧩': 'jigsaw puzzle piece', '📖': 'open storybook',

  // — Story heroes (each story's illustrated hero must be a first-class asset) —
  '☁️': 'fluffy white cloud', '🍭': 'swirly lollipop',
}

/** Deterministic 32-bit hash of a string → stable, positive integer seed. */
function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) % 100000
}

/** The subject noun for a content key, or a graceful derived fallback so no
 *  key is ever unmapped. */
export function subjectFor(key: string): string {
  if (SUBJECTS[key]) return SUBJECTS[key]
  // Fallback: a friendly generic that still yields on-style art rather than a
  // bare glyph. Kept intentionally cute so mystery tokens still look premium.
  return 'cute colorful cartoon object'
}

/** Whether we have a first-class named asset for this key (vs. the fallback). */
export function isKnownSubject(key: string): boolean {
  return Boolean(SUBJECTS[key])
}

/** Full, style-consistent generation prompt for a content key: the subject
 *  noun, its per-subject silhouette/personality direction, then the global
 *  style bible. This three-layer prompt is what makes each character both
 *  unmistakably itself AND unmistakably part of one studio's world. */
export function promptFor(key: string): string {
  return `${subjectFor(key)}, ${hintFor(key)}, ${ART_STYLE}`
}

/** Stable per-key seed so the same key always renders the identical asset. */
export function seedFor(key: string): number {
  return hashSeed(key)
}

/** Every content key that has a first-class illustrated subject. */
export const CONTENT_KEYS = Object.keys(SUBJECTS)

export type AssetCategory = 'animal' | 'food' | 'plant' | 'vehicle' | 'space' | 'character' | 'object'

// Keyword → category, checked in order. Used only to pick the right illustrated
// placeholder when a real asset can't load — never to render an emoji.
const CATEGORY_RULES: [RegExp, AssetCategory][] = [
  [/tiger|panda|fox|elephant|dragon|robot|parrot|wizard|fairy|astronaut|alien/, 'character'],
  [/cow|hen|pig|sheep|pony|rooster|goat|frog|duck|fish|turtle|beaver|swan|crocodile|monkey|lizard|flamingo|peacock|sloth|dolphin|whale|shark|octopus|crab|lobster|squid|seal|bear|owl|deer|squirrel|wolf|hedgehog|bird|bat|ant|caterpillar|bee|butterfly|snail|bunny|rabbit|moose|penguin|camel|scorpion|snake|worm|ladybug|unicorn|dinosaur|t-rex|lion|puppy|dog|kitten|cat|horse|pufferfish/, 'animal'],
  [/apple|banana|grape|watermelon|strawberry|peach|kiwi|carrot|corn|tomato|egg|coconut|pineapple|mango|milk|donut|candy|ice cream|meat/, 'food'],
  [/tree|flower|mushroom|leaf|leaves|acorn|blossom|hibiscus|sunflower|wheat|cactus|coral|sprig|palm/, 'plant'],
  [/car|bus|truck|taxi|tractor|train|helicopter|airplane|rocket|boat|sailboat|canoe|bicycle|rickshaw|saucer|ufo|sled|skis|rover/, 'vehicle'],
  [/star|planet|moon|galaxy|comet|satellite|earth|mars|saturn|nebula|space|rainbow/, 'space'],
]

/** Coarse category for a key — drives placeholder selection. */
export function categoryFor(key: string): AssetCategory {
  const s = subjectFor(key)
  for (const [re, cat] of CATEGORY_RULES) if (re.test(s)) return cat
  return 'object'
}

export interface AssetManifestEntry {
  key: string       // content token (emoji) — the stable id
  subject: string   // human-readable subject
  slug: string      // CDN object name (…/sprites/<slug>.webp)
  seed: number      // deterministic generation seed
  prompt: string    // full style-consistent generation prompt
}

/** Machine-readable catalogue of the whole sprite pack. Consumed by the
 *  backend bake job (gen-sprites) and the admin AI Content Studio to generate,
 *  validate and register every illustration. */
export function assetManifest(): AssetManifestEntry[] {
  return CONTENT_KEYS.map(key => ({
    key, subject: subjectFor(key), slug: slugFor(key), seed: seedFor(key), prompt: promptFor(key),
  }))
}

/** A filesystem/CDN-safe slug for a key — used as the object name when assets
 *  are served from S3/CloudFront (…/sprites/<slug>.webp). */
export function slugFor(key: string): string {
  return subjectFor(key).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
