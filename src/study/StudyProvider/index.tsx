/** 共享任务、打卡与词汇状态，保持既有存储键和写入语义。 */
import { useEffect, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getCourseForGoal, getCoursesForGoal, PLAN } from '@/content/plan';
import { LEARNING_GOALS } from '@/content/goals';
import { DECKS, type Deck } from '@/content/words';
import { todayStr } from '@/lib/date';
import {
  StudyContext,
  type CardMark,
  type CustomWord,
  type StudyAttempt,
  type StudySession,
  type StudyState,
} from '../context';

const ATTEMPT_ACTIVITIES = new Set([
  'flashcards',
  'speaking',
  'reading',
  'kana',
]);
const ATTEMPT_OUTCOMES = new Set(['known', 'unknown', 'recorded', 'completed']);

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
  const [courseSelections, setCourseSelections] = useLocalStorage<
    Record<string, string>
  >('lingua.courses', {});
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
  const [attempts, setAttempts] = useLocalStorage<StudyAttempt[]>(
    'lingua.attempts',
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

  const availableGoals = LEARNING_GOALS.filter(
    (goal) => goal.available && getCourseForGoal(goal.id),
  );
  const activeGoal =
    availableGoals.find((goal) => goal.id === storedGoalId) ??
    availableGoals[0];
  if (!activeGoal) throw new Error('没有可用的学习目标');
  const goalId = activeGoal.id;
  const courses = getCoursesForGoal(goalId);
  const course =
    courses.find((item) => item.id === courseSelections[goalId]) ?? courses[0];
  if (!course) throw new Error(`目标 ${goalId} 缺少课程数据`);
  const plan = course.days;

  useEffect(() => {
    if (storedGoalId !== goalId) setStoredGoalId(goalId);
  }, [goalId, setStoredGoalId, storedGoalId]);

  useEffect(() => {
    if (courseSelections[goalId] !== course.id) {
      setCourseSelections((current) => ({
        ...current,
        [goalId]: course.id,
      }));
    }
  }, [course.id, courseSelections, goalId, setCourseSelections]);

  useEffect(() => {
    if (goalStarts[course.id]) return;
    const start = goalStarts[goalId] || legacyStartDate || todayStr();
    setGoalStarts((current) => ({ ...current, [course.id]: start }));
    if (!legacyStartDate) setLegacyStartDate(start);
  }, [
    course.id,
    goalId,
    goalStarts,
    legacyStartDate,
    setGoalStarts,
    setLegacyStartDate,
  ]);

  useEffect(() => {
    const legacyEntries = Object.entries(storedChecks).filter(
      ([key]) => !key.includes(':') || key.startsWith(`${goalId}:`),
    );
    if (legacyEntries.length === 0) return;
    setChecks((current) => {
      const next = { ...current };
      legacyEntries.forEach(([storageKey, values]) => {
        const day = storageKey.includes(':')
          ? storageKey.split(':').at(-1)
          : storageKey;
        if (!day) return;
        delete next[storageKey];
        const courseKey = `${course.id}:${day}`;
        next[courseKey] = next[courseKey] ?? values;
      });
      return next;
    });
  }, [course.id, goalId, setChecks, storedChecks]);

  useEffect(() => {
    if (checkinsByGoal[course.id]) return;
    setCheckinsByGoal((current) => ({
      ...current,
      [course.id]: current[goalId] ?? legacyCheckins,
    }));
  }, [checkinsByGoal, course.id, goalId, legacyCheckins, setCheckinsByGoal]);

  const effectiveStart =
    goalStarts[course.id] ||
    goalStarts[goalId] ||
    legacyStartDate ||
    todayStr();

  const checks = useMemo<Record<number, string[]>>(
    () =>
      Object.fromEntries(
        Object.entries(storedChecks).flatMap(([storageKey, values]) => {
          const [storedCourseId, dayKey] = storageKey.includes(':')
            ? storageKey.split(':')
            : [course.id, storageKey];
          if (storedCourseId !== course.id && storedCourseId !== goalId) {
            return [];
          }
          const day = Number(dayKey);
          return [[day, normalizeTaskIds(day, values)]];
        }),
      ),
    [course.id, goalId, storedChecks],
  );

  const checkins =
    checkinsByGoal[course.id] ?? checkinsByGoal[goalId] ?? legacyCheckins;

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
      const storageKey = `${course.id}:${day}`;
      const cur = new Set(normalizeTaskIds(day, prev[storageKey] ?? []));
      if (forceComplete) cur.add(taskId);
      else if (cur.has(taskId)) cur.delete(taskId);
      else cur.add(taskId);
      const next = { ...prev, [storageKey]: [...cur] };
      // auto check-in when a day is fully completed
      if (cur.size === total && total > 0) {
        const today = todayStr();
        setCheckinsByGoal((current) => {
          const courseCheckins = current[course.id] ?? [];
          if (courseCheckins.includes(today)) return current;
          return { ...current, [course.id]: [...courseCheckins, today] };
        });
      }
      return next;
    });
  };

  const toggleTask = (day: number, taskId: string, total: number) =>
    updateTask(day, taskId, total, false);

  const completeTask = (day: number, taskId: string, total: number) => {
    updateTask(day, taskId, total, true);
    const task = plan
      .find((item) => item.day === day)
      ?.tasks.find((item) => item.id === taskId);
    if (!task) return;
    setSessions((current) => {
      if (
        current.some(
          (session) =>
            (session.courseId
              ? session.courseId === course.id
              : session.goalId === goalId && course.level === 'foundation') &&
            session.taskId === taskId,
        )
      ) {
        return current;
      }
      return [
        {
          id: `${course.id}-${taskId}-${Date.now()}`,
          goalId,
          courseId: course.id,
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
  };

  const setCourse = (nextCourseId: string) => {
    if (!courses.some((item) => item.id === nextCourseId)) return;
    setCourseSelections((current) => ({
      ...current,
      [goalId]: nextCourseId,
    }));
  };

  const markWord = (wordId: string, mark: CardMark) =>
    setMarks((prev) => ({ ...prev, [wordId]: mark }));

  const recordAttempt: StudyState['recordAttempt'] = (attempt) => {
    const completedAt = new Date().toISOString();
    setAttempts((current) =>
      [
        {
          ...attempt,
          id: crypto.randomUUID(),
          goalId,
          courseId: course.id,
          completedAt,
        },
        ...current,
      ].slice(0, 2000),
    );
  };

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
    setCheckinsByGoal({ [course.id]: [] });
    setMarks({});
    setSessions([]);
    setAttempts([]);
    setLegacyStartDate(todayStr());
    setGoalStarts({ [course.id]: todayStr() });
  };

  const exportData = () => ({
    version: 2,
    exportedAt: new Date().toISOString(),
    goalId,
    courseSelections,
    goalStarts,
    checks: storedChecks,
    checkinsByGoal,
    marks,
    customWords,
    sessions,
    attempts,
  });

  const importData = (value: unknown) => {
    if (!isRecord(value) || (value.version !== 1 && value.version !== 2)) {
      return false;
    }
    const version = value.version;
    const nextGoalId = value.goalId;
    if (
      typeof nextGoalId !== 'string' ||
      !availableGoals.some((goal) => goal.id === nextGoalId) ||
      !isRecord(value.goalStarts) ||
      !isRecord(value.checks) ||
      !isRecord(value.marks) ||
      !isRecord(value.checkinsByGoal) ||
      !Array.isArray(value.customWords) ||
      !Array.isArray(value.sessions) ||
      (version === 2 && !Array.isArray(value.attempts))
    ) {
      return false;
    }

    const nextCourseSelections: Record<string, string> = {};
    if (value.courseSelections !== undefined) {
      if (!isRecord(value.courseSelections)) return false;
      for (const [key, item] of Object.entries(value.courseSelections)) {
        if (
          typeof item !== 'string' ||
          !getCoursesForGoal(key).some((course) => course.id === item)
        ) {
          return false;
        }
        nextCourseSelections[key] = item;
      }
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
        (item.courseId !== undefined && typeof item.courseId !== 'string') ||
        typeof item.taskId !== 'string' ||
        typeof item.title !== 'string' ||
        typeof item.completedAt !== 'string'
      ) {
        return false;
      }
      nextSessions.push(item as unknown as StudySession);
    }

    const nextAttempts: StudyAttempt[] = [];
    const attemptValues = version === 2 ? value.attempts : [];
    if (!Array.isArray(attemptValues)) return false;
    for (const item of attemptValues) {
      if (
        !isRecord(item) ||
        typeof item.id !== 'string' ||
        typeof item.goalId !== 'string' ||
        typeof item.courseId !== 'string' ||
        (item.taskId !== undefined && typeof item.taskId !== 'string') ||
        typeof item.activity !== 'string' ||
        !ATTEMPT_ACTIVITIES.has(item.activity) ||
        typeof item.contentId !== 'string' ||
        typeof item.completedAt !== 'string' ||
        Number.isNaN(Date.parse(item.completedAt)) ||
        (item.outcome !== undefined &&
          (typeof item.outcome !== 'string' ||
            !ATTEMPT_OUTCOMES.has(item.outcome))) ||
        (item.correct !== undefined &&
          (typeof item.correct !== 'number' ||
            !Number.isInteger(item.correct) ||
            item.correct < 0)) ||
        (item.total !== undefined &&
          (typeof item.total !== 'number' ||
            !Number.isInteger(item.total) ||
            item.total < 0)) ||
        (typeof item.correct === 'number' &&
          typeof item.total === 'number' &&
          item.correct > item.total) ||
        (item.durationMs !== undefined &&
          (typeof item.durationMs !== 'number' || item.durationMs < 0))
      ) {
        return false;
      }
      nextAttempts.push(item as unknown as StudyAttempt);
    }

    setStoredGoalId(nextGoalId);
    setCourseSelections(nextCourseSelections);
    setGoalStarts(nextStarts);
    setLegacyStartDate(nextStarts[nextGoalId] || todayStr());
    setChecks(nextChecks);
    setLegacyCheckins([]);
    setCheckinsByGoal(nextCheckinsByGoal);
    setMarks(nextMarks);
    setCustomWords(nextCustomWords);
    setSessions(nextSessions);
    setAttempts(nextAttempts);
    return true;
  };

  const knownCount = useMemo(
    () => Object.values(marks).filter((m) => m === 'known').length,
    [marks],
  );

  const value: StudyState = {
    goalId,
    setGoal,
    setCourse,
    startDate: effectiveStart,
    course,
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
    attempts,
    recordAttempt,
    exportData,
    importData,
  };

  return (
    <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
  );
}
