import { useCallback, useEffect, useRef, useState } from 'react';
import { alignmentFor, audioUrlFor, playAudio, stopAudio } from '@/lib/speech';
import type { PlaybackState } from '@/lib/speech';

export default function useCdnReader(text: string, lang: 'en' | 'ja') {
  const audio = useRef<HTMLAudioElement | null>(null);
  const attachAudio = useCallback((element: HTMLAudioElement | null) => {
    audio.current = element;
  }, []);
  const [state, setState] = useState<PlaybackState>('idle');
  const [time, setTime] = useState(0);
  const [rate, setRate] = useState(1);
  const url = audioUrlFor(text, lang);
  const alignment = alignmentFor(text, lang);
  const [duration, setDuration] = useState(alignment?.duration ?? 0);
  useEffect(() => {
    const element = audio.current;
    return () => {
      if (element) stopAudio(element);
    };
  }, []);
  const play = (from = 0, to?: number) => {
    if (!audio.current || !url) return;
    setTime(from);
    void playAudio(audio.current, {
      from,
      to,
      rate,
      onState: setState,
      onTime: setTime,
    }).catch(() => setState('error'));
  };
  const toggle = () => {
    if (!audio.current) return;
    if (state === 'playing' || state === 'loading') stopAudio(audio.current);
    else play(time >= duration - 0.1 ? 0 : time);
  };
  const seek = (next: number) => {
    setTime(next);
    if (audio.current && audio.current.readyState >= 1)
      audio.current.currentTime = next;
  };
  const changeRate = (next: number) => {
    setRate(next);
    if (audio.current) audio.current.playbackRate = next;
  };
  return {
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
  };
}
