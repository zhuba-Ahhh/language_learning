import { useState } from 'react';
import { DECKS } from '@/content/words';
import { LESSONS } from '@/content/training';
import { useTraining } from '@/study/trainingContext';
import SpeakButton from '@/components/SpeakButton';
import styles from '../index.module.less';

export default function WordBank({ onBack }: { onBack: () => void }) {
  const { data } = useTraining();
  const [query, setQuery] = useState('');
  const [onlySaved, setOnlySaved] = useState(true);
  const builtIn = [
    ...DECKS.filter((deck) => deck.lang === data.language).flatMap((deck) =>
      deck.words.map((word) => ({ ...word, origin: deck.title })),
    ),
    ...LESSONS.filter((lesson) => lesson.lang === data.language).flatMap(
      (lesson) =>
        lesson.words.map((word) => ({ ...word, origin: lesson.title })),
    ),
  ];
  const unique = [
    ...new Map(
      builtIn.map((word) => [word.term.toLocaleLowerCase(), word]),
    ).values(),
  ];
  const words = onlySaved
    ? data.savedWords
        .filter((word) => word.lang === data.language)
        .map((word) => ({
          ...word,
          origin:
            LESSONS.find((lesson) => lesson.id === word.lessonId)?.title ??
            '我的词',
        }))
    : unique;
  const filtered = words.filter((word) =>
    `${word.term} ${word.meaning} ${word.reading ?? ''}`
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase()),
  );
  return (
    <div>
      <button type="button" className={styles.back} onClick={onBack}>
        ‹ 复习
      </button>
      <div className={styles.pageHeading}>
        <h1>查一个词，带走一句。</h1>
        <p>阅读里收藏的词会保留来源，并安排复习。</p>
      </div>
      <div className={styles.libraryToolbar}>
        <div className={styles.filters}>
          <button
            type="button"
            aria-pressed={onlySaved}
            onClick={() => setOnlySaved(true)}
          >
            我的词
          </button>
          <button
            type="button"
            aria-pressed={!onlySaved}
            onClick={() => setOnlySaved(false)}
          >
            内置词库
          </button>
        </div>
        <input
          type="search"
          aria-label="搜索词汇"
          placeholder="词、读音或释义"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className={styles.wordBank}>
        {filtered.map((word) => (
          <div key={word.id + word.origin}>
            <div>
              <strong lang={data.language}>{word.term}</strong>
              {word.reading && <small>{word.reading}</small>}
              <p>{word.meaning}</p>
              <small>{word.origin}</small>
            </div>
            <SpeakButton
              text={word.term}
              lang={data.language}
              size={34}
              tone="muted"
            />
          </div>
        ))}
      </div>
      {!filtered.length && (
        <p className={styles.empty}>
          {onlySaved
            ? '还没有收藏的词。阅读时点一下生词，就能带到这里。'
            : '没有匹配的词。'}
        </p>
      )}
    </div>
  );
}
