/** 展示 30 天计划与打卡统计，复用共享任务列表。 */
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import { useRef, useState, type ChangeEvent } from 'react';
import { FOCUS_LABEL } from '@/content/plan';
import { useStudy } from '@/study/useStudy';
import TaskList from '@/study/components/TaskList';
import Heatmap from './components/Heatmap';

const FOCUS_DOT: Record<string, string> = {
  EN: styles.english,
  JP: styles.japanese,
  RV: styles.review,
};

export default function PlanSection() {
  const {
    plan,
    currentPlanDay,
    checks,
    toggleTask,
    checkins,
    streak,
    resetAll,
    goalId,
    sessions,
    exportData,
    importData,
  } = useStudy();
  const [openDay, setOpenDay] = useState<number>(currentPlanDay.day);
  const [transferStatus, setTransferStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const completedDays = plan.filter(
    (p) => (checks[p.day] ?? []).length === p.tasks.length,
  ).length;
  const recentSessions = sessions
    .filter((session) => session.goalId === goalId)
    .slice(0, 5);

  const downloadData = () => {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `linguadesk-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setTransferStatus('已导出');
  };

  const loadData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const value: unknown = JSON.parse(await file.text());
      if (!window.confirm('导入会覆盖当前学习记录，继续吗？')) return;
      setTransferStatus(importData(value) ? '已导入' : '文件格式不正确');
    } catch {
      setTransferStatus('文件格式不正确');
    }
  };

  return (
    <div className={styles.section}>
      <FeatureHeader title="正在变得熟悉">
        <div className={styles.headerActions}>
          <button type="button" onClick={downloadData}>
            导出
          </button>
          <button type="button" onClick={() => fileRef.current?.click()}>
            导入
          </button>
          <button
            type="button"
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
            重新开始
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={loadData}
            className={styles.fileInput}
          />
          {transferStatus && <span>{transferStatus}</span>}
        </div>
      </FeatureHeader>

      <div className={`reveal ${styles.stats}`}>
        <Heatmap checkins={checkins} />
        <div className={styles.summary}>
          <div className={styles.metric}>
            <span>{streak}</span>
            <small>连续</small>
          </div>
          <div className={styles.metric}>
            <span>{completedDays}</span>
            <small>完成</small>
          </div>
        </div>
      </div>

      {recentSessions.length > 0 && (
        <section className={`reveal ${styles.history}`}>
          <h2>最近完成</h2>
          <ul>
            {recentSessions.map((session) => (
              <li key={session.id}>
                <span>{session.title}</span>
                <time dateTime={session.completedAt}>
                  {new Date(session.completedAt).toLocaleDateString('zh-CN', {
                    month: 'numeric',
                    day: 'numeric',
                  })}
                </time>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className={`reveal ${styles.days}`}>
        {plan.map((p, index) => {
          const done = checks[p.day] ?? [];
          const complete = done.length === p.tasks.length;
          const isToday = p.day === currentPlanDay.day;
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
                  D{String(index + 1).padStart(2, '0')}
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
