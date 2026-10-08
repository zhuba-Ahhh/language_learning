import { LESSONS } from '../content/training/index.ts';
import type { TrainingData } from './trainingTypes';
import { scoreQuestions } from './trainingScoring.ts';
import { GRAMMAR } from '../content/training/grammar.ts';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;
const date = (value: unknown) =>
  text(value) && Number.isFinite(Date.parse(value));

export function isTrainingData(value: unknown): value is TrainingData {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !['en', 'ja'].includes(String(value.language)) ||
    typeof value.dailyMinutes !== 'number' ||
    ![15, 30, 45].includes(value.dailyMinutes)
  )
    return false;
  if (
    !isRecord(value.targets) ||
    !text(value.targets.en) ||
    !text(value.targets.ja) ||
    !isRecord(value.lastLesson)
  )
    return false;
  if (
    !Array.isArray(value.results) ||
    !Array.isArray(value.savedWords) ||
    !Array.isArray(value.reviews)
  )
    return false;
  const validLesson = (id: unknown) =>
    LESSONS.find((lesson) => lesson.id === id);
  if (
    !Object.entries(value.lastLesson).every(
      ([lang, id]) =>
        ['en', 'ja'].includes(lang) && validLesson(id)?.lang === lang,
    )
  )
    return false;
  const ids = new Set<string>();
  for (const result of value.results) {
    if (!isRecord(result) || !text(result.id) || ids.has(result.id))
      return false;
    ids.add(result.id);
    const lesson = validLesson(result.lessonId);
    if (
      !lesson ||
      lesson.lang !== result.lang ||
      !['reading', 'speaking'].includes(String(result.skill)) ||
      !date(result.completedAt) ||
      typeof result.durationMs !== 'number' ||
      !Number.isFinite(result.durationMs) ||
      result.durationMs < 0
    )
      return false;
    if (result.skill === 'reading') {
      const questions = result.questionSnapshot ?? lesson.questions;
      if (
        !Array.isArray(questions) ||
        !questions.length ||
        !questions.every(
          (question) =>
            isRecord(question) &&
            text(question.id) &&
            text(question.prompt) &&
            text(question.answer),
        )
      )
        return false;
      if (
        !isRecord(result.answers) ||
        !Object.values(result.answers).every(
          (item) => typeof item === 'string',
        ) ||
        result.total !== questions.length ||
        result.correct !==
          scoreQuestions(questions, result.answers as Record<string, string>)
      )
        return false;
    } else if (
      !lesson.speaking.some((task) => task.id === result.taskId) ||
      !text(result.recordingId) ||
      !['again', 'ready'].includes(String(result.assessment))
    )
      return false;
    if (
      result.contentVersion !== undefined &&
      (typeof result.contentVersion !== 'number' ||
        !Number.isInteger(result.contentVersion) ||
        result.contentVersion < 1)
    )
      return false;
    if (result.lessonTitle !== undefined && !text(result.lessonTitle))
      return false;
    if (
      result.selfChecks !== undefined &&
      (!Array.isArray(result.selfChecks) ||
        !result.selfChecks.every((item) =>
          ['pause', 'message', 'pattern'].includes(String(item)),
        ) ||
        new Set(result.selfChecks).size !== result.selfChecks.length)
    )
      return false;
  }
  if (value.drillResults !== undefined) {
    if (!Array.isArray(value.drillResults)) return false;
    for (const result of value.drillResults) {
      if (!isRecord(result) || !text(result.id) || ids.has(result.id))
        return false;
      ids.add(result.id);
      const lesson = validLesson(result.lessonId);
      if (
        !lesson ||
        lesson.lang !== result.lang ||
        !['grammar', 'listening'].includes(String(result.kind)) ||
        !date(result.completedAt) ||
        typeof result.assisted !== 'boolean' ||
        typeof result.durationMs !== 'number' ||
        !Number.isFinite(result.durationMs) ||
        result.durationMs < 0 ||
        typeof result.contentVersion !== 'number' ||
        !Number.isInteger(result.contentVersion) ||
        result.contentVersion < 1 ||
        !isRecord(result.answers) ||
        !Object.values(result.answers).every(
          (answer) => typeof answer === 'string',
        )
      )
        return false;
      const questions = result.questionSnapshot;
      const allowed =
        result.kind === 'grammar'
          ? GRAMMAR[lesson.id].questions
          : [{ id: 'sentence' }];
      if (
        !Array.isArray(questions) ||
        !questions.length ||
        new Set(questions.map((q) => isRecord(q) && q.id)).size !==
          questions.length ||
        !questions.every(
          (q) =>
            isRecord(q) &&
            text(q.id) &&
            text(q.prompt) &&
            text(q.answer) &&
            allowed.some((item) => item.id === q.id),
        ) ||
        result.total !== questions.length ||
        result.correct !==
          scoreQuestions(questions, result.answers as Record<string, string>)
      )
        return false;
    }
  }
  for (const word of value.savedWords) {
    if (
      !isRecord(word) ||
      !text(word.key) ||
      !text(word.term) ||
      !text(word.meaning) ||
      !text(word.id) ||
      validLesson(word.lessonId)?.lang !== word.lang ||
      (word.reading !== undefined && !text(word.reading))
    )
      return false;
  }
  for (const item of value.reviews) {
    if (
      !isRecord(item) ||
      !text(item.id) ||
      !text(item.contentId) ||
      !date(item.dueAt) ||
      typeof item.intervalDays !== 'number' ||
      !Number.isInteger(item.intervalDays) ||
      item.intervalDays < 0 ||
      item.intervalDays > 30
    )
      return false;
    const lesson = validLesson(item.lessonId);
    if (
      !lesson ||
      !['word', 'question', 'speaking', 'grammar', 'listening'].includes(
        String(item.kind),
      ) ||
      (item.lastReviewedAt !== undefined && !date(item.lastReviewedAt))
    )
      return false;
    const contents =
      item.kind === 'word'
        ? lesson.words
        : item.kind === 'question'
          ? lesson.questions
          : item.kind === 'speaking'
            ? lesson.speaking
            : item.kind === 'grammar'
              ? GRAMMAR[lesson.id].questions
              : [{ id: 'sentence' }];
    if (!contents.some((content) => content.id === item.contentId))
      return false;
  }
  if (value.kanaResults !== undefined) {
    if (
      !Array.isArray(value.kanaResults) ||
      !value.kanaResults.every(
        (result) =>
          isRecord(result) &&
          text(result.id) &&
          text(result.group) &&
          (result.script === 0 || result.script === 1) &&
          typeof result.correct === 'number' &&
          Number.isInteger(result.correct) &&
          result.correct >= 0 &&
          result.correct <= 5 &&
          result.total === 5 &&
          date(result.completedAt),
      )
    )
      return false;
  }
  return true;
}
