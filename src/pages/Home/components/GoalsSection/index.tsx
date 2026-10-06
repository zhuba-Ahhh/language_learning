/** 选择当前学习目标；未接入的考试目标保持可见但不可选。 */
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import {
  LEARNING_GOALS,
  SKILL_LABELS,
  type LearningGoal,
} from '@/content/goals';
import { useLocalStorage } from '@/hooks/useLocalStorage';

function GoalContent({ goal, status }: { goal: LearningGoal; status: string }) {
  return (
    <>
      <span className={styles.meta}>
        <span className={styles.language}>
          {goal.language === 'en' ? 'EN' : 'JP'}
        </span>
        <span className={styles.status}>{status}</span>
      </span>
      <strong>{goal.title.replace(' Academic', '')}</strong>
      <span className={styles.subtitle}>{goal.subtitle}</span>
      <span className={styles.description}>{goal.description}</span>
      <span className={styles.skills}>
        {goal.skills.map((skill) => {
          const primary = skill === 'speaking' || skill === 'reading';
          return (
            <span
              key={skill}
              className={primary ? styles.primarySkill : styles.secondarySkill}
            >
              {SKILL_LABELS[skill]}
            </span>
          );
        })}
      </span>
      <span className={styles.footer}>
        <span>{goal.levels}</span>
        <span>{goal.note}</span>
      </span>
    </>
  );
}

export default function GoalsSection() {
  const [selectedGoal, setSelectedGoal] = useLocalStorage(
    'lingua.goal',
    'english-communication',
  );
  const availableGoals = LEARNING_GOALS.filter((goal) => goal.available);
  const upcomingGoals = LEARNING_GOALS.filter((goal) => !goal.available);

  return (
    <section className={styles.section}>
      <FeatureHeader title="你想去哪里？" />

      <div className={styles.group}>
        <h2>现在可用</h2>
        <div className={styles.goals}>
          {availableGoals.map((goal) => {
            const selected = selectedGoal === goal.id;
            return (
              <button
                key={goal.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedGoal(goal.id)}
                className={`${styles.goal} ${styles.selectable} ${selected ? styles.selected : ''}`}
              >
                <GoalContent
                  goal={goal}
                  status={selected ? '使用中' : '可切换'}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.group}>
        <h2>即将开放</h2>
        <div className={styles.goals}>
          {upcomingGoals.map((goal) => (
            <article
              key={goal.id}
              className={`${styles.goal} ${styles.upcoming}`}
            >
              <GoalContent goal={goal} status="待开放" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
