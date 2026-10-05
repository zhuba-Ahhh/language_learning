/** 闪卡正反面及朗读入口，样式与组件共置。 */
import { useEffect, useState } from 'react';
import type { Word } from '@/content/words';
import SpeakButton from '@/components/SpeakButton';
import styles from './index.module.css';

interface Props {
  word: Word;
  lang: 'en' | 'ja';
  deckTitle: string;
  index: number;
  total: number;
}

/** 3D flip flashcard — click / tap to flip. */
export default function FlipCard({ word, lang, deckTitle, index, total }: Props) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [word.id]);

  return (
    <button
      type="button"
      aria-label="点击翻面"
      onClick={() => setFlipped((f) => !f)}
      className={`${styles.scene} block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-aqua rounded-[2rem]`}
    >
      <div
        className={`${styles.inner} relative h-[340px] sm:h-[400px] ${flipped ? styles.flipped : ''}`}
      >
        {/* front */}
        <div className={`${styles.face} absolute inset-0 rounded-[2rem] bg-white soft-shadow-lg flex flex-col items-center justify-center px-6 overflow-hidden`}>
          <span className="absolute top-5 left-6 font-mono2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {deckTitle}
          </span>
          <span className="absolute top-5 right-6 font-mono2 text-[11px] tracking-widest text-muted-foreground">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span
            lang={lang === 'ja' ? 'ja' : undefined}
            className={`font-display text-ink text-center leading-tight ${
              lang === 'ja' ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-5xl'
            }`}
          >
            {word.term}
          </span>
          {word.reading && (
            <span className="mt-4 font-mono2 text-sm text-aqua">{word.reading}</span>
          )}
          <span className="mt-5">
            <SpeakButton
              text={word.term}
              lang={lang}
              className="bg-sand text-navy hover:bg-powder/60"
              size={44}
            />
          </span>
          <span className="absolute bottom-6 text-xs text-muted-foreground tracking-widest">
            轻点卡片翻面
          </span>
          <span className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-powder/30" />
        </div>

        {/* back */}
        <div className={`${styles.face} ${styles.back} absolute inset-0 rounded-[2rem] bg-navy text-white soft-shadow-lg flex flex-col justify-center px-7 sm:px-10 overflow-hidden`}>
          <span className="absolute top-5 left-6 font-mono2 text-[11px] uppercase tracking-[0.2em] text-powder">
            释义 · 例句
          </span>
          <p className="text-xl sm:text-2xl font-bold leading-snug">{word.meaning}</p>
          <div className="my-5 h-px w-16 bg-aqua" />
          <p
            lang={lang === 'ja' ? 'ja' : undefined}
            className="text-sm sm:text-base leading-relaxed text-white/90"
          >
            {word.example}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <p className="flex-1 text-xs sm:text-sm text-white/60">{word.exampleZh}</p>
            <SpeakButton
              text={word.example}
              lang={lang}
              className="bg-white/15 text-white hover:bg-white/25 shrink-0"
              size={36}
            />
          </div>
          <span className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-aqua/20" />
        </div>
      </div>
    </button>
  );
}
