/** 优先播放预生成 CDN 音频，缺失时请求 PPE TTS，失败再回退系统朗读。 */

import generatedAudioUrls from './audio.generated.json';

type SpeechLanguage = 'en' | 'ja';

const TTS_ENDPOINT =
  'https://douyin-game-ai.bytedance.net/webcast/game/role_agents/generate_avg_text_to_speech_audio';
const TTS_SPEAKER = 'S_olwRWVfN1';
const TTS_CACHE_PREFIX = 'linguadesk-tts:';
const staticAudioUrls: Readonly<Record<string, string>> = generatedAudioUrls;

interface TtsResponse {
  base_resp?: { status_code?: number; status_message?: string };
  items?: Array<{
    audio_url?: string;
    status_code?: number;
    status_text?: string;
  }>;
}

const audioUrlCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string>>();
let voicesCache: SpeechSynthesisVoice[] = [];
let activeAudio: HTMLAudioElement | null = null;

function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  voicesCache = window.speechSynthesis.getVoices();
  if (voicesCache.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      voicesCache = window.speechSynthesis.getVoices();
    };
  }
}

function cacheKey(text: string, lang: SpeechLanguage) {
  return `${TTS_CACHE_PREFIX}${TTS_SPEAKER}:${lang}:${text}`;
}

function readCachedUrl(key: string) {
  const memoryValue = audioUrlCache.get(key);
  if (memoryValue) return memoryValue;
  try {
    const storedValue = window.sessionStorage.getItem(key);
    if (storedValue) audioUrlCache.set(key, storedValue);
    return storedValue;
  } catch {
    return null;
  }
}

function saveCachedUrl(key: string, url: string) {
  audioUrlCache.set(key, url);
  try {
    window.sessionStorage.setItem(key, url);
  } catch {
    // 无痕模式等场景可能禁用 sessionStorage，内存缓存仍可用。
  }
}

function textHash(text: string) {
  let hash = 0;
  for (const character of text) {
    hash = Math.imul(hash, 31) + character.codePointAt(0)!;
  }
  return (hash >>> 0).toString(36);
}

async function generateAudioUrl(text: string, lang: SpeechLanguage) {
  const key = cacheKey(text, lang);
  const cachedUrl = readCachedUrl(key);
  if (cachedUrl) return cachedUrl;

  const pending = pendingRequests.get(key);
  if (pending) return pending;

  const request = (async () => {
    const response = await fetch(TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json',
        'x-tt-env': 'ppe_voice',
        'x-use-ppe': '1',
      },
      body: JSON.stringify({
        items: [
          {
            item_id: `linguadesk-${lang}-${textHash(text)}`,
            text,
          },
        ],
        common_request: {
          speaker: TTS_SPEAKER,
          audio_config: {
            format: 'mp3',
            sample_rate: 24000,
            speech_rate: 0,
            pitch: 0,
            enable_subtitle: true,
          },
        },
      }),
    });

    if (!response.ok) throw new Error(`TTS HTTP ${response.status}`);

    const result = (await response.json()) as TtsResponse;
    const item = result.items?.[0];
    if (
      (result.base_resp?.status_code ?? 0) !== 0 ||
      (item?.status_code ?? -1) !== 0 ||
      !item?.audio_url
    ) {
      throw new Error(
        item?.status_text || result.base_resp?.status_message || '配音生成失败',
      );
    }

    saveCachedUrl(key, item.audio_url);
    return item.audio_url;
  })();

  pendingRequests.set(key, request);
  try {
    return await request;
  } finally {
    pendingRequests.delete(key);
  }
}

function speakWithSystem(text: string, lang: SpeechLanguage) {
  if (!('speechSynthesis' in window)) return false;
  if (voicesCache.length === 0) loadVoices();

  const utterance = new SpeechSynthesisUtterance(text);
  const target = lang === 'ja' ? 'ja-JP' : 'en-US';
  utterance.lang = target;
  const voice =
    voicesCache.find((item) => item.lang === target) ??
    voicesCache.find((item) => item.lang.startsWith(lang));
  if (voice) utterance.voice = voice;
  utterance.rate = lang === 'ja' ? 0.95 : 0.92;
  window.speechSynthesis.speak(utterance);
  return true;
}

export async function speak(
  text: string,
  lang: SpeechLanguage,
  localAudioUrl?: string,
) {
  const normalizedText = text.trim();
  if (!normalizedText) return;
  stopSpeak();

  try {
    const audioUrl =
      localAudioUrl ||
      staticAudioUrls[`${lang}:${normalizedText}`] ||
      (await generateAudioUrl(normalizedText, lang));
    const audio = new Audio(audioUrl);
    activeAudio = audio;
    await audio.play();
  } catch (error) {
    if (!speakWithSystem(normalizedText, lang)) throw error;
  }
}

export function stopSpeak() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export const ttsSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window;
