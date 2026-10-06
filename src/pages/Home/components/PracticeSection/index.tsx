/** 以口语和阅读为核心，聚合可复用练习能力与基础工具。 */
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import FlashcardsSection from '@/features/flashcards';
import KanaSection from '@/features/kana';
import ReadingSection from '@/features/reading';
import SpeakingSection from '@/features/speaking';
import VocabSection from '@/features/vocabulary';
import ReviewSection from '../ReviewSection';

export type PracticeView =
  'overview' | 'speak' | 'read' | 'cards' | 'vocab' | 'kana' | 'review';

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
      <FeatureHeader title="选一种方式开始" />

      <div className={styles.focusGrid}>
        <button
          type="button"
          onClick={() => onChange('speak')}
          className={`${styles.focusCard} ${styles.speaking}`}
        >
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <rect x="22" y="8" width="20" height="34" rx="10" />
            <path d="M14 31v2a18 18 0 0 0 36 0v-2M32 51v7M23 58h18" />
          </svg>
          <h2 className={styles.focusTitle}>口语</h2>
        </button>

        <button
          type="button"
          onClick={() => onChange('read')}
          className={`${styles.focusCard} ${styles.reading}`}
        >
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <path d="M8 13h17a7 7 0 0 1 7 7v33a9 9 0 0 0-8-5H8V13Z" />
            <path d="M56 13H39a7 7 0 0 0-7 7v33a9 9 0 0 1 8-5h16V13Z" />
          </svg>
          <h2 className={styles.focusTitle}>阅读</h2>
        </button>
      </div>

      <div className={styles.tools}>
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
