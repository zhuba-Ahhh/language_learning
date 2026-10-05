/** 展示 30 天计划与打卡统计，复用共享任务列表。 */
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import { useState } from 'react';
import { FOCUS_LABEL, PLAN } from '@/content/plan';
import { useStudy } from '@/study/useStudy';
import TaskList from '@/study/components/TaskList';
import Heatmap from './components/Heatmap';

const FOCUS_DOT: Record<string, string> = {
  EN: styles.english,
  JP: styles.japanese,
  RV: styles.review,
};

export default function PlanSection() {
  const { dayIndex, checks, toggleTask, checkins, streak, resetAll } =
    useStudy();
  const [openDay, setOpenDay] = useState<number>(dayIndex);

  const completedDays = PLAN.filter(
    (p) => (checks[p.day] ?? []).length === p.tasks.length,
  ).length;

  return (
    <div className={styles.section}>
      <FeatureHeader
        eyebrow="30-Day Roadmap"
        title="30 天计划"
        description={
          <>单日英语、双日日语，周日复盘。已完成 {completedDays} / 30 天。</>
        }
      >
        <button
          onClick={() => {
            if (
              window.confirm(
                '确定要清空所有打卡和单词记录，从第 1 天重新开始吗？',
              )
            ) {
              resetAll();
            }
          }}
          className={styles.reset}
        >
          重置全部进度
        </button>
      </FeatureHeader>

      <div className={`reveal ${styles.stats}`}>
        <Heatmap checkins={checkins} />
        <div className={styles.streak}>
          <span className={styles.streakValue}>{streak}</span>
          <span className={styles.streakLabel}>连续打卡（天）</span>
        </div>
      </div>

      <div className={`reveal ${styles.days}`}>
        {PLAN.map((p) => {
          const done = checks[p.day] ?? [];
          const complete = done.length === p.tasks.length;
          const isToday = p.day === dayIndex;
          const open = openDay === p.day;
          return (
            <div
              key={p.day}
              className={`${styles.day} ${
                isToday
                  ? styles.current
                  : complete
                    ? styles.completed
                    : styles.pending
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenDay(open ? 0 : p.day)}
                className={styles.dayToggle}
              >
                <span
                  className={`${styles.dayNumber} ${
                    isToday ? styles.currentNumber : styles.muted
                  }`}
                >
                  D{String(p.day).padStart(2, '0')}
                </span>
                <span className={`${styles.focusDot} ${FOCUS_DOT[p.focus]}`} />
                <span className={styles.dayContent}>
                  <span
                    className={`${styles.dayTitle} ${
                      isToday
                        ? styles.currentTitle
                        : complete
                          ? styles.muted
                          : styles.defaultTitle
                    }`}
                  >
                    {p.title}
                  </span>
                  <span
                    className={`${styles.dayMeta} ${isToday ? styles.currentMeta : styles.muted}`}
                  >
                    {FOCUS_LABEL[p.focus]} ·{' '}
                    {p.tasks.reduce((n, t) => n + t.minutes, 0)} 分钟
                  </span>
                </span>
                {complete ? (
                  <span className={styles.completedIcon}>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6.5 4.8 9 10 3"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                ) : (
                  isToday && <span className={styles.todayBadge}>今天</span>
                )}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  className={`${styles.chevron} ${open ? styles.expanded : ''} ${
                    isToday ? styles.currentChevron : styles.muted
                  }`}
                  fill="none"
                >
                  <path
                    d="M4 6l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {open && (
                <TaskList
                  tasks={p.tasks}
                  done={done}
                  onToggle={(taskId) =>
                    toggleTask(p.day, taskId, p.tasks.length)
                  }
                  variant="plan"
                  dark={isToday}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
