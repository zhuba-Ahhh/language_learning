/** 日语词组清单；顺序决定词库和闪卡中的展示顺序。 */
import daily from './data/ja/daily.json';
import greeting from './data/ja/greeting.json';
import katakana from './data/ja/katakana.json';
import work from './data/ja/work.json';
import { defineDecks } from './schema';

export const JA_DECKS = defineDecks([katakana, work, daily, greeting], 'ja');
