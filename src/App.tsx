import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  Headphones,
  BookOpenCheck,
  PenLine,
  Cloud,
  RefreshCw,
  Moon,
  Sun,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import type {
  DailyActivity,
  Deck,
  JpStudyMode,
  Language,
  ListeningExercise,
  ListeningProgress,
  NavTab,
  SyncStatus,
  UserSettings,
  VocabCard,
} from './types';
import { db, DEFAULT_SETTINGS, ensureSeededDatabase } from './lib/db';
import { extractMagicSyncFromHash, syncWithFirebase } from './lib/firebaseSync';
import { DashboardPage } from './pages/DashboardPage';
import { VocabPage } from './pages/VocabPage';
import { ListeningPage } from './pages/ListeningPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { SettingsSyncPage } from './pages/SettingsSyncPage';

const NAV_ITEMS: { id: NavTab; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Tổng quan', shortLabel: 'Home', icon: LayoutDashboard },
  { id: 'vocab', label: 'Từ vựng (Anki)', shortLabel: 'Từ vựng', icon: Layers },
  { id: 'listening', label: 'Luyện Nghe', shortLabel: 'Nghe', icon: Headphones },
  { id: 'reading', label: 'Đọc', shortLabel: 'Đọc', icon: BookOpenCheck },
  { id: 'writing', label: 'Viết', shortLabel: 'Viết', icon: PenLine },
  { id: 'settings', label: 'Đồng bộ Firebase', shortLabel: 'Sync', icon: Cloud },
];

export default function App() {
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [exercises, setExercises] = useState<ListeningExercise[]>([]);
  const [progressList, setProgressList] = useState<ListeningProgress[]>([]);
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local');
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const autoSyncTimerRef = useRef<number | null>(null);

  const reloadLocalData = useCallback(async () => {
    const [d, c, ex, prog, act, st] = await Promise.all([
      db.decks.toArray(),
      db.cards.toArray(),
      db.exercises.toArray(),
      db.listeningProgress.toArray(),
      db.dailyActivity.toArray(),
      db.settings.get('singleton'),
    ]);
    setDecks(d);
    setCards(c);
    setExercises(ex);
    setProgressList(prog);
    setActivities(act);
    if (st) setSettings(st);
  }, []);

  const runCloudSync = useCallback(
    async (explicitSettings?: UserSettings, silent = false) => {
      const cfg = (explicitSettings ?? settings).firebaseConfig;
      if (!cfg?.apiKey || !cfg?.projectId || !cfg?.syncSpaceId) {
        setSyncStatus('local');
        if (!silent) {
          setActiveTab('settings');
        }
        return;
      }

      setSyncStatus('syncing');
      try {
        await syncWithFirebase(cfg);
        await reloadLocalData();
        setSyncStatus('synced');
        if (!silent) {
          setSyncToast('Đã đồng bộ toàn bộ tiến độ với Firebase!');
          window.setTimeout(() => setSyncToast(null), 2600);
        }
      } catch (err) {
        console.error('Sync failed:', err);
        setSyncStatus('error');
        if (!silent) {
          setSyncToast('Chưa đồng bộ được — kiểm tra cấu hình Firebase trong mục Sync.');
          window.setTimeout(() => setSyncToast(null), 3500);
        }
      }
    },
    [settings, reloadLocalData]
  );

  // Initial startup: seed DB, check Magic Auto-Login Bookmark Link (#sync=...), auto-sync Firebase!
  useEffect(() => {
    let active = true;
    (async () => {
      let seeded = await ensureSeededDatabase();

      const magicConfig = extractMagicSyncFromHash();
      if (magicConfig) {
        seeded = { ...seeded, firebaseConfig: magicConfig, autoSync: true };
        await db.settings.put(seeded);
        // Clean hash from URL bar after storing locally
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }

      await reloadLocalData();
      if (!active) return;
      setSettings(seeded);
      setReady(true);

      if (seeded.firebaseConfig?.projectId) {
        void runCloudSync(seeded, !magicConfig);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Apply Dark Mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  const handleDataChanged = useCallback(async () => {
    await reloadLocalData();
    if (settings.autoSync && settings.firebaseConfig?.projectId) {
      if (autoSyncTimerRef.current) window.clearTimeout(autoSyncTimerRef.current);
      autoSyncTimerRef.current = window.setTimeout(() => {
        void runCloudSync(settings, true);
      }, 1500);
    }
  }, [reloadLocalData, settings, runCloudSync]);

  async function updateSettings(patch: Partial<UserSettings>) {
    const next: UserSettings = { ...settings, ...patch };
    setSettings(next);
    await db.settings.put(next);
  }

  function handleNavigate(tab: NavTab, lang?: Language) {
    if (lang && lang !== settings.activeLanguage) {
      void updateSettings({ activeLanguage: lang });
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-indigo-600">
          <Sparkles className="h-9 w-9 animate-pulse" />
          <span className="text-sm font-bold">Đang khởi động KotobaLab...</span>
        </div>
      </div>
    );
  }

  const activeLang = settings.activeLanguage;
  const activeTtsRate = activeLang === 'jp' ? settings.ttsRateJp : settings.ttsRateEn;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:pb-10">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
          {/* Brand */}
          <button
            onClick={() => handleNavigate('dashboard')}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-base font-black text-white shadow-sm">
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
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Language Switcher + 1-Click Sync + Dark Mode */}
          <div className="flex items-center gap-2">
            {/* EN / JP Switcher */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={() => void updateSettings({ activeLanguage: 'en' })}
                className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition ${
                  activeLang === 'en'
                    ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                🇬🇧 EN
              </button>
              <button
                onClick={() => void updateSettings({ activeLanguage: 'jp' })}
                className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition ${
                  activeLang === 'jp'
                    ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-900 dark:text-rose-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                🇯🇵 JP
              </button>
            </div>

            {/* 1-Click Sync Button */}
            <button
              onClick={() => void runCloudSync(settings, false)}
              disabled={syncStatus === 'syncing'}
              title={
                settings.firebaseConfig?.projectId
                  ? 'Bấm để đồng bộ ngay với Firebase'
                  : 'Chưa nối Firebase — bấm để thiết lập'
              }
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition ${
                syncStatus === 'synced'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : syncStatus === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              {syncStatus === 'syncing' ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-500" />
              ) : syncStatus === 'synced' ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : syncStatus === 'error' ? (
                <AlertTriangle className="h-3.5 w-3.5" />
              ) : (
                <Cloud className="h-3.5 w-3.5 text-indigo-500" />
              )}
              <span className="hidden sm:inline">
                {syncStatus === 'syncing'
                  ? 'Đang đồng bộ'
                  : syncStatus === 'synced'
                  ? 'Đồng bộ'
                  : 'Sync'}
              </span>
            </button>

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
        <div className="fixed right-4 bottom-20 z-50 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl md:bottom-6 dark:bg-indigo-600">
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
            activities={activities}
            settings={settings}
            syncStatus={syncStatus}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'vocab' && (
          <VocabPage
            language={activeLang}
            decks={decks}
            cards={cards}
            jpStudyMode={settings.jpStudyMode}
            ttsRate={activeTtsRate}
            autoPlay={settings.autoPlayAudio}
            onChangeJpMode={(mode: JpStudyMode) => void updateSettings({ jpStudyMode: mode })}
            onDataChanged={handleDataChanged}
          />
        )}

        {activeTab === 'listening' && (
          <ListeningPage
            language={activeLang}
            exercises={exercises}
            progressList={progressList}
            decks={decks}
            onDataChanged={handleDataChanged}
          />
        )}

        {activeTab === 'reading' && <ComingSoonPage skill="reading" language={activeLang} />}
        {activeTab === 'writing' && <ComingSoonPage skill="writing" language={activeLang} />}

        {activeTab === 'settings' && (
          <SettingsSyncPage
            settings={settings}
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

      {/* Footer Credit (KanjiCanvas MIT attribution) */}
      <footer className="mx-auto mt-8 max-w-6xl px-4 text-center text-[11px] text-slate-400">
        KotobaLab Personal Study App · Japanese handwriting engine powered by{' '}
        <a
          href="https://github.com/asdfjkl/kanjicanvas"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-indigo-500"
        >
          KanjiCanvas (MIT)
        </a>{' '}
        · SRS powered by ts-fsrs
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-900/95">
        <div className="grid grid-cols-5 gap-1">
          {NAV_ITEMS.filter((i) => i.id !== 'writing').map((item) => {
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
