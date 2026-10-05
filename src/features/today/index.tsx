/** 聚合今日计划、任务进度、统计与每日一句。 */
import styles from './index.module.less';
import { FOCUS_LABEL, PLAN, type PlanTask } from '@/content/plan';
import { SCENARIOS } from '@/content/speaking';
import { TOTAL_WORDS } from '@/content/words';
import { useStudy } from '@/study/useStudy';
import TaskList from '@/study/components/TaskList';
import SpeakButton from '@/components/SpeakButton';

function Ring({ percent, size = 84 }: { percent: number; size?: number }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className={styles.ring}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#efece2"
        strokeWidth="10"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#019e96"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - percent)}
        style={{ transition: 'stroke-dashoffset .5s cubic-bezier(.4,0,.2,1)' }}
      />
    </svg>
  );
}

const FOCUS_STYLE: Record<string, string> = {
  EN: styles.english,
  JP: styles.japanese,
  RV: styles.review,
};

export default function TodaySection({
  onStartTask,
}: {
  onStartTask: (task: PlanTask) => void;
}) {
  const { dayIndex, checks, toggleTask, streak, knownCount, startDate } =
    useStudy();
  const plan = PLAN[dayIndex - 1];
  const done = new Set(checks[plan.day] ?? []);
  const percent = plan.tasks.length ? done.size / plan.tasks.length : 0;

  const today = new Date();
  const dateLabel = `${today.getMonth() + 1}月${today.getDate()}日`;
  const weekLabel = ['日', '一', '二', '三', '四', '五', '六'][today.getDay()];

  // 每日一句：按当天日期确定性轮换；英语日推英语，日语日推日语
  const pool = SCENARIOS.filter((s) =>
    plan.focus === 'JP'
      ? s.lang === 'ja'
      : plan.focus === 'EN'
        ? s.lang === 'en'
        : true,
  ).flatMap((s) => s.sentences.map((t) => ({ ...t, lang: s.lang })));
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  const quote = pool[dayOfYear % pool.length];

  return (
    <div className={styles.section}>
      {/* hero */}
      <section className={`reveal ${styles.hero}`}>
        <span className={styles.blueOrb} />
        <span className={styles.aquaOrb} />
        <p className={styles.date}>
          Day {String(plan.day).padStart(2, '0')} / 30 · {dateLabel} · 星期
          {weekLabel}
        </p>
        <h1 className={styles.title}>开始今天的练习</h1>
        <p lang="ja" className={styles.subtitle}>
          今日も一歩前進しよう。
        </p>
        <div className={styles.badges}>
          <span className={`${styles.focusBadge} ${FOCUS_STYLE[plan.focus]}`}>
            {FOCUS_LABEL[plan.focus]}
          </span>
          <span className={styles.topicBadge}>{plan.title}</span>
        </div>
      </section>

      {/* 每日一句 */}
      <section className={`reveal ${styles.quote}`}>
        <div className={styles.quoteContent}>
          <p className={styles.quoteLabel}>
            每日一句 · {quote.lang === 'ja' ? '日本語' : 'English'}
          </p>
          <p
            lang={quote.lang === 'ja' ? 'ja' : undefined}
            className={styles.quoteText}
          >
            {quote.text}
          </p>
          <p className={styles.quoteTranslation}>{quote.zh}</p>
        </div>
        <SpeakButton text={quote.text} lang={quote.lang} size={42} />
      </section>

      {/* stats */}
      <section className={`reveal ${styles.stats}`}>
        <div className={styles.stat}>
          <span className={styles.streakValue}>{streak}</span>
          <span className={styles.statLabel}>连续打卡（天）</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.knownValue}>{knownCount}</span>
          <span className={styles.statLabel}>已掌握单词</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.totalValue}>{TOTAL_WORDS}</span>
          <span className={styles.statLabel}>词库总量</span>
        </div>
      </section>

      {/* tasks */}
      <section className={`reveal ${styles.tasks}`}>
        <div className={styles.taskHeading}>
          <div className={styles.ringWrap}>
            <Ring percent={percent} />
            <span className={styles.percent}>{Math.round(percent * 100)}%</span>
          </div>
          <div>
            <h2 className={styles.taskTitle}>今日任务</h2>
            <p className={styles.taskDescription}>
              全部完成即可自动打卡 · 预计{' '}
              {plan.tasks.reduce((n, t) => n + t.minutes, 0)} 分钟
            </p>
          </div>
        </div>

        <TaskList
          tasks={plan.tasks}
          done={checks[plan.day] ?? []}
          onToggle={(taskId) => toggleTask(plan.day, taskId, plan.tasks.length)}
          onStart={onStartTask}
          variant="today"
        />

        {percent === 1 && (
          <p className={`pop-in ${styles.completed}`}>
            今日已打卡，干得漂亮！明天继续。
          </p>
        )}
      </section>

      <p className={`reveal ${styles.footer}`}>
        学习记录保存在当前浏览器中 · 开始于 {startDate}
      </p>
    </div>
  );
}
