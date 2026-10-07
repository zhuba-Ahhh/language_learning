import type { Lesson } from '@/content/training';
import type { TextToken } from '@/lib/textTokens';
import { findTextRanges } from '@/lib/textTokens';
import { audioUrlFor } from '@/lib/speech';
import { useTraining } from '@/study/trainingContext';
import SpeakButton from '@/components/SpeakButton';
import TrainingIcon from '@/components/TrainingIcon';
import styles from './index.module.less';

export default function WordActions({
  token,
  text,
  lesson,
  timing,
  onPlay,
  onClose,
}: {
  token: TextToken;
  text: string;
  lesson: Lesson;
  timing?: { start: number; end: number };
  onPlay: (from: number, to?: number) => void;
  onClose: () => void;
}) {
  const { data, addWord } = useTraining();
  const contains = (phrase: string) =>
    findTextRanges(text, phrase, lesson.lang).some(
      (range) => range.from <= token.from && range.to >= token.to,
    );
  const mark = lesson.marks?.find((mark) => contains(mark.text));
  const word = lesson.words.find(
    (word) => contains(word.term) || word.id === mark?.wordId,
  );
  const saved =
    word &&
    data.savedWords.some((item) => item.key === `${lesson.lang}:${word.term}`);
  const directUrl = audioUrlFor(word?.term ?? token.text, lesson.lang);
  return (
    <aside className={styles.actions} aria-label={`${token.text} 的词语操作`}>
      <div className={styles.definition}>
        <div>
          <strong lang={lesson.lang}>{word?.term ?? token.text}</strong>
          {word?.reading && <small>{word.reading}</small>}
          <p>
            {word?.meaning ??
              (mark ? mark.note : '未收录释义，可听原文中的读音。')}
          </p>
          {word && mark && <p>{mark.note}</p>}
        </div>
        <button
          type="button"
          className={styles.close}
          aria-label="关闭词语操作"
          onClick={onClose}
        >
          <TrainingIcon name="close" size={18} />
        </button>
      </div>
      <div className={styles.actionButtons}>
        {directUrl ? (
          <SpeakButton
            key={directUrl}
            text={word?.term ?? token.text}
            lang={lesson.lang}
            size={30}
            tone="muted"
            label="发音"
          />
        ) : (
          <button
            type="button"
            disabled={!timing}
            onClick={() => timing && onPlay(timing.start, timing.end)}
          >
            发音
          </button>
        )}
        <button
          type="button"
          disabled={!timing}
          onClick={() => timing && onPlay(timing.start)}
        >
          从这里播
        </button>
        <button
          type="button"
          disabled={!timing}
          onClick={() => timing && onPlay(0, timing.end)}
        >
          播到这里
        </button>
        {word && (
          <button
            type="button"
            disabled={!!saved}
            onClick={() => addWord(lesson, word)}
          >
            <TrainingIcon name="bookmark" size={15} />
            {saved ? '已收藏' : '复习'}
          </button>
        )}
      </div>
      {!timing && (
        <small className={styles.notice}>
          这个词暂无精确时间点，不做估算定位。
        </small>
      )}
    </aside>
  );
}
