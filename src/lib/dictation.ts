import { toHiragana } from 'wanakana';
import type { Language, ListeningSegment } from '../types';

export interface DiffToken {
  target: string;
  user?: string;
  status: 'correct' | 'wrong' | 'missing';
  masked: string;
}

export interface DictationCheckResult {
  isExact: boolean;
  accuracy: number;
  tokens: DiffToken[];
  correctCount: number;
  totalCount: number;
}

function normalizeEnWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/[.,!?;:"'()[\]{}—–-]/g, '')
    .trim();
}

function normalizeJpText(text: string): string {
  return text
    .replace(/[\s\u3000。、！？!?,.;:「」『』（）()・]/g, '')
    .trim();
}

function maskWord(word: string, revealFirstLetter = false): string {
  if (!word) return '';
  if (revealFirstLetter && word.length > 1) {
    return word[0] + '*'.repeat(Math.min(word.length - 1, 6));
  }
  return '*'.repeat(Math.min(Math.max(word.length, 2), 6));
}

export function compareDictation(
  userInput: string,
  targetText: string,
  language: Language,
  targetReading?: string
): DictationCheckResult {
  if (language === 'jp') {
    const cleanTarget = normalizeJpText(targetText);
    const cleanReading = targetReading ? normalizeJpText(targetReading) : '';
    const cleanUserRaw = normalizeJpText(userInput);
    const cleanUserHira = toHiragana(cleanUserRaw, { passRomaji: false });

    // Choose whether to compare against text or reading if user typed pure hiragana
    const compareAgainst =
      cleanReading &&
      cleanReading !== cleanTarget &&
      (cleanUserRaw === cleanReading || cleanUserHira === cleanReading)
        ? cleanReading
        : cleanTarget;

    const targetChars = Array.from(compareAgainst);
    const userChars = Array.from(cleanUserRaw);

    let correctCount = 0;
    const tokens: DiffToken[] = targetChars.map((ch, idx) => {
      const u = userChars[idx];
      const match =
        u === ch ||
        (u && toHiragana(u) === toHiragana(ch));
      if (match) {
        correctCount++;
        return { target: ch, user: u, status: 'correct', masked: ch };
      }
      if (!u) {
        return { target: ch, status: 'missing', masked: '＊' };
      }
      return { target: ch, user: u, status: 'wrong', masked: '＊' };
    });

    const extraCharsPenalty = Math.max(0, userChars.length - targetChars.length);
    const isExact = correctCount === targetChars.length && extraCharsPenalty === 0 && targetChars.length > 0;
    const accuracy =
      targetChars.length > 0
        ? Math.max(0, Math.round(((correctCount - extraCharsPenalty * 0.5) / targetChars.length) * 100))
        : 0;

    return {
      isExact,
      accuracy,
      tokens,
      correctCount,
      totalCount: targetChars.length,
    };
  }

  // English word-by-word DailyDictation style
  const rawTargetWords = targetText.trim().split(/\s+/).filter(Boolean);
  const rawUserWords = userInput.trim().split(/\s+/).filter(Boolean);

  let correctCount = 0;
  let userPointer = 0;
  const tokens: DiffToken[] = [];

  for (let i = 0; i < rawTargetWords.length; i++) {
    const tRaw = rawTargetWords[i];
    const tNorm = normalizeEnWord(tRaw);
    const uRaw = rawUserWords[userPointer];
    const uNorm = uRaw ? normalizeEnWord(uRaw) : '';

    if (uNorm && uNorm === tNorm) {
      correctCount++;
      tokens.push({ target: tRaw, user: uRaw, status: 'correct', masked: tRaw });
      userPointer++;
    } else if (!uRaw) {
      tokens.push({ target: tRaw, status: 'missing', masked: maskWord(tNorm, false) });
    } else {
      // Look ahead 1 word in user input in case user inserted an extra word
      const nextUserNorm = rawUserWords[userPointer + 1]
        ? normalizeEnWord(rawUserWords[userPointer + 1])
        : '';
      // Look ahead 1 word in target in case user skipped this word
      const nextTargetNorm = rawTargetWords[i + 1]
        ? normalizeEnWord(rawTargetWords[i + 1])
        : '';

      if (nextTargetNorm && uNorm === nextTargetNorm) {
        tokens.push({ target: tRaw, status: 'missing', masked: maskWord(tNorm, true) });
      } else if (nextUserNorm && nextUserNorm === tNorm) {
        correctCount++;
        tokens.push({
          target: tRaw,
          user: rawUserWords[userPointer + 1],
          status: 'correct',
          masked: tRaw,
        });
        userPointer += 2;
      } else {
        tokens.push({ target: tRaw, user: uRaw, status: 'wrong', masked: maskWord(tNorm, true) });
        userPointer++;
      }
    }
  }

  const isExact = correctCount === rawTargetWords.length && rawTargetWords.length > 0;
  const accuracy =
    rawTargetWords.length > 0 ? Math.round((correctCount / rawTargetWords.length) * 100) : 0;

  return {
    isExact,
    accuracy,
    tokens,
    correctCount,
    totalCount: rawTargetWords.length,
  };
}

export function buildHintInput(
  userInput: string,
  targetText: string,
  language: Language
): string {
  if (language === 'jp') {
    const cleanTarget = Array.from(normalizeJpText(targetText));
    const cleanUser = Array.from(normalizeJpText(userInput));
    let prefixLen = 0;
    while (
      prefixLen < cleanTarget.length &&
      prefixLen < cleanUser.length &&
      cleanTarget[prefixLen] === cleanUser[prefixLen]
    ) {
      prefixLen++;
    }
    const nextReveal = Math.min(cleanTarget.length, prefixLen + 1);
    return cleanTarget.slice(0, nextReveal).join('');
  }

  const targetWords = targetText.trim().split(/\s+/).filter(Boolean);
  const userWords = userInput.trim().split(/\s+/).filter(Boolean);
  let matchedPrefix = 0;
  while (
    matchedPrefix < targetWords.length &&
    matchedPrefix < userWords.length &&
    normalizeEnWord(targetWords[matchedPrefix]) === normalizeEnWord(userWords[matchedPrefix])
  ) {
    matchedPrefix++;
  }

  const revealed = targetWords.slice(0, Math.min(targetWords.length, matchedPrefix + 1));
  return revealed.join(' ') + (revealed.length < targetWords.length ? ' ' : '');
}

export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

function parseTimestampToSeconds(ts: string): number {
  const clean = ts.trim().replace(',', '.');
  const parts = clean.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return Number(clean) || 0;
}

export function parseSubtitlesToSegments(raw: string): ListeningSegment[] {
  const cleaned = raw.replace(/\r\n/g, '\n').replace(/^WEBVTT.*?\n\n?/s, '').trim();
  const blocks = cleaned.split(/\n{2,}/);
  const segments: ListeningSegment[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    const timeLineIdx = lines.findIndex((l) => l.includes('-->'));
    if (timeLineIdx !== -1) {
      const [startStr, endStr] = lines[timeLineIdx].split('-->');
      const text = lines
        .slice(timeLineIdx + 1)
        .join(' ')
        .replace(/<[^>]+>/g, '')
        .trim();
      if (!text) continue;
      segments.push({
        id: `seg-${segments.length + 1}`,
        index: segments.length,
        text,
        startSec: parseTimestampToSeconds(startStr),
        endSec: parseTimestampToSeconds(endStr.split(/\s+/)[0]),
      });
    }
  }

  return segments;
}

export function splitPlainTextToSegments(raw: string, language: Language): ListeningSegment[] {
  const lines = raw
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const sentences: string[] = [];
  for (const line of lines) {
    if (language === 'jp') {
      const parts = line
        .split(/(?<=[。！？!?])/)
        .map((s) => s.trim())
        .filter(Boolean);
      sentences.push(...(parts.length ? parts : [line]));
    } else {
      const parts = line
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
      sentences.push(...(parts.length ? parts : [line]));
    }
  }

  return sentences.map((text, idx) => ({
    id: `seg-${idx + 1}`,
    index: idx,
    text,
  }));
}
