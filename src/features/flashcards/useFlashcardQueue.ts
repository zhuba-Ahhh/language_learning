/** 管理卡组、复习队列与轮次，保持原有标记和重开规则。 */
import { useMemo, useState } from 'react';
import type { Word } from '@/content/words';
import { useStudy } from '@/study/useStudy';

interface CardItem {
  word: Word;
  lang: 'en' | 'ja';
}

export const REVIEW_ID = '__review';

export function useFlashcardQueue(initialDeckId?: string, taskId?: string) {
  const { decks, marks, markWord, resetDeckMarks, recordAttempt } = useStudy();
  const [deckId, setActiveDeckId] = useState(initialDeckId ?? decks[0].id);

  // 跨卡组「不熟的词」复习集
  const unknownCards = useMemo<CardItem[]>(
    () =>
      decks.flatMap((d) =>
        d.words
          .filter((w) => marks[w.id] === 'unknown')
          .map((w) => ({ word: w, lang: d.lang })),
      ),
    [decks, marks],
  );

  const isReview = deckId === REVIEW_ID;
  const deck = isReview ? null : decks.find((d) => d.id === deckId)!;
  const cards: CardItem[] = isReview
    ? unknownCards
    : deck!.words.map((w) => ({ word: w, lang: deck!.lang }));

  const [queue, setQueue] = useState<string[]>(() => {
    if (isReview) return unknownCards.map((card) => card.word.id);
    const remaining = deck!.words
      .filter((word) => marks[word.id] !== 'known')
      .map((word) => word.id);
    return remaining.length ? remaining : deck!.words.map((word) => word.id);
  });
  const [round, setRound] = useState(1);

  const setDeckId = (nextDeckId: string) => {
    const nextDeck = decks.find((item) => item.id === nextDeckId);
    const nextQueue =
      nextDeckId === REVIEW_ID
        ? unknownCards.map((card) => card.word.id)
        : (
            nextDeck?.words.filter((word) => marks[word.id] !== 'known') ?? []
          ).map((word) => word.id);
    setActiveDeckId(nextDeckId);
    setQueue(
      nextQueue.length
        ? nextQueue
        : (nextDeck?.words.map((word) => word.id) ?? []),
    );
    setRound((value) => value + 1);
  };

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
    recordAttempt({
      taskId,
      activity: 'flashcards',
      contentId: current.word.id,
      outcome: mark,
    });
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
    decks,
  };
}
