import React, { useMemo } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Play,
  BookOpen,
  ExternalLink,
  Clock,
  Target,
  Sparkles,
} from 'lucide-react';
import type { Deck, Language, StudyLessonProgress, VocabCard } from '../types';
import { EN_STUDY_LESSONS, EN_STUDY_STAGES } from '../data/studyCourseEn';
import { JP_STUDY_LESSONS, JP_STUDY_STAGES } from '../data/studyCourseJp';
import { StudyLessonView } from '../components/study/StudyLessonView';

interface StudyPageProps {
  language: Language;
  activeLessonId: string | null;
  studyProgressList: StudyLessonProgress[];
  decks: Deck[];
  cards: VocabCard[];
  ttsRate: number;
  onOpenLesson: (lessonId: string) => void;
  onCloseLesson: () => void;
  onDataChanged: () => Promise<void>;
}

export const StudyPage: React.FC<StudyPageProps> = ({
  language,
  activeLessonId,
  studyProgressList,
  decks,
  cards,
  ttsRate,
  onOpenLesson,
  onCloseLesson,
  onDataChanged,
}) => {
  const stages = language === 'en' ? EN_STUDY_STAGES : JP_STUDY_STAGES;
  const lessons = language === 'en' ? EN_STUDY_LESSONS : JP_STUDY_LESSONS;

  const progressMap = useMemo(() => {
    const map = new Map<string, StudyLessonProgress>();
    for (const p of studyProgressList) map.set(p.lessonId, p);
    return map;
  }, [studyProgressList]);

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === activeLessonId) ?? null,
    [lessons, activeLessonId]
  );

  const completedCount = useMemo(
    () => lessons.filter((l) => progressMap.get(l.id)?.completed).length,
    [lessons, progressMap]
  );

  const nextRecommendedLesson = useMemo(
    () => lessons.find((l) => !progressMap.get(l.id)?.completed) ?? lessons[0],
    [lessons, progressMap]
  );

  if (activeLesson) {
    const curIdx = lessons.findIndex((l) => l.id === activeLesson.id);
    const nextLesson = curIdx >= 0 && curIdx < lessons.length - 1 ? lessons[curIdx + 1] : null;
    return (
      <StudyLessonView
        lesson={activeLesson}
        progress={progressMap.get(activeLesson.id)}
        decks={decks}
        cards={cards}
        ttsRate={ttsRate}
        hasNextLesson={Boolean(nextLesson)}
        onBack={onCloseLesson}
        onGoNextLesson={() => {
          if (nextLesson) {
            onOpenLesson(nextLesson.id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onDataChanged={onDataChanged}
      />
    );
  }

  const pct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Study Course Hero Banner — Calm Discord matte panel in Dark Mode */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-lg sm:p-8 dark:border dark:border-[#3f4147] dark:bg-[#2b2d31] dark:bg-none dark:text-[#f2f3f5] dark:shadow-none ${
          language === 'en'
            ? 'bg-gradient-to-br from-sky-600 via-indigo-600 to-violet-700'
            : 'bg-gradient-to-br from-rose-600 via-pink-600 to-indigo-700'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm dark:bg-[#5865f2]/20 dark:text-[#b4beff]">
              <GraduationCap className="h-4 w-4" />
              {language === 'en'
                ? 'Khóa học tự học có hệ thống · Tham khảo IELTS Từ Đầu by Thế Quang'
                : 'Khóa học tự học có hệ thống · Tham khảo Dũng Mori & Minna / Shinkanzen'}
            </div>

            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {language === 'en'
                ? 'Lộ Trình IELTS 3.0 → 6.0 (Study)'
                : 'Lộ Trình Tiếng Nhật 0 → N3 (Study)'}
            </h1>

            <p className="mt-1.5 text-sm text-white/90 dark:text-[#b5bac1]">
              {language === 'en'
                ? '10 bài học trọng tâm chia thành 3 chặng (Nền tảng → Streamline 4 kỹ năng → Thực chiến Cambridge) kèm 40 bài tập tương tác & từ vựng đẩy thẳng sang Anki.'
                : '12 bài học chuẩn lộ trình 4 chặng (Bảng chữ cái → N5 Minna 1–25 → N4 Minna 26–50 → N3 Trung cấp) kèm 48 bài tập tương tác & từ vựng đẩy thẳng sang Anki.'}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {nextRecommendedLesson && (
                <button
                  onClick={() => onOpenLesson(nextRecommendedLesson.id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-indigo-700 shadow-md transition hover:bg-indigo-50 dark:bg-[#5865f2] dark:text-white dark:shadow-none dark:hover:bg-[#4752c4]"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {completedCount === 0
                    ? `Bắt đầu: ${nextRecommendedLesson.title.split(':')[0]}`
                    : `Học tiếp: ${nextRecommendedLesson.title.split(':')[0]}`}
                </button>
              )}

              <a
                href={
                  language === 'en'
                    ? 'https://www.youtube.com/@ieltstudau/playlists'
                    : 'https://www.youtube.com/@DungMori/playlists'
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/25 dark:border dark:border-[#3f4147] dark:bg-[#383a40] dark:text-[#dbdee1] dark:hover:bg-[#43464d]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {language === 'en' ? 'Kênh IELTS Từ Đầu (@ieltstudau)' : 'Kênh Dũng Mori (@DungMori)'}
              </a>
            </div>
          </div>

          {/* Progress Box */}
          <div className="min-w-[160px] rounded-2xl bg-white/15 p-4 text-center backdrop-blur-md dark:border dark:border-[#3f4147] dark:bg-[#1e1f22]">
            <div className="text-3xl font-black">{pct}%</div>
            <div className="mt-0.5 text-xs font-semibold text-white/90 dark:text-[#b5bac1]">
              {completedCount} / {lessons.length} bài hoàn thành
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/25 dark:bg-[#383a40]">
              <div className="h-full rounded-full bg-white transition-all dark:bg-[#5865f2]" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stage-by-Stage Roadmap */}
      <div className="space-y-6">
        {stages.map((stage) => {
          const stageLessons = lessons.filter((l) => l.stageId === stage.id);
          const stageDone = stageLessons.filter((l) => progressMap.get(l.id)?.completed).length;

          return (
            <section
              key={stage.id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Stage Header */}
              <div className="border-b border-slate-100 bg-slate-50/80 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-extrabold text-white">
                        {stage.badge}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        {stage.estimatedTime}
                      </span>
                    </div>
                    <h2 className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">
                      {stage.title}
                    </h2>
                    <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />
                      <span>{stage.goal}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {stageDone}/{stageLessons.length} bài xong
                    </span>
                    <a
                      href={stage.youtubeChannel.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {stage.youtubeChannel.label}
                    </a>
                  </div>
                </div>

                {/* Recommended Books Pill List */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="inline-flex items-center gap-1 font-bold text-slate-500">
                    <BookOpen className="h-3.5 w-3.5" /> Tài liệu chặng này:
                  </span>
                  {stage.recommendedBooks.map((book, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-0.5 font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {book}
                    </span>
                  ))}
                </div>
              </div>

              {/* Lessons List inside Stage */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {stageLessons.map((lesson) => {
                  const prog = progressMap.get(lesson.id);
                  const isDone = Boolean(prog?.completed);
                  const isNext = nextRecommendedLesson?.id === lesson.id;

                  return (
                    <div
                      key={lesson.id}
                      className={`flex flex-wrap items-center justify-between gap-4 p-5 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
                        isNext ? 'bg-indigo-50/30 dark:bg-indigo-950/15' : ''
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3.5">
                        <div
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : isNext
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="h-5 w-5" /> : lesson.order}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-extrabold text-slate-900 sm:text-base dark:text-white">
                              {lesson.title}
                            </h3>
                            {isNext && !isDone && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                <Sparkles className="h-3 w-3" /> Tiếp theo
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {lesson.subtitle}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
                            <span>{lesson.durationLabel}</span>
                            <span>·</span>
                            <span>{lesson.exercises.length} bài tập tương tác</span>
                            <span>·</span>
                            <span>{lesson.vocabPack.length} từ Anki</span>
                            {prog && prog.bestScore > 0 && (
                              <>
                                <span>·</span>
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  Điểm tốt nhất: {prog.bestScore}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenLesson(lesson.id)}
                        className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                          isDone
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-slate-900 text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500'
                        }`}
                      >
                        {isDone ? 'Ôn lại bài' : 'Vào học & Làm bài'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
