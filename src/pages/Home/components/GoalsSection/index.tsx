/** 选择当前学习目标；未接入的考试目标保持可见但不可选。 */
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import { LEARNING_GOALS } from '@/content/goals';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function GoalsSection() {
  const [selectedGoal, setSelectedGoal] = useLocalStorage(
    'lingua.goal',
    'english-communication',
  );

  return (
    <section className={styles.section}>
      <FeatureHeader title="你想去哪里？" />

      <div className={styles.goals}>
        {LEARNING_GOALS.map((goal) => {
          const selected = selectedGoal === goal.id;
          return (
            <button
              key={goal.id}
              type="button"
              disabled={!goal.available}
              onClick={() => setSelectedGoal(goal.id)}
              className={`${styles.goal} ${selected ? styles.selected : ''}`}
            >
              <span className={styles.language}>
                {goal.language === 'en' ? 'EN' : 'JP'}
              </span>
              <strong>{goal.title.replace(' Academic', '')}</strong>
              <small>
                {selected
                  ? '使用中'
                  : goal.available
                    ? goal.subtitle
                    : '待开放'}
              </small>
            </button>
          );
        })}
      </div>
    </section>
  );
}
