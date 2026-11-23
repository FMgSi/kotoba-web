import type { Language } from '../types';

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) cachedVoices = voices;
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

function pickVoice(language: Language): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!voices.length) return null;

  if (language === 'jp') {
    const jpVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('ja'));
    return (
      jpVoices.find((v) => /nanami|haruka|google|kyoko|otoya/i.test(v.name)) ||
      jpVoices[0] ||
      null
    );
  }

  const enVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  return (
    enVoices.find((v) => /google us|aria|jenny|natural|samantha|daniel|google uk/i.test(v.name)) ||
    enVoices.find((v) => v.lang.toLowerCase() === 'en-us') ||
    enVoices[0] ||
    null
  );
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakText(
  text: string,
  language: Language,
  rate = 0.9,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'jp' ? 'ja-JP' : 'en-US';
  utterance.rate = Math.min(1.5, Math.max(0.5, rate));
  const voice = pickVoice(language);
  if (voice) utterance.voice = voice;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  window.speechSynthesis.speak(utterance);
}
