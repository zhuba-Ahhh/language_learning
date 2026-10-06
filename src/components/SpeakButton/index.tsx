/** 跨功能共享朗读按钮，阻止点击冒泡到外层卡片。 */
import styles from './index.module.less';
import { useState } from 'react';
import { speak } from '@/lib/speech';

interface Props {
  text: string;
  lang: 'en' | 'ja';
  audioUrl?: string;
  tone?: 'sand' | 'muted' | 'dark';
  size?: number;
}

/** Small circular TTS button. Stops propagation so it can live inside flippable cards. */
export default function SpeakButton({
  text,
  lang,
  audioUrl,
  tone = 'sand',
  size = 36,
}: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'active'>('idle');

  return (
    <button
      type="button"
      aria-label={status === 'loading' ? '正在生成配音' : '朗读'}
      disabled={status === 'loading'}
      onClick={async (e) => {
        e.stopPropagation();
        setStatus('loading');
        try {
          await speak(text, lang, audioUrl);
          setStatus('active');
          window.setTimeout(
            () => setStatus('idle'),
            Math.max(900, text.length * 120),
          );
        } catch {
          setStatus('idle');
        }
      }}
      className={`${styles.button} ${styles[tone]} ${status === 'idle' ? '' : styles[status]}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </svg>
    </button>
  );
}
