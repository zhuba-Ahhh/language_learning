/** 管理卡组、复习队列与轮次，保持原有标记和重开规则。 */
import { useEffect, useMemo, useState } from 'react';
import { DECKS, type Word } from '@/content/words';
import { useStudy } from '@/study/useStudy';

interface CardItem {
  word: Word;
  lang: 'en' | 'ja';
}

export const REVIEW_ID = '__review';

export function useFlashcardQueue(initialDeckId = DECKS[0].id) {
  const { marks, markWord, resetDeckMarks } = useStudy();
  const [deckId, setDeckId] = useState(initialDeckId);

  // 跨卡组「不熟的词」复习集
  const unknownCards = useMemo<CardItem[]>(
    () =>
      DECKS.flatMap((d) =>
        d.words
          .filter((w) => marks[w.id] === 'unknown')
          .map((w) => ({ word: w, lang: d.lang })),
      ),
    [marks],
  );

  const isReview = deckId === REVIEW_ID;
  const deck = isReview ? null : DECKS.find((d) => d.id === deckId)!;
  const cards: CardItem[] = isReview
    ? unknownCards
    : deck!.words.map((w) => ({ word: w, lang: deck!.lang }));

  const [queue, setQueue] = useState<string[]>(() =>
    cards.map((c) => c.word.id),
  );
  const [round, setRound] = useState(1);

  useEffect(() => {
    if (isReview) {
      setQueue(unknownCards.map((c) => c.word.id));
    } else {
      const remaining = deck!.words
        .filter((w) => marks[w.id] !== 'known')
        .map((w) => w.id);
      setQueue(remaining.length ? remaining : deck!.words.map((w) => w.id));
    }
    setRound((r) => r + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  const cardMap = useMemo(
    () => new Map(cards.map((c) => [c.word.id, c])),
    [cards],
  );
  const current = queue.length ? cardMap.get(queue[0]) : undefined;
  const totalCount = cards.length;
  const knownInDeck = isReview
    ? 0
    : deck!.words.filter((w) => marks[w.id] === 'known').length;
  const doneCount = totalCount - queue.length;
  const finished = queue.length === 0;

  /** 已认识的词出队，不熟的词移到队尾。 */
  const answer = (mark: 'known' | 'unknown') => {
    if (!current) return;
    markWord(current.word.id, mark);
    setQueue((q) =>
      mark === 'known' ? q.slice(1) : [...q.slice(1), current.word.id],
    );
  };

  /** 普通卡组清除标记，复习集保留标记并重建当前队列。 */
  const restart = () => {
    if (!isReview) resetDeckMarks(deck!.id);
    setQueue(cards.map((c) => c.word.id));
    setRound((r) => r + 1);
  };

  const progress = isReview
    ? totalCount
      ? doneCount / totalCount
      : 0
    : totalCount
      ? knownInDeck / totalCount
      : 0;

  const deckTitle = isReview
    ? 'Review · 不熟的词'
    : `${deck!.subtitle} · ${deck!.title}`;

  return {
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
  };
}
