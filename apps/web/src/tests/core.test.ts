import { describe, it, expect } from 'vitest';
import { LEVELS, computeReward, recommendLevel, seededRandom } from '../data/levels';
import type { SkillMap, LevelDef } from '../data/levels';
import { generateWorldSeed, LEVELS_PER_GENERATED_WORLD } from '../data/endless';
import { buildWorlds } from '../data/worlds';

describe('level generation', () => {
  it('generates exactly 100 levels numbered 1..100', () => {
    expect(LEVELS.length).toBe(100);
    LEVELS.forEach((l, i) => expect(l.id).toBe(i + 1));
  });

  it('assigns correct difficulty tiers', () => {
    expect(LEVELS[0].tier).toBe('Very Easy');
    expect(LEVELS[19].tier).toBe('Very Easy');
    expect(LEVELS[20].tier).toBe('Easy');
    expect(LEVELS[59].tier).toBe('Medium');
    expect(LEVELS[79].tier).toBe('Hard');
    expect(LEVELS[99].tier).toBe('Expert');
    expect(LEVELS[99].tierIndex).toBe(4);
  });

  it('every level has a kind, title, and skill', () => {
    for (const l of LEVELS) {
      expect(l.kind.length).toBeGreaterThan(0);
      expect(l.title.length).toBeGreaterThan(0);
      expect(l.skill.length).toBeGreaterThan(0);
    }
  });

  it('uses a variety of game kinds in each tier', () => {
    for (let t = 0; t < 5; t++) {
      const kinds = new Set(LEVELS.slice(t * 20, t * 20 + 20).map(l => l.kind));
      expect(kinds.size).toBeGreaterThanOrEqual(8);
    }
  });

  it('difficulty knob (size) grows with tier for scalable games', () => {
    const byKind = (kind: string, tier: number) =>
      LEVELS.find(l => l.kind === kind && l.tierIndex === tier);
    const easyFlip = byKind('memory-flip', 0);
    const hardFlip = byKind('memory-flip', 4);
    if (easyFlip && hardFlip) expect(hardFlip.size).toBeGreaterThan(easyFlip.size);
  });

  it('flags the right milestone levels', () => {
    const m = (id: number) => LEVELS[id - 1].milestone;
    expect(m(5)).toBe('big');
    expect(m(10)).toBe('chest');
    expect(m(25)).toBe('badge');
    expect(m(50)).toBe('golden');
    expect(m(100)).toBe('champion');
    expect(m(7)).toBeUndefined();
  });
});

describe('reward engine', () => {
  const lvl = LEVELS[0];

  it('awards 1-3 stars based on accuracy', () => {
    expect(computeReward(lvl, 1.0, { premium: false }).stars).toBe(3);
    expect(computeReward(lvl, 0.75, { premium: false }).stars).toBe(2);
    expect(computeReward(lvl, 0.4, { premium: false }).stars).toBe(1);
  });

  it('never awards zero coins/xp for a completed level', () => {
    const r = computeReward(lvl, 0.1, { premium: false });
    expect(r.coins).toBeGreaterThan(0);
    expect(r.xp).toBeGreaterThan(0);
  });

  it('premium grants boosted coins and xp', () => {
    const free = computeReward(lvl, 1.0, { premium: false });
    const prem = computeReward(lvl, 1.0, { premium: true });
    expect(prem.coins).toBeGreaterThan(free.coins);
    expect(prem.xp).toBeGreaterThan(free.xp);
  });

  it('milestone levels pay bonus loot', () => {
    const normal = computeReward(LEVELS[23], 1.0, { premium: false }); // 24 — no milestone
    const badge = computeReward(LEVELS[24], 1.0, { premium: false });  // 25 — badge
    expect(badge.coins).toBeGreaterThan(normal.coins);
    expect(badge.diamonds).toBeGreaterThan(normal.diamonds);
  });

  it('higher tiers pay more than lower tiers at equal accuracy', () => {
    const t0 = computeReward(LEVELS[0], 1.0, { premium: false });
    const t4 = computeReward(LEVELS[98], 1.0, { premium: false }); // 99, no milestone
    expect(t4.coins).toBeGreaterThan(t0.coins);
    expect(t4.xp).toBeGreaterThan(t0.xp);
  });
});

describe('adaptive coach', () => {
  it('recommends a level targeting the weakest skill', () => {
    const skills: SkillMap = {
      memory: { plays: 10, totalAccuracy: 9 },
      logic: { plays: 10, totalAccuracy: 2 },   // weakest — avg 0.2
      math: { plays: 10, totalAccuracy: 8 },
      language: { plays: 10, totalAccuracy: 7 },
    };
    const rec = recommendLevel(skills, 40);
    expect(rec.level.skill).toBe('logic');
    expect(rec.level.id).toBeLessThanOrEqual(40);
    expect(rec.reason).toContain('Logic');
  });

  it('suggests climbing when all skills are strong', () => {
    const skills: SkillMap = { memory: { plays: 5, totalAccuracy: 4.9 } };
    const rec = recommendLevel(skills, 12);
    expect(rec.level.id).toBe(12);
  });

  it('returns a valid unlocked level even with no history', () => {
    const rec = recommendLevel({}, 1);
    expect(rec.level.id).toBe(1);
  });
});

describe('seeded random', () => {
  it('is deterministic for the same seed', () => {
    const a = seededRandom(42), b = seededRandom(42);
    for (let i = 0; i < 20; i++) expect(a()).toBe(b());
  });
  it('differs across seeds', () => {
    expect(seededRandom(1)()).not.toBe(seededRandom(2)());
  });
  it('stays within [0, 1)', () => {
    const r = seededRandom(7);
    for (let i = 0; i < 100; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('level content sanity', () => {
  it('all 100 levels can compute a reward without throwing', () => {
    for (const l of LEVELS as LevelDef[]) {
      const r = computeReward(l, 1, { premium: false });
      expect(r.stars).toBe(3);
    }
  });
});

describe('endless engine', () => {
  it('is deterministic — world N is the same world for every child', () => {
    expect(generateWorldSeed(3)).toEqual(generateWorldSeed(3));
    expect(generateWorldSeed(3).id).toBe('gen-3');
  });

  it('numbers repeat biome visits (… II, … III)', () => {
    const first = generateWorldSeed(0);
    const revisit = [...Array(40)].map((_, n) => generateWorldSeed(n))
      .find(w => w.name.startsWith(first.name) && w.name !== first.name);
    expect(revisit).toBeDefined();
    expect(revisit!.name).toBe(`${first.name} II`);
  });

  it('every generated world is complete (art prompts, terrain, content pool)', () => {
    for (let n = 0; n < 30; n++) {
      const w = generateWorldSeed(n);
      expect(w.artPrompt.length).toBeGreaterThan(10);
      expect(w.emblemPrompt.length).toBeGreaterThan(5);
      expect(w.terrain.length).toBeGreaterThan(2);
      expect(w.emojis.length).toBeGreaterThanOrEqual(12);
      expect(w.levels).toBe(LEVELS_PER_GENERATED_WORLD);
    }
  });

  it('generated worlds extend the catalogue through buildWorlds', () => {
    const seeds = [...Array(4)].map((_, n) => ({ ...generateWorldSeed(n) }));
    const worlds = buildWorlds(seeds, 4 * LEVELS_PER_GENERATED_WORLD);
    expect(worlds.length).toBe(4);
    expect(worlds[3].lastLevel).toBe(4 * LEVELS_PER_GENERATED_WORLD);
    expect(worlds[0].terrain).toBeTruthy();
  });
});
