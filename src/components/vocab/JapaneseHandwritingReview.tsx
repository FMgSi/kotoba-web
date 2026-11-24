import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  Snail,
  CheckCircle2,
  XCircle,
  Delete,
  PenTool,
  Keyboard,
  Layers,
  Lightbulb,
  RotateCcw,
  Eye,
  Zap,
} from 'lucide-react';
import { toHiragana } from 'wanakana';
import type { JpStudyMode, VocabCard } from '../../types';
import { previewRatings, type ReviewRating } from '../../lib/fsrs';
import { speakText } from '../../lib/tts';
import type { RecognitionScope } from '../../lib/kanjiCanvasLoader';
import { JapaneseHandwritingPad } from './JapaneseHandwritingPad';

interface JapaneseHandwritingReviewProps {
  queue: VocabCard[];
  deckName: string;
  studyMode: JpStudyMode;
  ttsRate: number;
  autoPlay: boolean;
  onChangeMode: (mode: JpStudyMode) => void;
  onRate: (card: VocabCard, rating: ReviewRating, usedHandwriting: boolean) => Promise<void>;
  onExit: () => void;
}

const RATING_BUTTONS: {
  rating: ReviewRating;
  keyHint: string;
  label: string;
  classes: string;
}[] = [
  {
    rating: 1,
    keyHint: '1',
    label: 'Quên (Again)',
    classes:
      'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300',
  },
  {
    rating: 2,
    keyHint: '2',
    label: 'Khó (Hard)',
    classes:
      'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300',
  },
  {
    rating: 3,
    keyHint: '3',
    label: 'Nhớ (Good)',
    classes:
      'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  {
    rating: 4,
    keyHint: '4',
    label: 'Rất dễ (Easy)',
    classes:
      'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300',
  },
];

function cleanJp(str: string): string {
  return str.replace(/[\s\u3000。、！？!?.]/g, '').trim();
}

function getLessonBadge(tags?: string[]): string | null {
  const tag = tags?.find((t) => /^bai-\d{2}$/.test(t));
  if (!tag) return null;
  const n = Number(tag.replace('bai-', ''));
  return Number.isFinite(n) ? `Bài ${n}` : null;
}

function extractKanjiRefFromNotes(notes?: string): string | null {
  if (!notes) return null;
  const m = notes.match(/Kanji:\s*([^·]+)/);
  return m ? m[1].trim() : null;
}

function getSpeakableText(card: VocabCard, isKanjiCard: boolean): string {
  if (isKanjiCard) {
    // Speak a natural N5 compound word from the example so TTS reads naturally instead of isolated Kanji
    const firstCompound = card.example?.split(/[、,（(]/)[0]?.trim();
    if (firstCompound) return firstCompound;
    const firstReading = card.reading?.split(/[・/／\s]/).find(Boolean);
    if (firstReading) return firstReading;
  }
  return card.front;
}

export const JapaneseHandwritingReview: React.FC<JapaneseHandwritingReviewProps> = ({
  queue,
  deckName,
  studyMode,
  ttsRate,
  autoPlay,
  onChangeMode,
  onRate,
  onExit,
}) => {
  const currentCard = queue[0];
  const [answerChars, setAnswerChars] = useState<string[]>([]);
  const [typingInput, setTypingInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [autoVerify, setAutoVerify] = useState(true);
  const [traceOnRetry, setTraceOnRetry] = useState(false);
  const [verifiedState, setVerifiedState] = useState<'idle' | 'correct' | 'wrong' | 'flipped'>('idle');
  const [sessionCount, setSessionCount] = useState(0);

  const intervals = useMemo(
    () => (currentCard ? previewRatings(currentCard) : null),
    [currentCard]
  );

  const isKanjiCard = useMemo(() => {
    if (!currentCard) return false;
    return (
      Boolean(currentCard.tags?.includes('kanji')) ||
      /^[\u4E00-\u9FAF]$/.test(cleanJp(currentCard.front))
    );
  }, [currentCard]);

  // Detect optimal handwriting recognition scope so Kanji never collides with Katakana
  const suggestedScope: RecognitionScope = useMemo(() => {
    if (!currentCard) return 'kana';
    if (isKanjiCard) return 'kanji';
    const text = cleanJp(currentCard.front);
    if (/^[\u30A0-\u30FFー]+$/.test(text)) return 'katakana';
    if (/^[\u3040-\u309F]+$/.test(text)) return 'hiragana';
    if (/[\u4E00-\u9FAF]/.test(text)) return 'all';
    return 'kana';
  }, [currentCard, isKanjiCard]);

  const speakCard = useCallback(
    (rateOverride?: number) => {
      if (!currentCard) return;
      const text = getSpeakableText(currentCard, isKanjiCard);
      if (rateOverride !== undefined) {
        speakText(text, 'jp', { rate: rateOverride });
      } else {
        speakText(text, 'jp', ttsRate);
      }
    },
    [currentCard, isKanjiCard, ttsRate]
  );

  useEffect(() => {
    setAnswerChars([]);
    setTypingInput('');
    setShowHint(false);
    setTraceOnRetry(false);
    setVerifiedState('idle');
    if (currentCard && autoPlay) {
      speakCard();
    }
  }, [currentCard?.id, autoPlay, speakCard]);

  const targetFront = currentCard ? cleanJp(currentCard.front) : '';
  const targetReading = currentCard?.reading ? cleanJp(currentCard.reading) : targetFront;
  const targetCharArray = useMemo(() => Array.from(targetFront), [targetFront]);

  const verifyWord = useCallback(
    (rawWord: string, mode: JpStudyMode) => {
      if (!currentCard) return;
      const userWord = cleanJp(rawWord);
      if (!userWord) return;

      let exactMatch = false;
      if (isKanjiCard) {
        if (mode === 'handwriting') {
          // Must write the actual Kanji character!
          exactMatch = userWord === targetFront;
        } else {
          // In typing mode, accept either the Kanji itself or any valid On/Kun reading
          const readings = (currentCard.reading || '')
            .split(/[・/／、,\s]+/)
            .map((r) => toHiragana(cleanJp(r)))
            .filter(Boolean);
          const normTyped = toHiragana(userWord);
          exactMatch = userWord === targetFront || readings.includes(normTyped);
        }
      } else {
        exactMatch =
          userWord === targetFront ||
          userWord === targetReading ||
          toHiragana(userWord) === toHiragana(targetReading);
      }

      setVerifiedState(exactMatch ? 'correct' : 'wrong');
      speakCard();
    },
    [currentCard, isKanjiCard, targetFront, targetReading, speakCard]
  );

  const handleRate = useCallback(
    async (rating: ReviewRating) => {
      if (!currentCard) return;
      setSessionCount((c) => c + 1);
      await onRate(currentCard, rating, studyMode === 'handwriting');
    },
    [currentCard, onRate, studyMode]
  );

  // Keyboard shortcuts: 1-4 to rate FSRS after verification, R to replay audio
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!currentCard) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        speakCard();
      } else if (verifiedState !== 'idle' && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        void handleRate(Number(e.key) as ReviewRating);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentCard, verifiedState, speakCard, handleRate]);

  if (!currentCard) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-emerald-200 bg-white p-10 text-center shadow-sm dark:border-emerald-900/50 dark:bg-slate-900">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          おつかれさま! Hoàn thành phiên học tiếng Nhật!
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Bạn đã luyện viết & ôn xong <b>{sessionCount}</b> từ trong bộ <b>{deckName}</b>.
        </p>
        <button
          onClick={onExit}
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Quay về bộ thẻ
        </button>
      </div>
    );
  }

  const userWord =
    studyMode === 'handwriting'
      ? cleanJp(answerChars.join(''))
      : cleanJp(toHiragana(typingInput, { IMEMode: true }));
  const userCharArray = Array.from(userWord);

  function handleCommitHandwrittenChar(ch: string) {
    const next = targetCharArray.length === 1 ? [ch] : [...answerChars, ch];
    setAnswerChars(next);
    if (autoVerify && next.length >= targetCharArray.length) {
      verifyWord(next.join(''), 'handwriting');
    }
  }

  function handleRetryWriting(withTrace = false) {
    setAnswerChars([]);
    setTypingInput('');
    setTraceOnRetry(withTrace);
    setVerifiedState('idle');
  }

  const lessonBadge = getLessonBadge(currentCard.tags);
  const kanjiRef = !isKanjiCard ? extractKanjiRefFromNotes(currentCard.notes) : null;
  const activeSlotIdx = Math.min(answerChars.length, Math.max(0, targetCharArray.length - 1));
  const currentGuideChar = targetCharArray[activeSlotIdx] || targetCharArray[0];

  // Split Kanji back "NHẬT — mặt trời, ngày" nicely for display
  const kanjiSplit = isKanjiCard ? currentCard.back.split(/\s*[—–-]\s*/) : null;
  const kanjiHanViet = kanjiSplit && kanjiSplit.length >= 2 ? kanjiSplit[0] : null;
  const kanjiMeaning =
    kanjiSplit && kanjiSplit.length >= 2 ? kanjiSplit.slice(1).join(' — ') : currentCard.back;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Bộ thẻ
        </button>

        {/* Study Mode Switcher */}
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {[
            { id: 'handwriting', label: 'Viết tay', icon: PenTool },
            { id: 'typing', label: 'Gõ Kana', icon: Keyboard },
            { id: 'flip', label: 'Lật thẻ', icon: Layers },
          ].map((m) => {
            const Icon = m.icon;
            const active = studyMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  onChangeMode(m.id as JpStudyMode);
                  setVerifiedState('idle');
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500">
          Còn <b>{queue.length}</b> thẻ
        </div>
      </div>

      {/* Main Prompt Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        {/* Prompt Header: Vietnamese Meaning + Audio */}
        <div className="border-b border-slate-100 bg-gradient-to-br from-rose-50/70 via-white to-indigo-50/60 p-6 text-center dark:border-[#3f4147] dark:bg-[#232428] dark:bg-none">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-rose-100 px-3 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
              {isKanjiCard
                ? 'Kanji N5'
                : suggestedScope === 'katakana'
                ? 'Katakana'
                : suggestedScope === 'hiragana'
                ? 'Hiragana'
                : 'Tiếng Nhật'}
            </span>
            {lessonBadge && (
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                {lessonBadge}
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {isKanjiCard ? 'Viết 1 chữ Kanji' : `${targetCharArray.length} ký tự`}
            </span>
          </div>

          {studyMode === 'flip' ? (
            <h2 className="font-jp mt-3 text-5xl font-extrabold text-slate-900 sm:text-6xl dark:text-white">
              {currentCard.front}
            </h2>
          ) : isKanjiCard && kanjiHanViet ? (
            <div className="mt-3">
              <div className="inline-block rounded-xl bg-indigo-600/10 px-3 py-1 text-sm font-black tracking-wider text-indigo-700 dark:bg-[#5865f2]/20 dark:text-[#b4beff]">
                Hán-Việt: {kanjiHanViet}
              </div>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-white">
                {kanjiMeaning}
              </h2>
              {currentCard.reading && (
                <div className="font-jp mt-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Âm đọc: <span className="text-slate-700 dark:text-slate-200">{currentCard.reading}</span>
                </div>
              )}
            </div>
          ) : (
            <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-white">
              {currentCard.back}
            </h2>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => speakCard()}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-indigo-700 shadow-sm ring-1 ring-slate-200 hover:bg-indigo-50 dark:bg-slate-800 dark:text-indigo-300 dark:ring-slate-700"
            >
              <Volume2 className="h-4 w-4" />
              Nghe phát âm (R)
            </button>

            <button
              type="button"
              onClick={() => speakCard(0.72)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
            >
              <Snail className="h-3.5 w-3.5" />
              Chậm
            </button>

            {studyMode !== 'flip' && verifiedState === 'idle' && (
              <button
                type="button"
                onClick={() => setShowHint((h) => !h)}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                {showHint ? 'Ẩn gợi ý' : 'Gợi ý'}
              </button>
            )}
          </div>

          {showHint && studyMode !== 'flip' && verifiedState === 'idle' && (
            <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
              {currentCard.notes && <span>{currentCard.notes}</span>}
              {!isKanjiCard && currentCard.romaji && currentCard.back !== currentCard.romaji && (
                <span>
                  Romaji: <b>{currentCard.romaji}</b>
                </span>
              )}
              {targetCharArray.length > 1 && (
                <span>
                  Chữ đầu: <b className="font-jp text-sm">{targetCharArray[0]}</b>
                </span>
              )}
              {currentCard.example && targetCharArray.length === 1 && (
                <span>
                  Ví dụ: <b className="font-jp">{currentCard.example}</b> ({currentCard.exampleVi})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Interactive Input Area */}
        <div className="p-5 sm:p-6">
          {studyMode === 'handwriting' && verifiedState === 'idle' && (
            <div className="space-y-4">
              {/* Assembled Answer Strip */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-[#1e1f22]">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {isKanjiCard
                      ? 'Chữ Kanji bạn viết'
                      : `Từ bạn đã viết (${answerChars.length}/${targetCharArray.length} chữ)`}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAutoVerify((v) => !v)}
                      title="Tự động chấm ngay khi chọn đủ số chữ"
                      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition ${
                        autoVerify
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <Zap className="h-3 w-3" />
                      Tự chấm: {autoVerify ? 'Bật' : 'Tắt'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setAnswerChars((prev) => prev.slice(0, -1))}
                      disabled={answerChars.length === 0}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <Delete className="h-3.5 w-3.5" />
                      Xóa 1 chữ
                    </button>
                  </div>
                </div>

                {/* Clickable character slots */}
                <div className="flex min-h-[54px] flex-wrap items-center justify-center gap-2">
                  {Array.from({ length: Math.max(targetCharArray.length, answerChars.length) }).map(
                    (_, i) => {
                      const ch = answerChars[i];
                      const isCurrentSlot = i === answerChars.length;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={!ch}
                          onClick={() => setAnswerChars((prev) => prev.slice(0, i))}
                          title={ch ? 'Chạm để xóa từ vị trí này' : undefined}
                          className={`font-jp flex h-13 w-13 items-center justify-center rounded-xl border-2 text-2xl font-bold transition ${
                            ch
                              ? 'border-indigo-500 bg-white text-indigo-700 shadow-sm hover:border-rose-400 dark:bg-[#2b2d31] dark:text-indigo-300'
                              : isCurrentSlot
                              ? 'border-indigo-400 bg-indigo-50/50 text-indigo-400 ring-2 ring-indigo-500/20 dark:border-[#5865f2] dark:bg-[#2b2d31]'
                              : 'border-dashed border-slate-300 bg-white/50 text-slate-300 dark:border-[#3f4147] dark:bg-[#2b2d31]/50'
                          }`}
                        >
                          {ch || (isCurrentSlot && targetCharArray.length > 1 ? i + 1 : '')}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Upgraded Handwriting Pad with Offline Stroke Animation & Ghost Trace */}
              <JapaneseHandwritingPad
                key={`${currentCard.id}-${suggestedScope}`}
                defaultScope={suggestedScope}
                guideChar={currentGuideChar}
                initialTrace={traceOnRetry}
                slotLabel={
                  targetCharArray.length > 1
                    ? `Chữ ${activeSlotIdx + 1}/${targetCharArray.length}`
                    : undefined
                }
                onCommitChar={handleCommitHandwrittenChar}
                onEmptyEnter={() => {
                  if (answerChars.length > 0) verifyWord(answerChars.join(''), 'handwriting');
                }}
              />

              {/* Verify Action Row */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => verifyWord(answerChars.join(''), 'handwriting')}
                  disabled={answerChars.length === 0}
                  className="flex-1 rounded-2xl bg-emerald-600 px-6 py-3.5 text-base font-bold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:opacity-40 dark:shadow-none"
                >
                  Xác nhận {isKanjiCard ? 'chữ Kanji' : 'từ đã viết'}
                </button>
                <button
                  type="button"
                  onClick={() => setVerifiedState('wrong')}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Không nhớ / Xem đáp án
                </button>
              </div>
            </div>
          )}

          {studyMode === 'typing' && verifiedState === 'idle' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyWord(toHiragana(typingInput, { IMEMode: true }), 'typing');
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                  {isKanjiCard
                    ? 'Gõ âm đọc On/Kun bằng Romaji (vd: nichi, hi) hoặc nhập Kanji:'
                    : 'Gõ Romaji (tự chuyển sang Hiragana) hoặc gõ trực tiếp Kana:'}
                </label>
                <input
                  autoFocus
                  value={typingInput}
                  onChange={(e) => setTypingInput(toHiragana(e.target.value, { IMEMode: true }))}
                  placeholder={isKanjiCard ? "vd: gõ 'nichi' → にち" : "vd: gõ 'watashi' → わたし"}
                  className="font-jp w-full rounded-2xl border-2 border-indigo-200 bg-white px-4 py-3.5 text-center text-2xl font-bold text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-[#3f4147] dark:bg-[#1e1f22] dark:text-[#f2f3f5] dark:focus:border-[#5865f2]"
                />
              </div>
              <div className="flex gap-2.5">
                <button
                  type="submit"
                  disabled={!typingInput.trim()}
                  className="flex-1 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
                >
                  Kiểm tra đáp án (Enter)
                </button>
                <button
                  type="button"
                  onClick={() => setVerifiedState('wrong')}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Xem đáp án
                </button>
              </div>
            </form>
          )}

          {studyMode === 'flip' && verifiedState === 'idle' && (
            <div className="py-4 text-center">
              <button
                type="button"
                onClick={() => setVerifiedState('flipped')}
                className="w-full max-w-xs rounded-2xl bg-indigo-600 px-6 py-3.5 text-base font-bold text-white hover:bg-indigo-700"
              >
                Hiện nghĩa tiếng Việt
              </button>
            </div>
          )}

          {/* Verification Result + FSRS Rating */}
          {verifiedState !== 'idle' && (
            <div className="space-y-5">
              {verifiedState === 'correct' && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-900/60 dark:bg-emerald-950/40">
                  <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="text-lg font-extrabold">Chính xác tuyệt đối!</span>
                  </div>
                  <div className="font-jp mt-2 text-5xl font-extrabold text-slate-900 dark:text-white">
                    {currentCard.front}
                  </div>
                  {kanjiRef && (
                    <div className="font-jp mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-300">
                      Hán tự: {kanjiRef}
                    </div>
                  )}
                  {currentCard.romaji && (
                    <div className="mt-1 text-sm text-slate-500">({currentCard.romaji})</div>
                  )}
                </div>
              )}

              {verifiedState === 'wrong' && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5 dark:border-rose-900/60 dark:bg-rose-950/30">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 text-rose-700 dark:text-rose-300">
                      <XCircle className="h-5 w-5" />
                      <span className="font-bold">Chưa khớp hoàn toàn — xem đối chiếu:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {studyMode === 'handwriting' && (
                        <button
                          type="button"
                          onClick={() => handleRetryWriting(true)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-200 dark:bg-amber-950/80 dark:text-amber-300"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Tô theo nét mẫu
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRetryWriting(false)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-sm hover:bg-indigo-50 dark:bg-slate-800 dark:text-indigo-300"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Viết lại ngay
                      </button>
                    </div>
                  </div>

                  {/* Per-character diff comparison */}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-3.5 text-center dark:bg-slate-900">
                      <div className="text-[11px] font-semibold uppercase text-slate-400">
                        Bạn viết
                      </div>
                      <div className="font-jp mt-1.5 flex justify-center gap-1 text-3xl font-bold">
                        {userCharArray.length > 0 ? (
                          userCharArray.map((ch, idx) => {
                            const ok =
                              ch === targetCharArray[idx] ||
                              (!isKanjiCard &&
                                toHiragana(ch) === toHiragana(targetCharArray[idx] || ''));
                            return (
                              <span
                                key={idx}
                                className={
                                  ok ? 'text-emerald-600' : 'text-rose-600 underline decoration-wavy'
                                }
                              >
                                {ch}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-sm font-normal text-slate-400">(Đã bỏ qua)</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl bg-white p-3.5 text-center dark:bg-slate-900">
                      <div className="text-[11px] font-semibold uppercase text-slate-400">
                        Đáp án đúng
                      </div>
                      <div className="font-jp mt-1.5 text-4xl font-extrabold text-indigo-700 dark:text-indigo-300">
                        {currentCard.front}
                      </div>
                      {kanjiRef && (
                        <div className="font-jp mt-0.5 text-sm font-semibold text-slate-500">
                          Kanji: {kanjiRef}
                        </div>
                      )}
                      {currentCard.romaji && (
                        <div className="text-xs text-slate-500">({currentCard.romaji})</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {verifiedState === 'flipped' && (
                <div className="rounded-2xl bg-indigo-50/70 p-5 text-center dark:bg-indigo-950/40">
                  <div className="text-xs font-semibold uppercase text-slate-400">
                    Nghĩa tiếng Việt
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">
                    {currentCard.back}
                  </div>
                  {currentCard.reading && currentCard.reading !== currentCard.front && (
                    <div className="font-jp mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {currentCard.reading}
                    </div>
                  )}
                  {currentCard.romaji && (
                    <div className="mt-0.5 text-sm text-slate-500">({currentCard.romaji})</div>
                  )}
                </div>
              )}

              {/* Example sentence & notes */}
              {(currentCard.example || currentCard.notes) && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-[#1e1f22]">
                  {currentCard.example && (
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-jp text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {currentCard.example}
                        </p>
                        {currentCard.exampleVi && (
                          <p className="mt-1 text-xs text-slate-500">→ {currentCard.exampleVi}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => speakText(currentCard.example!, 'jp', ttsRate)}
                        className="rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-950"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {currentCard.notes && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {currentCard.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Anki FSRS Rating Buttons */}
              <div>
                <div className="mb-2 text-center text-xs font-semibold text-slate-500">
                  Chọn mức độ nhớ (phím 1–4) để Anki (FSRS) lên lịch ôn tiếp theo:
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {RATING_BUTTONS.map((btn) => {
                    const recommended =
                      (verifiedState === 'correct' && btn.rating === 3) ||
                      (verifiedState === 'wrong' && btn.rating === 1);
                    return (
                      <button
                        key={btn.rating}
                        type="button"
                        onClick={() => void handleRate(btn.rating)}
                        className={`flex flex-col items-center rounded-2xl border px-3 py-3 transition active:scale-[0.98] ${
                          btn.classes
                        } ${
                          recommended
                            ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900'
                            : ''
                        }`}
                      >
                        <span className="text-sm font-bold">{btn.label}</span>
                        <span className="mt-0.5 text-xs opacity-80">
                          [{btn.keyHint}] {intervals?.[btn.rating] || ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
