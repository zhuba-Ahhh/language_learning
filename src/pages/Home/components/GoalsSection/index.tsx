/** 展示可复用学习目标及当前内容覆盖范围。 */
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import { LEARNING_GOALS, SKILL_LABELS } from '@/content/goals';

export default function GoalsSection() {
  return (
    <section className={styles.section}>
      <FeatureHeader
        eyebrow="Goals"
        title="学习目标"
        description={
          <>目标定义内容范围和训练规则；口语与阅读练习可以被不同目标复用。</>
        }
      />

      <div className={styles.groups}>
        {(['en', 'ja'] as const).map((language) => (
          <section key={language} className={styles.group}>
            <div className={styles.language}>
              <span>{language === 'en' ? '英语' : '日语'}</span>
              <small>{language === 'en' ? 'English' : '日本語'}</small>
            </div>
            <div className={styles.goalList}>
              {LEARNING_GOALS.filter((goal) => goal.language === language).map(
                (goal) => (
                  <article key={goal.id} className={styles.goal}>
                    <div className={styles.goalHeading}>
                      <div>
                        <h2>{goal.title}</h2>
                        <p>{goal.subtitle}</p>
                      </div>
                      <span
                        className={
                          goal.available ? styles.available : styles.planned
                        }
                      >
                        {goal.available ? '基础内容可用' : '专项待接入'}
                      </span>
                    </div>
                    <p className={styles.description}>{goal.description}</p>
                    <div className={styles.details}>
                      <span>{goal.levels}</span>
                      <span>
                        {goal.skills
                          .map((skill) => SKILL_LABELS[skill])
                          .join('、')}
                      </span>
                    </div>
                    <p className={styles.note}>{goal.note}</p>
                  </article>
                ),
              )}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
