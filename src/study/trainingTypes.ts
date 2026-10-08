import type { Language, Question, TrainingWord } from '@/content/training';

export interface PracticeResult {
  id: string;
  lessonId: string;
  lang: Language;
  skill: 'reading' | 'speaking';
  completedAt: string;
  durationMs: number;
  answers?: Record<string, string>;
  correct?: number;
  total?: number;
  taskId?: string;
  recordingId?: string;
  assessment?: 'again' | 'ready';
  selfChecks?: ('pause' | 'message' | 'pattern')[];
  contentVersion?: number;
  lessonTitle?: string;
  questionSnapshot?: Pick<Question, 'id' | 'prompt' | 'answer'>[];
}

export interface ReviewItem {
  id: string;
  lessonId?: string;
  lang?: Language;
  kind: 'word' | 'question' | 'speaking' | 'grammar' | 'listening';
  contentId: string;
  dueAt: string;
  intervalDays: number;
  lastReviewedAt?: string;
}

export interface DrillResult {
  id: string;
  lessonId: string;
  lang: Language;
  kind: 'grammar' | 'listening';
  answers: Record<string, string>;
  questionSnapshot: Pick<Question, 'id' | 'prompt' | 'answer'>[];
  correct: number;
  total: number;
  durationMs: number;
  completedAt: string;
  assisted: boolean;
  contentVersion: number;
}

export type DrillInput = Omit<
  DrillResult,
  | 'id'
  | 'completedAt'
  | 'correct'
  | 'total'
  | 'questionSnapshot'
  | 'contentVersion'
>;

export interface SavedWord extends TrainingWord {
  key: string;
  lessonId?: string;
  lang: Language;
  origin?: string;
}

export interface TrainingData {
  version: 1;
  language: Language;
  dailyMinutes: number;
  targets: { en: string; ja: string };
  results: PracticeResult[];
  savedWords: SavedWord[];
  reviews: ReviewItem[];
  lastLesson: Partial<Record<Language, string>>;
  drillResults?: DrillResult[];
  kanaResults?: {
    id: string;
    group: string;
    script: 0 | 1;
    correct: number;
    total: number;
    completedAt: string;
  }[];
}
