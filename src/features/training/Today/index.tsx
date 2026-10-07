import { LESSONS } from '@/content/training';
import { lessonCompleted, nextLesson } from '@/study/trainingState';
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
  const lesson = nextLesson(data);
  const last = LESSONS.find(
    (item) => item.id === data.lastLesson[data.language],
  );
  const all = LESSONS.filter((item) => item.lang === data.language);
  const learned = all.filter((item) => lessonCompleted(data, item)).length;
  const due = data.reviews.filter(
    (item) =>
      LESSONS.find((unit) => unit.id === item.lessonId)?.lang ===
        data.language && Date.parse(item.dueAt) <= now,
  );
  const results = data.results.filter(
    (result) => result.lang === data.language,
  );
  const startSkill = results.some(
    (result) => result.lessonId === lesson.id && result.skill === 'reading',
  )
    ? 'speaking'
    : 'reading';
  const nextSpeaking =
    lesson.speaking.find(
      (task) =>
        !results.some(
          (result) =>
            result.lessonId === lesson.id && result.taskId === task.id,
        ),
    ) ?? lesson.speaking[0];
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
              {lesson.minutes} 分钟
            </small>
          </div>
          <div className={styles.heroBottom}>
            <button
              type="button"
              className={styles.primary}
              onClick={() =>
                onOpen({
                  lessonId: lesson.id,
                  skill: startSkill,
                  taskId:
                    startSkill === 'speaking' ? nextSpeaking.id : undefined,
                })
              }
            >
              <TrainingIcon name="play" size={17} />
              {data.lastLesson[data.language] ? '继续' : '开始'}
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
