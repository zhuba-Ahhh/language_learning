import { useEffect, useState, type ReactNode } from 'react';
import { TrainingContext } from '../trainingContext';
import {
  initialTrainingData,
  isTrainingData,
  reviewResult,
  saveResult,
  saveWord,
} from '../trainingState';
import type { TrainingData } from '../trainingTypes';

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TrainingData>(() => {
    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem('lingua.training.v1') ?? 'null',
      );
      return isTrainingData(stored) ? stored : initialTrainingData;
    } catch {
      return initialTrainingData;
    }
  });
  const [storageError, setStorageError] = useState('');
  const [now, setNow] = useState(Date.now);
  const [draftActive, setDraftActive] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('lingua.training.v1', JSON.stringify(data));
    } catch {
      // Error feedback is deferred to avoid a synchronous effect state update.
      const timer = window.setTimeout(
        () =>
          setStorageError(
            '学习记录保存失败，请先导出备份并检查浏览器存储空间。',
          ),
        0,
      );
      return () => clearTimeout(timer);
    }
  }, [data]);

  return (
    <TrainingContext.Provider
      value={{
        data,
        now,
        draftActive,
        setDraftActive,
        storageError,
        setLanguage: (language) =>
          setData((current) => ({ ...current, language })),
        setBudget: (dailyMinutes) =>
          setData((current) => ({ ...current, dailyMinutes })),
        setTarget: (lang, target) =>
          setData((current) => ({
            ...current,
            targets: { ...current.targets, [lang]: target },
          })),
        openLesson: (lesson) =>
          setData((current) => ({
            ...current,
            lastLesson: { ...current.lastLesson, [lesson.lang]: lesson.id },
          })),
        addWord: (lesson, word) => {
          const time = new Date();
          setNow(time.getTime());
          setData((current) =>
            saveWord(current, lesson, word, time.toISOString()),
          );
        },
        addResult: (result) => {
          const completed = {
            ...result,
            id: crypto.randomUUID(),
            completedAt: new Date().toISOString(),
          };
          setNow(Date.parse(completed.completedAt));
          setData((current) => saveResult(current, completed));
        },
        review: (id, remembered) => {
          const time = new Date();
          setNow(time.getTime());
          setData((current) => reviewResult(current, id, remembered, time));
        },
        restore: (value) => {
          if (!isTrainingData(value)) return false;
          setData(value);
          return true;
        },
        recordKana: (result) => {
          const completed = {
            ...result,
            id: crypto.randomUUID(),
            completedAt: new Date().toISOString(),
          };
          setData((current) => ({
            ...current,
            kanaResults: [completed, ...(current.kanaResults ?? [])],
          }));
        },
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
}
