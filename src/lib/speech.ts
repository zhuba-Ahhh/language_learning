/** Text-to-speech via the Web Speech API (no backend needed). */

let voicesCache: SpeechSynthesisVoice[] = [];

function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  voicesCache = window.speechSynthesis.getVoices();
  if (voicesCache.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      voicesCache = window.speechSynthesis.getVoices();
    };
  }
}

export function speak(text: string, lang: 'en' | 'ja') {
  if (!('speechSynthesis' in window)) return;
  if (voicesCache.length === 0) loadVoices();

  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const target = lang === 'ja' ? 'ja-JP' : 'en-US';
  u.lang = target;
  const voice =
    voicesCache.find((v) => v.lang === target) ??
    voicesCache.find((v) => v.lang.startsWith(lang));
  if (voice) u.voice = voice;
  u.rate = lang === 'ja' ? 0.95 : 0.92;
  window.speechSynthesis.speak(u);
}

export function stopSpeak() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export const ttsSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window;
