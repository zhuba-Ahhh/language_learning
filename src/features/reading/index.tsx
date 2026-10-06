/** 按语言与难度展示内置阅读资源。 */
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import { READING_GROUPS } from '@/content/reading';

const LEVEL_STYLE: Record<number, { label: string; cls: string }> = {
  1: { label: '入门', cls: styles.beginner },
  2: { label: '进阶', cls: styles.intermediate },
  3: { label: '高级', cls: styles.advanced },
};

export default function ReadingSection() {
  return (
    <div className={styles.section}>
      <FeatureHeader title="慢慢读懂"></FeatureHeader>

      {READING_GROUPS.map((g) => (
        <section key={g.id} className="reveal">
          <div className={styles.groupHeading}>
            <h2 className={styles.groupTitle}>{g.title}</h2>
            <span className={styles.subtitle}>
              {g.lang === 'ja' ? '日语' : '英语'}
            </span>
          </div>
          <ul className={styles.resources}>
            {g.resources.map((r) => (
              <li key={r.name}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.resource}
                >
                  <div className={styles.content}>
                    <div className={styles.resourceHeading}>
                      <span className={styles.name}>{r.name}</span>
                      <span
                        className={`${styles.level} ${LEVEL_STYLE[r.level].cls}`}
                      >
                        {LEVEL_STYLE[r.level].label}
                      </span>
                    </div>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={styles.arrow}
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
