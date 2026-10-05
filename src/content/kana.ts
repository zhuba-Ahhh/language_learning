/** 基础五十音数据与平片假名、罗马音映射。 */
export interface KanaCell {
  kana: [string, string]; // [平假名, 片假名]
  romaji: string;
}

/** 五十音图（清音 46 个），按行排列 */
export const GOJUON: { row: string; cells: (KanaCell | null)[] }[] = [
  {
    row: 'あ行',
    cells: [
      { kana: ['あ', 'ア'], romaji: 'a' },
      { kana: ['い', 'イ'], romaji: 'i' },
      { kana: ['う', 'ウ'], romaji: 'u' },
      { kana: ['え', 'エ'], romaji: 'e' },
      { kana: ['お', 'オ'], romaji: 'o' },
    ],
  },
  {
    row: 'か行',
    cells: [
      { kana: ['か', 'カ'], romaji: 'ka' },
      { kana: ['き', 'キ'], romaji: 'ki' },
      { kana: ['く', 'ク'], romaji: 'ku' },
      { kana: ['け', 'ケ'], romaji: 'ke' },
      { kana: ['こ', 'コ'], romaji: 'ko' },
    ],
  },
  {
    row: 'さ行',
    cells: [
      { kana: ['さ', 'サ'], romaji: 'sa' },
      { kana: ['し', 'シ'], romaji: 'shi' },
      { kana: ['す', 'ス'], romaji: 'su' },
      { kana: ['せ', 'セ'], romaji: 'se' },
      { kana: ['そ', 'ソ'], romaji: 'so' },
    ],
  },
  {
    row: 'た行',
    cells: [
      { kana: ['た', 'タ'], romaji: 'ta' },
      { kana: ['ち', 'チ'], romaji: 'chi' },
      { kana: ['つ', 'ツ'], romaji: 'tsu' },
      { kana: ['て', 'テ'], romaji: 'te' },
      { kana: ['と', 'ト'], romaji: 'to' },
    ],
  },
  {
    row: 'な行',
    cells: [
      { kana: ['な', 'ナ'], romaji: 'na' },
      { kana: ['に', 'ニ'], romaji: 'ni' },
      { kana: ['ぬ', 'ヌ'], romaji: 'nu' },
      { kana: ['ね', 'ネ'], romaji: 'ne' },
      { kana: ['の', 'ノ'], romaji: 'no' },
    ],
  },
  {
    row: 'は行',
    cells: [
      { kana: ['は', 'ハ'], romaji: 'ha' },
      { kana: ['ひ', 'ヒ'], romaji: 'hi' },
      { kana: ['ふ', 'フ'], romaji: 'fu' },
      { kana: ['へ', 'ヘ'], romaji: 'he' },
      { kana: ['ほ', 'ホ'], romaji: 'ho' },
    ],
  },
  {
    row: 'ま行',
    cells: [
      { kana: ['ま', 'マ'], romaji: 'ma' },
      { kana: ['み', 'ミ'], romaji: 'mi' },
      { kana: ['む', 'ム'], romaji: 'mu' },
      { kana: ['め', 'メ'], romaji: 'me' },
      { kana: ['も', 'モ'], romaji: 'mo' },
    ],
  },
  {
    row: 'や行',
    cells: [
      { kana: ['や', 'ヤ'], romaji: 'ya' },
      null,
      { kana: ['ゆ', 'ユ'], romaji: 'yu' },
      null,
      { kana: ['よ', 'ヨ'], romaji: 'yo' },
    ],
  },
  {
    row: 'ら行',
    cells: [
      { kana: ['ら', 'ラ'], romaji: 'ra' },
      { kana: ['り', 'リ'], romaji: 'ri' },
      { kana: ['る', 'ル'], romaji: 'ru' },
      { kana: ['れ', 'レ'], romaji: 're' },
      { kana: ['ろ', 'ロ'], romaji: 'ro' },
    ],
  },
  {
    row: 'わ行',
    cells: [
      { kana: ['わ', 'ワ'], romaji: 'wa' },
      null,
      null,
      null,
      { kana: ['を', 'ヲ'], romaji: 'wo' },
    ],
  },
];

export const NASAL: KanaCell = { kana: ['ん', 'ン'], romaji: 'n' };

export const ALL_KANA: KanaCell[] = [
  ...GOJUON.flatMap((r) => r.cells.filter((c): c is KanaCell => c !== null)),
  NASAL,
];
