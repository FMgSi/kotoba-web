import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Layers,
  Headphones,
  BookOpenCheck,
  PenLine,
  Settings,
  RefreshCw,
  Moon,
  Sun,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  LogIn,
} from 'lucide-react';
import type {
  AuthUserInfo,
  DailyActivity,
  Deck,
  JpStudyMode,
  Language,
  ListeningExercise,
  ListeningProgress,
  NavTab,
  StudyLessonProgress,
  SyncStatus,
  UserSettings,
  VocabCard,
} from './types';
import { db, DEFAULT_SETTINGS, ensureSeededDatabase } from './lib/db';
import { configureAudioPreferences } from './lib/tts';
import {
  goBackOrFallback,
  pushRoute,
  replaceRoute,
  useHashRoute,
} from './lib/router';
import {
  signInWithGoogleAccount,
  signOutGoogleAccount,
  subscribeGoogleAuth,
  syncWithFirebase,
} from './lib/firebaseSync';
import { DashboardPage } from './pages/DashboardPage';
import { StudyPage } from './pages/StudyPage';
import { VocabPage } from './pages/VocabPage';
import { ListeningPage } from './pages/ListeningPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { SettingsSyncPage } from './pages/SettingsSyncPage';

const NAV_ITEMS: {
  id: NavTab;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Tổng quan', shortLabel: 'Home', icon: LayoutDashboard },
  { id: 'study', label: 'Study', shortLabel: 'Study', icon: GraduationCap },
  { id: 'vocab', label: 'Từ vựng (Anki)', shortLabel: 'Từ vựng', icon: Layers },
  { id: 'listening', label: 'Luyện Nghe', shortLabel: 'Nghe', icon: Headphones },
  { id: 'reading', label: 'Đọc', shortLabel: 'Đọc', icon: BookOpenCheck },
  { id: 'writing', label: 'Viết', shortLabel: 'Viết', icon: PenLine },
  { id: 'settings', label: 'Cài đặt', shortLabel: 'Cài đặt', icon: Settings },
];

export default function App() {
  const route = useHashRoute();
  const activeTab = route.tab;

  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [authUser, setAuthUser] = useState<AuthUserInfo | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [exercises, setExercises] = useState<ListeningExercise[]>([]);
  const [progressList, setProgressList] = useState<ListeningProgress[]>([]);
  const [studyProgressList, setStudyProgressList] = useState<StudyLessonProgress[]>([]);
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local');
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const autoSyncTimerRef = useRef<number | null>(null);
  const settingsRef = useRef<UserSettings>(DEFAULT_SETTINGS);
  settingsRef.current = settings;

  const showToast = useCallback((text: string, ms = 3200) => {
    setSyncToast(text);
    window.setTimeout(() => setSyncToast(null), ms);
  }, []);

  const reloadLocalData = useCallback(async () => {
    const [d, c, ex, prog, studyProg, act, st] = await Promise.all([
      db.decks.toArray(),
      db.cards.toArray(),
      db.exercises.toArray(),
      db.listeningProgress.toArray(),
      db.studyProgress.toArray(),
      db.dailyActivity.toArray(),
      db.settings.get('singleton'),
    ]);
    setDecks(d);
    setCards(c);
    setExercises(ex);
    setProgressList(prog);
    setStudyProgressList(studyProg);
    setActivities(act);
    if (st) setSettings(st);
  }, []);

  const runCloudSync = useCallback(
    async (explicitSettings?: UserSettings, silent = false) => {
      const cfg = (explicitSettings ?? settingsRef.current).firebaseConfig;
      if (!cfg?.apiKey || !cfg?.projectId) {
        setSyncStatus('local');
        return;
      }

      setSyncStatus('syncing');
      try {
        await syncWithFirebase(cfg);
        await reloadLocalData();
        setSyncStatus('synced');
        if (!silent) {
          showToast('Đã đồng bộ toàn bộ tiến độ với tài khoản Google!');
        }
      } catch (err) {
        console.error('Sync failed:', err);
        setSyncStatus('error');
        if (!silent) {
          const msg = err instanceof Error ? err.message : 'Chưa đồng bộ được.';
          showToast(
            msg.includes('Missing or insufficient permissions')
              ? 'Chưa có quyền ghi Firestore — kiểm tra tab Cài đặt để dán Firestore Rules theo email Google của bạn.'
              : msg,
            5000
          );
        }
      }
    },
    [reloadLocalData, showToast]
  );

  // 1. Seed local IndexedDB on startup
  useEffect(() => {
    let active = true;
    (async () => {
      const seeded = await ensureSeededDatabase();
      await reloadLocalData();
      if (!active) return;
      setSettings(seeded);
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [reloadLocalData]);

  // 2. Subscribe to Firebase Google Auth — auto-restores login on phone/PC/laptop and auto-syncs!
  useEffect(() => {
    const cfg = settings.firebaseConfig;
    if (!ready || !cfg?.apiKey || !cfg?.projectId) return;

    let unsubscribe: (() => void) | null = null;
    let active = true;

    subscribeGoogleAuth(cfg, (user) => {
      if (!active) return;
      setAuthUser(user);
      if (user) {
        void runCloudSync(settingsRef.current, true);
      } else {
        setSyncStatus('local');
      }
    })
      .then((unsub) => {
        if (active) unsubscribe = unsub;
        else unsub();
      })
      .catch((err) => {
        console.warn('Auth init warning:', err);
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [ready, settings.firebaseConfig?.projectId, settings.firebaseConfig?.apiKey, runCloudSync]);

  // Apply Dark Mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  // Sync preferred voice & accent into audio engine
  useEffect(() => {
    configureAudioPreferences({
      enAccent: settings.enAccent ?? 'us',
      voiceNameEn: settings.voiceNameEn,
      voiceNameJp: settings.voiceNameJp,
    });
  }, [settings.enAccent, settings.voiceNameEn, settings.voiceNameJp]);

  // Keep language aligned when Browser Back/Forward jumps across EN & JP deep links
  useEffect(() => {
    if (!ready || !route.itemId) return;
    const id = route.itemId;
    const inferred: Language | null =
      id.startsWith('jp-') || id.startsWith('ex-jp-') || id.startsWith('deck-jp-')
        ? 'jp'
        : id.startsWith('en-') || id.startsWith('ex-en-') || id.startsWith('deck-en-')
        ? 'en'
        : null;
    if (inferred && inferred !== settingsRef.current.activeLanguage) {
      const next: UserSettings = { ...settingsRef.current, activeLanguage: inferred };
      setSettings(next);
      void db.settings.put(next);
    }
  }, [ready, route.itemId]);

  const handleGoogleSignIn = useCallback(async () => {
    const cfg = settingsRef.current.firebaseConfig;
    if (!cfg?.apiKey || !cfg?.projectId) {
      pushRoute({ tab: 'settings' });
      return;
    }
    setAuthBusy(true);
    try {
      const user = await signInWithGoogleAccount(cfg);
      if (user) {
        setAuthUser(user);
        showToast(`Xin chào ${user.displayName || user.email}! Đang đồng bộ...`);
        await runCloudSync(settingsRef.current, false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập Google thất bại.';
      showToast(msg, 5500);
    } finally {
      setAuthBusy(false);
    }
  }, [runCloudSync, showToast]);

  const handleGoogleSignOut = useCallback(async () => {
    const cfg = settingsRef.current.firebaseConfig;
    if (!cfg) return;
    await signOutGoogleAccount(cfg);
    setAuthUser(null);
    setSyncStatus('local');
    showToast('Đã đăng xuất tài khoản Google.');
  }, [showToast]);

  const handleDataChanged = useCallback(async () => {
    await reloadLocalData();
    if (settingsRef.current.autoSync && authUser && settingsRef.current.firebaseConfig?.projectId) {
      if (autoSyncTimerRef.current) window.clearTimeout(autoSyncTimerRef.current);
      autoSyncTimerRef.current = window.setTimeout(() => {
        void runCloudSync(settingsRef.current, true);
      }, 1400);
    }
  }, [reloadLocalData, authUser, runCloudSync]);

  async function updateSettings(patch: Partial<UserSettings>) {
    const next: UserSettings = { ...settings, ...patch };
    setSettings(next);
    await db.settings.put(next);
  }

  function handleSwitchLanguage(nextLang: Language) {
    if (nextLang === settings.activeLanguage) return;
    void updateSettings({ activeLanguage: nextLang });
    // If currently inside a language-specific lesson/deck/exercise, cleanly step back to that tab's list
    if (route.itemId) {
      replaceRoute({ tab: route.tab });
    }
  }

  function handleNavigate(tab: NavTab, lang?: Language) {
    if (lang && lang !== settings.activeLanguage) {
      void updateSettings({ activeLanguage: lang });
    }
    pushRoute({ tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#313338]">
        <div className="flex flex-col items-center gap-3 text-indigo-600 dark:text-[#8ea1e1]">
          <Sparkles className="h-9 w-9 animate-pulse" />
          <span className="text-sm font-bold">Đang khởi động KotobaLab...</span>
        </div>
      </div>
    );
  }

  const activeLang = settings.activeLanguage;
  const activeTtsRate = activeLang === 'jp' ? settings.ttsRateJp : settings.ttsRateEn;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900 dark:bg-[#313338] dark:text-[#f2f3f5] md:pb-10">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-[#1f2023] dark:bg-[#2b2d31]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
          {/* Brand */}
          <button
            onClick={() => handleNavigate('dashboard')}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-base font-black text-white shadow-sm dark:bg-[#5865f2] dark:bg-none">
              言
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
                KotobaLab
              </div>
              <div className="text-[10px] font-semibold text-slate-400">EN · JP Studio</div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-[#404249] dark:text-[#f2f3f5]'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-[#b5bac1] dark:hover:bg-[#35373c] dark:hover:text-[#f2f3f5]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Language Switcher + Google Auth / 1-Click Sync + Dark Mode */}
          <div className="flex items-center gap-2">
            {/* EN / JP Switcher */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={() => handleSwitchLanguage('en')}
                className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition ${
                  activeLang === 'en'
                    ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                🇬🇧 EN
              </button>
              <button
                onClick={() => handleSwitchLanguage('jp')}
                className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition ${
                  activeLang === 'jp'
                    ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-900 dark:text-rose-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                🇯🇵 JP
              </button>
            </div>

            {/* Google Sign-In OR 1-Click Sync Button */}
            {authUser ? (
              <button
                onClick={() => void runCloudSync(settings, false)}
                disabled={syncStatus === 'syncing'}
                title={`Đã đăng nhập: ${authUser.email || ''} — bấm để đồng bộ ngay`}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition ${
                  syncStatus === 'synced'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : syncStatus === 'error'
                    ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                {syncStatus === 'syncing' ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                ) : syncStatus === 'synced' ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )}
                {authUser.photoURL && (
                  <img
                    src={authUser.photoURL}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-4 w-4 rounded-full"
                  />
                )}
                <span className="hidden sm:inline">
                  {syncStatus === 'syncing' ? 'Đang đồng bộ' : 'Đồng bộ'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => void handleGoogleSignIn()}
                disabled={authBusy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Đăng nhập Google</span>
                <span className="sm:hidden">Google</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => void updateSettings({ darkMode: !settings.darkMode })}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              title="Đổi giao diện Sáng / Tối"
            >
              {settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed right-4 bottom-20 z-50 max-w-sm rounded-2xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl md:bottom-6 dark:bg-indigo-600">
          {syncToast}
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {activeTab === 'dashboard' && (
          <DashboardPage
            cards={cards}
            exercises={exercises}
            progressList={progressList}
            studyProgressList={studyProgressList}
            activities={activities}
            settings={settings}
            authUser={authUser}
            syncStatus={syncStatus}
            onGoogleSignIn={() => void handleGoogleSignIn()}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'study' && (
          <StudyPage
            language={activeLang}
            activeLessonId={route.itemId ?? null}
            studyProgressList={studyProgressList}
            decks={decks}
            cards={cards}
            ttsRate={activeTtsRate}
            onOpenLesson={(lessonId) => pushRoute({ tab: 'study', itemId: lessonId })}
            onCloseLesson={() => goBackOrFallback({ tab: 'study' })}
            onDataChanged={handleDataChanged}
          />
        )}

        {activeTab === 'vocab' && (
          <VocabPage
            language={activeLang}
            studyingDeckId={route.itemId ?? null}
            practiceAllMode={Boolean(route.practiceAll)}
            decks={decks}
            cards={cards}
            jpStudyMode={settings.jpStudyMode}
            ttsRate={activeTtsRate}
            autoPlay={settings.autoPlayAudio}
            onStartStudy={(deckId, practiceAll) =>
              pushRoute({ tab: 'vocab', itemId: deckId, practiceAll })
            }
            onExitStudy={() => goBackOrFallback({ tab: 'vocab' })}
            onChangeJpMode={(mode: JpStudyMode) => void updateSettings({ jpStudyMode: mode })}
            onDataChanged={handleDataChanged}
          />
        )}

        {activeTab === 'listening' && (
          <ListeningPage
            language={activeLang}
            activeExerciseId={route.itemId ?? null}
            exercises={exercises}
            progressList={progressList}
            decks={decks}
            onOpenExercise={(exerciseId) => pushRoute({ tab: 'listening', itemId: exerciseId })}
            onCloseExercise={() => goBackOrFallback({ tab: 'listening' })}
            onDataChanged={handleDataChanged}
          />
        )}

        {activeTab === 'reading' && <ComingSoonPage skill="reading" language={activeLang} />}
        {activeTab === 'writing' && <ComingSoonPage skill="writing" language={activeLang} />}

        {activeTab === 'settings' && (
          <SettingsSyncPage
            settings={settings}
            authUser={authUser}
            authBusy={authBusy}
            onGoogleSignIn={handleGoogleSignIn}
            onGoogleSignOut={handleGoogleSignOut}
            onSettingsChanged={async (next) => {
              setSettings(next);
              await db.settings.put(next);
            }}
            onSynced={async () => {
              await reloadLocalData();
              setSyncStatus('synced');
            }}
          />
        )}
      </main>

      {/* Footer Credit */}
      <footer className="mx-auto mt-8 max-w-6xl px-4 text-center text-[11px] text-slate-400">
        KotobaLab v1.9 · Handwriting by{' '}
        <a
          href="https://github.com/asdfjkl/kanjicanvas"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-indigo-500"
        >
          KanjiCanvas (MIT)
        </a>{' '}
        · Kana Audio by{' '}
        <a
          href="https://github.com/veardk/just-gojuon"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-indigo-500"
        >
          just-gojuon (MIT)
        </a>{' '}
        · SRS by ts-fsrs
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur-md md:hidden dark:border-[#1f2023] dark:bg-[#2b2d31]/95">
        <div className="grid grid-cols-5 gap-1">
          {NAV_ITEMS.filter((i) => i.id !== 'reading' && i.id !== 'writing').map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex flex-col items-center justify-center rounded-xl py-1.5 text-[10px] font-bold ${
                  active
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="mb-0.5 h-5 w-5" />
                {item.shortLabel}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
