import type { Lesson, Question } from '../content/training/types';

export function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[.。!?！？]+$/, '')
    .replace(/\s+/g, ' ');
}

export function scoreReading(lesson: Lesson, answers: Record<string, string>) {
  return scoreQuestions(lesson.questions, answers);
}

export function scoreQuestions(
  questions: Pick<Question, 'id' | 'answer'>[],
  answers: Record<string, string>,
) {
  return questions.filter(
    (q) => normalizeAnswer(answers[q.id] ?? '') === normalizeAnswer(q.answer),
  ).length;
}
