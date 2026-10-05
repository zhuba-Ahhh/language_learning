/** 以口语和阅读为核心，聚合可复用练习能力与基础工具。 */
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import FlashcardsSection from '@/features/flashcards';
import KanaSection from '@/features/kana';
import ReadingSection from '@/features/reading';
import SpeakingSection from '@/features/speaking';
import VocabSection from '@/features/vocabulary';
import { READING_GROUPS } from '@/content/reading';
import { SCENARIOS } from '@/content/speaking';
import ReviewSection from '../ReviewSection';

export type PracticeView =
  'overview' | 'speak' | 'read' | 'cards' | 'vocab' | 'kana' | 'review';

const READING_COUNT = READING_GROUPS.reduce(
  (count, group) => count + group.resources.length,
  0,
);

export default function PracticeSection({
  view,
  onChange,
}: {
  view: PracticeView;
  onChange: (view: PracticeView) => void;
}) {
  if (view === 'speak') return <SpeakingSection />;
  if (view === 'read') return <ReadingSection />;
  if (view === 'cards') return <FlashcardsSection />;
  if (view === 'vocab') return <VocabSection />;
  if (view === 'kana') return <KanaSection />;
  if (view === 'review') {
    return <ReviewSection onBrowse={() => onChange('cards')} />;
  }

  return (
    <section className={styles.section}>
      <FeatureHeader
        eyebrow="Practice"
        title="练习"
        description={<>先练表达与理解，再用基础工具补齐词汇和文字。</>}
      />

      <div className={styles.focusGrid}>
        <article className={styles.speaking}>
          <p className={styles.sequence}>表达</p>
          <h2 className={styles.focusTitle}>口语</h2>
          <p className={styles.focusDescription}>
            场景跟读、复述和自由表达。后续 IELTS 口语也复用这套录音与反馈能力。
          </p>
          <p className={styles.meta}>{SCENARIOS.length} 个现有场景</p>
          <button
            type="button"
            onClick={() => onChange('speak')}
            className={styles.lightAction}
          >
            开始口语练习
          </button>
        </article>

        <article className={styles.reading}>
          <p className={styles.sequence}>理解</p>
          <h2 className={styles.focusTitle}>阅读</h2>
          <p className={styles.focusDescription}>
            从分级资源进入精读、查词和题目训练，为 IELTS 阅读和 JLPT
            读解提供共同基础。
          </p>
          <p className={styles.meta}>{READING_COUNT} 个现有资源</p>
          <button
            type="button"
            onClick={() => onChange('read')}
            className={styles.darkAction}
          >
            浏览阅读材料
          </button>
        </article>
      </div>

      <div className={styles.tools}>
        <div>
          <h2 className={styles.toolsTitle}>基础工具</h2>
          <p className={styles.toolsDescription}>需要时使用，不打断主练习。</p>
        </div>
        <div className={styles.toolActions}>
          {(
            [
              ['cards', '闪卡'],
              ['vocab', '词库'],
              ['kana', '假名'],
              ['review', '复习'],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" onClick={() => onChange(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
