import { useState } from 'react';
import { LESSONS } from '@/content/training';
import { VOCABULARY, lookupVocabulary } from '@/content/vocabulary';
import { vocabularyKey } from '@/content/vocabularyIndex';
import { useTraining } from '@/study/trainingContext';
import SpeakButton from '@/components/SpeakButton';
import TrainingIcon from '@/components/TrainingIcon';
import PageHeading from '../components/PageHeading';
import InteractiveReader from '../components/InteractiveReader';
import WordDetails from '../components/WordDetails';
import type { TrainingSelection } from '../types';
import styles from '../index.module.less';

export default function WordBank({
  onBack,
  onOpen,
}: {
  onBack: () => void;
  onOpen: (selection: TrainingSelection) => void;
}) {
  const { data, addVocabularyWord } = useTraining();
  const [query, setQuery] = useState('');
  const [onlySaved, setOnlySaved] = useState(true);
  const [selected, setSelected] = useState('');
  const words = onlySaved
    ? data.savedWords
        .filter((word) => word.lang === data.language)
        .map((word) => ({
          ...lookupVocabulary(word.term, word.lang),
          ...word,
          origin:
            LESSONS.find((lesson) => lesson.id === word.lessonId)?.title ??
            lookupVocabulary(word.term, word.lang)?.origin ??
            '我的词',
        }))
    : VOCABULARY.filter((word) => word.lang === data.language);
  const filtered = words.filter((word) =>
    `${word.term} ${word.meaning} ${word.reading ?? ''} ${word.lemma ?? ''} ${(word.forms ?? []).join(' ')}`
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase()),
  );
  const word = filtered.find((word) => word.term === selected) ?? filtered[0];
  const lesson =
    word &&
    LESSONS.find(
      (lesson) =>
        lesson.lang === data.language &&
        lesson.id === word.lessonId &&
        lesson.words.some((item) => item.term === word.term),
    );
  const entry = lesson?.words.find((item) => item.term === word?.term);
  const context = lesson?.paragraphs.find((paragraph) =>
    [
      word!.term,
      ...(lesson.marks ?? [])
        .filter((mark) => mark.wordId === entry?.id)
        .map((mark) => mark.text),
    ].some((term) =>
      paragraph.text.toLocaleLowerCase().includes(term.toLocaleLowerCase()),
    ),
  );
  const saved =
    word &&
    data.savedWords.some(
      (item) =>
        vocabularyKey(item.term, item.lang) ===
        vocabularyKey(word.term, data.language),
    );
  return (
    <div>
      <button type="button" className={styles.back} onClick={onBack}>
        ‹ 复习
      </button>
      <PageHeading title="词库" />
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
        <label className={styles.searchField}>
          <TrainingIcon name="search" size={19} />
          <input
            type="search"
            aria-label="搜索词汇"
            placeholder="搜词、读音或释义"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      {word ? (
        <div className={styles.wordBankLayout}>
          <div className={styles.wordList} aria-label="词汇列表">
            {filtered.map((item) => (
              <div
                key={item.id + item.origin}
                aria-current={word.term === item.term ? 'true' : undefined}
              >
                <button
                  type="button"
                  aria-pressed={word.term === item.term}
                  onClick={() => setSelected(item.term)}
                >
                  <strong lang={data.language}>{item.term}</strong>
                  <small>{item.meaning}</small>
                </button>
                <SpeakButton
                  text={item.term}
                  lang={data.language}
                  size={34}
                  tone="muted"
                />
              </div>
            ))}
          </div>
          <section className={styles.wordDetail} aria-label="词汇详情">
            <div className={styles.exerciseMeta}>
              <span>{word.origin}</span>
              <span>
                {saved ? '已收藏' : data.language === 'en' ? 'EN' : 'JP'}
              </span>
            </div>
            <h2 lang={data.language}>{word.term}</h2>
            {word.reading && <small>{word.reading}</small>}
            <SpeakButton text={word.term} lang={data.language} size={40} />
            <p>{word.meaning}</p>
            <WordDetails word={word} lang={data.language} />
            {context && lesson && (
              <div className={styles.wordContext}>
                <small>原文</small>
                <InteractiveReader text={context.text} lesson={lesson} />
                <button
                  type="button"
                  onClick={() =>
                    onOpen({ lessonId: lesson.id, skill: 'reading' })
                  }
                >
                  查看原文 →
                </button>
              </div>
            )}
            {lookupVocabulary(word.term, data.language) && (
              <button
                type="button"
                className={styles.primary}
                disabled={!!saved}
                onClick={() =>
                  addVocabularyWord(lookupVocabulary(word.term, data.language)!)
                }
              >
                <TrainingIcon name="bookmark" size={17} />
                {saved ? '已加入复习' : '加入复习'}
              </button>
            )}
          </section>
        </div>
      ) : (
        <div className={styles.empty}>
          <p>{onlySaved ? '暂无收藏词' : '没有匹配的词'}</p>
          {onlySaved && (
            <button
              type="button"
              className={styles.primary}
              onClick={() => setOnlySaved(false)}
            >
              查看内置词库
            </button>
          )}
        </div>
      )}
    </div>
  );
}
