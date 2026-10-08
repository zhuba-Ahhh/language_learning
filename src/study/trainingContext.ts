import { createContext, useContext } from 'react';
import type { Language, Lesson, TrainingWord } from '@/content/training';
import type { DrillInput, PracticeResult, TrainingData } from './trainingTypes';
import type { VocabularyWord } from '@/content/vocabularyIndex';

export interface TrainingState {
  data: TrainingData;
  now: number;
  draftActive: boolean;
  setDraftActive: (active: boolean) => void;
  setLanguage: (lang: Language) => void;
  setBudget: (minutes: number) => void;
  setTarget: (lang: Language, target: string) => void;
  openLesson: (lesson: Lesson) => void;
  addWord: (lesson: Lesson, word: TrainingWord) => void;
  addVocabularyWord: (word: VocabularyWord) => void;
  addResult: (result: Omit<PracticeResult, 'id' | 'completedAt'>) => void;
  addDrillResult: (result: DrillInput) => void;
  review: (id: string, remembered: boolean) => void;
  recordKana: (result: {
    group: string;
    script: 0 | 1;
    correct: number;
    total: number;
  }) => void;
  restore: (value: unknown) => boolean;
  storageError: string;
}

export const TrainingContext = createContext<TrainingState | null>(null);

export function useTraining() {
  const context = useContext(TrainingContext);
  if (!context) throw new Error('训练状态尚未挂载');
  return context;
}
