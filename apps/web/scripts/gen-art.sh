#!/bin/sh
# ---------------------------------------------------------------------------
# Brain Booster Kids — AI art pipeline (Pollinations, flux model, keyless)
#
# Generates every painted asset the app ships: world backdrops, signpost
# emblems, mascot portraits and UI icons. Idempotent — existing files are
# skipped, so deleting one image and re-running regenerates just that image.
# Change a seed to get a different composition for that asset.
#
# NOTE: Pollinations' free tier allows ~1 request at a time per IP, so this
# runs strictly sequentially with backoff. Full regeneration ≈ 15 minutes.
#
#   usage: sh apps/web/scripts/gen-art.sh
# ---------------------------------------------------------------------------
OUT="$(cd "$(dirname "$0")/../public" && pwd)/art"
mkdir -p "$OUT"

BG_STYLE="cute 3d render, kids mobile game art, soft pastel colors, dreamy soft light, adorable, high quality, no text"
IC_STYLE="cute 3d game icon, one single object centered, glossy, soft pastel colors, kids game badge, plain background, no text"
MC_STYLE="adorable friendly kids game mascot character, big sparkly eyes, cute 3d render, soft pastel plain background, no text"
UI_STYLE="cute 3d game ui icon, one single object centered, glossy, vibrant, rounded, plain soft white background, no text"

enc() { printf '%s' "$1" | sed 's/ /%20/g; s/,/%2C/g'; }

gen() { # gen <file> <WxH> <seed> <prompt>
  f="$OUT/$1"; wh="$2"; seed="$3"; p="$(enc "$4")"
  w="${wh%x*}"; h="${wh#*x}"
  [ -s "$f" ] && [ "$(wc -c < "$f")" -gt 5000 ] && { echo "skip $1"; return; }
  for i in 1 2 3 4 5; do
    curl -s -f -m 180 -o "$f" "https://image.pollinations.ai/prompt/$p?width=$w&height=$h&seed=$seed&nologo=true&model=flux" \
      && [ "$(wc -c < "$f")" -gt 5000 ] && { echo "ok   $1"; sleep 4; return; }
    echo "retry $1 ($i)"; sleep $((i * 8))
  done
  echo "FAIL $1"; rm -f "$f"
}

# --- world backdrops (portrait, cover the adventure-map bands) ----------------
gen world-home.jpg        512x640 11 "cozy fairytale village, tiny houses on rolling green hills, flower gardens, $BG_STYLE"
gen world-forest.jpg      512x640 12 "magical green forest, tall friendly trees, glowing mushrooms, fireflies, mossy path, $BG_STYLE"
gen world-countryside.jpg 512x640 13 "sunny farm, red barn, windmill, golden wheat field, sunflowers, hay bales, $BG_STYLE"
gen world-river.jpg       512x640 14 "winding blue river, wooden bridge, small waterfall, stepping stones, lily pads, reeds, $BG_STYLE"
gen world-tropical.jpg    512x640 15 "tropical island, palm trees, hibiscus flowers, turquoise lagoon, parrots, $BG_STYLE"
gen world-beach.jpg       512x640 16 "sunny beach, sandcastle, seashells, striped beach umbrella, gentle waves, starfish, $BG_STYLE"
gen world-ocean.jpg       512x640 26 "underwater ocean world, colorful coral reef, tropical fish, sea turtle, sun rays through blue water, bubbles, $BG_STYLE"
gen world-pirate.jpg      512x640 27 "pirate island, friendly pirate ship with sails, treasure chest on beach, palm trees, cave, $BG_STYLE"
gen world-volcano.jpg     512x640 17 "friendly cartoon volcano island, glowing orange lava rivers, smoke puffs, dark rocks, warm light, not scary, $BG_STYLE"
gen world-dino.jpg        512x640 18 "prehistoric jungle valley, cute baby dinosaurs, giant ferns, dinosaur eggs, distant volcano, $BG_STYLE"
gen world-bridges.jpg     512x640 19 "giant rope bridges across a deep canyon, waterfalls, adventurous cliffs, pine trees, $BG_STYLE"
gen world-snow.jpg        512x640 20 "snowy mountain peaks, cozy igloo, pine trees covered in snow, falling snowflakes, northern lights, $BG_STYLE"
gen world-desert.jpg      512x640 21 "golden sand dunes, cactus, friendly camel, ancient treasure chest, palm oasis, $BG_STYLE"
gen world-magic.jpg       512x640 22 "pink fairytale castle, rainbow, unicorn, floating islands, sparkles, magic clouds, $BG_STYLE"
gen world-magicforest.jpg 512x640 28 "enchanted magic forest at twilight, giant glowing mushrooms, fairy lights, sparkling stream, fireflies, $BG_STYLE"
gen world-robot.jpg       512x640 29 "cheerful robot city, cute friendly robots, colorful futuristic buildings, gears, soft neon lights, $BG_STYLE"
gen world-space.jpg       512x640 23 "outer space, colorful planets, friendly space station, rocket, glowing stars, soft nebula, $BG_STYLE"
gen world-moon.jpg        512x640 24 "moon surface with craters, cute moon base domes, planet earth in starry sky, astronaut, $BG_STYLE"
gen world-mars.jpg        512x640 30 "red planet mars, cute mars rover, red rock dunes, astronaut camp domes, pink sky with two tiny moons, $BG_STYLE"
gen world-galaxy.jpg      512x640 25 "swirling purple galaxy, shooting stars, glowing planets, cosmic clouds, wonder, $BG_STYLE"
gen world-future.jpg      512x640 31 "wonderful future city, flying cars, glass towers with sky gardens, rainbow bridges, happy bright, $BG_STYLE"
gen world-timetravel.jpg  512x640 32 "time travel wonderland, giant clock tower, swirling golden time portal, floating gears, dinosaur and rocket together, $BG_STYLE"

# --- world emblems (square badges for the map signposts) -----------------------
gen emblem-home.jpg        384x384 31 "tiny cozy cottage with red roof, $IC_STYLE"
gen emblem-forest.jpg      384x384 32 "big friendly green tree, $IC_STYLE"
gen emblem-countryside.jpg 384x384 33 "little red barn with wheat, $IC_STYLE"
gen emblem-river.jpg       384x384 34 "wooden bridge over blue stream, $IC_STYLE"
gen emblem-tropical.jpg    384x384 35 "palm tree on tiny island, $IC_STYLE"
gen emblem-beach.jpg       384x384 36 "sandcastle with little flag, $IC_STYLE"
gen emblem-ocean.jpg       384x384 56 "cute smiling sea turtle, $IC_STYLE"
gen emblem-pirate.jpg      384x384 57 "wooden treasure chest with gold coins and small pirate flag, $IC_STYLE"
gen emblem-volcano.jpg     384x384 37 "friendly cartoon volcano with lava, $IC_STYLE"
gen emblem-dino.jpg        384x384 38 "cute baby green dinosaur, $IC_STYLE"
gen emblem-bridges.jpg     384x384 39 "rope bridge over canyon, $IC_STYLE"
gen emblem-snow.jpg        384x384 40 "snowy mountain peak with snowflake, $IC_STYLE"
gen emblem-desert.jpg      384x384 41 "cactus and sand dune with sun, $IC_STYLE"
gen emblem-magic.jpg       384x384 42 "pink fairytale castle tower, $IC_STYLE"
gen emblem-magicforest.jpg 384x384 58 "glowing magic mushroom with sparkles, $IC_STYLE"
gen emblem-robot.jpg       384x384 59 "cute friendly robot head, $IC_STYLE"
gen emblem-space.jpg       384x384 43 "cute white and red rocket ship, $IC_STYLE"
gen emblem-moon.jpg        384x384 44 "crescent moon with tiny stars, $IC_STYLE"
gen emblem-mars.jpg        384x384 60 "cute red planet with little rover, $IC_STYLE"
gen emblem-galaxy.jpg      384x384 45 "swirling purple galaxy with stars, $IC_STYLE"
gen emblem-future.jpg      384x384 61 "cute flying car, $IC_STYLE"
gen emblem-timetravel.jpg  384x384 62 "golden magic pocket watch with time swirl, $IC_STYLE"

# --- mascot guide portraits (Boo the penguin stays hand-drawn SVG) -------------
gen mascot-panda.jpg    384x384 51 "happy baby panda, $MC_STYLE"
gen mascot-fox.jpg      384x384 52 "playful little orange fox, $MC_STYLE"
gen mascot-elephant.jpg 384x384 53 "friendly baby elephant, $MC_STYLE"
gen mascot-dino.jpg     384x384 54 "cute baby long neck dinosaur, $MC_STYLE"
gen mascot-dragon.jpg   384x384 55 "adorable baby dragon, tiny wings, $MC_STYLE"
gen mascot-robot.jpg    384x384 63 "cute little robot buddy, round body, glowing friendly eyes, tiny antenna, $MC_STYLE"
gen mascot-parrot.jpg   384x384 64 "colorful cheerful parrot wearing a tiny pirate hat, $MC_STYLE"

# --- UI icons (replace emoji across HUD, home, shop, rewards) ------------------
gen icon-coin.jpg     256x256 71 "shiny golden coin with star emblem, $UI_STYLE"
gen icon-gem.jpg      256x256 72 "sparkling blue diamond gemstone, $UI_STYLE"
gen icon-brain.jpg    256x256 73 "cute happy pink brain with sparkles, $UI_STYLE"
gen icon-flame.jpg    256x256 74 "friendly smiling orange flame, $UI_STYLE"
gen icon-map.jpg      256x256 75 "rolled adventure treasure map with red x, $UI_STYLE"
gen icon-gift.jpg     256x256 76 "wrapped present box with red ribbon bow, $UI_STYLE"
gen icon-shop.jpg     256x256 77 "colorful market stall with striped awning, $UI_STYLE"
gen icon-family.jpg   256x256 78 "parent and child figures with heart, $UI_STYLE"
gen icon-premium.jpg  256x256 79 "golden royal crown with sparkles, $UI_STYLE"
gen icon-settings.jpg 256x256 80 "friendly blue gear cogwheel, $UI_STYLE"
gen icon-wheel.jpg    256x256 81 "colorful carnival prize spinning wheel, $UI_STYLE"
gen icon-chest.jpg    256x256 82 "open wooden treasure chest full of gold, $UI_STYLE"
gen icon-xp.jpg       256x256 83 "magic glowing golden star with sparkle trail, $UI_STYLE"

echo "--- done ---"
ls "$OUT" | wc -l
