/** 跨功能共享朗读按钮，阻止点击冒泡到外层卡片。 */
import { useState } from 'react';
import { speak, ttsSupported } from '@/lib/speech';

interface Props {
  text: string;
  lang: 'en' | 'ja';
  className?: string;
  size?: number;
}

/** Small circular TTS button. Stops propagation so it can live inside flippable cards. */
export default function SpeakButton({ text, lang, className = '', size = 36 }: Props) {
  const [active, setActive] = useState(false);
  if (!ttsSupported) return null;

  return (
    <button
      type="button"
      aria-label="朗读"
      onClick={(e) => {
        e.stopPropagation();
        speak(text, lang);
        setActive(true);
        window.setTimeout(() => setActive(false), Math.max(900, text.length * 120));
      }}
      className={`inline-flex items-center justify-center rounded-full transition-all active:scale-90 ${
        active ? 'bg-aqua text-white' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </svg>
    </button>
  );
}
