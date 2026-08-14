import type { GeneratedExam } from '@/lib/types';

/** Removes every grading secret before an exam crosses the server boundary. */
export function toPublicExam(exam: GeneratedExam): GeneratedExam {
  return {
    ...exam,
    questions: exam.questions.map(({ correctOptions: _a, correctNumeric: _b, tolerance: _c, answerKeys: _d, ...question }) => question),
  };
}
