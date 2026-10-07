export type AudioWord = [from: number, to: number, start: number, end: number];
export interface AlignedAudio {
  url: string;
  duration: number;
  words: AudioWord[];
}

/** 保留服务返回的真实时间，按原文顺序匹配，不推算缺失的词。 */
export function alignSubtitles(text: string, subtitles: unknown): AudioWord[] {
  if (!Array.isArray(subtitles)) return [];
  const normalized = text.toLocaleLowerCase().replaceAll('’', "'");
  const words: AudioWord[] = [];
  let cursor = 0;
  let lastStart = -1;
  for (const sentence of subtitles) {
    if (!sentence || !Array.isArray(sentence.words)) continue;
    for (const item of sentence.words) {
      if (typeof item.word !== 'string') continue;
      const term = item.word
        .trim()
        .toLocaleLowerCase()
        .replaceAll('’', "'")
        .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
      // 服务省略值为 0 的 startTime（omitempty），并非缺失时间轴。
      const start = item.startTime ?? 0;
      const end = item.endTime;
      const from = normalized.indexOf(term, cursor);
      if (
        !term ||
        from < 0 ||
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        start < 0 ||
        end <= start ||
        start < lastStart
      )
        continue;
      const to = from + term.length;
      words.push([from, to, start, end]);
      cursor = to;
      lastStart = start;
    }
  }
  return words;
}

/** 只有词边界完整落在字幕中时才允许定位，不能把句级时间当作词级时间。 */
export function wordTiming(words: AudioWord[], from: number, to: number) {
  const matches = words.filter(([left, right]) => right > from && left < to);
  if (!matches.length || matches[0][0] !== from || matches.at(-1)![1] !== to)
    return undefined;
  return { start: matches[0][2], end: matches.at(-1)![3] };
}
