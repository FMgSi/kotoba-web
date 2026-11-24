import { toHiragana } from 'wanakana';
import type { Language } from '../types';

export type EnAccent = 'us' | 'uk';

export interface AudioPrefs {
  enAccent: EnAccent;
  voiceNameEn?: string;
  voiceNameJp?: string;
}

export interface DictionaryLookupResult {
  word: string;
  ipa?: string;
  audioUs?: string;
  audioUk?: string;
  audioAny?: string;
}

// 104 studio-recorded MIT-licensed Japanese Kana audio files (Hiragana & Katakana share identical sounds)
// Source: https://github.com/veardk/just-gojuon (MIT License)
const HIRA_TO_AUDIO_PATH: Record<string, string> = {
  // Seion (46)
  あ: 'seion/a.mp3', い: 'seion/i.mp3', う: 'seion/u.mp3', え: 'seion/e.mp3', お: 'seion/o.mp3',
  か: 'seion/ka.mp3', き: 'seion/ki.mp3', く: 'seion/ku.mp3', け: 'seion/ke.mp3', こ: 'seion/ko.mp3',
  さ: 'seion/sa.mp3', し: 'seion/shi.mp3', す: 'seion/su.mp3', せ: 'seion/se.mp3', そ: 'seion/so.mp3',
  た: 'seion/ta.mp3', ち: 'seion/chi.mp3', つ: 'seion/tsu.mp3', て: 'seion/te.mp3', と: 'seion/to.mp3',
  な: 'seion/na.mp3', に: 'seion/ni.mp3', ぬ: 'seion/nu.mp3', ね: 'seion/ne.mp3', の: 'seion/no.mp3',
  は: 'seion/ha.mp3', ひ: 'seion/hi.mp3', ふ: 'seion/fu.mp3', へ: 'seion/he.mp3', ほ: 'seion/ho.mp3',
  ま: 'seion/ma.mp3', み: 'seion/mi.mp3', む: 'seion/mu.mp3', め: 'seion/me.mp3', も: 'seion/mo.mp3',
  や: 'seion/ya.mp3', ゆ: 'seion/yu.mp3', よ: 'seion/yo.mp3',
  ら: 'seion/ra.mp3', り: 'seion/ri.mp3', る: 'seion/ru.mp3', れ: 'seion/re.mp3', ろ: 'seion/ro.mp3',
  わ: 'seion/wa.mp3', を: 'seion/wo.mp3', ん: 'seion/n.mp3',

  // Dakuon (20)
  が: 'dakuon/ga.mp3', ぎ: 'dakuon/gi.mp3', ぐ: 'dakuon/gu.mp3', げ: 'dakuon/ge.mp3', ご: 'dakuon/go.mp3',
  ざ: 'dakuon/za.mp3', じ: 'dakuon/ji.mp3', ず: 'dakuon/zu.mp3', ぜ: 'dakuon/ze.mp3', ぞ: 'dakuon/zo.mp3',
  だ: 'dakuon/da.mp3', ぢ: 'dakuon/di.mp3', づ: 'dakuon/du.mp3', で: 'dakuon/de.mp3', ど: 'dakuon/do.mp3',
  ば: 'dakuon/ba.mp3', び: 'dakuon/bi.mp3', ぶ: 'dakuon/bu.mp3', べ: 'dakuon/be.mp3', ぼ: 'dakuon/bo.mp3',

  // Handakuon (5)
  ぱ: 'handakuon/pa.mp3', ぴ: 'handakuon/pi.mp3', ぷ: 'handakuon/pu.mp3', ぺ: 'handakuon/pe.mp3', ぽ: 'handakuon/po.mp3',

  // Yoon (33)
  きゃ: 'yoon/kya.mp3', きゅ: 'yoon/kyu.mp3', きょ: 'yoon/kyo.mp3',
  しゃ: 'yoon/sya.mp3', しゅ: 'yoon/syu.mp3', しょ: 'yoon/syo.mp3',
  ちゃ: 'yoon/cya.mp3', ちゅ: 'yoon/cyu.mp3', ちょ: 'yoon/cyo.mp3',
  にゃ: 'yoon/nya.mp3', にゅ: 'yoon/nyu.mp3', にょ: 'yoon/nyo.mp3',
  ひゃ: 'yoon/hya.mp3', ひゅ: 'yoon/hyu.mp3', ひょ: 'yoon/hyo.mp3',
  みゃ: 'yoon/mya.mp3', みゅ: 'yoon/myu.mp3', みょ: 'yoon/myo.mp3',
  りゃ: 'yoon/rya.mp3', りゅ: 'yoon/ryu.mp3', りょ: 'yoon/ryo.mp3',
  ぎゃ: 'yoon/gya.mp3', ぎゅ: 'yoon/gyu.mp3', ぎょ: 'yoon/gyo.mp3',
  じゃ: 'yoon/zya.mp3', じゅ: 'yoon/zyu.mp3', じょ: 'yoon/zyo.mp3',
  びゃ: 'yoon/bya.mp3', びゅ: 'yoon/byu.mp3', びょ: 'yoon/byo.mp3',
  ぴゃ: 'yoon/pya.mp3', ぴゅ: 'yoon/pyu.mp3', ぴょ: 'yoon/pyo.mp3',
};

let currentPrefs: AudioPrefs = { enAccent: 'us' };
let cachedVoices: SpeechSynthesisVoice[] = [];
let activeAudio: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let speakSeq = 0;

const dictCache = new Map<string, DictionaryLookupResult | null>();
const dictInFlight = new Map<string, Promise<DictionaryLookupResult | null>>();

export function configureAudioPreferences(prefs: Partial<AudioPrefs>): void {
  currentPrefs = { ...currentPrefs, ...prefs };
}

function readVoicesNow(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) cachedVoices = voices;
  return cachedVoices;
}

export function ensureVoicesReady(timeoutMs = 500): Promise<SpeechSynthesisVoice[]> {
  const immediate = readVoicesNow();
  if (immediate.length > 0 || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve(immediate);
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve(readVoicesNow());
    };
    const prevHandler = window.speechSynthesis.onvoiceschanged;
    window.speechSynthesis.onvoiceschanged = (ev) => {
      if (typeof prevHandler === 'function') {
        prevHandler.call(window.speechSynthesis, ev);
      }
      finish();
    };
    window.setTimeout(finish, timeoutMs);
  });
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  readVoicesNow();
  window.speechSynthesis.onvoiceschanged = () => {
    readVoicesNow();
  };
}

function scoreJapaneseVoice(v: SpeechSynthesisVoice): number {
  const name = v.name;
  const lang = v.lang.toLowerCase();
  if (!lang.startsWith('ja')) return -999;

  let score = 10;
  if (lang === 'ja-jp') score += 20;
  // Microsoft Edge Neural voices (often displayed in Kanji: 七海 = Nanami, 圭太 = Keita)
  if (/七海|nanami/i.test(name)) score += 200;
  else if (/圭太|keita/i.test(name)) score += 185;
  if (/online\s*\(natural\)|natural|neural/i.test(name)) score += 120;
  if (/google\s*(日本語|japanese)/i.test(name)) score += 110;
  if (/kyoko|o-ren|otoya|siri/i.test(name)) score += 95;
  if (!v.localService) score += 20;
  // Deprioritize legacy robotic Windows SAPI desktop voices
  if (/haruka|ayumi|ichiro|sayaka|espeak/i.test(name)) score -= 70;
  return score;
}

function scoreEnglishVoice(v: SpeechSynthesisVoice, accent: EnAccent): number {
  const name = v.name;
  const lang = v.lang.toLowerCase();
  if (!lang.startsWith('en')) return -999;

  const targetLocale = accent === 'uk' ? 'en-gb' : 'en-us';
  let score = 0;

  // Strongly enforce requested US or UK accent so Edge doesn't pick Australia/India/Kenya!
  if (lang === targetLocale) score += 140;
  else if (lang === 'en-us' || lang === 'en-gb') score += 50;
  else score -= 30;

  if (/online\s*\(natural\)|natural|neural/i.test(name)) score += 90;

  // Prefer single-locale native voices over Multilingual (which can sound slightly accented on short isolated words)
  if (!/multilingual/i.test(name)) score += 18;

  if (accent === 'uk') {
    if (/\b(sonia|ryan|libby|daniel|google uk)\b/i.test(name)) score += 40;
  } else {
    if (/\b(jenny|aria|ava|andrew|guy|emma|samantha|google us)\b/i.test(name)) score += 40;
  }

  // Deprioritize ancient robotic SAPI desktop voices
  if (/\b(david|zira|mark|hazel|george|susan|espeak)\b/i.test(name)) score -= 75;
  return score;
}

export function getRankedVoices(
  language: Language,
  accent: EnAccent = currentPrefs.enAccent
): SpeechSynthesisVoice[] {
  const voices = readVoicesNow();
  if (language === 'jp') {
    return voices
      .filter((v) => v.lang.toLowerCase().startsWith('ja'))
      .sort((a, b) => scoreJapaneseVoice(b) - scoreJapaneseVoice(a));
  }
  return voices
    .filter((v) => v.lang.toLowerCase().startsWith('en'))
    .sort((a, b) => scoreEnglishVoice(b, accent) - scoreEnglishVoice(a, accent));
}

function pickBestVoice(
  language: Language,
  accent: EnAccent = currentPrefs.enAccent
): SpeechSynthesisVoice | null {
  const ranked = getRankedVoices(language, accent);
  if (!ranked.length) return null;

  const preferredName = language === 'jp' ? currentPrefs.voiceNameJp : currentPrefs.voiceNameEn;
  if (preferredName) {
    const exact = ranked.find((v) => v.name === preferredName);
    if (exact) return exact;
  }
  return ranked[0];
}

export function getKanaNativeAudioUrl(text: string): string | null {
  const clean = text.replace(/[\s\u3000。、！？!?.]/g, '').trim();
  if (!clean || clean.length > 2) return null;
  // Convert single Katakana (or 2-char Katakana yoon like キャ) to Hiragana key
  const hira = toHiragana(clean);
  const relPath = HIRA_TO_AUDIO_PATH[hira];
  return relPath ? `./audio/kana/${relPath}` : null;
}

export async function lookupEnglishDictionary(
  rawText: string
): Promise<DictionaryLookupResult | null> {
  const clean = rawText.trim().toLowerCase();
  // Only query dictionary for clean single English words (not full sentences or multi-word idioms)
  if (!/^[a-z]{2,28}(-[a-z]{2,15})?$/.test(clean)) return null;

  if (dictCache.has(clean)) return dictCache.get(clean) ?? null;
  const existingReq = dictInFlight.get(clean);
  if (existingReq) return existingReq;

  const promise = (async (): Promise<DictionaryLookupResult | null> => {
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 2200);
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`,
        { signal: controller.signal }
      );
      window.clearTimeout(timeout);
      if (!res.ok) {
        dictCache.set(clean, null);
        return null;
      }
      const data = (await res.json()) as Array<{
        phonetic?: string;
        phonetics?: Array<{ text?: string; audio?: string }>;
      }>;
      if (!Array.isArray(data) || !data.length) {
        dictCache.set(clean, null);
        return null;
      }

      const allPhonetics = data.flatMap((entry) => entry.phonetics || []);
      const ipa =
        allPhonetics.find((p) => p.text && p.text.trim())?.text?.trim() ||
        data[0].phonetic?.trim() ||
        undefined;

      const audioUrls = allPhonetics
        .map((p) => (p.audio || '').trim())
        .filter((u) => u.startsWith('http'));

      const audioUs = audioUrls.find((u) => /-us\.mp3/i.test(u));
      const audioUk = audioUrls.find((u) => /-uk\.mp3/i.test(u));
      const audioAny = audioUrls[0];

      const result: DictionaryLookupResult = {
        word: clean,
        ipa,
        audioUs,
        audioUk,
        audioAny,
      };
      dictCache.set(clean, result);
      return result;
    } catch {
      return null;
    } finally {
      dictInFlight.delete(clean);
    }
  })();

  dictInFlight.set(clean, promise);
  return promise;
}

function playAudioElement(url: string, rate: number, seq: number, onEnd?: () => void): Promise<boolean> {
  return new Promise((resolve) => {
    if (seq !== speakSeq) {
      resolve(false);
      return;
    }
    const audio = new Audio(url);
    audio.playbackRate = Math.min(1.4, Math.max(0.6, rate));
    activeAudio = audio;

    let settled = false;
    const done = (ok: boolean) => {
      if (settled) return;
      settled = true;
      if (activeAudio === audio) activeAudio = null;
      if (ok) onEnd?.();
      resolve(ok);
    };

    audio.onended = () => done(true);
    audio.onerror = () => done(false);
    audio.play().catch(() => done(false));
  });
}

export function stopSpeaking(): void {
  speakSeq++;
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {
      // ignore
    }
    activeAudio = null;
  }
  activeUtterance = null;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

export interface SpeakOptions {
  rate?: number;
  accent?: EnAccent;
  preferNativeAudio?: boolean;
  onEnd?: () => void;
  onSourceUsed?: (source: 'kana-mp3' | 'dict-mp3' | 'neural-tts') => void;
}

export function speakText(
  text: string,
  language: Language,
  rateOrOptions: number | SpeakOptions = 0.95,
  legacyOnEnd?: () => void
): void {
  if (typeof window === 'undefined' || !text.trim()) {
    legacyOnEnd?.();
    return;
  }

  const opts: SpeakOptions =
    typeof rateOrOptions === 'number'
      ? { rate: rateOrOptions, onEnd: legacyOnEnd }
      : rateOrOptions;

  const rate = Math.min(1.4, Math.max(0.55, opts.rate ?? 0.95));
  const accent = opts.accent ?? currentPrefs.enAccent;
  const preferNativeAudio = opts.preferNativeAudio !== false;

  stopSpeaking();
  const mySeq = speakSeq;

  void (async () => {
    // 1. Japanese single Kana / Yoon -> Always play crystal-clear bundled native MP3!
    if (language === 'jp' && preferNativeAudio) {
      const kanaUrl = getKanaNativeAudioUrl(text);
      if (kanaUrl) {
        opts.onSourceUsed?.('kana-mp3');
        const ok = await playAudioElement(kanaUrl, rate, mySeq, opts.onEnd);
        if (ok || mySeq !== speakSeq) return;
      }
    }

    // 2. Single English word -> Try real human studio dictionary MP3 first (when normal/near-normal speed)
    if (language === 'en' && preferNativeAudio && rate >= 0.7) {
      const dict = await lookupEnglishDictionary(text);
      if (mySeq !== speakSeq) return;
      const chosenUrl =
        accent === 'uk'
          ? dict?.audioUk || dict?.audioAny || dict?.audioUs
          : dict?.audioUs || dict?.audioAny || dict?.audioUk;
      if (chosenUrl) {
        opts.onSourceUsed?.('dict-mp3');
        const ok = await playAudioElement(chosenUrl, rate, mySeq, opts.onEnd);
        if (ok || mySeq !== speakSeq) return;
      }
    }

    // 3. High-quality Neural Web Speech API (waits for voices & avoids Chromium cancel-clipping!)
    if (!('speechSynthesis' in window)) {
      opts.onEnd?.();
      return;
    }

    await ensureVoicesReady(500);
    if (mySeq !== speakSeq) return;

    // Chromium/Edge clips the first ~120ms if speak() runs synchronously right after cancel()
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
      await new Promise((r) => window.setTimeout(r, 60));
      if (mySeq !== speakSeq) return;
    }

    // Clean Japanese text so isolated Katakana never gets read as Kanji
    const spokenText =
      language === 'jp' && text.trim().length <= 2 ? toHiragana(text.trim()) : text.trim();

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = language === 'jp' ? 'ja-JP' : accent === 'uk' ? 'en-GB' : 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const voice = pickBestVoice(language, accent);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    activeUtterance = utterance;
    opts.onSourceUsed?.('neural-tts');

    utterance.onend = () => {
      if (activeUtterance === utterance) activeUtterance = null;
      opts.onEnd?.();
    };
    utterance.onerror = () => {
      if (activeUtterance === utterance) activeUtterance = null;
      opts.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  })();
}
