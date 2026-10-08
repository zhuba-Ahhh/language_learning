import type { Language, TrainingWord } from '@/content/training';
import SpeakButton from '@/components/SpeakButton';
import styles from '../index.module.less';

export default function WordDetails({
  word,
  lang,
}: {
  word: TrainingWord;
  lang: Language;
}) {
  return (
    <>
      {(word.partOfSpeech || word.lemma) && (
        <div className={styles.wordFacts}>
          {word.partOfSpeech && <span>{word.partOfSpeech}</span>}
          {word.lemma && (
            <span>
              原形 <strong lang={lang}>{word.lemma}</strong>
            </span>
          )}
        </div>
      )}
      {word.note && <p className={styles.wordNote}>{word.note}</p>}
      {word.example && (
        <details className={styles.wordExample}>
          <summary>例句</summary>
          <p lang={lang}>{word.example}</p>
          {word.exampleZh && <small>{word.exampleZh}</small>}
          <SpeakButton
            text={word.example}
            lang={lang}
            label="听例句"
            size={30}
          />
        </details>
      )}
    </>
  );
}
