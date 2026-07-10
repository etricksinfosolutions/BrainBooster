// ---------------------------------------------------------------------------
// Brain Booster Kids — "Did you know?" educational facts
// Shown after every completed level. Facts are tagged with world-theme tags so
// each adventure world unlocks facts that belong to that place.
// Add more freely — the engine cycles through them per world.
// ---------------------------------------------------------------------------
export interface Fact { icon: string; category: string; title: string; text: string; themes: string[] }

export const FACTS: Fact[] = [
  // --- Original facts (kept verbatim, now theme-tagged) ---
  { icon: '🌍', category: 'Geography', title: 'The Water Planet', text: 'Earth is the only planet we know of with liquid water on its surface. That water makes life possible!', themes: ['space', 'general'] },
  { icon: '🏛️', category: 'History', title: 'A 4,500-Year-Old Giant', text: 'The Great Pyramid of Egypt is over 4,500 years old. It was built by hand, block by giant block!', themes: ['desert', 'city'] },
  { icon: '🚀', category: 'Space', title: 'One Million Earths', text: 'The Sun is so big that about one million Earths could fit inside it!', themes: ['space'] },
  { icon: '🦖', category: 'Dinosaurs', title: 'Big and Small Dinos', text: 'Some dinosaurs were smaller than a chicken, while others were longer than a school bus!', themes: ['dino'] },
  { icon: '🌊', category: 'Oceans', title: 'The Ocean Helps You Breathe', text: 'More than half of all the oxygen you breathe comes from tiny plants in the ocean.', themes: ['ocean', 'general'] },
  { icon: '🐘', category: 'Animals', title: 'Elephant Phone Calls', text: 'Elephants can hear each other from kilometres away using rumbles too low for us to hear.', themes: ['jungle', 'general'] },
  { icon: '🧠', category: 'Human Body', title: 'Faster Than a Race Car', text: 'Your brain sends messages faster than a race car — up to 400 kilometres per hour!', themes: ['general'] },
  { icon: '⚽', category: 'Sports', title: 'One Ball, 100,000 Fans', text: 'A football match uses only one ball, but a stadium can hold over 100,000 cheering fans!', themes: ['city', 'general'] },
  { icon: '🏔️', category: 'Mountains', title: 'The Growing Mountain', text: 'Mount Everest is the tallest mountain, and it grows a tiny bit taller every single year.', themes: ['snow', 'general'] },
  { icon: '🌋', category: 'Volcanoes', title: 'Volcanoes Never Sleep', text: 'Some volcanoes have been erupting on and off for thousands of years!', themes: ['volcano'] },
  { icon: '🏰', category: 'Famous Places', title: 'The Tower That Grows', text: 'The Eiffel Tower in Paris can grow about 15 cm taller in summer because heat makes metal expand.', themes: ['city'] },
  { icon: '👨‍🔬', category: 'Scientists', title: 'Riding a Beam of Light', text: 'Albert Einstein loved to imagine riding on a beam of light — that daydream helped him discover big ideas!', themes: ['general'] },
  { icon: '🧑‍🚀', category: 'Astronauts', title: 'Taller in Space', text: 'Astronauts grow a little taller in space because there is no gravity squishing them down!', themes: ['space'] },
  { icon: '🏆', category: 'World Records', title: 'The 68-Year Hiccup', text: 'The longest hiccuping spell lasted 68 years! Most hiccups only last a few minutes.', themes: ['general'] },
  { icon: '🍎', category: 'Health', title: 'Laughing Is Exercise', text: 'Laughing is good for you — it gives your tummy muscles a tiny workout!', themes: ['home', 'general'] },
  { icon: '🥦', category: 'Nutrition', title: 'Super Eyes from Carrots', text: 'Carrots are good for your eyes because they are full of vitamin A.', themes: ['farm', 'general'] },
  { icon: '🐦', category: 'Birds', title: 'Why Hummingbirds Hum', text: 'A hummingbird can flap its wings about 50 times every second — that is why they hum!', themes: ['forest', 'jungle', 'general'] },
  { icon: '🌎', category: 'Countries', title: 'Eleven Time Zones', text: 'Russia is the biggest country in the world and spans eleven different time zones!', themes: ['time', 'general'] },
  { icon: '🎨', category: 'Art', title: 'The Magic Three Colours', text: 'The colours red, blue and yellow are called primary colours — you can mix them to make almost any colour.', themes: ['general'] },
  { icon: '🎵', category: 'Music', title: '88 Keys', text: 'A piano has 88 keys — 52 white ones and 36 black ones!', themes: ['city', 'general'] },
  { icon: '🐙', category: 'Oceans', title: 'Three Hearts, Blue Blood', text: 'An octopus has three hearts and blue blood!', themes: ['ocean'] },
  { icon: '🐝', category: 'Animals', title: 'The Bee Dance', text: 'Bees dance to tell each other where to find the best flowers.', themes: ['farm', 'forest'] },
  { icon: '🌙', category: 'Space', title: 'Footprints Forever', text: 'The Moon has no wind, so the footprints astronauts left there are still there today!', themes: ['space'] },
  { icon: '🦋', category: 'Animals', title: 'Tasting with Feet', text: 'A butterfly tastes with its feet before it decides where to land!', themes: ['forest', 'jungle', 'general'] },
  { icon: '💧', category: 'Human Body', title: 'A Walking Water Balloon', text: 'More than half of your body is made of water — you are mostly a walking water balloon!', themes: ['general'] },
  { icon: '🦈', category: 'Oceans', title: 'Older Than Trees', text: 'Sharks existed before trees did — they have been swimming for over 400 million years!', themes: ['ocean'] },
  { icon: '🐧', category: 'Birds', title: 'Underwater Rockets', text: 'Penguins cannot fly in the air, but they zoom through water like little rockets.', themes: ['snow', 'ocean'] },
  { icon: '🌈', category: 'Geography', title: 'The Secret Circle', text: 'A rainbow is really a full circle — we usually only see the top half from the ground.', themes: ['general'] },
  { icon: '🐜', category: 'Animals', title: 'The Tiny Superhero', text: 'An ant can carry something 50 times heavier than its own body!', themes: ['forest', 'jungle', 'general'] },
  { icon: '⭐', category: 'Space', title: 'Light from Long Ago', text: 'When you look at faraway stars, you are seeing light that left them long, long ago.', themes: ['space'] },
  { icon: '🦒', category: 'Animals', title: 'Seven Giant Bones', text: 'A giraffe and a human both have exactly seven bones in their neck — the giraffe’s are just huge!', themes: ['jungle', 'general'] },
  { icon: '🍯', category: 'Nutrition', title: 'The Food That Never Spoils', text: 'Honey never goes bad. Honey found in ancient tombs was still good to eat!', themes: ['farm', 'general'] },
  { icon: '🌵', category: 'Geography', title: 'The Desert Water Bottle', text: 'A cactus stores water inside itself so it can survive in the dry desert.', themes: ['desert'] },
  { icon: '🐢', category: 'Animals', title: '150 Candles on the Cake', text: 'Some tortoises can live for more than 150 years — older than your great-great-grandparents!', themes: ['island', 'general'] },
  { icon: '🧊', category: 'Geography', title: 'The Frozen Continent', text: 'Antarctica is the coldest, windiest place on Earth and is covered in ice kilometres deep.', themes: ['snow'] },
  { icon: '👅', category: 'Human Body', title: 'Thousands of Taste Buds', text: 'Your tongue is covered with thousands of tiny taste buds that help you enjoy your food.', themes: ['general'] },
  { icon: '🌻', category: 'Nature', title: 'Flowers That Follow the Sun', text: 'Sunflowers turn during the day to follow the Sun across the sky.', themes: ['farm', 'general'] },
  { icon: '🦉', category: 'Birds', title: 'The Spinning Head', text: 'Owls can turn their heads almost all the way around to look behind them!', themes: ['forest', 'general'] },

  // --- Rivers ---
  { icon: '🏞️', category: 'Rivers', title: 'The Long Nile', text: 'The Nile in Africa is one of the longest rivers on Earth, flowing over 6,000 kilometres!', themes: ['river', 'general'] },
  { icon: '🐟', category: 'Rivers', title: 'Salmon Superjumpers', text: 'Salmon swim up rivers and can leap right up small waterfalls to reach the place where they hatched.', themes: ['river'] },
  { icon: '🦫', category: 'Rivers', title: 'Nature’s Engineers', text: 'Beavers build dams across rivers with sticks and mud to make cosy ponds for their homes.', themes: ['river', 'forest'] },
  { icon: '💧', category: 'Rivers', title: 'Always Downhill', text: 'Every river flows downhill, all the way from the mountains down to the sea.', themes: ['river', 'general'] },
  { icon: '🐊', category: 'Rivers', title: 'The Mighty Amazon', text: 'The Amazon River carries more water than the next several biggest rivers put together!', themes: ['river', 'jungle'] },

  // --- Beaches ---
  { icon: '🏖️', category: 'Beaches', title: 'Sand Is Tiny Rock', text: 'Beach sand is made of teeny pieces of rock and shell worn down by the waves over a very long time.', themes: ['beach', 'ocean'] },
  { icon: '🦀', category: 'Beaches', title: 'Sideways Walkers', text: 'Crabs usually walk sideways because of the way their legs bend!', themes: ['beach', 'ocean'] },
  { icon: '🐚', category: 'Beaches', title: 'The Sound in a Shell', text: 'When you hold a seashell to your ear, the whooshing sound is really the air moving around inside it.', themes: ['beach', 'ocean'] },
  { icon: '🐢', category: 'Beaches', title: 'Baby Turtle Dash', text: 'Baby sea turtles hatch in the warm sand and race down to the ocean as soon as they pop out.', themes: ['beach', 'ocean'] },
  { icon: '🌊', category: 'Beaches', title: 'Waves Are Made by Wind', text: 'Most ocean waves are made by wind blowing across the water far out at sea.', themes: ['beach', 'ocean'] },

  // --- Pirates ---
  { icon: '🏴‍☠️', category: 'Pirates', title: 'The Jolly Roger', text: 'Many pirates flew a flag called the Jolly Roger to warn other ships they were near.', themes: ['pirate', 'ocean'] },
  { icon: '🦜', category: 'Pirates', title: 'Parrots on Board', text: 'Sailors long ago really did carry colourful parrots home from far-off tropical islands.', themes: ['pirate', 'island'] },
  { icon: '💰', category: 'Pirates', title: 'Pieces of Eight', text: 'Pirates loved silver coins called "pieces of eight" that could be cut up to make smaller change.', themes: ['pirate'] },
  { icon: '🧭', category: 'Pirates', title: 'Finding the Way', text: 'Pirates used a compass and the stars to steer their ships across the wide open sea.', themes: ['pirate', 'ocean'] },
  { icon: '⚓', category: 'Pirates', title: 'The Real Blackbeard', text: 'Blackbeard was a famous real pirate who sailed the seas about 300 years ago.', themes: ['pirate'] },

  // --- Volcanoes ---
  { icon: '🌋', category: 'Volcanoes', title: 'Islands Born of Fire', text: 'The islands of Hawaii were built by volcanoes erupting under the ocean over millions of years.', themes: ['volcano', 'island', 'ocean'] },
  { icon: '🔥', category: 'Volcanoes', title: 'Magma and Lava', text: 'Hot melted rock is called magma while it is underground, and lava once it flows out of a volcano.', themes: ['volcano'] },
  { icon: '🌱', category: 'Volcanoes', title: 'Super Soil', text: 'After a volcano cools down, its ash makes the soil around it wonderful for growing plants.', themes: ['volcano', 'farm'] },
  { icon: '🌏', category: 'Volcanoes', title: 'The Ring of Fire', text: 'Most of the world’s volcanoes sit in a giant circle around the Pacific Ocean called the Ring of Fire.', themes: ['volcano', 'ocean'] },
  { icon: '💎', category: 'Volcanoes', title: 'Diamonds from Deep Down', text: 'Diamonds form deep underground and can be carried up towards the surface by ancient volcanoes.', themes: ['volcano', 'crystal'] },

  // --- Dinosaurs ---
  { icon: '🦕', category: 'Dinosaurs', title: 'Long-Necked Giants', text: 'Some long-necked dinosaurs were so tall they could have peeked over the roof of a four-storey building.', themes: ['dino'] },
  { icon: '🥚', category: 'Dinosaurs', title: 'Surprisingly Small Eggs', text: 'Even the very biggest dinosaurs hatched from eggs no larger than a football.', themes: ['dino'] },
  { icon: '🦖', category: 'Dinosaurs', title: 'Banana-Sized Teeth', text: 'Tyrannosaurus rex had teeth as long as bananas!', themes: ['dino'] },
  { icon: '🐦', category: 'Dinosaurs', title: 'Dinosaurs Are Still Here', text: 'Birds are the living cousins of dinosaurs — so a little sparrow is really a modern dino!', themes: ['dino', 'forest'] },
  { icon: '🪶', category: 'Dinosaurs', title: 'Feathered Dinos', text: 'Many dinosaurs were covered in fluffy feathers, just like birds today.', themes: ['dino'] },

  // --- Time ---
  { icon: '🌍', category: 'Time', title: 'A Day Is One Spin', text: 'A day is how long it takes Earth to spin all the way around once — about 24 hours.', themes: ['time', 'space'] },
  { icon: '📅', category: 'Time', title: 'A Year Is One Loop', text: 'A year is how long it takes Earth to travel all the way around the Sun.', themes: ['time', 'space'] },
  { icon: '⌛', category: 'Time', title: 'Clocks Made of Sand', text: 'Long ago, people measured time by watching sand trickle through an hourglass.', themes: ['time'] },
  { icon: '☀️', category: 'Time', title: 'Shadow Clocks', text: 'A sundial tells the time using the slow-moving shadow made by the Sun.', themes: ['time'] },
  { icon: '🌳', category: 'Time', title: 'Rings of Time', text: 'You can count the rings inside a tree trunk to work out how many years old the tree is.', themes: ['time', 'forest'] },

  // --- Islands ---
  { icon: '🏝️', category: 'Islands', title: 'Tiny Coral Builders', text: 'Some islands are made by tiny sea creatures called coral, slowly building reefs over thousands of years.', themes: ['island', 'ocean'] },
  { icon: '🦎', category: 'Islands', title: 'Found Nowhere Else', text: 'On far-away islands you can find animals that live nowhere else on Earth, like the giant Galapagos tortoise.', themes: ['island'] },
  { icon: '🌋', category: 'Islands', title: 'Fire and Ice', text: 'The island of Iceland has both icy glaciers and fiery volcanoes at the very same time!', themes: ['island', 'volcano', 'snow'] },
  { icon: '🥥', category: 'Islands', title: 'Floating Coconuts', text: 'Coconuts can float right across the ocean and sprout into palm trees on brand-new islands.', themes: ['island', 'beach'] },
  { icon: '🧊', category: 'Islands', title: 'The Biggest Island', text: 'Greenland is the largest island in the world, and nearly all of it is covered in ice.', themes: ['island', 'snow'] },

  // --- Home ---
  { icon: '🏠', category: 'Home', title: 'Dust Is Mostly You', text: 'A lot of the dust in your home is made of tiny flakes of skin and threads of fabric.', themes: ['home'] },
  { icon: '🧼', category: 'Home', title: 'Soap Beats Germs', text: 'Washing with soap and water sweeps germs off your hands and sends them down the drain.', themes: ['home'] },
  { icon: '🛏️', category: 'Home', title: 'Why We Sleep', text: 'While you sleep, your brain tidies up everything you learned that day so you remember it better.', themes: ['home'] },
  { icon: '🕷️', category: 'Home', title: 'Tiny House Guests', text: 'Lots of harmless little creatures share your home, from spiders in the corners to mites too small to see.', themes: ['home'] },
  { icon: '🧶', category: 'Home', title: 'Cosy and Warm', text: 'A woolly jumper keeps you warm because the wool traps a layer of cosy air all around you.', themes: ['home', 'snow'] },

  // --- Magic of Science ---
  { icon: '✨', category: 'Magic of Science', title: 'Living Lights', text: 'Fireflies and some deep-sea creatures make their own light — a real kind of magic called bioluminescence.', themes: ['magic', 'ocean'] },
  { icon: '🧲', category: 'Magic of Science', title: 'Invisible Pulling Power', text: 'Magnets can pull objects made of iron without even touching them, using an invisible force.', themes: ['magic'] },
  { icon: '🌈', category: 'Magic of Science', title: 'Splitting the Light', text: 'A glass prism can split plain white light into all the colours of the rainbow.', themes: ['magic', 'crystal'] },
  { icon: '🦎', category: 'Magic of Science', title: 'The Colour-Changer', text: 'A chameleon can change the colour of its skin — a little like real-life magic!', themes: ['magic', 'jungle'] },
  { icon: '🍋', category: 'Magic of Science', title: 'Invisible Ink', text: 'Lemon juice makes invisible ink that appears as if by magic when the paper is gently warmed.', themes: ['magic', 'home'] },

  // --- Robots ---
  { icon: '🤖', category: 'Robots', title: 'Robots on Mars', text: 'Real robots called rovers are driving around on Mars right now, taking photos and studying the rocks.', themes: ['robot', 'space'] },
  { icon: '🦾', category: 'Robots', title: 'Helpful Factory Arms', text: 'Robot arms help build cars in factories, doing the same careful job over and over without getting tired.', themes: ['robot', 'city'] },
  { icon: '🌊', category: 'Robots', title: 'Deep-Sea Explorers', text: 'Underwater robots explore the deepest parts of the ocean, where it is far too dark and cold for people.', themes: ['robot', 'ocean'] },
  { icon: '🧹', category: 'Robots', title: 'The Robot That Cleans', text: 'Some homes have little round robots that roll around the floor and vacuum up dust all by themselves.', themes: ['robot', 'home'] },
  { icon: '🐕', category: 'Robots', title: 'Walking Robot Dogs', text: 'Engineers have built robot dogs that can walk, climb stairs and even nudge open doors.', themes: ['robot'] },

  // --- Sweets ---
  { icon: '🍫', category: 'Sweets', title: 'Chocolate Grows on Trees', text: 'Chocolate is made from cocoa beans that grow inside big pods on tropical trees.', themes: ['candy', 'jungle'] },
  { icon: '🍬', category: 'Sweets', title: 'Sugar Comes from Plants', text: 'Most sugar comes from a tall grass called sugarcane, or from the roots of the sugar beet.', themes: ['candy', 'farm'] },
  { icon: '🍭', category: 'Sweets', title: 'Lollipops Are Old', text: 'People have enjoyed sweets on sticks for a very long time — the word "lollipop" is over 100 years old.', themes: ['candy'] },
  { icon: '🍯', category: 'Sweets', title: 'Nature’s Sweet Treat', text: 'Honey, made by busy bees, is one of the oldest natural sweets people have ever eaten.', themes: ['candy', 'farm'] },
  { icon: '🌡️', category: 'Sweets', title: 'Melts in Your Mouth', text: 'Chocolate melts just below the warmth of your body, which is why it goes soft in your hand.', themes: ['candy'] },

  // --- Crystals ---
  { icon: '💎', category: 'Crystals', title: 'The Hardest of All', text: 'Diamonds are the hardest natural material on Earth — only a diamond can scratch another diamond.', themes: ['crystal'] },
  { icon: '🧂', category: 'Crystals', title: 'Salt Is a Crystal', text: 'Every grain of table salt is a tiny cube-shaped crystal you can spot with a magnifying glass.', themes: ['crystal', 'home'] },
  { icon: '❄️', category: 'Crystals', title: 'Snowflake Crystals', text: 'Every snowflake is a tiny crystal of ice, and no two are ever exactly the same.', themes: ['crystal', 'snow'] },
  { icon: '🔮', category: 'Crystals', title: 'A Cave of Giant Crystals', text: 'A cave in Mexico holds crystals longer than a bus — some of the biggest ever found!', themes: ['crystal'] },
  { icon: '💜', category: 'Crystals', title: 'Purple Amethyst', text: 'Amethyst is a sparkly purple crystal that grows slowly inside hollow rocks called geodes.', themes: ['crystal'] },

  // --- Deserts ---
  { icon: '🐫', category: 'Deserts', title: 'What’s in the Hump?', text: 'A camel does not store water in its hump — the hump is actually full of fat for energy!', themes: ['desert'] },
  { icon: '🏜️', category: 'Deserts', title: 'Cold at Night', text: 'Deserts can turn freezing cold at night because the dry air cannot hold on to the daytime heat.', themes: ['desert'] },
  { icon: '🦂', category: 'Deserts', title: 'Glowing Scorpions', text: 'Scorpions glow a spooky blue-green colour when you shine an ultraviolet light on them!', themes: ['desert', 'magic'] },

  // --- Cities ---
  { icon: '🏙️', category: 'Cities', title: 'The Giant City', text: 'Greater Tokyo in Japan is one of the biggest city areas in the world, home to over 30 million people!', themes: ['city'] },

  // --- Snow & Ice ---
  { icon: '⛄', category: 'Snow & Ice', title: 'Snow Is Not Really White', text: 'Snowflakes are clear like ice — they only look white because of the way light bounces off them.', themes: ['snow', 'crystal'] },
  { icon: '🧊', category: 'Snow & Ice', title: 'Icebergs Hide Below', text: 'Only a small tip of an iceberg pokes above the water — most of it is hidden underneath.', themes: ['snow', 'ocean'] },
]

/** Facts matching any of the given theme tags; falls back to the full bank. */
export function factsForThemes(tags: string[]): Fact[] {
  const hit = FACTS.filter(f => f.themes.some(t => tags.includes(t)))
  return hit.length ? hit : FACTS
}
