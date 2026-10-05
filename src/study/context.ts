/** 学习状态类型与共享 Context，不挂载组件。 */
import { createContext } from 'react';

export type CardMark = 'known' | 'unknown';

export interface StudyState {
  startDate: string;
  dayIndex: number; // 1..30
  checks: Record<number, number[]>;
  toggleTask: (day: number, taskIdx: number, total: number) => void;
  checkins: string[];
  streak: number;
  marks: Record<string, CardMark>;
  markWord: (wordId: string, mark: CardMark) => void;
  resetDeckMarks: (deckId: string) => void;
  resetAll: () => void;
  knownCount: number;
}

export const StudyContext = createContext<StudyState | null>(null);
