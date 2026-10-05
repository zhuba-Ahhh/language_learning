/** 按原有顺序聚合词库，保持统一的内容导出入口。 */
import { EN_DECKS } from './en';
import { JA_DECKS } from './ja';
import type { Deck } from './types';

export type { Word, Deck } from './types';
export const DECKS: Deck[] = [...EN_DECKS, ...JA_DECKS];
export const TOTAL_WORDS = DECKS.reduce((n, d) => n + d.words.length, 0);
