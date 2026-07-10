import { describe, it, expect } from 'vitest';
import { WORLDS, buildWorlds, mascotByKey, DEFAULT_WORLD_SEEDS } from '../data/worlds';
import { generateWorldSeed } from '../data/endless';
import { themeFor } from '../theme';
import { STORIES, storiesForThemes } from '../data/stories';
import { FACTS, factsForThemes } from '../data/facts';
import { narratorGenderForWorld, welcomeScript } from '../state/narrator';
import { buildLevelQuestions } from '../data/questions';
import { LEVELS } from '../data/levels';

const CONTENT_TAGS = [
  'home', 'farm', 'forest', 'river', 'island', 'beach', 'ocean', 'pirate',
  'volcano', 'dino', 'city', 'snow', 'desert', 'magic', 'robot', 'space',
  'time', 'candy', 'crystal', 'jungle',
];

describe('world theme engine', () => {
  const generated = buildWorlds([...Array(20)].map((_, n) => generateWorldSeed(n)), 100);
  const everyWorld = [...WORLDS, ...generated];

  it('resolves a complete theme for every authored and generated world', () => {
    for (const w of everyWorld) {
      const t = themeFor(w);
      expect(t.terrain.length, w.id).toBeGreaterThan(2);
      expect(t.tags.length, w.id).toBeGreaterThan(0);
      expect(t.music.length, w.id).toBeGreaterThan(2);
      expect(t.pools.length, w.id).toBeGreaterThan(0);
      expect(t.art.length, w.id).toBeGreaterThan(4);
      expect(t.accent, w.id).toMatch(/^#/);
      expect(t.welcome, w.id).toContain(w.name);
    }
  });

  it('gives different worlds visibly different identities', () => {
    const musics = new Set(WORLDS.map(w => themeFor(w).music));
    const tags = new Set(WORLDS.flatMap(w => themeFor(w).tags));
    expect(musics.size).toBeGreaterThanOrEqual(7);
    expect(tags.size).toBeGreaterThanOrEqual(15);
  });

  it('adding a world needs no code: unknown ids fall back to terrain defaults', () => {
    const [w] = buildWorlds([{
      id: 'brand-new', name: 'Brand New World', emoji: '🌈', accent: '#123456', sky: '#eeeeee',
      mascot: 'panda', blurb: 'Never seen before!', activities: [], emojis: ['🌈', '⭐'], terrain: 'snow',
    }], 5);
    const t = themeFor(w);
    expect(t.music).toBe('snow');
    expect(t.tags).toContain('snow');
    expect(t.pools.length).toBeGreaterThan(0);
  });
});

describe('official mascot — Tigo the tiger', () => {
  it('is the lead mascot', () => {
    expect(mascotByKey('tiger').name).toBe('Tigo');
    expect(mascotByKey('tiger').emoji).toBe('🐯');
  });
  it('legacy "owl" content documents resolve to Tigo', () => {
    expect(mascotByKey('owl').key).toBe('tiger');
  });
  it('no default seed references the removed penguin slot', () => {
    for (const s of DEFAULT_WORLD_SEEDS) expect(s.mascot).not.toBe('owl');
  });
});

describe('themed content banks', () => {
  it('every world resolves a non-empty story pool and fact pool', () => {
    for (const w of WORLDS) {
      const t = themeFor(w);
      expect(storiesForThemes(t.tags).length, w.id).toBeGreaterThan(0);
      expect(factsForThemes(t.tags).length, w.id).toBeGreaterThan(0);
    }
  });

  it('every content tag has at least one story and five facts', () => {
    for (const tag of CONTENT_TAGS) {
      expect(STORIES.filter(s => s.themes.includes(tag)).length, `stories:${tag}`).toBeGreaterThanOrEqual(1);
      expect(FACTS.filter(f => f.themes.includes(tag)).length, `facts:${tag}`).toBeGreaterThanOrEqual(5);
    }
  });

  it('all stories are well-formed (3 questions × 3 options, valid answers)', () => {
    for (const s of STORIES) {
      expect(s.text.length).toBeGreaterThanOrEqual(4);
      expect(s.questions.length).toBe(3);
      for (const q of s.questions) {
        expect(q.options.length).toBe(3);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
      }
    }
  });
});

describe('narration manager', () => {
  it('narrator per world is deterministic', () => {
    for (let i = 0; i < 30; i++) {
      expect(narratorGenderForWorld(i)).toBe(narratorGenderForWorld(i));
    }
  });
  it('both narrators appear across the journey', () => {
    const genders = new Set([...Array(22)].map((_, i) => narratorGenderForWorld(i)));
    expect(genders.size).toBe(2);
  });
  it('welcome script introduces the world by name', () => {
    const script = welcomeScript({ index: 3, name: 'Deep Ocean', blurb: 'Dive in!' });
    expect(script).toContain('Deep Ocean');
    expect(script).toContain('Dive in!');
  });
});

describe('world-scoped questions', () => {
  it('every quiz level builds 6 escalating questions without throwing', () => {
    const quizKinds = new Set(['math', 'odd-one-out', 'shadow-match', 'pattern', 'missing-number', 'quick-count', 'riddle', 'opposites', 'flags']);
    for (const level of LEVELS.filter(l => quizKinds.has(l.kind))) {
      const qs = buildLevelQuestions(level, new Set());
      expect(qs.length, `level ${level.id}`).toBe(6);
      qs.forEach((q, i) => {
        expect(q.difficulty).toBe(i);
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
      });
    }
  });
});
