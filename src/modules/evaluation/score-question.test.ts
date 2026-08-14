import { describe, expect, it } from 'vitest';
import { scoreQuestion } from './score-question';
import type { Question } from '@/lib/types';
const base: Question = { id: 'q', type: 'mcq', subject: 'Math', topic: 'Algebra', difficulty: 'medium', text: 'x?', options: ['1', '2'], correctOptions: [1], marks: 4, negativeMarks: 1 };
describe('scoreQuestion', () => {
  it('awards positive marks', () => expect(scoreQuestion(base, { type: 'mcq', optionIndex: 1 }).awarded).toBe(4));
  it('applies negative marks', () => expect(scoreQuestion(base, { type: 'mcq', optionIndex: 0 }).awarded).toBe(-1));
  it('does not penalize unanswered', () => expect(scoreQuestion(base, { type: 'unanswered' }).awarded).toBe(0));
  it('supports partial multiple-select marking', () => expect(scoreQuestion({ ...base, type: 'msq', correctOptions: [0, 1] }, { type: 'msq', optionIndices: [0] })).toMatchObject({ partial: true, awarded: 2 }));
  it('uses numerical tolerance', () => expect(scoreQuestion({ ...base, type: 'numerical', correctNumeric: 3.14, tolerance: 0.01 }, { type: 'numerical', value: 3.145 }).correct).toBe(true));
});
