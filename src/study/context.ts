/** 学习状态类型与共享 Context，不挂载组件。 */
import { createContext } from 'react';
import type { CourseDefinition, PlanDay } from '@/content/plan';
import type { Deck, Word } from '@/content/words';

export type CardMark = 'known' | 'unknown';

export interface CustomWord extends Word {
  lang: 'en' | 'ja';
}

export interface StudySession {
  id: string;
  goalId: string;
  courseId?: string;
  taskId: string;
  title: string;
  completedAt: string;
}

export interface StudyState {
  goalId: string;
  setGoal: (goalId: string) => void;
  setCourse: (courseId: string) => void;
  startDate: string;
  course: CourseDefinition;
  plan: PlanDay[];
  currentPlanDay: PlanDay;
  checks: Record<number, string[]>;
  toggleTask: (day: number, taskId: string, total: number) => void;
  completeTask: (day: number, taskId: string, total: number) => void;
  checkins: string[];
  streak: number;
  decks: Deck[];
  customWords: CustomWord[];
  addCustomWord: (
    word: Pick<CustomWord, 'lang' | 'term' | 'meaning' | 'reading'>,
  ) => boolean;
  removeCustomWord: (wordId: string) => void;
  marks: Record<string, CardMark>;
  markWord: (wordId: string, mark: CardMark) => void;
  resetDeckMarks: (deckId: string) => void;
  resetAll: () => void;
  knownCount: number;
  sessions: StudySession[];
  exportData: () => object;
  importData: (value: unknown) => boolean;
}

export const StudyContext = createContext<StudyState | null>(null);
