import {
  LESSONS,
  type Lesson,
  type TrainingWord,
} from '../content/training/index.ts';
import type { PracticeResult, ReviewItem, TrainingData } from './trainingTypes';
import type { DrillInput } from './trainingTypes';
import { GRAMMAR } from '../content/training/grammar.ts';

export const initialTrainingData: TrainingData = {
  version: 1,
  language: 'en',
  dailyMinutes: 30,
  targets: { en: 'IELTS 6.5', ja: '入门 → N5 → N3/N2' },
  results: [],
  savedWords: [],
  reviews: [],
  lastLesson: {},
};

export { normalizeAnswer, scoreReading } from './trainingScoring.ts';
import { normalizeAnswer, scoreQuestions } from './trainingScoring.ts';

function addReview(
  data: TrainingData,
  lessonId: string,
  kind: ReviewItem['kind'],
  contentId: string,
  now: string,
) {
  const id = `${kind}:${lessonId}:${contentId}`;
  if (data.reviews.some((item) => item.id === id)) return data;
  return {
    ...data,
    reviews: [
      ...data.reviews,
      { id, lessonId, kind, contentId, dueAt: now, intervalDays: 0 },
    ],
  };
}

export function saveWord(
  data: TrainingData,
  lesson: Lesson,
  word: TrainingWord,
  now: string,
): TrainingData {
  const key = `${lesson.lang}:${word.term}`;
  if (data.savedWords.some((item) => item.key === key)) return data;
  const next = {
    ...data,
    savedWords: [
      ...data.savedWords,
      { ...word, key, lessonId: lesson.id, lang: lesson.lang },
    ],
  };
  return addReview(next, lesson.id, 'word', word.id, now);
}

export function saveResult(
  data: TrainingData,
  result: PracticeResult,
): TrainingData {
  const lesson = LESSONS.find((item) => item.id === result.lessonId);
  const saved = {
    ...result,
    contentVersion: result.contentVersion ?? lesson?.version,
    lessonTitle: result.lessonTitle ?? lesson?.title,
    questionSnapshot:
      result.questionSnapshot ??
      (result.skill === 'reading'
        ? lesson?.questions.map(({ id, prompt, answer }) => ({
            id,
            prompt,
            answer,
          }))
        : undefined),
  };
  let next = {
    ...data,
    results: [saved, ...data.results],
    lastLesson: { ...data.lastLesson, [result.lang]: result.lessonId },
  };
  if (!lesson) return next;
  if (result.skill === 'reading') {
    for (const question of lesson.questions) {
      if (
        normalizeAnswer(result.answers?.[question.id] ?? '') !==
        normalizeAnswer(question.answer)
      ) {
        next = addReview(
          next,
          lesson.id,
          'question',
          question.id,
          result.completedAt,
        );
      }
    }
  } else if (result.assessment === 'again' && result.taskId) {
    next = addReview(
      next,
      lesson.id,
      'speaking',
      result.taskId,
      result.completedAt,
    );
  }
  return next;
}

export function reviewResult(
  data: TrainingData,
  id: string,
  remembered: boolean,
  now: Date,
): TrainingData {
  return {
    ...data,
    reviews: data.reviews.map((item) => {
      if (item.id !== id) return item;
      const intervalDays = remembered
        ? Math.min(item.intervalDays ? item.intervalDays * 2 : 1, 30)
        : 0;
      const dueAt = new Date(
        now.getTime() + (remembered ? intervalDays * 86400000 : 10 * 60000),
      ).toISOString();
      return {
        ...item,
        intervalDays,
        dueAt,
        lastReviewedAt: now.toISOString(),
      };
    }),
  };
}

export function lessonCompleted(data: TrainingData, lesson: Lesson) {
  return (
    data.results.some(
      (result) => result.lessonId === lesson.id && result.skill === 'reading',
    ) &&
    lesson.speaking.every(
      (task) =>
        task.optional ||
        data.results.some(
          (result) =>
            result.lessonId === lesson.id &&
            result.skill === 'speaking' &&
            result.taskId === task.id,
        ),
    )
  );
}

export function nextLesson(data: TrainingData) {
  const lessons = lessonsForTarget(data);
  return (
    lessons.find((lesson) => !lessonCompleted(data, lesson)) ??
    lessons.find((lesson) => !lessonMastered(data, lesson)) ??
    lessons[0]
  );
}

export function lessonsForTarget(data: TrainingData) {
  const target = data.targets[data.language];
  const tracks = target.includes('IELTS')
    ? ['foundation', 'ielts']
    : target.includes('技术') || target.includes('IT')
      ? ['foundation', 'tech']
      : target.includes('生活')
        ? ['foundation', 'life']
        : target === '基础交流'
          ? ['foundation']
          : undefined;
  return LESSONS.filter(
    (lesson) =>
      lesson.lang === data.language &&
      (!tracks || tracks.includes(lesson.track)),
  );
}

export function lessonMastered(data: TrainingData, lesson: Lesson) {
  const results = data.results
    .filter((result) => result.lessonId === lesson.id)
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
  const reading = results.find((result) => result.skill === 'reading');
  return (
    !!reading &&
    reading.contentVersion === lesson.version &&
    reading.total === lesson.questions.length &&
    (reading.correct ?? 0) / reading.total >= 0.8 &&
    lesson.speaking.every(
      (task) =>
        task.optional ||
        results.find(
          (result) => result.skill === 'speaking' && result.taskId === task.id,
        )?.assessment === 'ready',
    )
  );
}

export function saveDrillResult(
  data: TrainingData,
  input: DrillInput & { id: string; completedAt: string },
): TrainingData {
  const lesson = LESSONS.find((item) => item.id === input.lessonId)!;
  const questions =
    input.kind === 'grammar'
      ? GRAMMAR[lesson.id].questions
      : [
          {
            id: 'sentence',
            prompt: '句型听写',
            answer: lesson.pattern.example,
          },
        ];
  const correct = scoreQuestions(questions, input.answers);
  let next: TrainingData = {
    ...data,
    drillResults: [
      {
        ...input,
        correct,
        total: questions.length,
        contentVersion: lesson.version,
        questionSnapshot: questions.map(({ id, prompt, answer }) => ({
          id,
          prompt,
          answer,
        })),
      },
      ...(data.drillResults ?? []),
    ],
  };
  for (const question of questions) {
    if (
      normalizeAnswer(input.answers[question.id] ?? '') !==
        normalizeAnswer(question.answer) ||
      input.assisted
    )
      next = addReview(
        next,
        lesson.id,
        input.kind,
        question.id,
        input.completedAt,
      );
  }
  return next;
}

export { isTrainingData } from './trainingValidation.ts';
