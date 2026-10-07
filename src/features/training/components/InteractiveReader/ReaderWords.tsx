import type { Lesson } from '@/content/training';
import { findTextRanges, rubySegments } from '@/lib/textTokens';
import type { TextToken } from '@/lib/textTokens';
import { wordTiming } from '@/lib/audioAlignment';
import type { AlignedAudio } from '@/lib/audioAlignment';
import styles from './index.module.less';

export default function ReaderWords({
  text,
  lesson,
  tokens,
  ruby,
  selected,
  alignment,
  time,
  playing,
  onSelect,
}: {
  text: string;
  lesson: Lesson;
  tokens: TextToken[];
  ruby?: string;
  selected?: number;
  alignment?: AlignedAudio;
  time: number;
  playing: boolean;
  onSelect: (index: number) => void;
}) {
  const marks = [
    ...lesson.words.flatMap((word) =>
      findTextRanges(text, word.term, lesson.lang).map((range) => ({
        ...range,
        kind: 'phrase',
      })),
    ),
    ...(lesson.marks ?? []).flatMap((mark) =>
      findTextRanges(text, mark.text, lesson.lang).map((range) => ({
        ...range,
        kind: mark.kind,
      })),
    ),
  ];
  const parts = ruby ? rubySegments(ruby) : [];
  const content = (token: TextToken) =>
    parts.length
      ? parts
          .filter((part) => part.to > token.from && part.from < token.to)
          .map((part) => {
            const base = part.text.slice(
              Math.max(0, token.from - part.from),
              token.to - part.from,
            );
            return part.reading &&
              token.from <= part.from &&
              token.to >= part.to ? (
              <ruby key={part.from}>
                {base}
                <rt>{part.reading}</rt>
              </ruby>
            ) : (
              <span key={part.from}>{base}</span>
            );
          })
      : token.text;
  return (
    <p className={styles.text} lang={lesson.lang}>
      {tokens.map((token, index) => {
        const mark = marks.find(
          (mark) => mark.from < token.to && mark.to > token.from,
        );
        const timing = wordTiming(alignment?.words ?? [], token.from, token.to);
        const active =
          playing && timing && time >= timing.start && time < timing.end;
        const className = [
          styles.word,
          mark && styles[mark.kind],
          active && styles.active,
          selected === index && styles.selected,
        ]
          .filter(Boolean)
          .join(' ');
        return token.isWord ? (
          <button
            type="button"
            key={token.from}
            className={className}
            aria-label={`查看 ${token.text}`}
            aria-pressed={selected === index}
            onClick={() => onSelect(index)}
          >
            {content(token)}
          </button>
        ) : (
          <span
            key={token.from}
            className={mark ? styles[mark.kind] : undefined}
          >
            {content(token)}
          </span>
        );
      })}
    </p>
  );
}
