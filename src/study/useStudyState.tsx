/** 共享任务、打卡与词汇状态，保持既有本地存储格式。 */
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PLAN } from '@/content/plan';
import { DECKS } from '@/content/words';

/** 使用本地日期生成打卡键，支持相对天数。 */
export function todayStr(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export type CardMark = 'known' | 'unknown';

interface StudyState {
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

const Ctx = createContext<StudyState | null>(null);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [startDate, setStartDate] = useLocalStorage<string>('lingua.start', '');
  const [checks, setChecks] = useLocalStorage<Record<number, number[]>>('lingua.checks', {});
  const [checkins, setCheckins] = useLocalStorage<string[]>('lingua.checkins', []);
  const [marks, setMarks] = useLocalStorage<Record<string, CardMark>>('lingua.marks', {});

  useEffect(() => {
    if (!startDate) setStartDate(todayStr());
  }, [startDate, setStartDate]);

  const effectiveStart = startDate || todayStr();

  const dayIndex = useMemo(() => {
    const ms = new Date(todayStr()).getTime() - new Date(effectiveStart).getTime();
    const diff = Math.floor(ms / 86400000) + 1;
    return Math.min(Math.max(diff, 1), PLAN.length);
  }, [effectiveStart]);

  const streak = useMemo(() => {
    const set = new Set(checkins);
    let n = 0;
    // allow today not-yet-done without breaking the streak
    let cursor = set.has(todayStr()) ? 0 : -1;
    while (set.has(todayStr(cursor))) {
      n++;
      cursor--;
    }
    return n;
  }, [checkins]);

  const toggleTask = (day: number, taskIdx: number, total: number) => {
    setChecks((prev) => {
      const cur = new Set(prev[day] ?? []);
      if (cur.has(taskIdx)) cur.delete(taskIdx);
      else cur.add(taskIdx);
      const next = { ...prev, [day]: [...cur].sort((a, b) => a - b) };
      // auto check-in when a day is fully completed
      if (cur.size === total && total > 0) {
        const today = todayStr();
        setCheckins((ci) => (ci.includes(today) ? ci : [...ci, today]));
      }
      return next;
    });
  };

  const markWord = (wordId: string, mark: CardMark) =>
    setMarks((prev) => ({ ...prev, [wordId]: mark }));

  const resetDeckMarks = (deckId: string) =>
    setMarks((prev) => {
      const deck = DECKS.find((d) => d.id === deckId);
      if (!deck) return prev;
      const next = { ...prev };
      deck.words.forEach((w) => delete next[w.id]);
      return next;
    });

  const resetAll = () => {
    setChecks({});
    setCheckins([]);
    setMarks({});
    setStartDate(todayStr());
  };

  const knownCount = useMemo(
    () => Object.values(marks).filter((m) => m === 'known').length,
    [marks]
  );

  const value: StudyState = {
    startDate: effectiveStart,
    dayIndex,
    checks,
    toggleTask,
    checkins,
    streak,
    marks,
    markWord,
    resetDeckMarks,
    resetAll,
    knownCount,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudy() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStudy must be used within StudyProvider');
  return ctx;
}
