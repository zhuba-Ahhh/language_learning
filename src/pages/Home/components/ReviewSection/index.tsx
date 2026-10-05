/** 汇总到期或未掌握内容；当前先接入已有的不熟词队列。 */
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import FlashcardsSection, { REVIEW_ID } from '@/features/flashcards';
import { useStudy } from '@/study/useStudy';

export default function ReviewSection({ onBrowse }: { onBrowse: () => void }) {
  const { marks } = useStudy();
  const unknownCount = Object.values(marks).filter(
    (mark) => mark === 'unknown',
  ).length;

  if (unknownCount > 0) {
    return <FlashcardsSection initialDeckId={REVIEW_ID} />;
  }

  return (
    <section className={styles.section}>
      <FeatureHeader
        eyebrow="Review"
        title="复习"
        description={<>需要再练的词和错题会集中出现在这里。</>}
      />
      <div className={styles.empty}>
        <p className={styles.title}>目前没有待复习内容</p>
        <p className={styles.description}>
          在闪卡中标记“还不熟”的单词后，就会自动加入复习。
        </p>
        <button type="button" onClick={onBrowse} className={styles.action}>
          去学习闪卡
        </button>
      </div>
    </section>
  );
}
