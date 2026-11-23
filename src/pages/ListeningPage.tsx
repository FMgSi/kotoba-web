import React, { useMemo, useState } from 'react';
import {
  Headphones,
  Plus,
  Play,
  Trash2,
  Youtube,
  Volume2,
  FileAudio,
  CheckCircle2,
} from 'lucide-react';
import type { Deck, Language, ListeningExercise, ListeningProgress } from '../types';
import { db } from '../lib/db';
import { DictationPlayer } from '../components/listening/DictationPlayer';
import { CreateExerciseModal } from '../components/listening/CreateExerciseModal';

interface ListeningPageProps {
  language: Language;
  exercises: ListeningExercise[];
  progressList: ListeningProgress[];
  decks: Deck[];
  onDataChanged: () => Promise<void>;
}

export const ListeningPage: React.FC<ListeningPageProps> = ({
  language,
  exercises,
  progressList,
  decks,
  onDataChanged,
}) => {
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const langExercises = useMemo(
    () => exercises.filter((e) => e.language === language && !e.deleted),
    [exercises, language]
  );

  const progressMap = useMemo(() => {
    const map = new Map<string, ListeningProgress>();
    for (const p of progressList) map.set(p.exerciseId, p);
    return map;
  }, [progressList]);

  const categories = useMemo(() => {
    const set = new Set(langExercises.map((e) => e.category));
    return ['ALL', ...Array.from(set)];
  }, [langExercises]);

  const filtered = useMemo(() => {
    if (selectedCategory === 'ALL') return langExercises;
    return langExercises.filter((e) => e.category === selectedCategory);
  }, [langExercises, selectedCategory]);

  const activeExercise = useMemo(
    () => langExercises.find((e) => e.id === activeExerciseId),
    [langExercises, activeExerciseId]
  );

  async function handleDelete(ex: ListeningExercise) {
    if (!window.confirm(`Xóa bài nghe "${ex.title}"?`)) return;
    await db.exercises.put({ ...ex, deleted: true, updatedAt: Date.now() });
    await onDataChanged();
  }

  if (activeExercise) {
    return (
      <DictationPlayer
        exercise={activeExercise}
        progress={progressMap.get(activeExercise.id)}
        decks={decks}
        onBack={() => setActiveExerciseId(null)}
        onProgressUpdated={onDataChanged}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
            <Headphones className="h-3.5 w-3.5" />
            Listen & Type (DailyDictation Style)
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {language === 'en'
              ? 'Luyện Nghe Chép Chính Tả — Tiếng Anh'
              : 'Luyện Nghe Chép Chính Tả — Tiếng Nhật'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {language === 'en'
              ? 'Nghe từng câu, gõ lại để kiểm tra chính tả, dùng Hint mở từng từ và lưu từ mới sang Anki.'
              : 'Nghe từng câu N5 / Minna, gõ Romaji tự đổi Hiragana hoặc viết tay cảm ứng, lưu từ mới sang Anki.'}
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Thêm bài nghe (Text / YouTube / MP3)
        </button>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white dark:bg-indigo-600'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {cat === 'ALL' ? 'Tất cả bài nghe' : cat}
          </button>
        ))}
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ex) => {
          const prog = progressMap.get(ex.id);
          const doneCount = prog ? Object.keys(prog.completedSegments).length : 0;
          const total = ex.segments.length;
          const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
          const isStarter = ex.id.startsWith('ex-en-') || ex.id.startsWith('ex-jp-');

          return (
            <div
              key={ex.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {ex.level}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {ex.audioType === 'youtube' ? (
                        <>
                          <Youtube className="h-3 w-3 text-rose-500" /> YouTube
                        </>
                      ) : ex.audioType === 'audioUrl' ? (
                        <>
                          <FileAudio className="h-3 w-3 text-sky-500" /> MP3
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3 w-3 text-indigo-500" /> TTS
                        </>
                      )}
                    </span>
                  </div>

                  {!isStarter && (
                    <button
                      onClick={() => handleDelete(ex)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      title="Xóa bài nghe"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <h3 className="mt-2.5 text-base font-bold text-slate-900 dark:text-white">
                  {ex.title}
                </h3>

                {ex.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {ex.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {doneCount}/{total} câu
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {pct === 100 ? (
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Hoàn thành
                        </span>
                      ) : (
                        `${pct}%`
                      )}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveExerciseId(ex.id)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                <Play className="h-4 w-4 fill-current" />
                {doneCount > 0 && doneCount < total ? 'Học tiếp' : 'Bắt đầu nghe & chép'}
              </button>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <CreateExerciseModal
          language={language}
          onClose={() => setShowCreate(false)}
          onCreated={async (created) => {
            setShowCreate(false);
            await onDataChanged();
            setActiveExerciseId(created.id);
          }}
        />
      )}
    </div>
  );
};
