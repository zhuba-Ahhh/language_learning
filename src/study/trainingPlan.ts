import {
  lessonsForTarget,
  nextLesson,
  reviewLanguage,
} from './trainingState.ts';
import type { TrainingData } from './trainingTypes';

const day = (value: string | number) =>
  new Date(value).toLocaleDateString('en-CA');

export function todayPlan(data: TrainingData, now: number) {
  const today = day(now);
  const lessons = lessonsForTarget(data);
  const attempts = [...data.results, ...(data.drillResults ?? [])]
    .filter(
      (item) =>
        item.lang === data.language &&
        day(item.completedAt) === today &&
        lessons.some((lesson) => lesson.id === item.lessonId),
    )
    .sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt));
  // ponytail: 今日单元由最早练习锁定；出现多单元计划需求时再保存独立日计划。
  const lesson =
    lessons.find((item) => item.id === attempts[0]?.lessonId) ??
    nextLesson(data);
  const reading = data.results.some(
    (result) =>
      result.lessonId === lesson.id &&
      result.skill === 'reading' &&
      day(result.completedAt) === today,
  );
  const speaking =
    lesson.speaking.find(
      (task) =>
        !task.optional &&
        !data.results.some(
          (result) =>
            result.lessonId === lesson.id && result.taskId === task.id,
        ),
    ) ?? lesson.speaking[0];
  const reviews = data.reviews.filter(
    (item) => reviewLanguage(item) === data.language,
  );
  const due = reviews.filter((item) => Date.parse(item.dueAt) <= now).length;
  const reviewed = reviews.filter(
    (item) => item.lastReviewedAt && day(item.lastReviewedAt) === today,
  ).length;
  const kana = data.kanaResults ?? [];
  const needsKana =
    data.language === 'ja' &&
    !kana.some(
      (result) =>
        result.group === '清音' &&
        result.script === 0 &&
        result.correct / result.total >= 0.8,
    );
  const candidates: {
    kind: 'review' | 'kana' | 'reading' | 'speaking' | 'grammar' | 'listening';
    title: string;
    minutes: number;
    done: boolean;
  }[] = [];
  if (due || reviewed)
    candidates.push({
      kind: 'review',
      title: '到期复习',
      minutes: 3,
      done: reviewed >= Math.min(10, due + reviewed),
    });
  if (
    needsKana ||
    (data.language === 'ja' &&
      kana.some((result) => day(result.completedAt) === today))
  )
    candidates.push({
      kind: 'kana',
      title: '假名基础',
      minutes: 3,
      done: kana.some((result) => day(result.completedAt) === today),
    });
  candidates.push(
    { kind: 'reading', title: '阅读理解', minutes: 7, done: reading },
    {
      kind: 'speaking',
      title: '开口练习',
      minutes: 3,
      done: data.results.some(
        (result) =>
          result.lessonId === lesson.id &&
          result.skill === 'speaking' &&
          day(result.completedAt) === today,
      ),
    },
    {
      kind: 'grammar',
      title: '句型拆解',
      minutes: 4,
      done: (data.drillResults ?? []).some(
        (result) =>
          result.lessonId === lesson.id &&
          result.kind === 'grammar' &&
          day(result.completedAt) === today,
      ),
    },
    {
      kind: 'listening',
      title: '短句精听',
      minutes: 5,
      done: (data.drillResults ?? []).some(
        (result) =>
          result.lessonId === lesson.id &&
          result.kind === 'listening' &&
          day(result.completedAt) === today,
      ),
    },
  );
  let minutes = 0;
  const tasks = candidates.filter((task) => {
    if (minutes + task.minutes > data.dailyMinutes) return false;
    minutes += task.minutes;
    return true;
  });
  return { lesson, speaking, tasks, minutes };
}
