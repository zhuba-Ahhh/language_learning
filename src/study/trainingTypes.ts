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
  contentVersion?: number;
  lessonTitle?: string;
  questionSnapshot?: Pick<Question, 'id' | 'prompt' | 'answer'>[];
}

export interface ReviewItem {
  id: string;
  lessonId: string;
  kind: 'word' | 'question' | 'speaking';
  contentId: string;
  dueAt: string;
  intervalDays: number;
}

export interface SavedWord extends TrainingWord {
  key: string;
  lessonId: string;
  lang: Language;
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
  kanaResults?: {
    id: string;
    group: string;
    script: 0 | 1;
    correct: number;
    total: number;
    completedAt: string;
  }[];
}
