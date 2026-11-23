import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lightbulb,
  SkipForward,
  FileText,
  Headphones,
  PlusCircle,
  PenTool,
  Keyboard,
  Volume2,
  X,
} from 'lucide-react';
import { toHiragana } from 'wanakana';
import type { Deck, ListeningExercise, ListeningProgress } from '../../types';
import {
  buildHintInput,
  compareDictation,
  type DictationCheckResult,
} from '../../lib/dictation';
import { speakText, stopSpeaking } from '../../lib/tts';
import { db, recordActivity } from '../../lib/db';
import { JapaneseHandwritingPad } from '../vocab/JapaneseHandwritingPad';

interface DictationPlayerProps {
  exercise: ListeningExercise;
  progress?: ListeningProgress;
  decks: Deck[];
  onBack: () => void;
  onProgressUpdated: () => Promise<void>;
}

interface YTPlayerInstance {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  setPlaybackRate: (rate: number) => void;
  getCurrentTime: () => number;
  destroy: () => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement | string,
        options: {
          height?: string | number;
          width?: string | number;
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: { onReady?: () => void };
        }
      ) => YTPlayerInstance;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const SPEEDS = [0.6, 0.75, 0.85, 1.0, 1.2];

export const DictationPlayer: React.FC<DictationPlayerProps> = ({
  exercise,
  progress,
  decks,
  onBack,
  onProgressUpdated,
}) => {
  const [viewMode, setViewMode] = useState<'dictation' | 'transcript'>('dictation');
  const [segmentIndex, setSegmentIndex] = useState<number>(
    Math.min(progress?.lastSegmentIndex ?? 0, Math.max(0, exercise.segments.length - 1))
  );
  const [userInput, setUserInput] = useState('');
  const [checkResult, setCheckResult] = useState<DictationCheckResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(exercise.language === 'jp' ? 0.85 : 0.9);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [autoRomaji, setAutoRomaji] = useState(true);
  const [showHandwritingInput, setShowHandwritingInput] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Quick Save Word to Anki popover
  const [saveWordDraft, setSaveWordDraft] = useState<{
    word: string;
    meaning: string;
    example: string;
    exampleVi?: string;
  } | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const ytReadyRef = useRef(false);
  const clipTimerRef = useRef<number | null>(null);

  const segment = exercise.segments[segmentIndex];
  const completedMap = progress?.completedSegments ?? {};
  const completedCount = Object.keys(completedMap).length;

  // Initialize YouTube IFrame API if exercise is a YouTube video
  useEffect(() => {
    if (exercise.audioType !== 'youtube' || !exercise.youtubeId) return;

    function mountPlayer() {
      if (!ytContainerRef.current || !window.YT?.Player) return;
      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        height: '180',
        width: '100%',
        videoId: exercise.youtubeId!,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: () => {
            ytReadyRef.current = true;
          },
        },
      });
    }

    if (window.YT?.Player) {
      mountPlayer();
    } else {
      const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existing) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = mountPlayer;
    }

    return () => {
      if (clipTimerRef.current) window.clearInterval(clipTimerRef.current);
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
      ytReadyRef.current = false;
    };
  }, [exercise.audioType, exercise.youtubeId]);

  const stopPlayback = useCallback(() => {
    stopSpeaking();
    if (clipTimerRef.current) {
      window.clearInterval(clipTimerRef.current);
      clipTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (ytPlayerRef.current && ytReadyRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {
        // ignore
      }
    }
    setIsPlaying(false);
  }, []);

  const playCurrentSegment = useCallback(() => {
    if (!segment) return;
    stopPlayback();
    setIsPlaying(true);

    if (exercise.audioType === 'youtube' && ytPlayerRef.current && ytReadyRef.current) {
      const start = segment.startSec ?? 0;
      const end = segment.endSec;
      ytPlayerRef.current.setPlaybackRate(speed);
      ytPlayerRef.current.seekTo(start, true);
      ytPlayerRef.current.playVideo();
      if (end !== undefined && end > start) {
        clipTimerRef.current = window.setInterval(() => {
          const cur = ytPlayerRef.current?.getCurrentTime() ?? 0;
          if (cur >= end) {
            stopPlayback();
          }
        }, 120);
      }
      return;
    }

    if (exercise.audioType === 'audioUrl' && audioRef.current) {
      const audio = audioRef.current;
      const start = segment.startSec ?? 0;
      const end = segment.endSec;
      audio.playbackRate = speed;
      audio.currentTime = start;
      void audio.play();
      if (end !== undefined && end > start) {
        clipTimerRef.current = window.setInterval(() => {
          if (audio.currentTime >= end) {
            stopPlayback();
          }
        }, 100);
      }
      return;
    }

    // Default: Built-in Web Speech TTS
    speakText(segment.text, exercise.language, speed, () => {
      setIsPlaying(false);
    });
  }, [segment, exercise.audioType, exercise.language, speed, stopPlayback]);

  // Reset UI on segment change
  useEffect(() => {
    stopPlayback();
    const prevSaved = segment ? completedMap[segment.id] : undefined;
    setUserInput(prevSaved ? segment.text : '');
    setCheckResult(null);
    setRevealed(Boolean(prevSaved));
    setAttempts(0);
    setHintsUsed(0);
    if (autoPlayNext && viewMode === 'dictation' && segment) {
      const t = window.setTimeout(() => {
        playCurrentSegment();
        inputRef.current?.focus();
      }, 220);
      return () => window.clearTimeout(t);
    }
  }, [segmentIndex, exercise.id]);

  useEffect(() => {
    return () => stopPlayback();
  }, [stopPlayback]);

  const persistProgress = useCallback(
    async (segId: string, bestInput: string, segAttempts: number, segHints: number, nextIdx: number) => {
      const now = Date.now();
      const existing = (await db.listeningProgress.get(exercise.id)) ?? {
        exerciseId: exercise.id,
        completedSegments: {},
        lastSegmentIndex: nextIdx,
        updatedAt: now,
      };
      existing.completedSegments[segId] = {
        bestInput,
        attempts: segAttempts,
        hintsUsed: segHints,
        completedAt: now,
      };
      existing.lastSegmentIndex = nextIdx;
      existing.updatedAt = now;
      await db.listeningProgress.put(existing);
      await recordActivity('dictation', 1);
      await onProgressUpdated();
    },
    [exercise.id, onProgressUpdated]
  );

  const handleCheck = useCallback(async () => {
    if (!segment) return;

    // If already solved or revealed, Enter moves to next sentence (classic DailyDictation flow!)
    if (revealed || checkResult?.isExact) {
      if (segmentIndex < exercise.segments.length - 1) {
        setSegmentIndex((i) => i + 1);
      }
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    const res = compareDictation(userInput, segment.text, exercise.language, segment.reading);
    setCheckResult(res);

    if (res.isExact) {
      setRevealed(true);
      await persistProgress(segment.id, userInput, nextAttempts, hintsUsed, segmentIndex);
    }
  }, [
    segment,
    revealed,
    checkResult,
    segmentIndex,
    exercise.segments.length,
    exercise.language,
    attempts,
    userInput,
    hintsUsed,
    persistProgress,
  ]);

  const handleHint = useCallback(() => {
    if (!segment || revealed) return;
    const nextInput = buildHintInput(userInput, segment.text, exercise.language);
    setUserInput(nextInput);
    setHintsUsed((h) => h + 1);
    const res = compareDictation(nextInput, segment.text, exercise.language, segment.reading);
    setCheckResult(res);
    inputRef.current?.focus();
  }, [segment, revealed, userInput, exercise.language]);

  const handleSkipReveal = useCallback(() => {
    if (!segment) return;
    setRevealed(true);
    setCheckResult(compareDictation(userInput, segment.text, exercise.language, segment.reading));
  }, [segment, userInput, exercise.language]);

  // Global DailyDictation shortcuts: Ctrl to replay, Alt+H for hint
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (saveWordDraft) return;
      if (e.key === 'Control' && !e.shiftKey && !e.altKey) {
        // Quick tap Control to replay audio (signature DailyDictation shortcut!)
        playCurrentSegment();
      } else if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        handleHint();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [playCurrentSegment, handleHint, saveWordDraft]);

  function handleInputChange(value: string) {
    if (exercise.language === 'jp' && autoRomaji) {
      setUserInput(toHiragana(value, { IMEMode: true }));
    } else {
      setUserInput(value);
    }
  }

  const clickableWords = useMemo(() => {
    if (!segment) return [];
    if (exercise.language === 'jp') {
      return segment.text.split(/[\s\u3000、。！？]+/).filter(Boolean);
    }
    return segment.text.split(/\s+/).filter(Boolean);
  }, [segment, exercise.language]);

  async function handleSaveWordToAnki(e: React.FormEvent) {
    e.preventDefault();
    if (!saveWordDraft || !saveWordDraft.word.trim() || !saveWordDraft.meaning.trim()) return;
    const langDecks = decks.filter((d) => d.language === exercise.language && !d.deleted);
    let deckId = langDecks[0]?.id;
    const now = Date.now();

    if (!deckId) {
      deckId = `deck-${exercise.language}-listening`;
      await db.decks.put({
        id: deckId,
        name: `Từ vựng từ Luyện Nghe (${exercise.language.toUpperCase()})`,
        language: exercise.language,
        description: 'Từ mới lưu trực tiếp từ các bài nghe chép chính tả',
        source: 'custom',
        createdAt: now,
        updatedAt: now,
      });
    }

    await db.cards.put({
      id: `card-${now}-${Math.random().toString(36).slice(2, 7)}`,
      deckId,
      language: exercise.language,
      front: saveWordDraft.word.replace(/[.,!?;:"'()]/g, '').trim(),
      back: saveWordDraft.meaning.trim(),
      example: saveWordDraft.example,
      exampleVi: saveWordDraft.exampleVi,
      tags: ['from-listening'],
      due: now,
      stability: 0,
      difficulty: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      state: 0,
      createdAt: now,
      updatedAt: now,
    });

    setSavedNotice(`Đã lưu "${saveWordDraft.word}" vào bộ thẻ Anki!`);
    setSaveWordDraft(null);
    await onProgressUpdated();
    window.setTimeout(() => setSavedNotice(null), 3000);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => {
            stopPlayback();
            onBack();
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Danh sách bài nghe
        </button>

        {/* DailyDictation Mode Tabs */}
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setViewMode('dictation')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              viewMode === 'dictation'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Headphones className="h-3.5 w-3.5" />
            Listen & Type
          </button>
          <button
            onClick={() => setViewMode('transcript')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              viewMode === 'transcript'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Full Transcript
          </button>
        </div>
      </div>

      {/* Exercise Title + Segmented Progress */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                {exercise.level}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {exercise.category}
              </span>
            </div>
            <h1 className="mt-1.5 text-xl font-extrabold text-slate-900 dark:text-white">
              {exercise.title}
            </h1>
          </div>

          <div className="text-right text-xs text-slate-500">
            Hoàn thành{' '}
            <b className="text-emerald-600 dark:text-emerald-400">
              {completedCount}/{exercise.segments.length}
            </b>{' '}
            câu
          </div>
        </div>

        {/* Clickable sentence progress bar */}
        <div className="mt-4 flex gap-1.5">
          {exercise.segments.map((seg, idx) => {
            const done = Boolean(completedMap[seg.id]);
            const current = idx === segmentIndex;
            return (
              <button
                key={seg.id}
                onClick={() => setSegmentIndex(idx)}
                title={`Câu ${idx + 1}`}
                className={`h-2.5 flex-1 rounded-full transition ${
                  current
                    ? 'bg-indigo-600 ring-2 ring-indigo-300 dark:ring-indigo-800'
                    : done
                    ? 'bg-emerald-500'
                    : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800'
                }`}
              />
            );
          })}
        </div>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md">
          <CheckCircle2 className="h-4 w-4" />
          {savedNotice}
        </div>
      )}

      {/* Optional YouTube / MP3 media containers */}
      {exercise.audioType === 'youtube' && exercise.youtubeId && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm dark:border-slate-800">
          <div ref={ytContainerRef} className="w-full" />
        </div>
      )}

      {exercise.audioType === 'audioUrl' && exercise.audioUrl && (
        <audio
          ref={audioRef}
          src={exercise.audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {viewMode === 'dictation' && segment ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          {/* Audio Control Bar (DailyDictation-style) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSegmentIndex((i) => Math.max(0, i - 1))}
                disabled={segmentIndex === 0}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-35 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                title="Câu trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="min-w-[68px] text-center text-sm font-extrabold text-slate-800 dark:text-slate-100">
                {segmentIndex + 1} / {exercise.segments.length}
              </span>

              <button
                onClick={() =>
                  setSegmentIndex((i) => Math.min(exercise.segments.length - 1, i + 1))
                }
                disabled={segmentIndex === exercise.segments.length - 1}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-35 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                title="Câu tiếp"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                onClick={isPlaying ? stopPlayback : playCurrentSegment}
                className="ml-1 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98]"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                {isPlaying ? 'Dừng' : 'Nghe lại'}
              </button>
            </div>

            {/* Speed & Auto-play settings */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`rounded-lg px-2 py-1 text-xs font-bold transition ${
                      speed === s
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={autoPlayNext}
                  onChange={(e) => setAutoPlayNext(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Tự phát
              </label>
            </div>
          </div>

          {/* Dictation Typing / Handwriting Area */}
          <div className="space-y-4 p-5 sm:p-6">
            {exercise.language === 'jp' && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHandwritingInput(false)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      !showHandwritingInput
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    <Keyboard className="h-3.5 w-3.5" />
                    Gõ phím
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHandwritingInput(true)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      showHandwritingInput
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    <PenTool className="h-3.5 w-3.5" />
                    Viết tay cảm ứng
                  </button>
                </div>

                {!showHandwritingInput && (
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-500">
                    <input
                      type="checkbox"
                      checked={autoRomaji}
                      onChange={(e) => setAutoRomaji(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    Tự đổi Romaji → Hiragana
                  </label>
                )}
              </div>
            )}

            <textarea
              ref={inputRef}
              rows={2}
              value={userInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleCheck();
                }
              }}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              placeholder={
                exercise.language === 'en'
                  ? 'Type what you hear... (Nhấn Ctrl để nghe lại, Enter để kiểm tra)'
                  : 'Gõ những gì bạn nghe được (vd: ohayou → おはよう)...'
              }
              className="font-jp w-full resize-none rounded-2xl border-2 border-slate-200 bg-slate-50/50 p-4 text-lg font-medium text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />

            {/* Optional Japanese Handwriting Pad right inside Dictation! */}
            {exercise.language === 'jp' && showHandwritingInput && !revealed && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <JapaneseHandwritingPad
                  compact
                  defaultScope="kana"
                  onCommitChar={(ch) => setUserInput((prev) => prev + ch)}
                />
              </div>
            )}

            {/* Action Buttons Row (DailyDictation: Check, Hint, Skip) */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => void handleCheck()}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99]"
              >
                {revealed || checkResult?.isExact ? (
                  <>
                    Câu tiếp theo (Enter)
                    <ChevronRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Check (Enter)
                  </>
                )}
              </button>

              {!revealed && (
                <>
                  <button
                    onClick={handleHint}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Hint (Alt+H)
                  </button>

                  <button
                    onClick={handleSkipReveal}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip / Đáp án
                  </button>
                </>
              )}

              <button
                onClick={playCurrentSegment}
                className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Nghe lại (Ctrl)
              </button>
            </div>

            {/* DailyDictation Word-by-Word Feedback */}
            {checkResult && !revealed && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300">
                    Kết quả kiểm tra (các chỗ sai/thiếu được ẩn bằng * để bạn nghe lại):
                  </span>
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Đúng {checkResult.accuracy}%
                  </span>
                </div>
                <div className="font-jp flex flex-wrap gap-1.5 text-lg leading-relaxed font-semibold">
                  {checkResult.tokens.map((tok, idx) => (
                    <span
                      key={idx}
                      className={`rounded-md px-1.5 py-0.5 ${
                        tok.status === 'correct'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : tok.status === 'wrong'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-slate-200/80 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {tok.status === 'correct' ? tok.target : tok.masked}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Revealed Full Answer + Translation + Clickable Words to Save to Anki */}
            {revealed && (
              <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    {checkResult?.isExact ? 'Chính xác 100%!' : 'Đáp án đầy đủ'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Bấm vào bất kỳ từ nào để lưu sang Anki
                  </span>
                </div>

                {/* Clickable words */}
                <div className="font-jp flex flex-wrap gap-1.5 text-xl font-bold text-slate-900 dark:text-white">
                  {clickableWords.map((w, i) => (
                    <button
                      key={`${w}-${i}`}
                      type="button"
                      onClick={() =>
                        setSaveWordDraft({
                          word: w,
                          meaning: '',
                          example: segment.text,
                          exampleVi: segment.translationVi,
                        })
                      }
                      className="rounded-lg px-1.5 py-0.5 transition hover:bg-indigo-600 hover:text-white"
                      title="Bấm để lưu từ này vào Anki SRS"
                    >
                      {w}
                    </button>
                  ))}
                </div>

                {segment.romaji && (
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Romaji: {segment.romaji}
                  </div>
                )}

                {segment.translationVi && (
                  <div className="rounded-xl bg-white/80 px-3.5 py-2.5 text-sm font-medium text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                    🇻🇳 {segment.translationVi}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Full Transcript View */
        <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {exercise.segments.map((seg, idx) => (
            <div key={seg.id} className="flex items-start gap-3 py-3.5">
              <button
                onClick={() => {
                  setSegmentIndex(idx);
                  speakText(seg.text, exercise.language, speed);
                }}
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300"
                title="Nghe câu này"
              >
                <Volume2 className="h-4 w-4" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                  {completedMap[seg.id] && (
                    <span className="text-xs font-semibold text-emerald-600">✓ Đã chép đúng</span>
                  )}
                </div>
                <p className="font-jp mt-0.5 text-base font-bold text-slate-900 dark:text-white">
                  {seg.text}
                </p>
                {seg.romaji && <p className="text-xs text-slate-400">{seg.romaji}</p>}
                {seg.translationVi && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {seg.translationVi}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setSegmentIndex(idx);
                  setViewMode('dictation');
                }}
                className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Luyện câu này
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Save Word to Anki Modal */}
      {saveWordDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSaveWordToAnki}
            className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <PlusCircle className="h-5 w-5 text-indigo-600" />
                Lưu từ mới vào Anki SRS
              </h3>
              <button
                type="button"
                onClick={() => setSaveWordDraft(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Từ vựng</label>
              <input
                required
                value={saveWordDraft.word}
                onChange={(e) => setSaveWordDraft({ ...saveWordDraft, word: e.target.value })}
                className="font-jp w-full rounded-xl border border-slate-300 px-3 py-2 text-base font-bold dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Nghĩa tiếng Việt *
              </label>
              <input
                required
                autoFocus
                value={saveWordDraft.meaning}
                onChange={(e) => setSaveWordDraft({ ...saveWordDraft, meaning: e.target.value })}
                placeholder="Nhập nghĩa của từ này..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-400">
              <b>Ví dụ tự gắn kèm:</b> {saveWordDraft.example}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
            >
              Lưu vào bộ thẻ Anki
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
