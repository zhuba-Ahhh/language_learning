/** 对人工维护的 JSON 词库做轻量校验，并返回统一业务类型。 */
import type { Deck, Word } from './types';

const hasText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isWord = (value: unknown): value is Word => {
  if (!isRecord(value)) return false;
  return (
    hasText(value.id) &&
    hasText(value.term) &&
    hasText(value.meaning) &&
    hasText(value.example) &&
    hasText(value.exampleZh) &&
    (value.reading === undefined || hasText(value.reading)) &&
    (value.audioUrl === undefined || hasText(value.audioUrl))
  );
};

const isDeck = (value: unknown, language: Deck['lang']): value is Deck => {
  if (!isRecord(value)) return false;
  return (
    hasText(value.id) &&
    value.lang === language &&
    hasText(value.title) &&
    hasText(value.subtitle) &&
    Array.isArray(value.words) &&
    value.words.length > 0 &&
    value.words.every(isWord)
  );
};

export function defineDecks(
  input: readonly unknown[],
  language: Deck['lang'],
): Deck[] {
  if (!input.every((deck) => isDeck(deck, language))) {
    throw new Error(`${language} 词库数据格式不完整`);
  }

  const decks = [...input];
  const deckIds = new Set<string>();
  const wordIds = new Set<string>();

  decks.forEach((deck) => {
    if (deckIds.has(deck.id)) throw new Error(`词组 ID 重复：${deck.id}`);
    deckIds.add(deck.id);

    deck.words.forEach((word) => {
      if (wordIds.has(word.id)) throw new Error(`词条 ID 重复：${word.id}`);
      wordIds.add(word.id);
    });
  });

  return decks;
}
