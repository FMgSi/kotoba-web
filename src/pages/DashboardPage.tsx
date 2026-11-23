import React, { useMemo } from 'react';
import {
  Flame,
  GraduationCap,
  BookOpen,
  Headphones,
  PenTool,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  LogIn,
} from 'lucide-react';
import type {
  AuthUserInfo,
  DailyActivity,
  Language,
  ListeningExercise,
  ListeningProgress,
  NavTab,
  StudyLessonProgress,
  SyncStatus,
  UserSettings,
  VocabCard,
} from '../types';
import { EN_STUDY_LESSONS } from '../data/studyCourseEn';
import { JP_STUDY_LESSONS } from '../data/studyCourseJp';
import { getDueQueue, isCardMastered } from '../lib/fsrs';
import { getTodayKey } from '../lib/db';

interface DashboardPageProps {
  cards: VocabCard[];
  exercises: ListeningExercise[];
  progressList: ListeningProgress[];
  studyProgressList: StudyLessonProgress[];
  activities: DailyActivity[];
  settings: UserSettings;
  authUser: AuthUserInfo | null;
  syncStatus: SyncStatus;
  onGoogleSignIn: () => void;
  onNavigate: (tab: NavTab, lang?: Language) => void;
}

function computeStreak(activities: DailyActivity[]): number {
  const activeDates = new Set(
    activities
      .filter((a) => a.reviewsCount + a.dictationCount > 0)
      .map((a) => a.date)
  );
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;
    if (activeDates.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  cards,
  exercises,
  progressList,
  studyProgressList,
  activities,
  settings,
  authUser,
  syncStatus,
  onGoogleSignIn,
  onNavigate,
}) => {
  const enStudyDone = useMemo(
    () =>
      EN_STUDY_LESSONS.filter((l) =>
        studyProgressList.some((p) => p.lessonId === l.id && p.completed)
      ).length,
    [studyProgressList]
  );
  const jpStudyDone = useMemo(
    () =>
      JP_STUDY_LESSONS.filter((l) =>
        studyProgressList.some((p) => p.lessonId === l.id && p.completed)
      ).length,
    [studyProgressList]
  );
  const activeCards = useMemo(() => cards.filter((c) => !c.deleted), [cards]);
  const enCards = useMemo(() => activeCards.filter((c) => c.language === 'en'), [activeCards]);
  const jpCards = useMemo(() => activeCards.filter((c) => c.language === 'jp'), [activeCards]);

  const enDue = getDueQueue(enCards).length;
  const jpDue = getDueQueue(jpCards).length;
  const today = activities.find((a) => a.date === getTodayKey());
  const streak = useMemo(() => computeStreak(activities), [activities]);

  const totalDictationDone = useMemo(
    () => progressList.reduce((sum, p) => sum + Object.keys(p.completedSegments).length, 0),
    [progressList]
  );

  const last14Days = useMemo(() => {
    const map = new Map(activities.map((a) => [a.date, a]));
    const arr: { date: string; label: string; total: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const dt = new Date();
      dt.setDate(dt.getDate() - i);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
        dt.getDate()
      ).padStart(2, '0')}`;
      const act = map.get(key);
      const total = (act?.reviewsCount ?? 0) + (act?.dictationCount ?? 0);
      arr.push({ date: key, label: `${dt.getDate()}/${dt.getMonth() + 1}`, total });
    }
    return arr;
  }, [activities]);

  const maxDayTotal = Math.max(5, ...last14Days.map((d) => d.total));

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-6 text-white shadow-lg sm:p-8">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Góc tự học cá nhân · Anh (A2→IELTS) & Nhật (Kana→N5)
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Chào mừng trở lại KotobaLab!
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-indigo-100">
              Hôm nay bạn có <b>{enDue}</b> thẻ Tiếng Anh và <b>{jpDue}</b> thẻ Tiếng Nhật đến hạn ôn. Duy trì 15–30 phút mỗi ngày để lên trình đều nhé!
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-5 py-3.5 backdrop-blur-md">
            <Flame className="h-9 w-9 text-amber-300" />
            <div>
              <div className="text-2xl font-extrabold leading-none">{streak} ngày</div>
              <div className="mt-0.5 text-xs text-indigo-100">Chuỗi học liên tiếp</div>
            </div>
          </div>
        </div>
      </div>

      {/* Google 1-Time Sign-In Banner (only shown if not signed in yet) */}
      {!authUser && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 px-5 py-3.5 dark:border-indigo-900/60 dark:bg-indigo-950/30">
          <div className="flex items-center gap-3 text-sm text-indigo-950 dark:text-indigo-200">
            <ShieldCheck className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span>
              Đăng nhập <b>Google 1 lần duy nhất</b> trên thiết bị này để bảo vệ dữ liệu riêng tư và tự động đồng bộ giữa điện thoại, laptop & PC.
            </span>
          </div>
          <button
            onClick={onGoogleSignIn}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
          >
            <LogIn className="h-3.5 w-3.5" />
            Đăng nhập Google
          </button>
        </div>
      )}

      {/* Today KPI Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold text-slate-500">Ôn thẻ hôm nay</div>
          <div className="mt-1 text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {today?.reviewsCount ?? 0}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold text-slate-500">Viết tay tiếng Nhật</div>
          <div className="mt-1 text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {today?.handwritingCount ?? 0}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold text-slate-500">Câu nghe đã chép đúng</div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {totalDictationDone}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold text-slate-500">Trạng thái đám mây</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-100">
            {syncStatus === 'synced' ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Đã đồng bộ
              </>
            ) : syncStatus === 'syncing' ? (
              'Đang đồng bộ...'
            ) : (
              'Chế độ cục bộ'
            )}
          </div>
        </div>
      </div>

      {/* Two Language Study Tracks */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* English Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-extrabold text-sky-700 dark:bg-sky-950/70 dark:text-sky-300">
              🇬🇧 ENGLISH · A2 → IELTS
            </span>
            <span className="text-xs font-medium text-slate-400">
              {enCards.filter(isCardMastered).length}/{enCards.length} từ thuộc
            </span>
          </div>
          <h2 className="mt-3 text-xl font-extrabold text-slate-900 dark:text-white">
            Tiếng Anh (Anki & DailyDictation)
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Luyện nghe chép chính tả từ Short Stories, IELTS Part 1, YouTube và ôn thẻ chuẩn Anki.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <button
              onClick={() => onNavigate('study', 'en')}
              className="flex flex-col items-start rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-sky-400 hover:bg-sky-50/50 dark:border-slate-800 dark:bg-slate-950"
            >
              <GraduationCap className="h-5 w-5 text-sky-600" />
              <span className="mt-2 text-xs font-bold text-slate-900 sm:text-sm dark:text-white">
                Study 3→6
              </span>
              <span className="text-[11px] font-semibold text-sky-600">
                {enStudyDone}/{EN_STUDY_LESSONS.length} bài
              </span>
            </button>

            <button
              onClick={() => onNavigate('vocab', 'en')}
              className="flex flex-col items-start rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-950"
            >
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <span className="mt-2 text-xs font-bold text-slate-900 sm:text-sm dark:text-white">
                Ôn Anki
              </span>
              <span className="text-[11px] font-semibold text-indigo-600">{enDue} đến hạn</span>
            </button>

            <button
              onClick={() => onNavigate('listening', 'en')}
              className="flex flex-col items-start rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-slate-800 dark:bg-slate-950"
            >
              <Headphones className="h-5 w-5 text-emerald-600" />
              <span className="mt-2 text-xs font-bold text-slate-900 sm:text-sm dark:text-white">
                Luyện Nghe
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">
                {exercises.filter((e) => e.language === 'en' && !e.deleted).length} bài
              </span>
            </button>
          </div>
        </div>

        {/* Japanese Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
              🇯🇵 日本語 · Kana → N5
            </span>
            <span className="text-xs font-medium text-slate-400">
              {jpCards.filter(isCardMastered).length}/{jpCards.length} từ thuộc
            </span>
          </div>
          <h2 className="mt-3 text-xl font-extrabold text-slate-900 dark:text-white">
            Tiếng Nhật (Viết tay cảm ứng & Minna)
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Dùng tay viết trực tiếp Hiragana/Katakana/Kanji để máy chấm đúng sai, kết hợp nghe chép Minna no Nihongo.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <button
              onClick={() => onNavigate('study', 'jp')}
              className="flex flex-col items-start rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-pink-400 hover:bg-pink-50/50 dark:border-slate-800 dark:bg-slate-950"
            >
              <GraduationCap className="h-5 w-5 text-pink-600" />
              <span className="mt-2 text-xs font-bold text-slate-900 sm:text-sm dark:text-white">
                Study 0→N3
              </span>
              <span className="text-[11px] font-semibold text-pink-600">
                {jpStudyDone}/{JP_STUDY_LESSONS.length} bài
              </span>
            </button>

            <button
              onClick={() => onNavigate('vocab', 'jp')}
              className="flex flex-col items-start rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-rose-400 hover:bg-rose-50/50 dark:border-slate-800 dark:bg-slate-950"
            >
              <PenTool className="h-5 w-5 text-rose-600" />
              <span className="mt-2 text-xs font-bold text-slate-900 sm:text-sm dark:text-white">
                Viết tay
              </span>
              <span className="text-[11px] font-semibold text-rose-600">{jpDue} đến hạn</span>
            </button>

            <button
              onClick={() => onNavigate('listening', 'jp')}
              className="flex flex-col items-start rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-slate-800 dark:bg-slate-950"
            >
              <Headphones className="h-5 w-5 text-emerald-600" />
              <span className="mt-2 text-xs font-bold text-slate-900 sm:text-sm dark:text-white">
                Nghe N5
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">
                {exercises.filter((e) => e.language === 'jp' && !e.deleted).length} bài
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 14-day Activity Chart */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Nhịp độ học 14 ngày gần nhất
            </h3>
            <p className="text-xs text-slate-500">Tổng số lượt ôn từ + câu nghe chép mỗi ngày</p>
          </div>
          <button
            onClick={() => onNavigate('vocab', settings.activeLanguage)}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Vào học ngay <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid h-32 grid-cols-14 items-end gap-1.5">
          {last14Days.map((day) => {
            const heightPct = day.total > 0 ? Math.max(14, Math.round((day.total / maxDayTotal) * 100)) : 6;
            return (
              <div key={day.date} className="flex h-full flex-col items-center justify-end gap-1">
                <div
                  title={`${day.label}: ${day.total} hoạt động`}
                  className={`w-full rounded-t-lg transition-all ${
                    day.total > 0
                      ? 'bg-indigo-500 dark:bg-indigo-400'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[10px] text-slate-400">{day.label.split('/')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
