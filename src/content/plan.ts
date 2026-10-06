/** 可扩展课程目录；课程由目标、等级与技能共同定义。 */
import rawCourses from './courses.json';

export type Focus = 'EN' | 'JP' | 'RV';
export type ActivityType = 'flashcards' | 'speaking' | 'reading' | 'kana';
export type CourseSkill = 'reading' | 'speaking' | 'vocabulary' | 'kana';

export interface ActivityRef {
  type: ActivityType;
  mode?: 'learn' | 'practice' | 'review';
  resourceGroupIds?: string[];
  resourceNames?: string[];
  scenarioIds?: string[];
}

export interface PlanTask {
  id: string;
  text: string;
  minutes: number;
  language: 'en' | 'ja' | 'all';
  skill: CourseSkill;
  activity: ActivityRef;
}

export interface PlanDay {
  day: number;
  focus: Focus;
  title: string;
  tasks: PlanTask[];
}

export interface CourseDefinition {
  id: string;
  goalId: string;
  language: 'en' | 'ja';
  level: string;
  levelTitle: string;
  title: string;
  skills: CourseSkill[];
  days: PlanDay[];
}

const FOCUSES: Focus[] = ['EN', 'JP', 'RV'];
const LANGUAGES: PlanTask['language'][] = ['en', 'ja', 'all'];
const ACTIVITY_TYPES: ActivityType[] = [
  'flashcards',
  'speaking',
  'reading',
  'kana',
];
const ACTIVITY_MODES: NonNullable<ActivityRef['mode']>[] = [
  'learn',
  'practice',
  'review',
];
const COURSE_SKILLS: CourseSkill[] = [
  'reading',
  'speaking',
  'vocabulary',
  'kana',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(hasString);
}

function assertCourseData(value: unknown): asserts value is CourseDefinition[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('课程数据不能为空');
  }

  const courseIds = new Set<string>();
  const courseKeys = new Set<string>();

  value.forEach((course, courseIndex) => {
    const label = `课程 ${courseIndex + 1}`;
    if (
      !isRecord(course) ||
      !hasString(course.id) ||
      !hasString(course.goalId) ||
      (course.language !== 'en' && course.language !== 'ja') ||
      !hasString(course.level) ||
      !hasString(course.levelTitle) ||
      !hasString(course.title) ||
      !Array.isArray(course.skills) ||
      course.skills.length === 0 ||
      !course.skills.every((skill) =>
        COURSE_SKILLS.includes(skill as CourseSkill),
      ) ||
      !Array.isArray(course.days) ||
      course.days.length === 0
    ) {
      throw new Error(`${label}格式不正确`);
    }
    const courseKey = `${course.goalId}:${course.level}`;
    if (courseIds.has(course.id) || courseKeys.has(courseKey)) {
      throw new Error(`${label}的课程 ID 或目标等级重复`);
    }
    courseIds.add(course.id);
    courseKeys.add(courseKey);

    const days = new Set<number>();
    const taskIds = new Set<string>();
    course.days.forEach((day, dayIndex) => {
      const dayLabel = `${label}第 ${dayIndex + 1} 天`;
      if (
        !isRecord(day) ||
        !Number.isInteger(day.day) ||
        (day.day as number) < 1 ||
        !FOCUSES.includes(day.focus as Focus) ||
        !hasString(day.title) ||
        !Array.isArray(day.tasks) ||
        day.tasks.length === 0
      ) {
        throw new Error(`${dayLabel}格式不正确`);
      }
      if (days.has(day.day as number)) {
        throw new Error(`${dayLabel}的日期重复`);
      }
      days.add(day.day as number);

      day.tasks.forEach((task, taskIndex) => {
        const taskLabel = `${dayLabel}任务 ${taskIndex + 1}`;
        if (
          !isRecord(task) ||
          !hasString(task.id) ||
          !hasString(task.text) ||
          !Number.isInteger(task.minutes) ||
          (task.minutes as number) < 1 ||
          !LANGUAGES.includes(task.language as PlanTask['language']) ||
          (task.language !== 'all' && task.language !== course.language) ||
          !COURSE_SKILLS.includes(task.skill as CourseSkill) ||
          !(course.skills as unknown[]).includes(task.skill) ||
          !isRecord(task.activity) ||
          !ACTIVITY_TYPES.includes(task.activity.type as ActivityType) ||
          (task.activity.mode !== undefined &&
            !ACTIVITY_MODES.includes(
              task.activity.mode as NonNullable<ActivityRef['mode']>,
            )) ||
          (task.activity.resourceGroupIds !== undefined &&
            !isStringArray(task.activity.resourceGroupIds)) ||
          (task.activity.resourceNames !== undefined &&
            !isStringArray(task.activity.resourceNames)) ||
          (task.activity.scenarioIds !== undefined &&
            !isStringArray(task.activity.scenarioIds))
        ) {
          throw new Error(`${taskLabel}格式不正确`);
        }
        if (taskIds.has(task.id)) {
          throw new Error(`${taskLabel}的 ID 重复`);
        }
        taskIds.add(task.id);
      });
    });
  });
}

assertCourseData(rawCourses);

export const COURSES: CourseDefinition[] = rawCourses;

export function getCoursesForGoal(goalId: string) {
  return COURSES.filter((course) => course.goalId === goalId);
}

export function getCourseForGoal(goalId: string, level?: string) {
  return getCoursesForGoal(goalId).find(
    (course) => level === undefined || course.level === level,
  );
}

function taskOrder(task: PlanTask) {
  const match = task.id.match(/-task-(\d+)$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

/** 仅用于兼容旧版按任务序号保存的进度。 */
export const PLAN: PlanDay[] = COURSES.filter((course) =>
  [
    'english-communication-foundation',
    'japanese-communication-foundation',
  ].includes(course.id),
)
  .flatMap((course) => course.days)
  .reduce<PlanDay[]>((days, sourceDay) => {
    const day = days.find((item) => item.day === sourceDay.day);
    if (!day) {
      days.push({ ...sourceDay, tasks: [...sourceDay.tasks] });
      return days;
    }
    sourceDay.tasks.forEach((task) => {
      if (!day.tasks.some((item) => item.id === task.id)) day.tasks.push(task);
    });
    day.tasks.sort((a, b) => taskOrder(a) - taskOrder(b));
    return days;
  }, [])
  .sort((a, b) => a.day - b.day);

export const FOCUS_LABEL: Record<Focus, string> = {
  EN: '英语日',
  JP: '日语日',
  RV: '复盘日',
};
