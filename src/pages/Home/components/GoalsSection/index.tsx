/** 以四张目标卡完成选择；考试目标保留但暂不可用。 */
import styles from './index.module.less';
import { LEARNING_GOALS } from '@/content/goals';
import { getCoursesForGoal } from '@/content/plan';
import { useStudy } from '@/study/useStudy';
import englishIcon from './icons/english-chat.svg';
import ieltsIcon from './icons/ielts-document.svg';
import japaneseIcon from './icons/japanese-torii.svg';
import jlptIcon from './icons/jlpt-sakura.svg';

const PRIMARY_GOAL_IDS = [
  'english-communication',
  'ielts-academic',
  'japanese-communication',
  'jlpt',
];

const GOAL_ICONS: Record<string, string> = {
  'english-communication': englishIcon,
  'ielts-academic': ieltsIcon,
  'japanese-communication': japaneseIcon,
  jlpt: jlptIcon,
};

export default function GoalsSection({ onConfirm }: { onConfirm: () => void }) {
  const { goalId, setGoal, course, setCourse } = useStudy();
  const goals = PRIMARY_GOAL_IDS.flatMap((id) => {
    const goal = LEARNING_GOALS.find((item) => item.id === id);
    return goal ? [goal] : [];
  });
  const courses = getCoursesForGoal(goalId);

  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <header className={`reveal ${styles.heading}`}>
          <h1>你想去哪里？</h1>
        </header>

        <div className={`reveal ${styles.goals}`}>
          {goals.map((goal) => {
            const selected = goalId === goal.id;
            const label = goal.title.replace(' Academic', '');
            return (
              <button
                key={goal.id}
                type="button"
                disabled={!goal.available}
                aria-label={`${label}${goal.available ? '' : '，待开放'}`}
                aria-pressed={selected}
                onClick={() => setGoal(goal.id)}
                className={`${styles.goal} ${selected ? styles.selected : ''} ${goal.available ? styles.available : styles.unavailable}`}
              >
                {selected && (
                  <>
                    <span className={styles.bookmark} aria-hidden="true" />
                    <span className={styles.status}>使用中</span>
                  </>
                )}
                <img src={GOAL_ICONS[goal.id]} alt="" aria-hidden="true" />
                <strong>{label}</strong>
              </button>
            );
          })}
        </div>

        {courses.length > 1 && (
          <div className={styles.coursePicker} aria-label="当前课程">
            {courses.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === course.id}
                onClick={() => setCourse(item.id)}
              >
                {item.levelTitle}
              </button>
            ))}
          </div>
        )}

        <button type="button" className={styles.confirm} onClick={onConfirm}>
          选好了
        </button>
      </div>
    </section>
  );
}
