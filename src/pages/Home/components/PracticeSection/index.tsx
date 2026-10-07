/** 以口语和阅读为核心，聚合可复用练习能力与基础工具。 */
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import type { PlanTask } from '@/content/plan';
import FlashcardsSection from '@/features/flashcards';
import KanaSection from '@/features/kana';
import ReadingSection from '@/features/reading';
import SpeakingSection from '@/features/speaking';
import VocabSection from '@/features/vocabulary';
import ReviewSection from '../ReviewSection';
import flashcardsIcon from './icons/flashcards.svg';
import kanaIcon from './icons/kana.svg';
import readingIcon from './icons/reading.svg';
import reviewIcon from './icons/review.svg';
import speakingIcon from './icons/speaking.svg';
import vocabularyIcon from './icons/vocabulary.svg';

export type PracticeView =
  'overview' | 'speak' | 'read' | 'cards' | 'vocab' | 'kana' | 'review';

const tools = [
  ['cards', '闪卡', flashcardsIcon],
  ['vocab', '词库', vocabularyIcon],
  ['kana', '假名', kanaIcon],
  ['review', '复习', reviewIcon],
] as const;

export default function PracticeSection({
  view,
  onChange,
  task,
  onActivityComplete,
}: {
  view: PracticeView;
  onChange: (view: PracticeView) => void;
  task?: PlanTask;
  onActivityComplete?: () => void;
}) {
  if (view === 'speak') {
    return <SpeakingSection task={task} onComplete={onActivityComplete} />;
  }
  if (view === 'read')
    return <ReadingSection task={task} onComplete={onActivityComplete} />;
  if (view === 'cards') {
    return (
      <FlashcardsSection taskId={task?.id} onComplete={onActivityComplete} />
    );
  }
  if (view === 'vocab') return <VocabSection />;
  if (view === 'kana') {
    return <KanaSection taskId={task?.id} onComplete={onActivityComplete} />;
  }
  if (view === 'review') {
    return (
      <ReviewSection
        onBrowse={() => onChange('cards')}
        taskId={task?.id}
        onComplete={onActivityComplete}
      />
    );
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
          <span className={styles.focusIcon}>
            <img src={speakingIcon} alt="" aria-hidden="true" />
          </span>
          <h2 className={styles.focusTitle}>口语</h2>
        </button>

        <button
          type="button"
          onClick={() => onChange('read')}
          className={`${styles.focusCard} ${styles.reading}`}
        >
          <span className={styles.focusIcon}>
            <img src={readingIcon} alt="" aria-hidden="true" />
          </span>
          <h2 className={styles.focusTitle}>阅读</h2>
        </button>
      </div>

      <div className={styles.tools}>
        <div className={styles.toolActions}>
          {tools.map(([id, label, icon]) => (
            <button key={id} type="button" onClick={() => onChange(id)}>
              <img src={icon} alt="" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
