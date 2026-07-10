// ---------------------------------------------------------------------------
// Brain Booster Kids — content database
// Static, offline-first content. In production this is hydrated from the
// backend CMS (see server/src/routes/admin.js) and cached locally.
// ---------------------------------------------------------------------------

export interface Riddle { q: string; options: string[]; answer: number; hint: string }
export interface FlagItem { flag: string; country: string; capital: string; continent: string }
export interface WordItem { emoji: string; word: string; opposite?: string }
// Stories moved to data/stories.ts — the themed story bank tagged per world.

export const RIDDLES: Riddle[] = [
  { q: 'I have hands but cannot clap. What am I?', options: ['A clock', 'A glove', 'A monkey', 'A door'], answer: 0, hint: 'Tick tock!' },
  { q: 'What has to be broken before you can use it?', options: ['A toy', 'An egg', 'A pencil', 'A book'], answer: 1, hint: 'Breakfast time!' },
  { q: 'I am full of holes but I still hold water. What am I?', options: ['A bucket', 'A cup', 'A sponge', 'A bottle'], answer: 2, hint: 'Bath time helper.' },
  { q: 'What has one eye but cannot see?', options: ['A needle', 'A cat', 'A potato', 'A fish'], answer: 0, hint: 'It helps you sew.' },
  { q: 'What gets wetter the more it dries?', options: ['A fan', 'A towel', 'The sun', 'Sand'], answer: 1, hint: 'After a bath...' },
  { q: 'I have teeth but I never bite. What am I?', options: ['A shark', 'A dog', 'A comb', 'A lion'], answer: 2, hint: 'It fixes your hair.' },
  { q: 'What goes up but never comes down?', options: ['A ball', 'Rain', 'Your age', 'A kite'], answer: 2, hint: 'Happy birthday!' },
  { q: 'I am yellow, I peel, and monkeys love me!', options: ['Lemon', 'Banana', 'Sun', 'Cheese'], answer: 1, hint: '🐒 yum!' },
  { q: 'What has a neck but no head?', options: ['A bottle', 'A giraffe', 'A shirt... wait, both!', 'A swan'], answer: 0, hint: 'You drink from it.' },
  { q: 'The more you take, the more you leave behind. What am I?', options: ['Cookies', 'Footsteps', 'Toys', 'Time'], answer: 1, hint: 'Look at the sand!' },
  { q: 'I fly without wings and cry without eyes. What am I?', options: ['A bird', 'A plane', 'A cloud', 'A bee'], answer: 2, hint: 'It brings rain.' },
  { q: 'What kind of room has no doors or windows?', options: ['A bathroom', 'A mushroom', 'A classroom', 'A bedroom'], answer: 1, hint: 'It grows in the forest.' },
  { q: 'What has legs but cannot walk?', options: ['A spider', 'A table', 'A baby', 'A robot'], answer: 1, hint: 'You eat dinner on it.' },
  { q: 'I get smaller every time I take a bath. What am I?', options: ['Soap', 'A duck', 'A towel', 'A boat'], answer: 0, hint: 'Bubbles everywhere!' },
  { q: 'What has a face and two hands but no arms?', options: ['A doll', 'A clock', 'A mirror', 'A puppet'], answer: 1, hint: 'It tells the time.' },
  { q: 'What is orange and sounds like a parrot?', options: ['A carrot', 'A mango', 'A tiger', 'A ball'], answer: 0, hint: 'Rabbits love it.' },
  { q: 'I am tall when I am young and short when I am old.', options: ['A tree', 'A candle', 'A mountain', 'A giraffe'], answer: 1, hint: 'Birthday cakes have them.' },
  { q: 'What can you catch but never throw?', options: ['A ball', 'A fish', 'A cold', 'A frisbee'], answer: 2, hint: 'Achoo!' },
  { q: 'What building has the most stories?', options: ['A tower', 'A castle', 'A library', 'A school'], answer: 2, hint: 'Shhh... read quietly.' },
  { q: 'I have a tail and a head, but no body. What am I?', options: ['A snake', 'A coin', 'A comet', 'A kite'], answer: 1, hint: 'Flip me!' },
  { q: 'What goes through towns and hills but never moves?', options: ['A road', 'A river... no, a road!', 'A train', 'Wind'], answer: 0, hint: 'Cars drive on it.' },
  { q: 'Which month has 28 days?', options: ['February only', 'All of them', 'January', 'None'], answer: 1, hint: 'Think carefully!' },
  { q: 'What can travel around the world while staying in a corner?', options: ['A plane', 'A stamp', 'A spider', 'A ball'], answer: 1, hint: 'On an envelope.' },
  { q: 'What has many keys but cannot open a single lock?', options: ['A keychain', 'A piano', 'A robot', 'A guard'], answer: 1, hint: '🎵 It makes music.' },
]

export const FLAGS: FlagItem[] = [
  { flag: '🇮🇳', country: 'India', capital: 'New Delhi', continent: 'Asia' },
  { flag: '🇯🇵', country: 'Japan', capital: 'Tokyo', continent: 'Asia' },
  { flag: '🇧🇷', country: 'Brazil', capital: 'Brasília', continent: 'South America' },
  { flag: '🇫🇷', country: 'France', capital: 'Paris', continent: 'Europe' },
  { flag: '🇮🇹', country: 'Italy', capital: 'Rome', continent: 'Europe' },
  { flag: '🇺🇸', country: 'United States', capital: 'Washington D.C.', continent: 'North America' },
  { flag: '🇬🇧', country: 'United Kingdom', capital: 'London', continent: 'Europe' },
  { flag: '🇦🇺', country: 'Australia', capital: 'Canberra', continent: 'Oceania' },
  { flag: '🇨🇦', country: 'Canada', capital: 'Ottawa', continent: 'North America' },
  { flag: '🇩🇪', country: 'Germany', capital: 'Berlin', continent: 'Europe' },
  { flag: '🇨🇳', country: 'China', capital: 'Beijing', continent: 'Asia' },
  { flag: '🇪🇬', country: 'Egypt', capital: 'Cairo', continent: 'Africa' },
  { flag: '🇿🇦', country: 'South Africa', capital: 'Pretoria', continent: 'Africa' },
  { flag: '🇰🇷', country: 'South Korea', capital: 'Seoul', continent: 'Asia' },
  { flag: '🇲🇽', country: 'Mexico', capital: 'Mexico City', continent: 'North America' },
  { flag: '🇪🇸', country: 'Spain', capital: 'Madrid', continent: 'Europe' },
  { flag: '🇷🇺', country: 'Russia', capital: 'Moscow', continent: 'Europe' },
  { flag: '🇳🇵', country: 'Nepal', capital: 'Kathmandu', continent: 'Asia' },
  { flag: '🇦🇷', country: 'Argentina', capital: 'Buenos Aires', continent: 'South America' },
  { flag: '🇰🇪', country: 'Kenya', capital: 'Nairobi', continent: 'Africa' },
  { flag: '🇹🇭', country: 'Thailand', capital: 'Bangkok', continent: 'Asia' },
  { flag: '🇬🇷', country: 'Greece', capital: 'Athens', continent: 'Europe' },
  { flag: '🇱🇰', country: 'Sri Lanka', capital: 'Colombo', continent: 'Asia' },
  { flag: '🇳🇿', country: 'New Zealand', capital: 'Wellington', continent: 'Oceania' },
]

export const WORDS: WordItem[] = [
  { emoji: '🐱', word: 'CAT', opposite: undefined },
  { emoji: '🐶', word: 'DOG' },
  { emoji: '☀️', word: 'SUN' },
  { emoji: '⭐', word: 'STAR' },
  { emoji: '🌙', word: 'MOON' },
  { emoji: '🐟', word: 'FISH' },
  { emoji: '🍎', word: 'APPLE' },
  { emoji: '🏠', word: 'HOUSE' },
  { emoji: '🌈', word: 'RAINBOW' },
  { emoji: '🐘', word: 'ELEPHANT' },
  { emoji: '🦋', word: 'BUTTERFLY' },
  { emoji: '🚂', word: 'TRAIN' },
  { emoji: '🌸', word: 'FLOWER' },
  { emoji: '🍌', word: 'BANANA' },
  { emoji: '🐢', word: 'TURTLE' },
  { emoji: '🎈', word: 'BALLOON' },
  { emoji: '🦁', word: 'LION' },
  { emoji: '🍕', word: 'PIZZA' },
  { emoji: '🚀', word: 'ROCKET' },
  { emoji: '🌋', word: 'VOLCANO' },
]

export const OPPOSITES: { a: string; b: string; wrong: string[] }[] = [
  { a: 'Hot', b: 'Cold', wrong: ['Warm', 'Wet', 'Big'] },
  { a: 'Big', b: 'Small', wrong: ['Tall', 'Huge', 'Round'] },
  { a: 'Up', b: 'Down', wrong: ['Left', 'High', 'Over'] },
  { a: 'Fast', b: 'Slow', wrong: ['Quick', 'Run', 'Jump'] },
  { a: 'Happy', b: 'Sad', wrong: ['Glad', 'Angry', 'Sleepy'] },
  { a: 'Day', b: 'Night', wrong: ['Morning', 'Noon', 'Sun'] },
  { a: 'Open', b: 'Closed', wrong: ['Door', 'Wide', 'Locked... close!'] },
  { a: 'Full', b: 'Empty', wrong: ['Half', 'Heavy', 'Round'] },
  { a: 'Soft', b: 'Hard', wrong: ['Fluffy', 'Smooth', 'Warm'] },
  { a: 'Loud', b: 'Quiet', wrong: ['Noisy', 'Music', 'Shout'] },
]

export const ODD_ONE_OUT: { items: string[]; odd: number; why: string }[] = [
  { items: ['🍎', '🍌', '🍇', '🚗'], odd: 3, why: 'A car is not a fruit!' },
  { items: ['🐶', '🐱', '🐰', '🌳'], odd: 3, why: 'A tree is not an animal!' },
  { items: ['🔵', '🔵', '🔴', '🔵'], odd: 2, why: 'One circle is red!' },
  { items: ['✈️', '🚁', '🚗', '🚀'], odd: 2, why: 'A car cannot fly!' },
  { items: ['🍕', '🍔', '🍟', '⚽'], odd: 3, why: 'You cannot eat a football!' },
  { items: ['🐟', '🐬', '🦈', '🦅'], odd: 3, why: 'An eagle lives in the sky, not the sea!' },
  { items: ['🌹', '🌻', '🌷', '🥕'], odd: 3, why: 'A carrot is a vegetable, not a flower!' },
  { items: ['👟', '🧦', '🧤', '🍩'], odd: 3, why: 'A donut is not clothing!' },
  { items: ['🎸', '🥁', '🎹', '📚'], odd: 3, why: 'A book is not an instrument!' },
  { items: ['🌞', '🌝', '⭐', '🐠'], odd: 3, why: 'A fish is not in the sky!' },
  { items: ['🚒', '🚑', '🚓', '🛒'], odd: 3, why: 'A trolley is not a rescue vehicle!' },
  { items: ['🦷', '👀', '👂', '🎩'], odd: 3, why: 'A hat is not a body part!' },
]

export const SHADOW_SETS: { target: string; options: string[]; answer: number }[] = [
  { target: '🐘', options: ['🐘', '🐭', '🦒'], answer: 0 },
  { target: '🦒', options: ['🐢', '🦒', '🐍'], answer: 1 },
  { target: '🚀', options: ['✏️', '🌂', '🚀'], answer: 2 },
  { target: '🦋', options: ['🦋', '🐛', '🐝'], answer: 0 },
  { target: '⚽', options: ['🎲', '⚽', '📦'], answer: 1 },
  { target: '🌵', options: ['🌲', '🌵', '🍄'], answer: 1 },
  { target: '🐙', options: ['🐙', '🦀', '🐌'], answer: 0 },
  { target: '🎸', options: ['🏏', '🪃', '🎸'], answer: 2 },
]

export const MEMORY_EMOJI = ['🐶','🐱','🦊','🐼','🐸','🦁','🐷','🐵','🦄','🐙','🦀','🐳','🦉','🐞','🦋','🌸','🍓','🍉','🍩','🚀','⚽','🎈','🎁','⭐']
export const FRUITS = ['🍎','🍌','🍇','🍉','🍓','🍑','🍍','🥝']
export const NOT_FRUITS = ['🚗','⚽','🎩','📚','✏️','🧸','🎺','🛸']
export const COLORS_CB = [
  { name: 'Red', hex: '#e5484d', shape: '●' },
  { name: 'Blue', hex: '#3e7bfa', shape: '■' },
  { name: 'Green', hex: '#2f9e6e', shape: '▲' },
  { name: 'Yellow', hex: '#f5b93e', shape: '◆' },
]

export const PRAISE = ['Excellent!', 'Awesome!', 'You are super smart!', 'Fantastic!', 'Great job!', 'Wow, amazing!', 'Brilliant!', 'Superstar!']
export const ENCOURAGE = ['Almost! Try again!', 'You can do it!', 'Good try! One more time!', 'Keep going, champ!', 'So close!']
