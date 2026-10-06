/** 汇总到期或未掌握内容；当前先接入已有的不熟词队列。 */
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import FlashcardsSection, { REVIEW_ID } from '@/features/flashcards';
import { useStudy } from '@/study/useStudy';

export default function ReviewSection({
  onBrowse,
  onComplete,
}: {
  onBrowse: () => void;
  onComplete?: () => void;
}) {
  const { marks } = useStudy();
  const unknownCount = Object.values(marks).filter(
    (mark) => mark === 'unknown',
  ).length;

  if (unknownCount > 0) {
    return (
      <FlashcardsSection initialDeckId={REVIEW_ID} onComplete={onComplete} />
    );
  }

  return (
    <section className={styles.section}>
      <FeatureHeader title="今天到这里。" />
      <div className={styles.empty}>
        <p className={styles.title}>没有待复习内容</p>
        <button type="button" onClick={onBrowse} className={styles.action}>
          看闪卡
        </button>
      </div>
    </section>
  );
}
