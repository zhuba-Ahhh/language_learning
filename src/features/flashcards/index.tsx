/** 闪卡功能入口，组合语言筛选、卡组选择与答题界面。 */
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import { useState } from 'react';
import FlipCard from './components/FlipCard';
import LanguageFilter from '@/components/LanguageFilter';
import { REVIEW_ID, useFlashcardQueue } from './useFlashcardQueue';

export { REVIEW_ID } from './useFlashcardQueue';

export default function FlashcardsSection({
  initialDeckId,
  taskId,
  onComplete,
}: {
  initialDeckId?: string;
  taskId?: string;
  onComplete?: () => void;
} = {}) {
  const {
    deckId,
    setDeckId,
    unknownCards,
    isReview,
    deck,
    queue,
    round,
    current,
    totalCount,
    knownInDeck,
    doneCount,
    finished,
    answer,
    restart,
    progress,
    deckTitle,
    decks,
  } = useFlashcardQueue(initialDeckId, taskId);
  const [langFilter, setLangFilter] = useState<'all' | 'en' | 'ja'>('all');
  const visibleDecks = decks.filter(
    (d) => langFilter === 'all' || d.lang === langFilter,
  );

  const handleAnswer = (mark: 'known' | 'unknown') => {
    const completesDeck = mark === 'known' && queue.length === 1;
    answer(mark);
    if (completesDeck) onComplete?.();
  };

  return (
    <div className={styles.section}>
      <FeatureHeader title="翻一张卡"></FeatureHeader>

      {/* language filter */}
      <LanguageFilter
        options={
          [
            ['all', '全部'],
            ['en', '英语'],
            ['ja', '日语'],
          ] as const
        }
        value={langFilter}
        variant="segmented"
        onChange={(v) => {
          setLangFilter(v);
          const first = decks.find((d) => v === 'all' || d.lang === v)!;
          if (v !== 'all' && !isReview && deck!.lang !== v) setDeckId(first.id);
        }}
      />

      {/* deck chips */}
      <div className={`reveal ${styles.deckScroller}`}>
        <div className={styles.deckList}>
          {unknownCards.length > 0 && (
            <button
              onClick={() => setDeckId(REVIEW_ID)}
              className={`${styles.reviewChip} ${
                isReview ? styles.reviewSelected : styles.reviewIdle
              }`}
            >
              复习 · 不熟的词（{unknownCards.length}）
            </button>
          )}
          {visibleDecks.map((d) => (
            <button
              key={d.id}
              onClick={() => setDeckId(d.id)}
              className={`${styles.deckChip} ${
                d.id === deckId ? styles.deckSelected : styles.deckIdle
              }`}
            >
              {d.lang === 'ja' ? '日语' : '英语'} · {d.title}
            </button>
          ))}
        </div>
      </div>

      {/* progress */}
      <div className={`reveal ${styles.progress}`}>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className={styles.progressLabel}>
          {isReview
            ? `剩余 ${queue.length}/${totalCount}`
            : `已掌握 ${knownInDeck}/${totalCount}`}
        </span>
      </div>

      {/* card */}
      {finished ? (
        <div className={`pop-in ${styles.completion}`}>
          <p lang="ja" className={styles.congratulations}>
            よくできました！
          </p>
          <h2 className={styles.completionTitle}>
            {isReview ? '复习完成' : '本组全部掌握'}
          </h2>
          <p className={styles.description}>
            {isReview
              ? `${totalCount} 个不熟的词全部过了一遍。`
              : `「${deck!.title}」的 ${totalCount} 个单词全部标记为认识。`}
          </p>
          <button onClick={restart} className={styles.restart}>
            重新来过
          </button>
        </div>
      ) : (
        current && (
          <div
            key={`${deckId}-${round}-${current.word.id}`}
            className={styles.cardEntrance}
          >
            <FlipCard
              word={current.word}
              lang={current.lang}
              deckTitle={deckTitle}
              index={doneCount}
              total={totalCount}
            />
            <div className={styles.answers}>
              <button
                onClick={() => handleAnswer('unknown')}
                className={styles.unknown}
              >
                还不熟
              </button>
              <button
                onClick={() => handleAnswer('known')}
                className={styles.known}
              >
                认识了
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
