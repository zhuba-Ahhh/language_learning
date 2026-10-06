/** 搜索内置词库，展示共享学习状态中的掌握标记。 */
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import { useMemo, useState } from 'react';
import { DECKS } from '@/content/words';
import { useStudy } from '@/study/useStudy';
import SpeakButton from '@/components/SpeakButton';
import LanguageFilter from '@/components/LanguageFilter';

export default function VocabSection() {
  const { marks } = useStudy();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'en' | 'ja'>('all');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DECKS.filter((d) => filter === 'all' || d.lang === filter)
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
  }, [query, filter]);

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
      </div>

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
                  tone="muted"
                  size={32}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
