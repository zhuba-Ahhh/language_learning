import { englishLessons } from './en.ts';
import { japaneseLessons } from './ja.ts';
import type { Lesson, Track } from './types';

export type {
  Language,
  Lesson,
  Question,
  SpeakingTask,
  TextMark,
  TrainingWord,
  Track,
} from './types';

export const TRACK_LABELS: Record<Track, string> = {
  foundation: '基础',
  ielts: '雅思',
  jlpt: 'JLPT',
  life: '生活',
  tech: 'IT 工作',
};

export function validateLessons(lessons: Lesson[]) {
  const ids = new Set<string>();
  for (const lesson of lessons) {
    if (ids.has(lesson.id) || !lesson.id.startsWith(`${lesson.lang}-`))
      throw new Error(`单元 ID 不合法：${lesson.id}`);
    ids.add(lesson.id);
    if (
      !['en', 'ja'].includes(lesson.lang) ||
      !Object.hasOwn(TRACK_LABELS, lesson.track) ||
      !lesson.title ||
      !lesson.stage ||
      !lesson.pattern.form ||
      lesson.minutes <= 0
    )
      throw new Error(`单元元数据不完整：${lesson.id}`);
    if (
      !lesson.paragraphs.length ||
      !lesson.questions.length ||
      !lesson.speaking.length
    )
      throw new Error(`单元内容不完整：${lesson.id}`);
    for (const paragraph of lesson.paragraphs) {
      if (
        !paragraph.text ||
        !paragraph.translation ||
        (paragraph.ruby &&
          paragraph.ruby.replace(/\[[^\]]+\]/g, '') !== paragraph.text)
      )
        throw new Error(`正文或读音不匹配：${lesson.id}`);
    }
    for (const collection of [
      lesson.questions,
      lesson.speaking,
      lesson.words,
    ]) {
      if (new Set(collection.map((item) => item.id)).size !== collection.length)
        throw new Error(`单元内 ID 重复：${lesson.id}`);
    }
    const texts = [
      ...lesson.paragraphs.map((p) => p.text),
      ...lesson.speaking.map((t) => t.sample),
      lesson.pattern.example,
    ];
    for (const mark of lesson.marks ?? []) {
      if (
        !mark.text ||
        !mark.note ||
        !['phrase', 'pattern'].includes(mark.kind) ||
        !texts.some((text) =>
          text.toLowerCase().includes(mark.text.toLowerCase()),
        ) ||
        (mark.wordId && !lesson.words.some((word) => word.id === mark.wordId))
      )
        throw new Error(`划线标记不匹配：${lesson.id}/${mark.text}`);
    }
    for (const question of lesson.questions) {
      if (
        !lesson.paragraphs[question.evidence] ||
        !question.answer ||
        !question.explanation
      )
        throw new Error(`题目依据缺失：${lesson.id}/${question.id}`);
      if (
        question.kind === 'choice' &&
        !question.options?.includes(question.answer)
      )
        throw new Error(`题目答案不在选项中：${lesson.id}/${question.id}`);
      if (
        question.kind === 'truth' &&
        !['True', 'False', 'Not Given'].includes(question.answer)
      )
        throw new Error(`判断题答案不合法：${lesson.id}/${question.id}`);
    }
    if (
      lesson.speaking.some(
        (task) =>
          !task.prompt ||
          !task.sample ||
          !task.translation ||
          !task.hints.length ||
          task.seconds < 1,
      )
    )
      throw new Error(`口语任务不完整：${lesson.id}`);
  }
}

export const LESSONS: Lesson[] = [...englishLessons, ...japaneseLessons];
validateLessons(LESSONS);
