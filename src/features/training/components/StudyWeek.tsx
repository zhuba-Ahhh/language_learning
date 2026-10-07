import { useTraining } from '@/study/trainingContext';
import TrainingIcon from '@/components/TrainingIcon';
import styles from '../index.module.less';
export default function StudyWeek() {
  const { data, now } = useTraining();
  const start = new Date(now);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const dates = new Set(
    data.results
      .filter((result) => result.lang === data.language)
      .map((result) => new Date(result.completedAt).toDateString()),
  );
  return (
    <section className={styles.studyWeek} aria-label="本周学习记录">
      <h2>本周</h2>
      <div>
        {['一', '二', '三', '四', '五', '六', '日'].map((label, index) => {
          const date = new Date(start);
          date.setDate(start.getDate() + index);
          const active = dates.has(date.toDateString());
          const today = date.toDateString() === new Date(now).toDateString();
          return (
            <div key={label}>
              <span
                className={`${active ? styles.dayActive : ''} ${today ? styles.dayToday : ''}`}
                aria-current={today ? 'date' : undefined}
                aria-label={`${date.toLocaleDateString('zh-CN')} ${active ? '已练习' : '未练习'}`}
              >
                {active ? (
                  <TrainingIcon name="check" size={16} />
                ) : (
                  date.getDate()
                )}
              </span>
              <small>{label}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}
