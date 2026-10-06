/** 搜索内置词库，展示共享学习状态中的掌握标记。 */
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import { useMemo, useState, type FormEvent } from 'react';
import { useStudy } from '@/study/useStudy';
import SpeakButton from '@/components/SpeakButton';
import LanguageFilter from '@/components/LanguageFilter';

export default function VocabSection() {
  const { decks, customWords, addCustomWord, removeCustomWord, marks } =
    useStudy();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'en' | 'ja'>('all');
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState('');
  const [draft, setDraft] = useState({
    lang: 'en' as 'en' | 'ja',
    term: '',
    meaning: '',
    reading: '',
  });
  const customIds = useMemo(
    () => new Set(customWords.map((word) => word.id)),
    [customWords],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return decks
      .filter((d) => filter === 'all' || d.lang === filter)
      .map((d) => ({
        deck: d,
        words: d.words.filter(
          (w) =>
            !q ||
            w.term.toLowerCase().includes(q) ||
            w.meaning.toLowerCase().includes(q) ||
            (w.reading ?? '').toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.words.length > 0);
  }, [decks, query, filter]);

  const submitWord = (event: FormEvent) => {
    event.preventDefault();
    const added = addCustomWord(draft);
    setNotice(added ? '已加入' : '这个词已经有了');
    if (added) {
      setDraft((current) => ({
        ...current,
        term: '',
        meaning: '',
        reading: '',
      }));
    }
  };

  return (
    <div className={styles.section}>
      <FeatureHeader title="查一个词"></FeatureHeader>

      <div className={`reveal ${styles.controls}`}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索"
          className={styles.search}
        />
        <LanguageFilter
          options={
            [
              ['all', '全部'],
              ['en', '英语'],
              ['ja', '日语'],
            ] as const
          }
          value={filter}
          onChange={setFilter}
          variant="chips"
        />
        <button
          type="button"
          onClick={() => {
            setAdding((value) => !value);
            setNotice('');
          }}
          className={styles.addToggle}
        >
          {adding ? '收起' : '加词'}
        </button>
      </div>

      {adding && (
        <form className={`reveal ${styles.addForm}`} onSubmit={submitWord}>
          <LanguageFilter
            options={
              [
                ['en', '英语'],
                ['ja', '日语'],
              ] as const
            }
            value={draft.lang}
            onChange={(lang) => setDraft((current) => ({ ...current, lang }))}
            variant="chips"
          />
          <input
            required
            aria-label="词"
            placeholder="词"
            value={draft.term}
            onChange={(event) =>
              setDraft((current) => ({ ...current, term: event.target.value }))
            }
          />
          <input
            required
            aria-label="释义"
            placeholder="释义"
            value={draft.meaning}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                meaning: event.target.value,
              }))
            }
          />
          <input
            aria-label="读音"
            placeholder="读音（可选）"
            value={draft.reading}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                reading: event.target.value,
              }))
            }
          />
          <button type="submit">加入</button>
          {notice && <span className={styles.notice}>{notice}</span>}
        </form>
      )}

      {rows.length === 0 && (
        <p className={`reveal ${styles.empty}`}>没有结果</p>
      )}

      {rows.map(({ deck, words }) => (
        <section key={deck.id} className={`reveal ${styles.deck}`}>
          <div className={styles.deckHeading}>
            <h2 className={styles.deckTitle}>
              {deck.lang === 'ja' ? '日语' : '英语'} · {deck.title}
            </h2>
            <span className={styles.count}>{words.length} 词</span>
          </div>
          <ul className={styles.words}>
            {words.map((w) => (
              <li key={w.id} className={styles.word}>
                <span
                  className={`${styles.status} ${
                    marks[w.id] === 'known' ? styles.known : styles.unknown
                  }`}
                />
                <div className={styles.content}>
                  <div className={styles.termHeading}>
                    <span
                      lang={deck.lang === 'ja' ? 'ja' : undefined}
                      className={styles.term}
                    >
                      {w.term}
                    </span>
                    {w.reading && (
                      <span className={styles.reading}>{w.reading}</span>
                    )}
                  </div>
                  <p className={styles.meaning}>{w.meaning}</p>
                </div>
                <SpeakButton
                  text={w.term}
                  lang={deck.lang}
                  audioUrl={w.audioUrl}
                  tone="muted"
                  size={32}
                />
                {customIds.has(w.id) && (
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => {
                      if (window.confirm(`移除“${w.term}”？`)) {
                        removeCustomWord(w.id);
                      }
                    }}
                  >
                    移除
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
