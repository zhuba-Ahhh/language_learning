/** 闪卡正反面及朗读入口，样式与组件共置。 */
import { useState } from 'react';
import type { Word } from '@/content/words';
import SpeakButton from '@/components/SpeakButton';
import styles from './index.module.less';

interface Props {
  word: Word;
  lang: 'en' | 'ja';
  deckTitle: string;
  index: number;
  total: number;
}

/** 3D flip flashcard — click / tap to flip. */
export default function FlipCard({
  word,
  lang,
  deckTitle,
  index,
  total,
}: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className={styles.scene}>
      <button
        type="button"
        aria-label="点击翻面"
        aria-pressed={flipped}
        onClick={() => setFlipped((f) => !f)}
        className={styles.flipTrigger}
      />
      <div className={`${styles.inner} ${flipped ? styles.flipped : ''}`}>
        {/* front */}
        <div className={`${styles.face} ${styles.front}`} inert={flipped}>
          <span className={styles.deckLabel}>{deckTitle}</span>
          <span className={styles.counter}>
            {String(index + 1).padStart(2, '0')} /{' '}
            {String(total).padStart(2, '0')}
          </span>
          <span
            lang={lang === 'ja' ? 'ja' : undefined}
            className={`${styles.term} ${
              lang === 'ja' ? styles.japanese : styles.english
            }`}
          >
            {word.term}
          </span>
          {word.reading && (
            <span className={styles.reading}>{word.reading}</span>
          )}
          <span className={styles.speakWrap}>
            <SpeakButton
              text={word.term}
              lang={lang}
              audioUrl={word.audioUrl}
              size={44}
            />
          </span>
          <span className={styles.hint}>轻点卡片翻面</span>
          <span className={styles.frontOrb} />
        </div>

        {/* back */}
        <div className={`${styles.face} ${styles.back}`} inert={!flipped}>
          <span className={styles.backLabel}>释义 · 例句</span>
          <p className={styles.meaning}>{word.meaning}</p>
          <div className={styles.divider} />
          <p lang={lang === 'ja' ? 'ja' : undefined} className={styles.example}>
            {word.example}
          </p>
          <div className={styles.translationRow}>
            <p className={styles.translation}>{word.exampleZh}</p>
            <SpeakButton
              text={word.example}
              lang={lang}
              tone="dark"
              size={36}
            />
          </div>
          <span className={styles.backOrb} />
        </div>
      </div>
    </div>
  );
}
