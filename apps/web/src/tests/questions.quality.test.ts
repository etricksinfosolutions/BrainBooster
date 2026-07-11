import { describe, it, expect } from 'vitest'
import { LEVELS } from '../data/levels'
import { buildLevelQuestions, validateLevelQuestions, validateQuestion, type QCategory } from '../data/questions'

// Regression coverage for the Gameplay Quality sprint (#1, #2, #3, #6, #11).
// Generators are random, so each is exercised many times to catch flaky invalids.
// We drive every QCategory directly (covering all generators) across representative
// levels (one per distinct kind), which is thorough AND fast.

const CATEGORIES: QCategory[] = ['math', 'count', 'pattern', 'sequence', 'observation', 'knowledge', 'language', 'riddle', 'shadow']
const SAMPLE_LEVELS = [...new Map(LEVELS.map(l => [l.kind, l])).values()].slice(0, 5)

describe('question quality pipeline', () => {
  it('every category yields valid, non-repeating questions, each with an explanation', () => {
    for (const level of SAMPLE_LEVELS) {
      for (const cat of CATEGORIES) {
        for (let run = 0; run < 8; run++) {
          const qs = buildLevelQuestions(level, new Set<string>(), cat)
          // #1 — no two IDENTICAL questions in a level.
          expect(validateLevelQuestions(qs), `${cat} L${level.id} r${run}`).toBeNull()
          for (const q of qs) {
            // #2/#3 — each question valid (one correct, distinct options, valid shadow).
            expect(validateQuestion(q), q.id).toBeNull()
            expect(new Set(q.options).size, `distinct ${q.id}`).toBe(q.options.length)
            expect(q.options.filter(o => o === q.options[q.answer]).length, `one-correct ${q.id}`).toBe(1)
            // #6 — every question carries a contextual explanation.
            expect((q.explain ?? '').trim().length, `explain ${q.id}`).toBeGreaterThan(0)
          }
        }
      }
    }
  })

  it('every Shadow Matching puzzle has its silhouette as exactly one selectable option (#3)', () => {
    let shadows = 0
    for (const level of SAMPLE_LEVELS) {
      for (let run = 0; run < 8; run++) {
        for (const q of buildLevelQuestions(level, new Set<string>(), 'shadow').filter(x => x.mediaShadow)) {
          shadows++
          expect(q.media && q.options.includes(q.media), `${q.id} silhouette in options`).toBeTruthy()
          expect(q.options[q.answer], `${q.id} answer is the silhouette`).toBe(q.media)
        }
      }
    }
    expect(shadows, 'shadow puzzles exercised').toBeGreaterThan(0)
  })

  it('validateQuestion rejects a distractor equal to the correct answer (#2)', () => {
    expect(validateQuestion({
      id: 'x', category: 'math', difficulty: 0, title: 't', icon: '➕',
      prompt: '1+1?', options: ['2', '2', '3'], answer: 0, hint: 'h',
    } as any)).toBe('duplicate options')
  })

  it('validateQuestion rejects a shadow with no matching option (#3)', () => {
    expect(validateQuestion({
      id: 'x', category: 'shadow', difficulty: 0, title: 't', icon: '🎯',
      prompt: 'Whose shadow?', media: '🦊', mediaShadow: true,
      options: ['🐼', '🦁', '🐸'], answer: 0, hint: 'h',
    } as any)).toBe('shadow has no matching option')
  })
})
