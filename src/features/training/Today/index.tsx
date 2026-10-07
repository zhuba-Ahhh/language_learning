import { LESSONS } from '@/content/training';
import { lessonCompleted, nextLesson } from '@/study/trainingState';
import { useTraining } from '@/study/trainingContext';
import TrainingIcon from '@/components/TrainingIcon';
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
  const { data, now, setBudget } = useTraining();
  const lesson = nextLesson(data);
  const last = LESSONS.find(
    (item) => item.id === data.lastLesson[data.language],
  );
  const due = data.reviews.filter(
    (item) =>
      LESSONS.find((unit) => unit.id === item.lessonId)?.lang ===
        data.language && Date.parse(item.dueAt) <= now,
  );
  const results = data.results.filter(
    (result) => result.lang === data.language,
  );
  const learned = LESSONS.filter(
    (item) => item.lang === data.language && lessonCompleted(data, item),
  ).length;
  const all = LESSONS.filter((item) => item.lang === data.language);
  const date = new Date(now).toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
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

  return (
    <div>
      <div className={styles.todayTop}>
        <p>{date}</p>
        <div className={styles.budget} aria-label="每日学习时间">
          {[15, 30, 45].map((minutes) => (
            <button
              type="button"
              key={minutes}
              aria-pressed={data.dailyMinutes === minutes}
              onClick={() => setBudget(minutes)}
            >
              {minutes} 分钟
            </button>
          ))}
        </div>
      </div>
      <div className={styles.welcome}>
        <h1>
          {data.language === 'en' ? (
            <>
              把读懂的，
              <br className={styles.mobileBreak} />
              变成说得出的。
            </>
          ) : (
            <>
              从第一句，
              <br className={styles.mobileBreak} />
              慢慢说到更多。
            </>
          )}
        </h1>
        <p>
          {data.language === 'en'
            ? '英语起步、雅思训练，还有你的专业。'
            : '日语入门、读解练习，还有未来的日常。'}
        </p>
        {data.language === 'ja' && (
          <button type="button" className={styles.startKana} onClick={onKana}>
            零基础？先认识假名 ›
          </button>
        )}
      </div>
      <div className={styles.todayGrid}>
        <section className={styles.mainLesson}>
          <div className={styles.lessonKicker}>
            <span>{learned === all.length ? '巩固一课' : '下一课'}</span>
            <span>{lesson.stage}</span>
          </div>
          <div className={styles.heroText}>
            <h2>{lesson.title}</h2>
            <p>{lesson.subtitle}</p>
          </div>
          <p className={styles.heroGoal}>{lesson.goal}</p>
          <div className={styles.lessonSteps}>
            <span>
              <TrainingIcon name="reading" />
              读一篇
            </span>
            <i />{' '}
            <span>
              <TrainingIcon name="speaking" />
              说一段
            </span>
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
              开始{startSkill === 'reading' ? '阅读' : '口语'}
            </button>
            <small>约 {lesson.minutes} 分钟</small>
          </div>
          <div className={styles.sheetMark} aria-hidden="true">
            {data.language === 'en' ? 'Aa' : 'あ'}
          </div>
        </section>
        <aside className={styles.todayAside}>
          <section className={styles.reviewSummary}>
            <TrainingIcon name="review" />
            <h2>留一点时间，重新练。</h2>
            <p>
              {due.length
                ? `${due.length} 项内容已到复习时间`
                : '读过的词、做错的题，都可以再练一次。'}
            </p>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => onNavigate('review')}
            >
              {due.length ? '开始复习' : '打开复习'}
            </button>
          </section>
          <section className={styles.pathSummary}>
            <p>当前路线</p>
            <strong>
              {data.language === 'en' ? '英语起步 → 雅思' : '日语入门 → JLPT'}
            </strong>
            <span>{data.targets[data.language]}</span>
            <div className={styles.progressTrack}>
              <i style={{ width: `${(learned / all.length) * 100}%` }} />
            </div>
            <small>
              {learned} / {all.length} 个单元已完成阅读与口语
            </small>
          </section>
        </aside>
      </div>
      <section className={styles.quickSection}>
        <div className={styles.sectionHeading}>
          <h2>也可以，直接练。</h2>
          {last && (
            <button
              type="button"
              onClick={() => onOpen({ lessonId: last.id, skill: 'reading' })}
            >
              回到上次：{last.title}
            </button>
          )}
        </div>
        <div className={styles.quickActions}>
          <button type="button" onClick={() => onNavigate('speaking')}>
            <TrainingIcon name="speaking" size={28} />
            <span>
              <strong>口语</strong>
              <small>跟读、回答、复述</small>
            </span>
            <span aria-hidden="true">↗</span>
          </button>
          <button type="button" onClick={() => onNavigate('reading')}>
            <TrainingIcon name="reading" size={28} />
            <span>
              <strong>阅读</strong>
              <small>理解、查词、找依据</small>
            </span>
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </section>
    </div>
  );
}
