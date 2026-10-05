/** 今日与计划共享的任务列表，完成状态与切换操作由上层管理。 */
import styles from './index.module.less';
import type { PlanTask } from '@/content/plan';

interface Props {
  tasks: PlanTask[];
  done: readonly string[];
  onToggle: (taskId: string) => void;
  onStart?: (task: PlanTask) => void;
  variant: 'today' | 'plan';
  dark?: boolean;
}

export default function TaskList({
  tasks,
  done,
  onToggle,
  onStart,
  variant,
  dark = false,
}: Props) {
  const today = variant === 'today';
  const iconSize = today ? 12 : 10;
  return (
    <ul
      className={
        today
          ? styles.today
          : `${styles.plan} ${dark ? styles.darkBorder : styles.lightBorder}`
      }
    >
      {tasks.map((task) => {
        const checked = done.includes(task.id);
        return (
          <li key={task.id} className={styles.taskRow}>
            <button
              type="button"
              onClick={() => onToggle(task.id)}
              className={today ? styles.todayButton : styles.planButton}
            >
              <span
                className={`${styles.checkbox} ${
                  today ? styles.todayCheckbox : styles.planCheckbox
                } ${
                  checked
                    ? `pop-in ${styles.checked}`
                    : today
                      ? styles.todayUnchecked
                      : dark
                        ? styles.darkUnchecked
                        : styles.lightUnchecked
                }`}
              >
                {checked && (
                  <svg
                    width={iconSize}
                    height={iconSize}
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6.5 4.8 9 10 3"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span
                className={`${styles.text} ${
                  today ? styles.todayText : styles.planText
                } ${
                  checked
                    ? today
                      ? styles.todayDone
                      : styles.planDone
                    : today
                      ? styles.todayPending
                      : dark
                        ? styles.darkPending
                        : styles.lightPending
                }`}
              >
                {task.text}
              </span>
              <span
                className={`${styles.duration} ${
                  today
                    ? styles.todayDuration
                    : `${styles.planDuration} ${dark ? styles.darkDuration : styles.lightDuration}`
                }`}
              >
                {task.minutes}min
              </span>
            </button>
            {onStart && (
              <button
                type="button"
                onClick={() => onStart(task)}
                className={styles.start}
                aria-label={`开始：${task.text}`}
              >
                开始
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
