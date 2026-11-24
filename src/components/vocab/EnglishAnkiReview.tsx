import React, { useEffect, useMemo, useState } from 'react';
import { Volume2, Eye, RotateCcw, CheckCircle2, ArrowLeft, Snail } from 'lucide-react';
import type { VocabCard } from '../../types';
import { previewRatings, type ReviewRating } from '../../lib/fsrs';
import { lookupEnglishDictionary, speakText } from '../../lib/tts';

interface EnglishAnkiReviewProps {
  queue: VocabCard[];
  deckName: string;
  ttsRate: number;
  autoPlay: boolean;
  onRate: (card: VocabCard, rating: ReviewRating) => Promise<void>;
  onExit: () => void;
}

const RATING_BUTTONS: {
  rating: ReviewRating;
  label: string;
  keyHint: string;
  classes: string;
}[] = [
  {
    rating: 1,
    label: 'Quên (Again)',
    keyHint: '1',
    classes: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300',
  },
  {
    rating: 2,
    label: 'Khó (Hard)',
    keyHint: '2',
    classes: 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300',
  },
  {
    rating: 3,
    label: 'Nhớ (Good)',
    keyHint: '3',
    classes: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  {
    rating: 4,
    label: 'Rất dễ (Easy)',
    keyHint: '4',
    classes: 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300',
  },
];

export const EnglishAnkiReview: React.FC<EnglishAnkiReviewProps> = ({
  queue,
  deckName,
  ttsRate,
  autoPlay,
  onRate,
  onExit,
}) => {
  const [revealed, setRevealed] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [liveIpa, setLiveIpa] = useState<string | null>(null);
  const [audioBadge, setAudioBadge] = useState<'dict-mp3' | 'neural-tts' | null>(null);
  const currentCard = queue[0];

  const intervals = useMemo(
    () => (currentCard ? previewRatings(currentCard) : null),
    [currentCard]
  );

  useEffect(() => {
    setRevealed(false);
    setLiveIpa(null);
    setAudioBadge(null);
    if (!currentCard) return;

    let active = true;
    if (!currentCard.reading && currentCard.language === 'en') {
      void lookupEnglishDictionary(currentCard.front).then((info) => {
        if (active && info?.ipa) setLiveIpa(info.ipa);
      });
    }

    if (autoPlay) {
      speakText(currentCard.front, currentCard.language, {
        rate: ttsRate,
        onSourceUsed: (src) => {
          if (active && (src === 'dict-mp3' || src === 'neural-tts')) setAudioBadge(src);
        },
      });
    }
    return () => {
      active = false;
    };
  }, [currentCard?.id, autoPlay, ttsRate]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!currentCard) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' && !revealed) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        void handleSelectRating(Number(e.key) as ReviewRating);
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        speakText(currentCard.front, currentCard.language, ttsRate);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentCard, revealed, ttsRate]);

  async function handleSelectRating(rating: ReviewRating) {
    if (!currentCard) return;
    setSessionCount((c) => c + 1);
    setRevealed(false);
    await onRate(currentCard, rating);
  }

  if (!currentCard) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-emerald-200 bg-white p-10 text-center shadow-sm dark:border-emerald-900/50 dark:bg-slate-900">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          Hoàn thành phiên ôn Anki!
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Bạn vừa ôn xong <b>{sessionCount}</b> thẻ trong bộ <b>{deckName}</b>. Thuật toán FSRS đã tự lên lịch nhắc lại tối ưu.
        </p>
        <button
          onClick={onExit}
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Quay về danh sách bộ thẻ
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Session Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Bộ thẻ
        </button>
        <div className="text-center">
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{deckName}</div>
          <div className="text-xs text-slate-500">
            Còn lại <b>{queue.length}</b> thẻ cần ôn · Đã học phiên này: <b>{sessionCount}</b>
          </div>
        </div>
        <button
          onClick={() => speakText(currentCard.front, currentCard.language, ttsRate)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          title="Phát âm (phím R)"
        >
          <Volume2 className="h-4 w-4 text-indigo-500" />
          Nghe (R)
        </button>
      </div>

      {/* Flashcard */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="flex min-h-[240px] flex-col items-center justify-center p-8 text-center">
          <span className="mb-3 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            {currentCard.state === 0 ? 'Thẻ mới' : currentCard.state === 2 ? 'Ôn tập' : 'Đang học'}
          </span>

          <div className="font-jp text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            {currentCard.front}
          </div>

          {(currentCard.reading || liveIpa) && (
            <div className="mt-2 font-mono text-base text-slate-500 dark:text-slate-400">
              {currentCard.reading || liveIpa}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() =>
                speakText(currentCard.front, currentCard.language, {
                  rate: ttsRate,
                  onSourceUsed: (src) => {
                    if (src === 'dict-mp3' || src === 'neural-tts') setAudioBadge(src);
                  },
                })
              }
              className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-950/70 dark:text-indigo-300 dark:hover:bg-indigo-950"
            >
              <Volume2 className="h-4 w-4" />
              Nghe chuẩn
            </button>

            <button
              onClick={() =>
                speakText(currentCard.front, currentCard.language, {
                  rate: 0.68,
                  preferNativeAudio: false,
                })
              }
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Đọc chậm rõ từng âm tiết"
            >
              <Snail className="h-3.5 w-3.5" />
              Đọc chậm
            </button>
          </div>

          {audioBadge && (
            <span className="mt-2 text-[10px] font-medium text-slate-400">
              {audioBadge === 'dict-mp3' ? 'Giọng thu âm bản xứ (Dictionary)' : 'Giọng Neural tự nhiên'}
            </span>
          )}
        </div>

        {/* Back answer */}
        {revealed ? (
          <div className="border-t border-slate-100 bg-slate-50/80 p-7 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Nghĩa tiếng Việt
              </div>
              <div className="mt-1 text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                {currentCard.back}
              </div>
            </div>

            {currentCard.example && (
              <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-jp text-sm font-medium text-slate-800 dark:text-slate-200">
                    “{currentCard.example}”
                  </p>
                  <button
                    onClick={() => speakText(currentCard.example!, currentCard.language, ttsRate)}
                    className="shrink-0 rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                    title="Nghe câu ví dụ"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
                {currentCard.exampleVi && (
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    → {currentCard.exampleVi}
                  </p>
                )}
              </div>
            )}

            {currentCard.notes && (
              <p className="mt-3 text-center text-xs text-slate-500">Ghi chú: {currentCard.notes}</p>
            )}

            {/* FSRS Rating Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {RATING_BUTTONS.map((btn) => (
                <button
                  key={btn.rating}
                  onClick={() => handleSelectRating(btn.rating)}
                  className={`flex flex-col items-center rounded-2xl border px-3 py-3 transition active:scale-[0.98] ${btn.classes}`}
                >
                  <span className="text-sm font-bold">{btn.label}</span>
                  <span className="mt-0.5 text-xs opacity-80">
                    {intervals?.[btn.rating] || ''}
                  </span>
                  <span className="mt-1 hidden text-[10px] opacity-60 sm:inline">
                    Phím {btn.keyHint}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="border-t border-slate-100 p-6 text-center dark:border-slate-800">
            <button
              onClick={() => setRevealed(true)}
              className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-[0.99]"
            >
              <Eye className="h-5 w-5" />
              Hiện đáp án (Space)
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <RotateCcw className="h-3.5 w-3.5" /> Phím tắt: <b>Space</b> lật thẻ · <b>1–4</b> chấm mức nhớ · <b>R</b> nghe lại
        </span>
      </div>
    </div>
  );
};
