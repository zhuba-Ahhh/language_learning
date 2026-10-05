/** 共享任务、打卡与词汇状态，保持既有存储键和写入语义。 */
import { useEffect, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PLAN } from '@/content/plan';
import { DECKS } from '@/content/words';
import { todayStr } from '@/lib/date';
import { StudyContext, type CardMark, type StudyState } from '../context';

export function StudyProvider({ children }: { children: ReactNode }) {
  const [startDate, setStartDate] = useLocalStorage<string>('lingua.start', '');
  const [checks, setChecks] = useLocalStorage<Record<number, number[]>>(
    'lingua.checks',
    {},
  );
  const [checkins, setCheckins] = useLocalStorage<string[]>(
    'lingua.checkins',
    [],
  );
  const [marks, setMarks] = useLocalStorage<Record<string, CardMark>>(
    'lingua.marks',
    {},
  );

  useEffect(() => {
    if (!startDate) setStartDate(todayStr());
  }, [startDate, setStartDate]);

  const effectiveStart = startDate || todayStr();

  const dayIndex = useMemo(() => {
    const ms =
      new Date(todayStr()).getTime() - new Date(effectiveStart).getTime();
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
    [marks],
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

  return (
    <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
  );
}
