/** 播放只读取预生成 CDN 资产，不调用生成接口或系统朗读。 */
import generatedAudioUrls from './audio.generated.json';
import generatedTimings from './audio.timings.json';
import type { AlignedAudio } from './audioAlignment';

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'error';
interface PlaybackOptions {
  from?: number;
  to?: number;
  rate?: number;
  onState?: (state: PlaybackState) => void;
  onTime?: (time: number) => void;
}
const urls: Readonly<Record<string, string>> = generatedAudioUrls;
const timings = generatedTimings as unknown as Readonly<
  Record<string, AlignedAudio>
>;
let active: { audio: HTMLAudioElement; dispose: () => void } | null = null;

export function audioUrlFor(
  text: string,
  lang: 'en' | 'ja',
  override?: string,
) {
  const url = override || urls[`${lang}:${text.trim()}`];
  return url?.startsWith('https://') ? url : undefined;
}
export function alignmentFor(text: string, lang: 'en' | 'ja') {
  const entry = timings[`${lang}:${text.trim()}`];
  return entry?.url === audioUrlFor(text, lang) ? entry : undefined;
}

/** 所有控件共享播放互斥；切页、点另一个词会取消之前的播放。 */
export async function playAudio(
  audio: HTMLAudioElement,
  options: PlaybackOptions = {},
) {
  stopSpeak();
  const { from = 0, to, rate = 1, onState, onTime } = options;
  let frame = 0;
  const seek = () => {
    audio.currentTime = from;
  };
  const finish = () => stopAudio(audio);
  const fail = () => {
    finish();
    onState?.('error');
  };
  const checkBoundary = () => {
    if (active?.audio === audio && to !== undefined && audio.currentTime >= to)
      finish();
  };
  const tick = () => {
    if (active?.audio !== audio) return;
    onTime?.(audio.currentTime);
    if (to !== undefined && audio.currentTime >= to) finish();
    else frame = requestAnimationFrame(tick);
  };
  const playing = () => {
    onState?.('playing');
    cancelAnimationFrame(frame);
    tick();
  };
  active = {
    audio,
    dispose: () => {
      cancelAnimationFrame(frame);
      audio.removeEventListener('loadedmetadata', seek);
      audio.removeEventListener('ended', finish);
      audio.removeEventListener('error', fail);
      audio.removeEventListener('playing', playing);
      audio.removeEventListener('timeupdate', checkBoundary);
      onState?.('idle');
    },
  };
  audio.addEventListener('loadedmetadata', seek, { once: true });
  audio.addEventListener('ended', finish);
  audio.addEventListener('error', fail);
  audio.addEventListener('playing', playing);
  audio.addEventListener('timeupdate', checkBoundary);
  audio.playbackRate = rate;
  if (audio.readyState >= 1) seek();
  onState?.('loading');
  try {
    await audio.play();
  } catch (error) {
    if (active?.audio !== audio) return;
    fail();
    throw error;
  }
}

export function stopAudio(audio: HTMLAudioElement) {
  if (active?.audio === audio) stopSpeak();
}
export function stopSpeak() {
  if (!active) return;
  const previous = active;
  active = null;
  previous.audio.pause();
  previous.dispose();
}
export async function speak(
  text: string,
  lang: 'en' | 'ja',
  override?: string,
) {
  const url = audioUrlFor(text, lang, override);
  if (!url) throw new Error('这段内容尚未配音');
  await playAudio(new Audio(url));
}
// 兼容旧版假名控件；不再依赖 SpeechSynthesis。
export const ttsSupported = typeof Audio !== 'undefined';
