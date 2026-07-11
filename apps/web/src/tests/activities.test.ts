import { describe, it, expect } from 'vitest';
import { ACTIVITY_TYPES, mergeActivityTypes, activityTypeById } from '../activities/catalog';
import { pickActivity, sizeForMechanic, weakestSkill, ScheduleContext } from '../activities/scheduler';
import { MECHANIC_REGISTRY } from '../activities/mechanics';
import { Mechanic } from '../activities/types';
import { validateText, validateItem, runPipeline, imageGenerator, llmGenerator, styledPrompt, GeneratedItem } from '../activities/generators';
import { freshBoard, hasLegalMove, resolveSwap, findMatches } from '@etricks/activity-match3';
import { LEVELS } from '../data/levels';

const emptyCtx = (): ScheduleContext => ({ recentActivities: [], recentMechanics: [], activityLog: {}, skills: {} });

describe('activity catalogue', () => {
  it('ships at least 100 distinct activity types', () => {
    const types = ACTIVITY_TYPES();
    expect(types.length).toBeGreaterThanOrEqual(100);
    expect(new Set(types.map(t => t.id)).size).toBe(types.length);   // ids unique
  });

  it('every activity type maps to a registered mechanic', () => {
    const known = new Set(Object.keys(MECHANIC_REGISTRY));
    for (const t of ACTIVITY_TYPES()) expect(known.has(t.mechanic), t.id).toBe(true);
  });

  it('covers all interaction mechanics, including the new ones', () => {
    const used = new Set(ACTIVITY_TYPES().map(t => t.mechanic));
    for (const m of ['sorting', 'match3', 'maze', 'find-difference', 'sliding'] as Mechanic[]) {
      expect(used.has(m), m).toBe(true);
    }
  });

  it('merges server-delivered activity types (id wins, invalid dropped)', () => {
    const before = ACTIVITY_TYPES().length;
    mergeActivityTypes([
      { id: 'srv-test-1', name: 'Server Test', icon: '🧪', mechanic: 'sorting', skill: 'observation', category: 'Test', minTier: 0, maxTier: 4 },
      { bogus: true } as any,
      { id: 'srv-bad-mech', name: 'Bad', icon: '❓', mechanic: 'not-a-real-mechanic', skill: 'logic', category: 'X', minTier: 0, maxTier: 4 } as any,
    ]);
    expect(activityTypeById('srv-test-1')).toBeTruthy();
    // An unknown mechanic has no renderer, so it must be rejected (never scheduled → no blank screen).
    expect(activityTypeById('srv-bad-mech')).toBeUndefined();
    expect(ACTIVITY_TYPES().length).toBe(before + 1);
  });
});

describe('activity scheduler', () => {
  const level = LEVELS[29]; // tier 1 — plenty of mechanics available

  it('is deterministic for the same level + context', () => {
    const a = pickActivity(level, emptyCtx());
    const b = pickActivity(level, emptyCtx());
    expect(a.activityId).toBe(b.activityId);
    expect(a.mechanic).toBe(b.mechanic);
  });

  it('never repeats the same mechanic back-to-back', () => {
    const first = pickActivity(level, emptyCtx());
    const second = pickActivity(level, { ...emptyCtx(), recentMechanics: [first.mechanic] });
    expect(second.mechanic).not.toBe(first.mechanic);
  });

  it('never serves an activity inside the no-repeat window', () => {
    const seen = ACTIVITY_TYPES().slice(0, 40).map(t => t.id);
    const spec = pickActivity(level, { ...emptyCtx(), recentActivities: seen });
    // The scheduler remembers a recent window (RECENT_WINDOW) and must avoid it.
    expect(seen.slice(0, 12).includes(spec.activityId)).toBe(false);
  });

  it('prefers a never-played activity when history is fresh', () => {
    // Mark most of the pool as played; the pick should still avoid the recent window.
    const played = Object.fromEntries(ACTIVITY_TYPES().slice(0, 5).map(t => [t.id, { plays: 3, completed: 3, skips: 0, stars: 2, hints: 0, bestMs: 0, lastLevel: 1, ts: 0 }]));
    const spec = pickActivity(level, { ...emptyCtx(), activityLog: played, recentActivities: ACTIVITY_TYPES().slice(0, 5).map(t => t.id) });
    expect(ACTIVITY_TYPES().slice(0, 5).map(t => t.id).includes(spec.activityId)).toBe(false);
  });

  it('produces a valid spec for every level in the catalogue', () => {
    for (const l of LEVELS) {
      const spec = pickActivity(l, emptyCtx());
      expect(spec.mechanic in MECHANIC_REGISTRY).toBe(true);
      expect(spec.size).toBeGreaterThan(0);
      expect(spec.difficulty).toBeGreaterThanOrEqual(0);
      expect(spec.difficulty).toBeLessThanOrEqual(5);
    }
  });

  it('sizes mechanics sensibly and ramps with tier', () => {
    expect(sizeForMechanic('memory-flip', 0)).toBeLessThan(sizeForMechanic('memory-flip', 4));
    expect(sizeForMechanic('maze', 0)).toBeGreaterThanOrEqual(4);
  });

  it('never sizes a board-based mechanic below a playable minimum (no blank boards)', () => {
    // Regression: a scheduled mechanic used to inherit the level.size of a
    // DIFFERENT kind (e.g. 0 on a story level) → an empty board. Every tier must
    // give a playable size for the size-driven mechanics.
    for (let t = 0; t <= 4; t++) {
      expect(sizeForMechanic('memory-flip', t)).toBeGreaterThanOrEqual(3);
      expect(sizeForMechanic('memory-sequence', t)).toBeGreaterThanOrEqual(3);
      expect(sizeForMechanic('quick-tap', t)).toBeGreaterThanOrEqual(4);
      expect(sizeForMechanic('sorting', t)).toBeGreaterThanOrEqual(4);
      expect(sizeForMechanic('find-difference', t)).toBeGreaterThanOrEqual(2);
      expect(sizeForMechanic('sliding', t)).toBeGreaterThanOrEqual(3);
    }
  });

  it('detects a genuine weak skill and ignores strong ones', () => {
    expect(weakestSkill({ memory: { plays: 10, totalAccuracy: 2 }, math: { plays: 10, totalAccuracy: 9 } })).toBe('memory');
    expect(weakestSkill({ memory: { plays: 10, totalAccuracy: 9.5 } })).toBeNull();
  });
});

describe('match-3 board — never deadlocks', () => {
  it('deals boards with no free matches and always a legal move', () => {
    for (let i = 0; i < 400; i++) {
      const b = freshBoard(5, 4);
      expect(findMatches(b, 5).size).toBe(0);
      expect(hasLegalMove(b, 5)).toBe(true);
    }
  });

  it('a resolved swap always leaves a playable board (no dead end)', () => {
    for (let i = 0; i < 200; i++) {
      let board = freshBoard(5, 4);
      // play random legal swaps; every accepted move must leave a legal move
      for (let move = 0; move < 30; move++) {
        const idx = Math.floor(Math.random() * 25);
        const neighbours = [idx + 1, idx + 5].filter(j => j < 25 && (j !== idx + 1 || j % 5 !== 0));
        const j = neighbours[Math.floor(Math.random() * neighbours.length)];
        const res = resolveSwap(board, 5, idx, j, 4);
        if (res) { board = res.cells; expect(hasLegalMove(board, 5)).toBe(true); }
      }
    }
  });

  it('rejects a swap that makes no match (illegal move → null)', () => {
    // a striped board where no adjacent swap can align three
    const board = [0, 1, 0, 1, 0,  1, 0, 1, 0, 1,  0, 1, 0, 1, 0,  1, 0, 1, 0, 1,  0, 1, 0, 1, 0];
    // swapping two equal-pattern neighbours yields no 3-run here
    expect(resolveSwap(board, 5, 0, 1, 2)).toBeNull();
  });
});

describe('AI content pipeline & validation gate', () => {
  it('rejects unsafe or malformed text, accepts clean text', () => {
    expect(validateText('A happy little bunny hops in the meadow.').ok).toBe(true);
    expect(validateText('the scary gun').ok).toBe(false);
    expect(validateText('x').ok).toBe(false);
  });

  it('validates items structurally by kind', () => {
    const goodRiddle: GeneratedItem = { id: 'r1', kind: 'riddle', payload: { q: 'What has hands but cannot clap?', options: ['Clock', 'Cat'], answer: 0 }, themeTags: ['home'], difficulty: 1, source: 'llm' };
    const badRiddle: GeneratedItem = { id: 'r2', kind: 'riddle', payload: { q: 'no options here' }, themeTags: [], difficulty: 1, source: 'llm' };
    expect(validateItem(goodRiddle).ok).toBe(true);
    expect(validateItem(badRiddle).ok).toBe(false);
  });

  it('only admits validated items through the pipeline', async () => {
    const out = await runPipeline([imageGenerator, llmGenerator], { kind: 'scene', themeTags: ['ocean'], difficulty: 1, seed: 3 });
    expect(out.admitted.length).toBeGreaterThan(0);
    expect(out.admitted.every(i => validateItem(i).ok)).toBe(true);
  });

  it('keeps a consistent house art style', () => {
    expect(styledPrompt('a friendly dinosaur')).toContain('a friendly dinosaur');
    expect(styledPrompt('a friendly dinosaur')).toContain('no text');
  });
});
