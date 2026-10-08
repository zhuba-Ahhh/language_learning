/** 制作阶段使用人工读音；网页仍显示原文，不引入运行时辞书。 */
export function japaneseSpeech(text, ruby) {
  const units = [];
  let original = '';
  let speechText = '';
  const add = (base, reading = base) => {
    units.push([
      original.length,
      original.length + base.length,
      speechText.length,
      speechText.length + reading.length,
    ]);
    original += base;
    speechText += reading;
  };
  let cursor = 0;
  for (const match of ruby.matchAll(
    /([\p{Script=Han}々A-Za-z0-9○]+)\[([\p{Script=Hiragana}\p{Script=Katakana}ー]+)\]/gu,
  )) {
    for (const char of ruby.slice(cursor, match.index)) add(char);
    add(match[1], match[2]);
    cursor = match.index + match[0].length;
  }
  for (const char of ruby.slice(cursor)) add(char);
  if (
    original !== text ||
    !/^[\p{Script=Hiragana}\p{Script=Katakana}ー\p{P}\p{Zs}]+$/u.test(
      speechText,
    )
  )
    throw new Error(`Missing or invalid Japanese pronunciation: ${text}`);
  return { speechText, units };
}

/** 只有完整假名边界才映射到原文；保留服务时间，不拆分或估算汉字时间。 */
export function mapJapaneseTimings(units, words) {
  const boundaries = new Map(
    units.flatMap(([from, to, left, right]) => [
      [left, from],
      [right, to],
    ]),
  );
  const mapped = [];
  let pending;
  for (const [from, to, start, end] of words) {
    if (pending && from !== pending.to) pending = undefined;
    if (!pending) {
      if (!boundaries.has(from)) continue;
      pending = { from, to, start, end };
    } else {
      pending.to = to;
      pending.end = end;
    }
    if (boundaries.has(to)) {
      mapped.push([
        boundaries.get(pending.from),
        boundaries.get(to),
        pending.start,
        pending.end,
      ]);
      pending = undefined;
    }
  }
  return mapped;
}

export function completeJapaneseTimings(text, words) {
  let offset = 0;
  for (const char of text) {
    if (
      /[\p{L}\p{N}]/u.test(char) &&
      !words.some(([from, to]) => from <= offset && to >= offset + char.length)
    )
      return false;
    offset += char.length;
  }
  return true;
}
