/** 共享任务、打卡与词汇状态，保持既有存储键和写入语义。 */
import { useEffect, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getPlanForLanguage, PLAN } from '@/content/plan';
import { LEARNING_GOALS } from '@/content/goals';
import { DECKS, type Deck } from '@/content/words';
import { todayStr } from '@/lib/date';
import {
  StudyContext,
  type CardMark,
  type CustomWord,
  type StudySession,
  type StudyState,
} from '../context';

function normalizeTaskIds(day: number, values: (string | number)[]) {
  const tasks = PLAN.find((item) => item.day === day)?.tasks ?? [];
  return values.flatMap((value) => {
    if (typeof value === 'string') return [value];
    const task = tasks[value];
    return task ? [task.id] : [];
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function StudyProvider({ children }: { children: ReactNode }) {
  const [legacyStartDate, setLegacyStartDate] = useLocalStorage<string>(
    'lingua.start',
    '',
  );
  const [storedGoalId, setStoredGoalId] = useLocalStorage(
    'lingua.goal',
    'english-communication',
  );
  const [goalStarts, setGoalStarts] = useLocalStorage<Record<string, string>>(
    'lingua.goalStarts',
    {},
  );
  const [storedChecks, setChecks] = useLocalStorage<
    Record<string, (string | number)[]>
  >('lingua.checks', {});
  const [legacyCheckins, setLegacyCheckins] = useLocalStorage<string[]>(
    'lingua.checkins',
    [],
  );
  const [checkinsByGoal, setCheckinsByGoal] = useLocalStorage<
    Record<string, string[]>
  >('lingua.goalCheckins', {});
  const [marks, setMarks] = useLocalStorage<Record<string, CardMark>>(
    'lingua.marks',
    {},
  );
  const [customWords, setCustomWords] = useLocalStorage<CustomWord[]>(
    'lingua.customWords',
    [],
  );
  const [sessions, setSessions] = useLocalStorage<StudySession[]>(
    'lingua.sessions',
    [],
  );

  const decks = useMemo<Deck[]>(() => {
    const customDecks = (['en', 'ja'] as const).flatMap((lang) => {
      const words = customWords
        .filter((word) => word.lang === lang)
        .map((word) => ({
          id: word.id,
          term: word.term,
          reading: word.reading,
          audioUrl: word.audioUrl,
          meaning: word.meaning,
          example: word.example,
          exampleZh: word.exampleZh,
        }));
      return words.length
        ? [
            {
              id: `custom-${lang}`,
              lang,
              title: '我的词',
              subtitle: 'Custom',
              words,
            },
          ]
        : [];
    });
    return [...DECKS, ...customDecks];
  }, [customWords]);

  const availableGoals = LEARNING_GOALS.filter((goal) => goal.available);
  const activeGoal =
    availableGoals.find((goal) => goal.id === storedGoalId) ??
    availableGoals[0];
  const goalId = activeGoal.id;
  const plan = useMemo(
    () => getPlanForLanguage(activeGoal.language),
    [activeGoal.language],
  );

  useEffect(() => {
    if (storedGoalId !== goalId) setStoredGoalId(goalId);
  }, [goalId, setStoredGoalId, storedGoalId]);

  useEffect(() => {
    if (goalStarts[goalId]) return;
    const start = legacyStartDate || todayStr();
    setGoalStarts((current) => ({ ...current, [goalId]: start }));
    if (!legacyStartDate) setLegacyStartDate(start);
  }, [goalId, goalStarts, legacyStartDate, setGoalStarts, setLegacyStartDate]);

  useEffect(() => {
    const legacyEntries = Object.entries(storedChecks).filter(
      ([key]) => !key.includes(':'),
    );
    if (legacyEntries.length === 0) return;
    setChecks((current) => {
      const next = { ...current };
      legacyEntries.forEach(([day, values]) => {
        delete next[day];
        next[`${goalId}:${day}`] = values;
      });
      return next;
    });
  }, [goalId, setChecks, storedChecks]);

  useEffect(() => {
    if (checkinsByGoal[goalId]) return;
    setCheckinsByGoal((current) => ({
      ...current,
      [goalId]: legacyCheckins,
    }));
  }, [checkinsByGoal, goalId, legacyCheckins, setCheckinsByGoal]);

  const effectiveStart = goalStarts[goalId] || legacyStartDate || todayStr();

  const checks = useMemo<Record<number, string[]>>(
    () =>
      Object.fromEntries(
        Object.entries(storedChecks).flatMap(([storageKey, values]) => {
          const [storedGoalId, dayKey] = storageKey.includes(':')
            ? storageKey.split(':')
            : [goalId, storageKey];
          if (storedGoalId !== goalId) return [];
          const day = Number(dayKey);
          return [[day, normalizeTaskIds(day, values)]];
        }),
      ),
    [goalId, storedChecks],
  );

  const checkins = checkinsByGoal[goalId] ?? legacyCheckins;

  const planIndex = useMemo(() => {
    const ms =
      new Date(todayStr()).getTime() - new Date(effectiveStart).getTime();
    const diff = Math.floor(ms / 86400000) + 1;
    return Math.min(Math.max(diff, 1), plan.length) - 1;
  }, [effectiveStart, plan.length]);
  const currentPlanDay = plan[planIndex];

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

  const updateTask = (
    day: number,
    taskId: string,
    total: number,
    forceComplete: boolean,
  ) => {
    setChecks((prev) => {
      const storageKey = `${goalId}:${day}`;
      const cur = new Set(normalizeTaskIds(day, prev[storageKey] ?? []));
      if (forceComplete) cur.add(taskId);
      else if (cur.has(taskId)) cur.delete(taskId);
      else cur.add(taskId);
      const next = { ...prev, [storageKey]: [...cur] };
      // auto check-in when a day is fully completed
      if (cur.size === total && total > 0) {
        const today = todayStr();
        setCheckinsByGoal((current) => {
          const goalCheckins = current[goalId] ?? [];
          if (goalCheckins.includes(today)) return current;
          return { ...current, [goalId]: [...goalCheckins, today] };
        });
      }
      return next;
    });
  };

  const toggleTask = (day: number, taskId: string, total: number) =>
    updateTask(day, taskId, total, false);

  const completeTask = (day: number, taskId: string, total: number) => {
    updateTask(day, taskId, total, true);
    const task = PLAN.find((item) => item.day === day)?.tasks.find(
      (item) => item.id === taskId,
    );
    if (!task) return;
    setSessions((current) => {
      if (
        current.some(
          (session) => session.goalId === goalId && session.taskId === taskId,
        )
      ) {
        return current;
      }
      return [
        {
          id: `${goalId}-${taskId}-${Date.now()}`,
          goalId,
          taskId,
          title: task.text,
          completedAt: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 100);
    });
  };

  const setGoal = (nextGoalId: string) => {
    const nextGoal = availableGoals.find((goal) => goal.id === nextGoalId);
    if (!nextGoal) return;
    setStoredGoalId(nextGoal.id);
    setGoalStarts((current) =>
      current[nextGoal.id]
        ? current
        : { ...current, [nextGoal.id]: todayStr() },
    );
  };

  const markWord = (wordId: string, mark: CardMark) =>
    setMarks((prev) => ({ ...prev, [wordId]: mark }));

  const addCustomWord: StudyState['addCustomWord'] = (word) => {
    const term = word.term.trim();
    const meaning = word.meaning.trim();
    const reading = word.reading?.trim();
    if (!term || !meaning) return false;
    if (
      customWords.some(
        (item) =>
          item.lang === word.lang &&
          item.term.toLocaleLowerCase() === term.toLocaleLowerCase(),
      )
    ) {
      return false;
    }
    setCustomWords((current) => [
      ...current,
      {
        id: `custom-${word.lang}-${Date.now()}`,
        lang: word.lang,
        term,
        reading: reading || undefined,
        meaning,
        example: '',
        exampleZh: '',
      },
    ]);
    return true;
  };

  const removeCustomWord = (wordId: string) => {
    setCustomWords((current) => current.filter((word) => word.id !== wordId));
    setMarks((current) => {
      const next = { ...current };
      delete next[wordId];
      return next;
    });
  };

  const resetDeckMarks = (deckId: string) =>
    setMarks((prev) => {
      const deck = decks.find((d) => d.id === deckId);
      if (!deck) return prev;
      const next = { ...prev };
      deck.words.forEach((w) => delete next[w.id]);
      return next;
    });

  const resetAll = () => {
    setChecks({});
    setLegacyCheckins([]);
    setCheckinsByGoal({ [goalId]: [] });
    setMarks({});
    setSessions([]);
    setLegacyStartDate(todayStr());
    setGoalStarts({ [goalId]: todayStr() });
  };

  const exportData = () => ({
    version: 1,
    exportedAt: new Date().toISOString(),
    goalId,
    goalStarts,
    checks: storedChecks,
    checkinsByGoal,
    marks,
    customWords,
    sessions,
  });

  const importData = (value: unknown) => {
    if (!isRecord(value) || value.version !== 1) return false;
    const nextGoalId = value.goalId;
    if (
      typeof nextGoalId !== 'string' ||
      !availableGoals.some((goal) => goal.id === nextGoalId) ||
      !isRecord(value.goalStarts) ||
      !isRecord(value.checks) ||
      !isRecord(value.marks) ||
      !isRecord(value.checkinsByGoal) ||
      !Array.isArray(value.customWords) ||
      !Array.isArray(value.sessions)
    ) {
      return false;
    }

    const nextStarts: Record<string, string> = {};
    for (const [key, item] of Object.entries(value.goalStarts)) {
      if (typeof item !== 'string') return false;
      nextStarts[key] = item;
    }

    const nextChecks: Record<string, (string | number)[]> = {};
    for (const [key, items] of Object.entries(value.checks)) {
      const day = Number(key.includes(':') ? key.split(':').at(-1) : key);
      if (
        !Number.isInteger(day) ||
        day < 1 ||
        !Array.isArray(items) ||
        !items.every(
          (item) => typeof item === 'string' || typeof item === 'number',
        )
      ) {
        return false;
      }
      nextChecks[key] = items;
    }

    const nextMarks: Record<string, CardMark> = {};
    for (const [key, mark] of Object.entries(value.marks)) {
      if (mark !== 'known' && mark !== 'unknown') return false;
      nextMarks[key] = mark;
    }

    const nextCheckinsByGoal: Record<string, string[]> = {};
    for (const [key, items] of Object.entries(value.checkinsByGoal)) {
      if (
        !Array.isArray(items) ||
        !items.every((item) => typeof item === 'string')
      ) {
        return false;
      }
      nextCheckinsByGoal[key] = items;
    }

    const nextCustomWords: CustomWord[] = [];
    for (const item of value.customWords) {
      if (
        !isRecord(item) ||
        typeof item.id !== 'string' ||
        (item.lang !== 'en' && item.lang !== 'ja') ||
        typeof item.term !== 'string' ||
        typeof item.meaning !== 'string'
      ) {
        return false;
      }
      nextCustomWords.push({
        id: item.id,
        lang: item.lang,
        term: item.term,
        reading: typeof item.reading === 'string' ? item.reading : undefined,
        meaning: item.meaning,
        example: typeof item.example === 'string' ? item.example : '',
        exampleZh: typeof item.exampleZh === 'string' ? item.exampleZh : '',
        audioUrl: typeof item.audioUrl === 'string' ? item.audioUrl : undefined,
      });
    }

    const nextSessions: StudySession[] = [];
    for (const item of value.sessions) {
      if (
        !isRecord(item) ||
        typeof item.id !== 'string' ||
        typeof item.goalId !== 'string' ||
        typeof item.taskId !== 'string' ||
        typeof item.title !== 'string' ||
        typeof item.completedAt !== 'string'
      ) {
        return false;
      }
      nextSessions.push(item as unknown as StudySession);
    }

    setStoredGoalId(nextGoalId);
    setGoalStarts(nextStarts);
    setLegacyStartDate(nextStarts[nextGoalId] || todayStr());
    setChecks(nextChecks);
    setLegacyCheckins([]);
    setCheckinsByGoal(nextCheckinsByGoal);
    setMarks(nextMarks);
    setCustomWords(nextCustomWords);
    setSessions(nextSessions);
    return true;
  };

  const knownCount = useMemo(
    () => Object.values(marks).filter((m) => m === 'known').length,
    [marks],
  );

  const value: StudyState = {
    goalId,
    setGoal,
    startDate: effectiveStart,
    plan,
    currentPlanDay,
    checks,
    toggleTask,
    completeTask,
    checkins,
    streak,
    decks,
    customWords,
    addCustomWord,
    removeCustomWord,
    marks,
    markWord,
    resetDeckMarks,
    resetAll,
    knownCount,
    sessions,
    exportData,
    importData,
  };

  return (
    <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
  );
}
