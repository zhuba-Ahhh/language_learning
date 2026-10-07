export interface TextToken {
  text: string;
  from: number;
  to: number;
  isWord: boolean;
}

export function findTextRanges(
  text: string,
  phrase: string,
  lang: 'en' | 'ja',
) {
  const source = text.toLowerCase();
  const query = phrase.toLowerCase();
  const ranges: { from: number; to: number }[] = [];
  if (!query) return ranges;
  let cursor = 0;
  while (cursor < source.length) {
    const from = source.indexOf(query, cursor);
    if (from < 0) break;
    const to = from + query.length;
    const letter = lang === 'en' ? /[\p{L}\p{N}'’]/u : /[\p{Script=Han}々]/u;
    const startsWithLetter = letter.test(query[0]);
    const endsWithLetter = letter.test(query.at(-1)!);
    if (
      !(startsWithLetter && from > 0 && letter.test(source[from - 1])) &&
      !(endsWithLetter && to < source.length && letter.test(source[to]))
    )
      ranges.push({ from, to });
    cursor = to;
  }
  return ranges;
}

/** 日语优先保留已收录词的整体边界，避免把大学生拆成大学 + 生。 */
export function tokenizeText(
  text: string,
  lang: 'en' | 'ja',
  terms: string[] = [],
): TextToken[] {
  const preferred =
    lang === 'ja'
      ? [
          ...terms,
          'ございます',
          'ありません',
          'しています',
          'いたします',
          'しました',
          'します',
          'ました',
          'ください',
          'ます',
        ].flatMap((term) => findTextRanges(text, term, lang))
      : [];
  preferred.sort((a, b) => a.from - b.from || b.to - a.to);
  const ranges: { from: number; to: number }[] = [];
  for (const range of preferred)
    if (!ranges.length || range.from >= ranges.at(-1)!.to) ranges.push(range);
  const result: TextToken[] = [];
  const segmenter = new Intl.Segmenter(lang, { granularity: 'word' });
  const segment = (from: number, to: number) => {
    for (const item of segmenter.segment(text.slice(from, to))) {
      result.push({
        text: item.segment,
        from: from + item.index,
        to: from + item.index + item.segment.length,
        isWord: !!item.isWordLike,
      });
    }
  };
  let cursor = 0;
  for (const range of ranges) {
    segment(cursor, range.from);
    result.push({
      ...range,
      text: text.slice(range.from, range.to),
      isWord: true,
    });
    cursor = range.to;
  }
  segment(cursor, text.length);
  if (lang === 'en') {
    for (let index = 0; index < result.length - 2; index++) {
      const [left, joiner, right] = result.slice(index, index + 3);
      if (left.isWord && joiner.text === '-' && right.isWord) {
        result.splice(index, 3, {
          ...left,
          text: left.text + '-' + right.text,
          to: right.to,
        });
        index--;
      }
    }
  }
  return result;
}

export function rubySegments(text: string) {
  let cursor = 0;
  return text
    .split(/([\p{Script=Han}々]+\[[^\]]+\])/gu)
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^(.+)\[([^\]]+)\]$/);
      const base = match?.[1] ?? part;
      const result = {
        text: base,
        reading: match?.[2],
        from: cursor,
        to: cursor + base.length,
      };
      cursor += base.length;
      return result;
    });
}
