/** 搜索内置词库，展示共享学习状态中的掌握标记。 */
import { useMemo, useState } from 'react';
import { DECKS } from '@/content/words';
import { useStudy } from '@/study/useStudyState';
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
            (w.reading ?? '').toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.words.length > 0);
  }, [query, filter]);

  return (
    <div className="space-y-6">
      <header className="reveal">
        <p className="font-mono2 text-[11px] uppercase tracking-[0.3em] text-aqua">Vocabulary</p>
        <h1 className="font-display mt-2 text-3xl sm:text-5xl text-ink">词库总览</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          圆点亮起 = 已在闪卡中标记为「认识」。
        </p>
      </header>

      <div className="reveal flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索单词 / 释义 / 读音…"
          className="h-11 flex-1 rounded-full border border-border bg-white px-5 text-sm outline-none transition focus:border-aqua focus:ring-2 focus:ring-aqua/30"
        />
        <LanguageFilter
          options={[['all', '全部'], ['en', '英语'], ['ja', '日语']] as const}
          value={filter}
          onChange={setFilter}
          variant="chips"
        />
      </div>

      {rows.length === 0 && (
        <p className="reveal rounded-[1.4rem] bg-white soft-shadow p-8 text-center text-sm text-muted-foreground">
          没有匹配的单词
        </p>
      )}

      {rows.map(({ deck, words }) => (
        <section key={deck.id} className="reveal overflow-hidden rounded-[1.4rem] bg-white soft-shadow">
          <div className="flex items-baseline justify-between px-5 sm:px-6 pt-5 pb-3">
            <h2 className="font-display text-lg text-ink">
              {deck.lang === 'ja' ? '日语' : '英语'} · {deck.title}
            </h2>
            <span className="font-mono2 text-[11px] text-muted-foreground">{words.length} 词</span>
          </div>
          <ul className="divide-y divide-border">
            {words.map((w) => (
              <li key={w.id} className="flex items-center gap-3 px-5 sm:px-6 py-3.5">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full transition-colors ${
                    marks[w.id] === 'known' ? 'bg-aqua' : 'bg-sand'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span
                      lang={deck.lang === 'ja' ? 'ja' : undefined}
                      className="text-sm sm:text-base font-semibold text-ink"
                    >
                      {w.term}
                    </span>
                    {w.reading && (
                      <span className="font-mono2 text-[11px] text-aqua">{w.reading}</span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{w.meaning}</p>
                </div>
                <SpeakButton
                  text={w.term}
                  lang={deck.lang}
                  className="bg-sand/70 text-navy hover:bg-powder/60 shrink-0"
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
