import { LESSONS } from '@/content/training';
import {
  lessonCompleted,
  lessonMastered,
  lessonsForTarget,
} from '@/study/trainingState';
import { todayPlan } from '@/study/trainingPlan';
import { useTraining } from '@/study/trainingContext';
import TrainingIcon from '@/components/TrainingIcon';
import StudyArt from '../components/StudyArt';
import StudyWeek from '../components/StudyWeek';
import type { TrainingSelection, WorkspaceTab } from '../types';
import styles from '../index.module.less';

export default function Today({
  onOpen,
  onNavigate,
  onKana,
}: {
  onOpen: (selection: TrainingSelection) => void;
  onNavigate: (tab: WorkspaceTab) => void;
  onKana: () => void;
}) {
  const { data, now } = useTraining();
  const plan = todayPlan(data, now);
  const { lesson } = plan;
  const last = LESSONS.find(
    (item) => item.id === data.lastLesson[data.language],
  );
  const all = lessonsForTarget(data);
  const learned = all.filter((item) => lessonCompleted(data, item)).length;
  const mastered = all.filter((item) => lessonMastered(data, item)).length;
  const due = data.reviews.filter(
    (item) =>
      LESSONS.find((unit) => unit.id === item.lessonId)?.lang ===
        data.language && Date.parse(item.dueAt) <= now,
  );
  const nextSpeaking = plan.speaking;
  const done = plan.tasks.filter((task) => task.done).length;
  const openTask = (kind: (typeof plan.tasks)[number]['kind']) => {
    if (kind === 'review') onNavigate('review');
    else if (kind === 'kana') onKana();
    else
      onOpen({
        lessonId: lesson.id,
        skill: kind === 'speaking' ? 'speaking' : 'reading',
        taskId: kind === 'speaking' ? nextSpeaking.id : undefined,
        panel: kind === 'grammar' || kind === 'listening' ? kind : undefined,
      });
  };
  const date = new Date(now);
  return (
    <div>
      <div className={styles.todayTop}>
        <h1>今天</h1>
        <time>
          {String(date.getMonth() + 1).padStart(2, '0')} /{' '}
          {String(date.getDate()).padStart(2, '0')}
        </time>
      </div>
      <div className={styles.todayGrid}>
        <section className={styles.mainLesson}>
          <div className={styles.lessonKicker}>
            <span>{learned === all.length ? '巩固' : lesson.stage}</span>
            <span>
              {learned} / {all.length}
            </span>
          </div>
          <StudyArt name="book" className={styles.heroArt} eager />
          <div className={styles.heroText}>
            <h2>{lesson.title}</h2>
            <small>
              <TrainingIcon name="clock" size={17} />
              预计 {plan.minutes} 分钟
            </small>
          </div>
          <div className={styles.heroBottom}>
            <button
              type="button"
              className={styles.primary}
              onClick={() =>
                openTask(
                  plan.tasks.find((task) => !task.done)?.kind ?? 'reading',
                )
              }
            >
              <TrainingIcon name="play" size={17} />
              {done === plan.tasks.length
                ? '自由练习'
                : data.lastLesson[data.language]
                  ? '继续'
                  : '开始'}
            </button>
            {last && (
              <button
                type="button"
                className={styles.lastLesson}
                aria-label={`上次阅读：${last.title}`}
                onClick={() => onOpen({ lessonId: last.id, skill: 'reading' })}
              >
                上次
              </button>
            )}
          </div>
        </section>
        <section className={styles.reviewSummary}>
          <StudyArt name="flashcards" className={styles.reviewArt} />
          <div>
            <h2>待复习</h2>
            <span className={styles.reviewCount}>{due.length}</span>
          </div>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => onNavigate('review')}
          >
            复习
          </button>
        </section>
      </div>
      <section className={styles.dailyPlan} aria-label="今日安排">
        <div className={styles.sectionHeading}>
          <h2>
            今日安排{' '}
            <small>
              {done}/{plan.tasks.length}
            </small>
          </h2>
          <span>{data.dailyMinutes} 分钟预算</span>
        </div>
        <p>
          {data.targets[data.language]} · 已完成 {learned}/{all.length} · 已掌握{' '}
          {mastered}/{all.length}
        </p>
        <ol>
          {plan.tasks.map((task) => (
            <li key={task.kind}>
              <button
                type="button"
                onClick={() => openTask(task.kind)}
                aria-label={`${task.title}${task.done ? '，已完成' : `，约 ${task.minutes} 分钟`}`}
              >
                <i className={task.done ? styles.taskDone : ''}>
                  {task.done ? (
                    <TrainingIcon name="check" size={15} />
                  ) : (
                    <TrainingIcon name="arrow" size={15} />
                  )}
                </i>
                <strong>{task.title}</strong>
                <span>{task.done ? '已完成' : `${task.minutes} 分钟`}</span>
              </button>
            </li>
          ))}
        </ol>
      </section>
      <div className={styles.quickActions}>
        <button
          type="button"
          className={styles.speakingCard}
          onClick={() => onNavigate('speaking')}
        >
          <div>
            <strong>口语</strong>
            <small>{nextSpeaking.title}</small>
            <span>
              <TrainingIcon name="clock" size={15} />
              {nextSpeaking.seconds} 秒
            </span>
          </div>
          <StudyArt name="microphone" className={styles.skillArt} />
          <i className={styles.entryArrow}>
            <TrainingIcon name="arrow" />
          </i>
        </button>
        <button
          type="button"
          className={styles.readingCard}
          onClick={() => onNavigate('reading')}
        >
          <div>
            <strong>阅读</strong>
            <small>{lesson.title}</small>
            <span>
              <TrainingIcon name="clock" size={15} />
              {lesson.minutes} 分钟
            </span>
          </div>
          <StudyArt name="book" className={styles.skillArt} />
          <i className={styles.entryArrow}>
            <TrainingIcon name="arrow" />
          </i>
        </button>
      </div>
      <StudyWeek />
      {data.language === 'ja' && (
        <button type="button" className={styles.startKana} onClick={onKana}>
          <span lang="ja">あ</span>假名
          <TrainingIcon name="arrow" size={17} />
        </button>
      )}
    </div>
  );
}
