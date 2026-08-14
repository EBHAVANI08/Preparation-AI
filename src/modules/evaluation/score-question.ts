import type { AnswerValue, Question } from '@/lib/types';

export interface ScoredAnswer { correct: boolean; partial: boolean; awarded: number }

export function scoreQuestion(question: Question, answer?: AnswerValue): ScoredAnswer {
  if (!answer || answer.type === 'unanswered') return { correct: false, partial: false, awarded: 0 };
  if (answer.type === 'mcq' || answer.type === 'reading' || answer.type === 'listening') {
    const correct = question.correctOptions?.length === 1 && answer.optionIndex === question.correctOptions[0];
    return { correct: Boolean(correct), partial: false, awarded: correct ? question.marks : -question.negativeMarks };
  }
  if (answer.type === 'msq') {
    const expected = new Set(question.correctOptions || []);
    const received = new Set(answer.optionIndices);
    const correct = expected.size === received.size && [...expected].every((value) => received.has(value));
    if (correct) return { correct: true, partial: false, awarded: question.marks };
    const partial = answer.optionIndices.some((value) => expected.has(value));
    return { correct: false, partial, awarded: partial ? question.marks / 2 : -question.negativeMarks };
  }
  if (answer.type === 'numerical') {
    const correct = Math.abs(answer.value - (question.correctNumeric ?? 0)) <= (question.tolerance ?? 0.01);
    return { correct, partial: false, awarded: correct ? question.marks : -question.negativeMarks };
  }
  const text = answer.text.trim().toLowerCase();
  if (!text) return { correct: false, partial: false, awarded: 0 };
  const keys = question.answerKeys || [];
  const ratio = keys.length ? keys.filter((key) => text.includes(key.toLowerCase())).length / keys.length : Math.min(text.length / 200, 1);
  if (ratio >= 0.7) return { correct: true, partial: false, awarded: question.marks };
  if (ratio >= 0.4) return { correct: false, partial: true, awarded: question.marks * 0.5 };
  return { correct: false, partial: false, awarded: question.marks * 0.25 };
}
