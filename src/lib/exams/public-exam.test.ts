import { describe, expect, it } from 'vitest';
import { toPublicExam } from './public-exam';
import type { GeneratedExam } from '@/lib/types';

describe('toPublicExam', () => {
  it('never exposes grading secrets', () => {
    const exam: GeneratedExam = {
      id: 'attempt', examId: 'jee-main', examName: 'JEE Main', durationSec: 60,
      totalMarks: 4, startedAt: new Date(0).toISOString(), sections: [],
      questions: [{ id: 'q1', type: 'mcq', subject: 'Physics', topic: 'Motion', difficulty: 'easy', text: 'Question', options: ['A', 'B'], correctOptions: [1], correctNumeric: 2, tolerance: 0.1, answerKeys: ['secret'], marks: 4, negativeMarks: 1 }],
    };
    const output = toPublicExam(exam);
    expect(output.questions[0]).not.toHaveProperty('correctOptions');
    expect(output.questions[0]).not.toHaveProperty('correctNumeric');
    expect(output.questions[0]).not.toHaveProperty('tolerance');
    expect(output.questions[0]).not.toHaveProperty('answerKeys');
  });
});
