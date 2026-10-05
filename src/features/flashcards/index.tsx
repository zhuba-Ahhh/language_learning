/** 闪卡功能入口，组合语言筛选、卡组选择与答题界面。 */
import { useState } from 'react';
import FlipCard from './components/FlipCard';
import { DECKS } from '@/content/words';
import LanguageFilter from '@/components/LanguageFilter';
import { REVIEW_ID, useFlashcardQueue } from './useFlashcardQueue';

export default function FlashcardsSection() {
  const {
    deckId, setDeckId, unknownCards, isReview, deck, queue, round, current,
    totalCount, knownInDeck, doneCount, finished, answer, restart, progress, deckTitle,
  } = useFlashcardQueue();
  const [langFilter, setLangFilter] = useState<'all' | 'en' | 'ja'>('all');
  const visibleDecks = DECKS.filter((d) => langFilter === 'all' || d.lang === langFilter);

  return (
    <div className="space-y-6">
      <header className="reveal">
        <p className="font-mono2 text-[11px] uppercase tracking-[0.3em] text-aqua">Flashcards</p>
        <h1 className="font-display mt-2 text-3xl sm:text-5xl text-ink">单词闪卡</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          点卡片翻面看释义和例句。认识 → 下一张；不认识 → 自动排到队尾再复习。
        </p>
      </header>

      {/* language filter */}
      <LanguageFilter
        options={[['all', '全部'], ['en', '英语'], ['ja', '日语']] as const}
        value={langFilter}
        variant="segmented"
        onChange={(v) => {
          setLangFilter(v);
          const first = DECKS.find((d) => v === 'all' || d.lang === v)!;
          if (v !== 'all' && !isReview && deck!.lang !== v) setDeckId(first.id);
        }}
      />

      {/* deck chips */}
      <div className="reveal -mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 w-max">
          {unknownCards.length > 0 && (
            <button
              onClick={() => setDeckId(REVIEW_ID)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-300 ${
                isReview
                  ? 'bg-aqua text-white soft-shadow'
                  : 'bg-aqua/15 text-aqua hover:bg-aqua/25'
              }`}
            >
              复习 · 不熟的词（{unknownCards.length}）
            </button>
          )}
          {visibleDecks.map((d) => (
            <button
              key={d.id}
              onClick={() => setDeckId(d.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                d.id === deckId
                  ? 'bg-deepblue text-white soft-shadow'
                  : 'bg-white text-ink/70 hover:bg-powder/40'
              }`}
            >
              {d.lang === 'ja' ? '日语' : '英语'} · {d.title}
            </button>
          ))}
        </div>
      </div>

      {/* progress */}
      <div className="reveal flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand">
          <div
            className="h-full rounded-full bg-aqua transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="font-mono2 text-xs text-muted-foreground">
          {isReview ? `剩余 ${queue.length}/${totalCount}` : `已掌握 ${knownInDeck}/${totalCount}`}
        </span>
      </div>

      {/* card */}
      {finished ? (
        <div className="pop-in rounded-[2rem] bg-white soft-shadow-lg px-8 py-16 text-center">
          <p lang="ja" className="font-mono2 text-xs tracking-[0.3em] text-aqua">よくできました！</p>
          <h2 className="font-display mt-3 text-2xl sm:text-3xl text-ink">
            {isReview ? '复习完成' : '本组全部掌握'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isReview
              ? `${totalCount} 个不熟的词全部过了一遍。`
              : `「${deck!.title}」的 ${totalCount} 个单词全部标记为认识。`}
          </p>
          <button
            onClick={restart}
            className="mt-6 rounded-full bg-deepblue px-8 py-3 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
          >
            重新来过
          </button>
        </div>
      ) : (
        current && (
          <div key={`${deckId}-${round}`} className="slide-card-in">
            <FlipCard
              word={current.word}
              lang={current.lang}
              deckTitle={deckTitle}
              index={doneCount}
              total={totalCount}
            />
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={() => answer('unknown')}
                className="rounded-full border-2 border-navy/20 bg-white py-3.5 text-sm font-bold text-navy transition-all hover:border-navy/50 active:scale-[0.97]"
              >
                还不熟 · 晚点再看
              </button>
              <button
                onClick={() => answer('known')}
                className="rounded-full bg-aqua py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.97]"
              >
                认识了 · 下一张
              </button>
            </div>
          </div>
        )
      )}

      <p className="reveal text-center text-[11px] text-muted-foreground">
        词汇来自计算机高频场景与日常交流 · 掌握状态自动保存
      </p>
    </div>
  );
}
