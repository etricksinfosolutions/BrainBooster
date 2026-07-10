// ---------------------------------------------------------------------------
// Brain Booster Kids — themed story bank
// Every story is tagged with world-theme tags so each adventure world serves
// stories that belong to that place. Adding stories = appending data.
// ---------------------------------------------------------------------------
export interface Story {
  title: string
  emoji: string            // one emoji hero for the illustration
  themes: string[]         // world-theme tags, see canonical list
  text: string[]           // 4-6 short pages, 1-3 sentences each
  questions: { q: string; options: string[]; answer: number }[]  // exactly 3 comprehension questions, 3 options each
}

export const STORIES: Story[] = [
  {
    title: 'The Little Cloud Who Shared',
    emoji: '☁️',
    themes: ['home', 'farm', 'general'],
    text: [
      'Nimbo was a tiny cloud who lived above a dry, thirsty garden.',
      'The flowers below whispered, "We are so thirsty!" But Nimbo was small and had only a little rain inside him.',
      '"If I give my rain away, I might disappear," Nimbo worried. But he looked at the drooping sunflower and made up his mind.',
      'Nimbo squeezed out every last drop. The garden burst into color — reds, yellows, and purples everywhere!',
      'And a funny thing happened: the warm, happy garden sent sweet mist back up into the sky, and Nimbo grew bigger and fluffier than ever before.',
    ],
    questions: [
      { q: 'What was the garden feeling?', options: ['Thirsty', 'Sleepy', 'Angry'], answer: 0 },
      { q: 'Who did Nimbo help?', options: ['A cat', 'The flowers', 'A river'], answer: 1 },
      { q: 'What is the moral of the story?', options: ['Keep everything for yourself', 'Sharing makes everyone grow', 'Never rain on gardens'], answer: 1 },
    ],
  },
  {
    title: 'Tara the Slow Turtle',
    emoji: '🐢',
    themes: ['forest', 'general'],
    text: [
      'Tara the turtle was the slowest animal in Sunny Meadow. The rabbits giggled every time she walked by.',
      'One day, a big race was announced: first one to the old oak tree wins a golden acorn!',
      'The rabbits zoomed off, but soon they stopped to nap, sure they had plenty of time.',
      'Tara never stopped. Step... by step... by step. She passed the sleeping rabbits quietly.',
      'When the rabbits woke up, Tara was already at the oak tree, smiling with the golden acorn!',
    ],
    questions: [
      { q: 'Why did the rabbits lose?', options: ['They were too slow', 'They stopped to nap', 'They got lost'], answer: 1 },
      { q: 'Which character kept going without stopping?', options: ['Tara', 'The rabbits', 'The oak tree'], answer: 0 },
      { q: 'What is the moral of the story?', options: ['Naps are bad', 'Slow and steady wins the race', 'Racing is silly'], answer: 1 },
    ],
  },
  {
    title: 'Pip and the Broken Kite',
    emoji: '🪁',
    themes: ['beach', 'general'],
    text: [
      'Pip the penguin found a beautiful red kite with a broken string on the beach.',
      '"Whose kite is this?" Pip wondered. He could have kept it — it was the prettiest kite he had ever seen.',
      'Pip waddled all over the beach asking everyone. Finally he found Lulu the seagull, crying by the rocks.',
      '"My kite flew away!" Lulu sniffed. Pip smiled and handed it back. Together they fixed the string.',
      'Now every windy day, Pip and Lulu fly the red kite together — because kites are more fun with a friend.',
    ],
    questions: [
      { q: 'What did Pip find?', options: ['A shell', 'A kite', 'A fish'], answer: 1 },
      { q: 'Who helped Lulu feel better?', options: ['Pip', 'A crab', 'Nobody'], answer: 0 },
      { q: 'What should happen next?', options: ['They fly the kite together', 'Pip hides the kite', 'Lulu flies away alone'], answer: 0 },
    ],
  },
  {
    title: 'The Star That Fell in the Pond',
    emoji: '⭐',
    themes: ['river', 'space'],
    text: [
      'One night, little frog Fergus saw a star twinkling at the bottom of his pond.',
      '"A star fell in! I must save it!" he croaked, and dove down again and again, but he could never catch it.',
      'Wise old fish Mira watched and smiled. "Look up, little frog," she said gently.',
      'Fergus looked up — the real star was safe in the sky! The pond was only showing its reflection, like a mirror.',
      'Fergus laughed at himself, then floated on his back all night, watching the real stars dance above.',
    ],
    questions: [
      { q: 'What did Fergus see in the pond?', options: ['A real star', 'A reflection', 'A coin'], answer: 1 },
      { q: 'Which character helped Fergus understand?', options: ['Mira the fish', 'A duck', 'The moon'], answer: 0 },
      { q: 'What is the moral of the story?', options: ['Never swim at night', 'Look carefully before you worry', 'Stars are dangerous'], answer: 1 },
    ],
  },
  {
    title: 'The Great Pillow Fort',
    emoji: '🐱',
    themes: ['home'],
    text: [
      'Kiki the kitten wanted to build the biggest pillow fort in the whole house.',
      'She stacked pillows high, but the tower wobbled and — flump! — it all tumbled down.',
      'Her little brother Milo peeked in. "Can I help?" he asked. Kiki almost said no. Then she remembered how lonely one builder can be.',
      '"Yes, please!" said Kiki. Milo held the pillows steady while Kiki stacked them tall.',
      'Soon the fort had a blanket roof and a flashlight moon. Two builders, one cozy castle — building together made it twice the fun.',
    ],
    questions: [
      { q: 'What was Kiki building?', options: ['A sandcastle', 'A pillow fort', 'A treehouse'], answer: 1 },
      { q: 'Who helped hold the pillows steady?', options: ['Milo', 'Grandma', 'A puppy'], answer: 0 },
      { q: 'What is the moral of the story?', options: ['Working together is better', 'Forts are silly', 'Never share pillows'], answer: 0 },
    ],
  },
  {
    title: 'Henny’s Missing Egg',
    emoji: '🐔',
    themes: ['farm'],
    text: [
      'Henny the hen counted her eggs every morning. One, two, three... but today one egg was missing!',
      'She asked Berta the cow. "Moo, not me," said Berta. She asked Pog the pig. "Oink, not me," said Pog.',
      'Then Henny heard a tiny tap-tap-tap coming from the hay pile.',
      'The missing egg had rolled into the warm hay — and it was hatching! Out popped a fluffy yellow chick.',
      'All the farm friends cheered. "Thank you for helping me look," Henny clucked. "Good friends make every search shorter."',
    ],
    questions: [
      { q: 'What was Henny looking for?', options: ['A lost egg', 'A shiny stone', 'Her hat'], answer: 0 },
      { q: 'Where did Henny find the egg?', options: ['In the pond', 'In the hay pile', 'Under the tractor'], answer: 1 },
      { q: 'What came out of the egg?', options: ['A puppy', 'A duckling', 'A fluffy chick'], answer: 2 },
    ],
  },
  {
    title: 'The Tractor That Would Not Start',
    emoji: '🚜',
    themes: ['farm'],
    text: [
      'On Maple Farm, Rusty the tractor would not start. Cough, sputter... silence.',
      '"The apples must get to the barn before the rain!" said Farmer Joy.',
      'Berta the cow pushed the cart. Pog the pig rolled apples up a plank. Henny and her chick carried one tiny apple together.',
      'Drip, drop — the rain began just as the last apple rolled into the barn. Everything was safe and dry.',
      'Rusty smiled his headlight smile. "When friends work as a team, even a broken day turns out fine."',
    ],
    questions: [
      { q: 'Why couldn’t Rusty help with the apples?', options: ['He would not start', 'He was on holiday', 'He was too small'], answer: 0 },
      { q: 'How did the apples reach the barn?', options: ['A truck came', 'The animals worked together', 'They rolled by themselves'], answer: 1 },
      { q: 'What is the moral of the story?', options: ['Rain ruins everything', 'Only tractors can help', 'Teamwork saves the day'], answer: 2 },
    ],
  },
  {
    title: 'The Glowing Mushroom Path',
    emoji: '🦊',
    themes: ['forest', 'magic'],
    text: [
      'Deep in Whisperwood, Finn the fox stayed out playing until the sky turned dark blue.',
      '"Oh no," he whispered. "Which way is home?" The trees all looked the same in the dark.',
      'Then, one by one, tiny mushrooms began to glow — soft green, gentle gold — lighting a path through the ferns.',
      'Finn followed the glowing trail slowly and carefully, thanking each mushroom as he passed.',
      'The path ended right at his den, where his mama waited. "Kind forests help kind foxes," she smiled — for Finn had watered those mushrooms all summer long.',
    ],
    questions: [
      { q: 'Why was Finn worried?', options: ['He lost his ball', 'It got dark and he was lost', 'He was hungry'], answer: 1 },
      { q: 'What lit up the path home?', options: ['Glowing mushrooms', 'A flashlight', 'The sun'], answer: 0 },
      { q: 'Why did the forest help Finn?', options: ['He was the fastest fox', 'He had been kind to it all summer', 'He paid the trees'], answer: 1 },
    ],
  },
  {
    title: 'Dara Duck and the River Race',
    emoji: '🦆',
    themes: ['river'],
    text: [
      'Every spring, the animals of Silverstream raced tiny leaf-boats down the river.',
      'Dara Duck’s boat zoomed ahead. She was going to win!',
      'Then she heard a squeak. Little Newt Nia’s boat had tipped over near the reeds.',
      'Dara paddled back, lifted Nia onto her own leaf-boat, and they floated on together.',
      'They crossed the finish line last — but the whole river cheered the loudest. "Helping a friend," said Dara, "is the best way to win."',
    ],
    questions: [
      { q: 'What were the animals racing?', options: ['Leaf-boats', 'Bicycles', 'Sleds'], answer: 0 },
      { q: 'Why did Dara turn back?', options: ['She was tired', 'Nia’s boat tipped over', 'She forgot her hat'], answer: 1 },
      { q: 'What is the moral of the story?', options: ['Winning is everything', 'Never race on rivers', 'Helping a friend matters most'], answer: 2 },
    ],
  },
  {
    title: 'The Little Lighthouse Parrot',
    emoji: '🦜',
    themes: ['island', 'beach'],
    text: [
      'On a tiny island lived Pico the parrot, who loved the old lighthouse on the cliff.',
      'One foggy evening, the lighthouse lamp flickered... and went out. The boats would not see the island!',
      'Pico flew fast to Keeper Rosa’s window and tapped, tap-tap-tap! "The light is out! The light is out!"',
      'Rosa climbed the spiral stairs with a new bulb, and Pico carried her little toolbox in his claws.',
      'The great light swept over the waves again, and the boats sailed safely home. "Small wings can do big things," Rosa laughed.',
    ],
    questions: [
      { q: 'Where did Pico live?', options: ['In a city', 'On a tiny island', 'On a farm'], answer: 1 },
      { q: 'What went wrong one foggy evening?', options: ['The lighthouse light went out', 'A boat got stuck', 'It started snowing'], answer: 0 },
      { q: 'How did Pico help?', options: ['He fixed the roof', 'He sang to the boats', 'He warned Rosa and carried her toolbox'], answer: 2 },
    ],
  },
  {
    title: 'Dola the Dolphin’s Big Echo',
    emoji: '🐬',
    themes: ['ocean'],
    text: [
      'Dola the dolphin loved to click and whistle. Her sounds bounced back like a game of tag — click, click, echo!',
      'One day she heard a tiny voice in the deep blue. "Hello? I am lost!" It was Sami the baby seahorse.',
      'The water was cloudy with swirling sand, and Sami could not see the way home.',
      'Dola clicked her echoes left, then right, listening carefully. "This way! The coral garden is close!"',
      'Soon Sami hugged his seahorse family with his curly tail. "Your ears found what my eyes could not," he said. "Thank you, Dola!"',
    ],
    questions: [
      { q: 'Who was lost in the cloudy water?', options: ['Sami the seahorse', 'Dola the dolphin', 'A little crab'], answer: 0 },
      { q: 'How did Dola find the way?', options: ['With a map', 'With her clicking echoes', 'With a lantern'], answer: 1 },
      { q: 'Where did Sami’s family live?', options: ['In a shipwreck', 'On an iceberg', 'In the coral garden'], answer: 2 },
    ],
  },
  {
    title: 'The Littlest Whale’s Song',
    emoji: '🐳',
    themes: ['ocean'],
    text: [
      'Wally was the littlest whale in the pod. His song was little too — a small, squeaky hum.',
      'The big whales boomed songs so deep the whole sea rumbled. Wally wished he could boom like that.',
      'One gray evening, fog sat on the water and the pod drifted apart. Boom! Boom! The big songs all blurred together.',
      'But Wally’s squeaky hum was different from every other sound in the sea. "Follow the squeak!" called Grandma Whale.',
      'One by one, the whales gathered around Wally, safe and together. Being different, it turns out, can be exactly what your family needs.',
    ],
    questions: [
      { q: 'What was special about Wally’s song?', options: ['It was loud and deep', 'It was small and squeaky', 'It was silent'], answer: 1 },
      { q: 'What problem did the pod have in the fog?', options: ['They drifted apart', 'They were hungry', 'They lost a race'], answer: 0 },
      { q: 'What did the whales follow to gather together?', options: ['A lighthouse', 'A fishing boat', 'Wally’s squeaky hum'], answer: 2 },
    ],
  },
  {
    title: 'Captain Plum’s Kindest Treasure',
    emoji: '🏴‍☠️',
    themes: ['pirate', 'island'],
    text: [
      'Captain Plum was a friendly pirate with a purple hat and a map with a big red X.',
      'She sailed to Coconut Island and dug and dug under the tallest palm tree. Clunk! A wooden chest!',
      'Inside there was no gold at all — just little packets of seeds and a note that said, "Plant me."',
      'Captain Plum almost grumbled. Instead, she got curious. She planted every seed and watered them with her pirate hat.',
      'When she sailed back next summer, the island was covered in mango trees, and every visiting crew ate for free. "Sharing," said Plum, "is the shiniest treasure."',
    ],
    questions: [
      { q: 'What was inside the treasure chest?', options: ['Gold coins', 'Seeds and a note', 'A parrot'], answer: 1 },
      { q: 'What did Captain Plum do with the seeds?', options: ['Planted and watered them', 'Threw them in the sea', 'Traded them for gold'], answer: 0 },
      { q: 'What is the moral of the story?', options: ['Keep treasure hidden', 'Never dig holes', 'Sharing is the best treasure'], answer: 2 },
    ],
  },
  {
    title: 'Rumbly the Sleepy Volcano',
    emoji: '🌋',
    themes: ['volcano', 'island'],
    text: [
      'On Warm Rock Island stood Rumbly, a round little volcano who was always sleepy.',
      'Grumble... rumble... His tummy-deep yawns made the pebbles hop and the puddles wiggle.',
      'The island animals giggled, but the little geckos could not nap with all that rumbling.',
      'So kind Gecko Gigi climbed up Rumbly’s warm side and sang him a soft lullaby, low and slow.',
      'Rumbly sighed one gentle puff of steam and fell fast asleep. Now Gigi sings to him every night, and the whole island naps in peace.',
    ],
    questions: [
      { q: 'Why did the pebbles hop?', options: ['Rumbly’s big yawns shook them', 'A storm blew in', 'Crabs were dancing'], answer: 0 },
      { q: 'Who sang a lullaby to Rumbly?', options: ['A parrot', 'Gigi the gecko', 'The moon'], answer: 1 },
      { q: 'How did Rumbly finally fall asleep?', options: ['He counted stars', 'He drank warm milk', 'Gigi’s soft song calmed him'], answer: 2 },
    ],
  },
  {
    title: 'Rex’s Tiny Roar',
    emoji: '🦖',
    themes: ['dino'],
    text: [
      'Rex was a young T-rex with a very tiny roar. "Squeak!" he went. "Squeak, squeak!"',
      'The other dinosaurs roared like thunder. Rex practiced every day by the fern patch.',
      'One afternoon, baby Trico wandered toward the slippery mud pools, not looking where she stepped.',
      'Rex took the biggest breath of his whole life. "SQUEAK-ROAR!" It was small — but it was enough. Trico stopped just in time.',
      '"Your roar saved my day!" said Trico. Rex learned that even a tiny voice is mighty when it speaks up to help.',
    ],
    questions: [
      { q: 'What did Rex’s roar sound like at first?', options: ['Thunder', 'A squeak', 'A drum'], answer: 1 },
      { q: 'Who was walking toward the slippery mud pools?', options: ['Baby Trico', 'Rex', 'A little bird'], answer: 0 },
      { q: 'What is the moral of the story?', options: ['Only loud voices matter', 'Never practice anything', 'Even a small voice can help'], answer: 2 },
    ],
  },
  {
    title: 'Dot’s Leafy Picnic',
    emoji: '🦕',
    themes: ['dino'],
    text: [
      'Dot the long-neck dinosaur could reach the sweetest leaves at the very top of the trees.',
      'The small dinosaurs below could only watch. Their tummies grumbled like little drums.',
      'Dot bent her long, long neck down low. "One for you, one for you, and one for you!"',
      'Soon there was a leafy picnic on the grass, with every dinosaur munching happily.',
      'From that day on, Dot picked the tall leaves and her friends found the juicy berries down low. Sharing made every meal a feast.',
    ],
    questions: [
      { q: 'What could Dot reach with her long neck?', options: ['The top leaves', 'The river', 'The clouds'], answer: 0 },
      { q: 'What did Dot do with the leaves?', options: ['Hid them', 'Shared them with her friends', 'Ate them all alone'], answer: 1 },
      { q: 'How did the small dinosaurs help back?', options: ['They found juicy berries down low', 'They climbed the trees', 'They did nothing'], answer: 0 },
    ],
  },
  {
    title: 'Mila and the City Bus',
    emoji: '🚌',
    themes: ['city'],
    text: [
      'Mila loved riding the big blue bus through the busy, twinkling city.',
      'One morning she found a small brown teddy bear on the seat beside her.',
      '"Someone must miss him," Mila said. She gave the teddy to Mr. Ravi, the friendly bus driver.',
      'Mr. Ravi placed the teddy by his mirror, where it waved at every stop. At the library stop, a little boy gasped. "Barnaby! You found him!"',
      'The whole bus cheered. Mila smiled all the way home — doing the honest thing feels as bright as city lights.',
    ],
    questions: [
      { q: 'What did Mila find on the bus?', options: ['A teddy bear', 'An umbrella', 'A sandwich'], answer: 0 },
      { q: 'Who did Mila give the teddy to?', options: ['A police officer', 'Mr. Ravi the bus driver', 'Her teacher'], answer: 1 },
      { q: 'What is the moral of the story?', options: ['Finders keepers', 'Buses are too slow', 'Honesty feels wonderful'], answer: 2 },
    ],
  },
  {
    title: 'Bibi Bunny’s First Snow',
    emoji: '⛄',
    themes: ['snow'],
    text: [
      'One morning, Bibi Bunny woke to find the whole meadow covered in sparkling white.',
      '"The world turned to sugar!" she gasped. She hopped outside and — brrr! — snow was cold, not sweet.',
      'Her friend Ollie Owl chuckled softly. "It is snow, little one. Watch what it can do."',
      'Together they rolled three big snowballs and stacked them tall, with a carrot nose on top.',
      'Bibi’s first snowman sparkled in the sun. New things can feel strange at first — until a friend shows you the fun inside them.',
    ],
    questions: [
      { q: 'What did Bibi think the snow was?', options: ['Sugar', 'Clouds', 'Feathers'], answer: 0 },
      { q: 'Who taught Bibi about snow?', options: ['A fox', 'A snowman', 'Ollie Owl'], answer: 2 },
      { q: 'What did the friends build together?', options: ['An igloo', 'A snowman', 'A sled'], answer: 1 },
    ],
  },
  {
    title: 'The Penguin Sled Team',
    emoji: '🐧',
    themes: ['snow'],
    text: [
      'Pia, Pon, and Petey the penguins found an old wooden sled at the top of Glitter Hill.',
      'Pia wanted to steer. Pon wanted to steer. Petey wanted to steer. The sled did not move at all.',
      'Wise seal Soma barked from below, "One steers, one pushes, one cheers — then swap!"',
      'They took turns, and whoosh, whoosh, whoosh! Down the sparkly hill they flew, laughing all the way.',
      'By sunset, everyone had steered, everyone had pushed, and everyone had cheered. Taking turns made the fun three times bigger.',
    ],
    questions: [
      { q: 'Why didn’t the sled move at first?', options: ['It was broken', 'Everyone wanted to steer at once', 'It was frozen to the ice'], answer: 1 },
      { q: 'What did Soma the seal suggest?', options: ['Taking turns', 'Buying a new sled', 'Going home'], answer: 0 },
      { q: 'How did the penguins feel at sunset?', options: ['Grumpy', 'Sleepy and sad', 'Happy after sharing turns'], answer: 2 },
    ],
  },
  {
    title: 'Cami Camel and the Cool Well',
    emoji: '🐫',
    themes: ['desert'],
    text: [
      'Cami the camel loved walking the golden desert, where the sand glittered like tiny stars.',
      'One hot afternoon she met Fen the fennec fox, resting under a lonely palm. "The well is so far," Fen sighed, "and my legs are so small."',
      '"Hop on!" said Cami, kneeling down low. Fen climbed up between her two soft humps.',
      'Step by steady step, Cami carried Fen to the cool, bubbling well, and they drank together in the shade.',
      'On the way back, Fen told jokes so funny the journey felt short. Kindness carried one friend — and laughter carried the other.',
    ],
    questions: [
      { q: 'Where does this story happen?', options: ['In a snowy forest', 'In the golden desert', 'Under the sea'], answer: 1 },
      { q: 'How did Cami help Fen?', options: ['She carried him to the well', 'She built him a house', 'She gave him a hat'], answer: 0 },
      { q: 'What did Fen share on the way back?', options: ['His dinner', 'His blanket', 'Funny jokes'], answer: 2 },
    ],
  },
  {
    title: 'Fifi the Forgetful Fairy',
    emoji: '🧚',
    themes: ['magic'],
    text: [
      'Fifi the fairy had shimmering wings and a very forgetful head.',
      'Her job was waking the flowers each morning with a tap of her wand — but she kept forgetting which garden came next!',
      'Her friend Glow the firefly had an idea. "Let’s make a picture list!" They drew a rose, then a tulip, then a daisy on a big leaf.',
      'The next morning, Fifi checked her leaf-list. Tap, tap, tap — every flower woke right on time, yawning in pink and gold.',
      'Fifi twirled with joy. Everyone forgets sometimes — clever plans and good friends help us remember.',
    ],
    questions: [
      { q: 'What was Fifi’s job?', options: ['Waking the flowers', 'Painting rainbows', 'Baking fairy bread'], answer: 0 },
      { q: 'What helped Fifi remember the gardens?', options: ['A magic potion', 'A picture list on a leaf', 'An alarm clock'], answer: 1 },
      { q: 'Who helped Fifi make her plan?', options: ['Glow the firefly', 'A rabbit', 'The moon'], answer: 0 },
    ],
  },
  {
    title: 'Beep the Helper Robot',
    emoji: '🤖',
    themes: ['robot', 'city'],
    text: [
      'Beep the little robot rolled around the city on one shiny wheel, looking for ways to help.',
      'Splat! Grandpa Lou’s shopping bag ripped, and his oranges rolled everywhere on the sidewalk.',
      'Beep zipped left, zoomed right, and caught orange after orange in his basket-hands. But one had rolled far under a bench.',
      'Beep stretched his arm looong — click, whirr — and reached it! "Thank you, little friend," said Grandpa Lou.',
      'Beep’s happy lights blinked pink. Helping others, he decided, was the very best thing his batteries could do.',
    ],
    questions: [
      { q: 'What spilled on the sidewalk?', options: ['Apples', 'Oranges', 'Marbles'], answer: 1 },
      { q: 'Where did the last orange roll?', options: ['Under a bench', 'Into a puddle', 'Down a hill'], answer: 0 },
      { q: 'How did Beep feel after helping?', options: ['Grumpy', 'Bored', 'Happy'], answer: 2 },
    ],
  },
  {
    title: 'Zuri and the Moon Garden',
    emoji: '🚀',
    themes: ['space'],
    text: [
      'Zuri the young astronaut flew her little rocket to the moon with a pocket full of sunflower seeds.',
      'She planted them in moon dust inside her shiny glass dome and waited. Nothing grew.',
      'Day after day, Zuri watered and waited. "Growing takes time," she told herself, "even on the moon."',
      'On the tenth morning, a tiny green sprout unfolded, glowing softly in the earthlight.',
      'Soon the dome was golden with sunflowers, and every passing astronaut stopped to smile. Patience, Zuri learned, can grow gardens anywhere.',
    ],
    questions: [
      { q: 'What did Zuri bring to the moon?', options: ['Sunflower seeds', 'A puppy', 'A drum'], answer: 0 },
      { q: 'Why did Zuri keep waiting and watering?', options: ['She was locked outside', 'Growing takes time', 'Her rocket was broken'], answer: 1 },
      { q: 'What filled the dome at the end?', options: ['Snow', 'Robots', 'Golden sunflowers'], answer: 2 },
    ],
  },
  {
    title: 'Tock the Little Clock',
    emoji: '⏰',
    themes: ['time', 'home'],
    text: [
      'Tock the little clock hung on the kitchen wall, singing his quiet song: tick, tock, tick, tock.',
      '"I wish I were exciting," Tock sighed. "I just go around and around."',
      'But watch! At seven, his tick woke the family for pancakes. At three, his tock said it was playtime in the park.',
      'At eight, his gentle hands pointed to storytime, and the children snuggled up to listen.',
      'That night Tock glowed with pride. He was not loud — but he gave every happy moment its perfect turn.',
    ],
    questions: [
      { q: 'What did Tock wish at first?', options: ['To be exciting', 'To stop ticking', 'To live outside'], answer: 0 },
      { q: 'What time was playtime in the park?', options: ['Three', 'Seven', 'Eight'], answer: 0 },
      { q: 'What did Tock learn about himself?', options: ['Clocks are boring', 'Being loud is best', 'His quiet work made happy moments'], answer: 2 },
    ],
  },
  {
    title: 'The Lollipop Lane Mix-Up',
    emoji: '🍭',
    themes: ['candy'],
    text: [
      'In Candy Town, Lolly the mouse baked swirly lollipops in every color of the rainbow.',
      'One busy morning, she mixed up the labels! Strawberry said "lemon," and lemon said "blueberry."',
      'Her customers took funny-tasting licks. "Oh dear," said Lolly. She could have pretended nothing was wrong.',
      'Instead she rang her candy bell. "I made a mix-up! Free swaps for everyone — and a mini pop for the wait!"',
      'The line turned into a giggling taste-test party. Owning your mistakes, Lolly learned, makes everything sweeter.',
    ],
    questions: [
      { q: 'What got mixed up in the shop?', options: ['The labels', 'The chairs', 'The music'], answer: 0 },
      { q: 'What did Lolly do about her mistake?', options: ['Hid in the kitchen', 'Told everyone and fixed it', 'Blamed the wind'], answer: 1 },
      { q: 'What is the moral of the story?', options: ['Never bake lollipops', 'Honesty makes things sweeter', 'Labels are useless'], answer: 1 },
    ],
  },
  {
    title: 'The Glimmer Cave',
    emoji: '💎',
    themes: ['crystal'],
    text: [
      'Digby the mole dug a brand-new tunnel and popped out into a secret cave.',
      'Crystals glowed everywhere — pink, blue, and violet — like a sky of underground stars.',
      'Digby wanted to keep the cave all to himself. But glitter is quiet fun when you are alone.',
      'So he invited everyone: the rabbits, the hedgehogs, even sleepy Badger Bo. Their happy eyes made the crystals seem twice as bright.',
      'Now Glimmer Cave is where all the burrow friends gather on rainy days. Beautiful things grow more beautiful when they are shared.',
    ],
    questions: [
      { q: 'What did Digby find?', options: ['A crystal cave', 'A pirate ship', 'A honey pot'], answer: 0 },
      { q: 'What did Digby almost do?', options: ['Sell the crystals', 'Keep the cave to himself', 'Close the tunnel forever'], answer: 1 },
      { q: 'What made the cave feel even brighter?', options: ['Sharing it with friends', 'More digging', 'A flashlight'], answer: 0 },
    ],
  },
  {
    title: 'Momo Monkey’s Banana Day',
    emoji: '🐒',
    themes: ['jungle'],
    text: [
      'Momo the monkey found the biggest banana bunch in the whole jungle, high in a rain-sparkled tree.',
      'Down below, little Tapi the tapir looked up hungrily. The branch was much too high for him.',
      'Momo remembered how Tapi had shared his river-berries on a rainy day.',
      'So Momo picked bananas — one, two, three — and tossed them gently down. Tapi caught them with a happy wiggle.',
      'They ate their feast under giant green leaves while parrots sang above. In the jungle, kindness always swings back around.',
    ],
    questions: [
      { q: 'Where does this story happen?', options: ['In the jungle', 'On the moon', 'At school'], answer: 0 },
      { q: 'Why couldn’t Tapi get the bananas?', options: ['He didn’t like them', 'The branch was too high', 'He was fast asleep'], answer: 1 },
      { q: 'Why did Momo share his bananas?', options: ['Tapi had been kind to him before', 'He hated bananas', 'A parrot told him to'], answer: 0 },
    ],
  },
]

/** Stories matching any of the given theme tags; falls back to the full bank. */
export function storiesForThemes(tags: string[]): Story[] {
  const hit = STORIES.filter(s => s.themes.some(t => tags.includes(t)))
  return hit.length ? hit : STORIES
}
