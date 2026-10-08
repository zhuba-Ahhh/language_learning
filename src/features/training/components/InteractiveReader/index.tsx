import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import TrainingIcon from '@/components/TrainingIcon';
import type { Lesson } from '@/content/training';
import { tokenizeText } from '@/lib/textTokens';
import { wordTiming } from '@/lib/audioAlignment';
import useCdnReader from './useCdnReader';
import ReaderWords from './ReaderWords';
import WordActions from './WordActions';
import styles from './index.module.less';
import { VOCABULARY } from '@/content/vocabulary';

const clock = (time: number) =>
  `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`;

export default function InteractiveReader({
  text,
  lesson,
  ruby,
  label = '示范音频',
  controlsTarget,
  active = true,
  onActivate,
  hideText = false,
  loopable = false,
}: {
  text: string;
  lesson: Lesson;
  ruby?: string;
  label?: string;
  controlsTarget?: HTMLElement | null;
  active?: boolean;
  onActivate?: () => void;
  hideText?: boolean;
  loopable?: boolean;
}) {
  const {
    attachAudio,
    url,
    alignment,
    state,
    time,
    duration,
    rate,
    play,
    toggle,
    seek,
    changeRate,
    setDuration,
  } = useCdnReader(text, lesson.lang);
  const [selected, setSelected] = useState<number>();
  const [loop, setLoop] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected === undefined) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setSelected(undefined);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [selected]);
  const tokens = useMemo(
    () =>
      tokenizeText(text, lesson.lang, [
        ...lesson.words.map((word) => word.term),
        ...VOCABULARY.filter((word) => word.lang === lesson.lang).flatMap(
          (word) =>
            [word.term, word.lemma, ...(word.forms ?? [])].filter(
              (term): term is string => !!term,
            ),
        ),
        ...(lesson.lang === 'ja'
          ? (alignment?.words ?? [])
              .map(([from, to]) => text.slice(from, to))
              .filter((term) => term.length > 1)
          : []),
      ]),
    [text, lesson, alignment],
  );
  const token = selected === undefined ? undefined : tokens[selected];
  const playing = state === 'playing';
  const timing =
    token && wordTiming(alignment?.words ?? [], token.from, token.to);
  const controls = (
    <div className={styles.controls}>
      <button
        type="button"
        className={styles.play}
        disabled={!url}
        aria-busy={state === 'loading'}
        aria-label={`${playing || state === 'loading' ? '暂停' : '播放'}${label}`}
        onClick={toggle}
      >
        <TrainingIcon
          name={playing || state === 'loading' ? 'pause' : 'play'}
          size={18}
        />
      </button>
      <input
        type="range"
        min="0"
        max={duration || 1}
        step="0.01"
        value={Math.min(time, duration || 1)}
        style={
          {
            '--reader-progress': `${duration ? Math.min(100, (time / duration) * 100) : 0}%`,
          } as CSSProperties
        }
        disabled={!url || !duration}
        aria-label={`${label}进度`}
        aria-valuetext={`${clock(time)} / ${clock(duration)}`}
        onChange={(event) => seek(Number(event.target.value))}
      />
      <time>
        {clock(time)} / {clock(duration)}
      </time>
      <select
        aria-label={`${label}语速`}
        value={rate}
        onChange={(event) => changeRate(Number(event.target.value))}
      >
        <option value={0.8}>0.8×</option>
        <option value={1}>1×</option>
      </select>
      {loopable && (
        <button
          type="button"
          className={styles.loop}
          aria-pressed={loop}
          disabled={!url}
          onClick={() => setLoop((value) => !value)}
        >
          循环
        </button>
      )}
    </div>
  );
  return (
    <div
      ref={root}
      className={styles.reader}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setSelected(undefined);
      }}
    >
      <audio
        ref={attachAudio}
        src={url}
        preload="none"
        aria-label={label}
        loop={loop}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
      />
      {controlsTarget !== undefined ? (
        active && controlsTarget ? (
          createPortal(controls, controlsTarget)
        ) : (
          <button
            type="button"
            className={styles.paragraphPlay}
            aria-label={`播放${label}`}
            disabled={!url}
            onClick={() => {
              onActivate?.();
              toggle();
            }}
          >
            <TrainingIcon name="speaker" size={16} />
          </button>
        )
      ) : (
        controls
      )}
      {state === 'error' && (
        <p role="alert" className={styles.notice}>
          音频加载失败，检查网络后点击播放重试。
        </p>
      )}
      {!url && <p className={styles.notice}>尚未配音，不会请求生成接口。</p>}
      {!hideText && (
        <ReaderWords
          text={text}
          lesson={lesson}
          tokens={tokens}
          ruby={ruby}
          selected={selected}
          alignment={alignment}
          time={time}
          playing={playing}
          onSelect={(index) => {
            onActivate?.();
            setSelected(index);
          }}
        />
      )}
      {!hideText && token && (
        <WordActions
          token={token}
          text={text}
          lesson={lesson}
          timing={timing}
          onPlay={play}
          onClose={() => setSelected(undefined)}
        />
      )}
    </div>
  );
}
