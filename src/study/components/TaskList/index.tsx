/** 今日与计划共享的任务列表，完成状态与切换操作由上层管理。 */
import styles from './index.module.less';
import type { PlanTask } from '@/content/plan';

interface Props {
  tasks: PlanTask[];
  done: readonly number[];
  onToggle: (index: number) => void;
  variant: 'today' | 'plan';
  dark?: boolean;
}

export default function TaskList({
  tasks,
  done,
  onToggle,
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
      {tasks.map((task, i) => {
        const checked = done.includes(i);
        return (
          <li key={i}>
            <button
              type="button"
              onClick={() => onToggle(i)}
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
          </li>
        );
      })}
    </ul>
  );
}
