import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Volume2,
  Sparkles,
  PlusCircle,
  RotateCcw,
  ClipboardCheck,
  Layers,
  Award,
} from 'lucide-react';
import { toHiragana } from 'wanakana';
import type { Deck, StudyExercise, StudyLesson, StudyLessonProgress, VocabCard } from '../../types';
import { db, recordActivity } from '../../lib/db';
import { speakText } from '../../lib/tts';

interface StudyLessonViewProps {
  lesson: StudyLesson;
  progress?: StudyLessonProgress;
  decks: Deck[];
  cards: VocabCard[];
  ttsRate: number;
  hasNextLesson: boolean;
  onBack: () => void;
  onGoNextLesson: () => void;
  onDataChanged: () => Promise<void>;
}

function deterministicShuffle(items: string[], seedStr: string): string[] {
  const arr = [...items];
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Ensure order differs from original when length >= 2
  if (arr.length >= 2 && arr.join(' ') === items.join(' ')) {
    [arr[0], arr[arr.length - 1]] = [arr[arr.length - 1], arr[0]];
  }
  return arr;
}

function normalizeAnswer(str: string, isJp: boolean): string {
  const base = str.trim().toLowerCase().replace(/\s+/g, ' ');
  if (isJp) {
    return base.replace(/[\s\u3000。、！？!?.]/g, '');
  }
  return base.replace(/[.,!?;:"'()]/g, '').replace(/\s+/g, ' ');
}

export const StudyLessonView: React.FC<StudyLessonViewProps> = ({
  lesson,
  progress,
  decks,
  cards,
  ttsRate,
  hasNextLesson,
  onBack,
  onGoNextLesson,
  onDataChanged,
}) => {
  const [innerTab, setInnerTab] = useState<'theory' | 'practice' | 'vocab'>('theory');
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [fillInput, setFillInput] = useState('');
  const [autoRomaji, setAutoRomaji] = useState(true);
  const [pickedTokenIndices, setPickedTokenIndices] = useState<number[]>([]);
  const [checkedState, setCheckedState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [correctCount, setCorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [savedVocabNotice, setSavedVocabNotice] = useState<string | null>(null);

  const currentExercise: StudyExercise | undefined = lesson.exercises[qIndex];

  const scrambledTokens = useMemo(() => {
    if (!currentExercise?.tokens) return [];
    return deterministicShuffle(currentExercise.tokens, currentExercise.id);
  }, [currentExercise]);

  useEffect(() => {
    setInnerTab('theory');
    setQIndex(0);
    setSelectedOption('');
    setFillInput('');
    setPickedTokenIndices([]);
    setCheckedState('idle');
    setCorrectCount(0);
    setQuizFinished(false);
    setSavedVocabNotice(null);
  }, [lesson.id]);

  function resetQuestionInputs() {
    setSelectedOption('');
    setFillInput('');
    setPickedTokenIndices([]);
    setCheckedState('idle');
  }

  function handleRestartQuiz() {
    setQIndex(0);
    setCorrectCount(0);
    setQuizFinished(false);
    resetQuestionInputs();
  }

  const checkedTasks = progress?.checkedTasks ?? [];

  async function handleToggleChecklist(idx: number) {
    const now = Date.now();
    const existing: StudyLessonProgress = progress ?? {
      lessonId: lesson.id,
      completed: false,
      bestScore: 0,
      attempts: 0,
      checkedTasks: [],
      updatedAt: now,
    };
    const nextTasks = existing.checkedTasks.includes(idx)
      ? existing.checkedTasks.filter((i) => i !== idx)
      : [...existing.checkedTasks, idx];

    await db.studyProgress.put({
      ...existing,
      checkedTasks: nextTasks,
      updatedAt: now,
    });
    await onDataChanged();
  }

  async function handleMarkCompletedManual() {
    const now = Date.now();
    const existing: StudyLessonProgress = progress ?? {
      lessonId: lesson.id,
      completed: false,
      bestScore: 0,
      attempts: 0,
      checkedTasks: [],
      updatedAt: now,
    };
    await db.studyProgress.put({
      ...existing,
      completed: !existing.completed,
      completedAt: !existing.completed ? now : existing.completedAt,
      updatedAt: now,
    });
    await onDataChanged();
  }

  function getUserAnswerText(): string {
    if (!currentExercise) return '';
    if (currentExercise.type === 'mcq') return selectedOption;
    if (currentExercise.type === 'fill') return fillInput;
    return pickedTokenIndices.map((idx) => scrambledTokens[idx]).join(' ');
  }

  function handleCheckExercise() {
    if (!currentExercise || checkedState !== 'idle') return;
    const isJp = lesson.language === 'jp';
    const userRaw = getUserAnswerText();
    if (!userRaw.trim()) return;

    const userNorm = normalizeAnswer(userRaw, isJp);
    const candidates = [
      currentExercise.correctAnswer,
      ...(currentExercise.acceptedAnswers ?? []),
    ].map((ans) => normalizeAnswer(ans, isJp));

    const userHiraNorm = isJp ? normalizeAnswer(toHiragana(userRaw), true) : userNorm;
    const isRight = candidates.includes(userNorm) || candidates.includes(userHiraNorm);

    if (isRight) {
      setCorrectCount((c) => c + 1);
      setCheckedState('correct');
    } else {
      setCheckedState('wrong');
    }
  }

  async function handleNextQuestion() {
    if (qIndex < lesson.exercises.length - 1) {
      setQIndex((i) => i + 1);
      resetQuestionInputs();
      return;
    }

    // Finish quiz & save score to IndexedDB (+ Firebase auto-sync)
    const total = lesson.exercises.length;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 100;
    const now = Date.now();
    const existing: StudyLessonProgress = progress ?? {
      lessonId: lesson.id,
      completed: false,
      bestScore: 0,
      attempts: 0,
      checkedTasks: [],
      updatedAt: now,
    };
    const passed = score >= 75;
    await db.studyProgress.put({
      ...existing,
      completed: existing.completed || passed,
      bestScore: Math.max(existing.bestScore, score),
      attempts: existing.attempts + 1,
      completedAt: passed ? existing.completedAt ?? now : existing.completedAt,
      updatedAt: now,
    });
    await recordActivity('review', total);
    await onDataChanged();
    setQuizFinished(true);
  }

  async function handleSaveVocabPackToAnki() {
    if (!lesson.vocabPack.length) return;
    const now = Date.now();
    const targetDeckId =
      lesson.language === 'en' ? 'deck-en-study-course' : 'deck-jp-study-course';
    const existingDeck = decks.find((d) => d.id === targetDeckId && !d.deleted);

    if (!existingDeck) {
      await db.decks.put({
        id: targetDeckId,
        name:
          lesson.language === 'en'
            ? 'Từ vựng Khóa học IELTS (3.0 → 6.0)'
            : 'Từ vựng Khóa học Tiếng Nhật (0 → N3)',
        language: lesson.language,
        description: 'Từ vựng trọng tâm trích từ các bài học trong mục Study.',
        source: 'custom',
        createdAt: now,
        updatedAt: now,
      });
    }

    const existingFronts = new Set(
      cards
        .filter((c) => c.language === lesson.language && !c.deleted)
        .map((c) => c.front.trim().toLowerCase())
    );

    const toInsert: VocabCard[] = [];
    for (const v of lesson.vocabPack) {
      if (existingFronts.has(v.front.trim().toLowerCase())) continue;
      toInsert.push({
        id: `card-study-${lesson.id}-${Math.random().toString(36).slice(2, 8)}`,
        deckId: targetDeckId,
        language: lesson.language,
        front: v.front,
        reading: v.reading,
        romaji: v.romaji,
        back: v.back,
        example: v.example,
        exampleVi: v.exampleVi,
        tags: ['study-course', lesson.id],
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
    }

    if (toInsert.length > 0) {
      await db.cards.bulkPut(toInsert);
      await onDataChanged();
      setSavedVocabNotice(`Đã lưu ${toInsert.length} từ mới của bài này vào bộ thẻ Anki!`);
    } else {
      setSavedVocabNotice('Toàn bộ từ vựng của bài này đã có sẵn trong kho Anki của bạn!');
    }
  }

  const finalScore =
    lesson.exercises.length > 0
      ? Math.round((correctCount / lesson.exercises.length) * 100)
      : 100;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay về lộ trình Study
        </button>

        <button
          onClick={() => void handleMarkCompletedManual()}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition ${
            progress?.completed
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {progress?.completed ? 'Đã hoàn thành bài học' : 'Đánh dấu hoàn thành'}
        </button>
      </div>

      {/* Lesson Hero Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-extrabold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
            {lesson.targetBandOrLevel}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {lesson.durationLabel}
          </span>
          {progress && progress.bestScore > 0 && (
            <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              Điểm cao nhất: {progress.bestScore}%
            </span>
          )}
        </div>

        <h1 className="mt-2.5 text-xl font-extrabold text-slate-900 sm:text-2xl dark:text-white">
          {lesson.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{lesson.subtitle}</p>

        {/* Sub-Tabs inside Lesson */}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          {[
            { id: 'theory', label: '1. Bài giảng & Video', icon: BookOpen },
            {
              id: 'practice',
              label: `2. Bài tập thực hành (${lesson.exercises.length} câu)`,
              icon: Sparkles,
            },
            {
              id: 'vocab',
              label: `3. Từ vựng bài này (${lesson.vocabPack.length})`,
              icon: Layers,
            },
          ].map((t) => {
            const Icon = t.icon;
            const active = innerTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setInnerTab(t.id as 'theory' | 'practice' | 'vocab')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: THEORY, SOURCES & CHECKLIST */}
      {innerTab === 'theory' && (
        <div className="space-y-5">
          {/* Reference Videos & Books */}
          <div className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/20">
            <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Nguồn tham khảo & Video bài giảng đề xuất
            </div>

            <div className="mt-3 flex flex-wrap gap-2.5">
              {lesson.resources.map((res, idx) => (
                <a
                  key={idx}
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm ring-1 ring-indigo-200/80 transition hover:bg-indigo-600 hover:text-white dark:bg-slate-900 dark:text-slate-100 dark:ring-indigo-800 dark:hover:bg-indigo-600"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  <span>{res.label}</span>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    {res.source}
                  </span>
                </a>
              ))}
            </div>

            {lesson.booksAndMaterials.length > 0 && (
              <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                <b>Giáo trình bám sát:</b> {lesson.booksAndMaterials.join(' · ')}
              </div>
            )}
          </div>

          {/* Core Summary Cards */}
          <div className="space-y-4">
            {lesson.summaryPoints.map((pt, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {pt.heading}
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {pt.body}
                </p>

                {pt.examples && pt.examples.length > 0 && (
                  <div className="mt-4 space-y-2.5">
                    {pt.examples.map((ex, eIdx) => (
                      <div
                        key={eIdx}
                        className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-950/70"
                      >
                        <div>
                          <div className="font-jp text-sm font-bold text-slate-900 dark:text-white">
                            {ex.text}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            → {ex.meaning}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => speakText(ex.text, lesson.language, ttsRate)}
                          className="shrink-0 rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-950"
                          title="Nghe phát âm ví dụ"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Checklist */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <ClipboardCheck className="h-4 w-4 text-emerald-500" />
              Nhiệm vụ thực hành của bài này ({checkedTasks.length}/{lesson.checklist.length})
            </h3>
            <div className="mt-3 space-y-2">
              {lesson.checklist.map((task, idx) => {
                const done = checkedTasks.includes(idx);
                return (
                  <label
                    key={idx}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
                      done
                        ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900 line-through dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => void handleToggleChecklist(idx)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{task}</span>
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setInnerTab('practice')}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700"
              >
                Bắt đầu làm {lesson.exercises.length} bài tập thực hành
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE EXERCISES */}
      {innerTab === 'practice' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {quizFinished ? (
            <div className="py-6 text-center">
              <Award
                className={`mx-auto h-14 w-14 ${
                  finalScore >= 75 ? 'text-emerald-500' : 'text-amber-500'
                }`}
              />
              <h2 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
                Kết quả: {correctCount}/{lesson.exercises.length} câu đúng ({finalScore}%)
              </h2>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                {finalScore >= 75
                  ? 'Tuyệt vời! Bạn đã đạt chuẩn và hoàn thành bài học này (đã tự động lưu lên Firebase).'
                  : 'Bạn cần đạt ít nhất 75% để chốt hoàn thành bài — xem lại phần bài giảng rồi làm lại nhé!'}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleRestartQuiz}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <RotateCcw className="h-4 w-4" />
                  Làm lại bài tập
                </button>
                <button
                  onClick={() => setInnerTab('vocab')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
                >
                  <Layers className="h-4 w-4" />
                  Lưu từ bài này sang Anki
                </button>
                {hasNextLesson && (
                  <button
                    onClick={onGoNextLesson}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
                  >
                    Sang bài tiếp theo
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : currentExercise ? (
            <div className="space-y-5">
              {/* Question progress header */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>
                  Câu {qIndex + 1} / {lesson.exercises.length} ·{' '}
                  {currentExercise.type === 'mcq'
                    ? 'Trắc nghiệm'
                    : currentExercise.type === 'fill'
                    ? 'Điền từ / Chia thể'
                    : 'Sắp xếp câu'}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  Đúng hiện tại: {correctCount}
                </span>
              </div>

              <div className="flex gap-1.5">
                {lesson.exercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className={`h-2 flex-1 rounded-full ${
                      idx < qIndex
                        ? 'bg-emerald-500'
                        : idx === qIndex
                        ? 'bg-indigo-600'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              {/* Optional Reading Context */}
              {currentExercise.context && (
                <div className="font-jp rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                  {currentExercise.context}
                </div>
              )}

              {/* Optional Audio Button */}
              {currentExercise.audioText && (
                <div>
                  <button
                    type="button"
                    onClick={() => speakText(currentExercise.audioText!, lesson.language, ttsRate)}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700"
                  >
                    <Volume2 className="h-4 w-4" />
                    Bấm để nghe đoạn âm thanh câu hỏi
                  </button>
                </div>
              )}

              {/* Prompt */}
              <h3 className="font-jp text-lg font-bold text-slate-900 dark:text-white">
                {currentExercise.prompt}
              </h3>

              {/* Type 1: MCQ */}
              {currentExercise.type === 'mcq' && currentExercise.options && (
                <div className="grid gap-2.5">
                  {currentExercise.options.map((opt) => {
                    const isPicked = selectedOption === opt;
                    const isCorrectOpt = opt === currentExercise.correctAnswer;
                    let cls =
                      'border-slate-200 bg-white text-slate-800 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100';
                    if (checkedState === 'idle' && isPicked) {
                      cls =
                        'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:bg-indigo-950/60 dark:text-indigo-200';
                    } else if (checkedState !== 'idle') {
                      if (isCorrectOpt) {
                        cls =
                          'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-200';
                      } else if (isPicked && !isCorrectOpt) {
                        cls =
                          'border-rose-500 bg-rose-50 text-rose-900 dark:border-rose-500 dark:bg-rose-950/50 dark:text-rose-200';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={checkedState !== 'idle'}
                        onClick={() => setSelectedOption(opt)}
                        className={`font-jp rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-semibold transition ${cls}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Type 2: Fill-in-the-blank */}
              {currentExercise.type === 'fill' && (
                <div className="space-y-2.5">
                  {lesson.language === 'jp' && (
                    <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={autoRomaji}
                        onChange={(e) => setAutoRomaji(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      Tự đổi Romaji → Hiragana khi gõ
                    </label>
                  )}
                  <input
                    autoFocus
                    disabled={checkedState !== 'idle'}
                    value={fillInput}
                    onChange={(e) =>
                      setFillInput(
                        lesson.language === 'jp' && autoRomaji
                          ? toHiragana(e.target.value, { IMEMode: true })
                          : e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (checkedState === 'idle') handleCheckExercise();
                        else void handleNextQuestion();
                      }
                    }}
                    placeholder="Nhập đáp án của bạn..."
                    className="font-jp w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-[#3f4147] dark:bg-[#1e1f22] dark:text-[#f2f3f5] dark:placeholder:text-[#949ba4] dark:focus:border-[#5865f2] dark:focus:bg-[#1e1f22]"
                  />
                </div>
              )}

              {/* Type 3: Sentence Ordering / JLPT ★ */}
              {currentExercise.type === 'order' && (
                <div className="space-y-4">
                  {/* Assembled Answer Zone */}
                  <div className="min-h-[64px] rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/40 p-3 dark:border-indigo-800 dark:bg-indigo-950/20">
                    {pickedTokenIndices.length === 0 ? (
                      <div className="py-2 text-center text-xs text-slate-400">
                        Chạm lần lượt các mảnh từ bên dưới để ghép thành câu hoàn chỉnh...
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {pickedTokenIndices.map((tokenIdx, pos) => (
                          <button
                            key={`${tokenIdx}-${pos}`}
                            type="button"
                            disabled={checkedState !== 'idle'}
                            onClick={() =>
                              setPickedTokenIndices((prev) => prev.filter((_, i) => i !== pos))
                            }
                            className="font-jp rounded-xl bg-indigo-600 px-3 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700"
                          >
                            {scrambledTokens[tokenIdx]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Available Chips */}
                  <div className="flex flex-wrap gap-2">
                    {scrambledTokens.map((tok, idx) => {
                      const used = pickedTokenIndices.includes(idx);
                      return (
                        <button
                          key={`${tok}-${idx}`}
                          type="button"
                          disabled={used || checkedState !== 'idle'}
                          onClick={() => setPickedTokenIndices((prev) => [...prev, idx])}
                          className={`font-jp rounded-xl border px-3.5 py-2 text-sm font-bold transition ${
                            used
                              ? 'border-slate-200 bg-slate-100 text-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-700'
                              : 'border-slate-300 bg-white text-slate-800 hover:border-indigo-500 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {tok}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Feedback & Explanation */}
              {checkedState !== 'idle' && (
                <div
                  className={`rounded-2xl border p-4 text-sm ${
                    checkedState === 'correct'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200'
                      : 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-extrabold">
                    {checkedState === 'correct' ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        Chính xác!
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                        Chưa đúng — Đáp án đúng:{' '}
                        <span className="font-jp underline">{currentExercise.correctAnswer}</span>
                      </>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed opacity-90">
                    <b>Giải thích:</b> {currentExercise.explanation}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end pt-1">
                {checkedState === 'idle' ? (
                  <button
                    type="button"
                    disabled={!getUserAnswerText().trim()}
                    onClick={handleCheckExercise}
                    className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40"
                  >
                    Kiểm tra đáp án
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleNextQuestion()}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700"
                  >
                    {qIndex < lesson.exercises.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả bài học'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 3: LESSON VOCAB PACK -> 1-CLICK TO ANKI */}
      {innerTab === 'vocab' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Từ vựng trọng tâm của bài học ({lesson.vocabPack.length} từ)
              </h2>
              <p className="text-xs text-slate-500">
                Đẩy thẳng sang bộ thẻ Anki SRS để hệ thống tự nhắc ôn lặp lại ngắt quãng.
              </p>
            </div>
            <button
              onClick={() => void handleSaveVocabPackToAnki()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
            >
              <PlusCircle className="h-4 w-4" />
              Lưu toàn bộ vào Anki SRS
            </button>
          </div>

          {savedVocabNotice && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              {savedVocabNotice}
            </div>
          )}

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {lesson.vocabPack.map((v, i) => (
              <div key={i} className="flex items-start justify-between gap-3 py-3.5">
                <div>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-jp text-lg font-extrabold text-slate-900 dark:text-white">
                      {v.front}
                    </span>
                    {v.reading && v.reading !== v.front && (
                      <span className="font-jp text-xs text-slate-500">{v.reading}</span>
                    )}
                    {v.romaji && <span className="text-xs text-slate-400">({v.romaji})</span>}
                  </div>
                  <div className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                    {v.back}
                  </div>
                  {v.example && (
                    <div className="font-jp mt-1 text-xs text-slate-600 dark:text-slate-300">
                      “{v.example}” {v.exampleVi ? `— ${v.exampleVi}` : ''}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => speakText(v.front, lesson.language, ttsRate)}
                  className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950"
                  title="Nghe phát âm"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
