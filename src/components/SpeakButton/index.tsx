/** 跨功能共享朗读按钮，阻止点击冒泡到外层卡片。 */
import styles from './index.module.less';
import { useEffect, useRef, useState } from 'react';
import { audioUrlFor, playAudio, stopAudio } from '@/lib/speech';
import type { PlaybackState } from '@/lib/speech';
import TrainingIcon from '@/components/TrainingIcon';

interface Props {
  text: string;
  lang: 'en' | 'ja';
  audioUrl?: string;
  tone?: 'sand' | 'muted' | 'dark';
  size?: number;
  label?: string;
}

/** CDN 朗读按钮，状态由实际播放事件驱动。 */
export default function SpeakButton({
  text,
  lang,
  audioUrl,
  tone = 'sand',
  size = 36,
  label: textLabel,
}: Props) {
  const [status, setStatus] = useState<PlaybackState>('idle');
  const audio = useRef<HTMLAudioElement | null>(null);
  const url = audioUrlFor(text, lang, audioUrl);
  useEffect(
    () => () => {
      if (audio.current) stopAudio(audio.current);
    },
    [],
  );
  const label = !url
    ? '尚未配音'
    : status === 'loading'
      ? '正在加载音频'
      : status === 'playing'
        ? '停止朗读'
        : status === 'error'
          ? '播放失败，点击重试'
          : (textLabel ?? '朗读');

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={!url}
      onClick={async (e) => {
        e.stopPropagation();
        if (audio.current && (status === 'playing' || status === 'loading')) {
          stopAudio(audio.current);
          return;
        }
        if (!url) return;
        audio.current = new Audio(url);
        try {
          await playAudio(audio.current, { onState: setStatus });
        } catch {
          setStatus('error');
        }
      }}
      className={`${styles.button} ${styles[tone]} ${status === 'playing' ? styles.active : status === 'loading' ? styles.loading : ''}`}
      style={{
        width: textLabel ? 'auto' : size,
        height: size,
        ...(textLabel
          ? { padding: '0 10px', gap: 5, borderRadius: 9, fontSize: 12 }
          : {}),
      }}
    >
      <TrainingIcon name="speaker" size={size * 0.5} />
      {textLabel && <span>{textLabel}</span>}
    </button>
  );
}
