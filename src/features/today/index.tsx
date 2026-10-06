/** 只保留今天真正需要完成的任务。 */
import styles from './index.module.less';
import { FOCUS_LABEL, type PlanTask } from '@/content/plan';
import { useStudy } from '@/study/useStudy';
import TaskList from '@/study/components/TaskList';

export default function TodaySection({
  onStartTask,
}: {
  onStartTask: (task: PlanTask, day: number, total: number) => void;
}) {
  const { currentPlanDay: plan, checks, toggleTask } = useStudy();
  const done = new Set(checks[plan.day] ?? []);
  const percent = plan.tasks.length ? done.size / plan.tasks.length : 0;
  const totalMinutes = plan.tasks.reduce((sum, task) => sum + task.minutes, 0);

  const today = new Date();
  const dateLabel = `${today.getMonth() + 1}月${today.getDate()}日`;
  const weekLabel = ['日', '一', '二', '三', '四', '五', '六'][today.getDay()];

  return (
    <div className={styles.section}>
      <section className={`reveal ${styles.hero}`}>
        <span className={styles.bookmark} aria-hidden="true" />
        <div className={styles.heroHeading}>
          <div>
            <p className={styles.date}>
              {dateLabel} · 星期{weekLabel} · {FOCUS_LABEL[plan.focus]}
            </p>
            <h1 className={styles.title}>今天，练一点。</h1>
          </div>
          <p className={styles.minutes}>{totalMinutes} 分钟</p>
        </div>
        <div className={styles.taskHeading}>
          <h2 className={styles.taskTitle}>{plan.title}</h2>
          <span className={styles.progress}>
            {done.size} / {plan.tasks.length}
          </span>
        </div>

        <TaskList
          tasks={plan.tasks}
          done={checks[plan.day] ?? []}
          onToggle={(taskId) => toggleTask(plan.day, taskId, plan.tasks.length)}
          onStart={(task) => onStartTask(task, plan.day, plan.tasks.length)}
          variant="today"
        />

        {percent === 1 && (
          <p className={`pop-in ${styles.completed}`}>今天到这里。</p>
        )}
      </section>
    </div>
  );
}
