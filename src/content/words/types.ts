/** 内置词条与卡组的数据结构，不依赖学习状态。 */
export interface Word {
  id: string;
  term: string;
  reading?: string; // 日语读音 / 英文音标提示
  audioUrl?: string;
  meaning: string;
  example: string;
  exampleZh: string;
}

export interface Deck {
  id: string;
  lang: 'en' | 'ja';
  title: string;
  subtitle: string;
  words: Word[];
}
