import Dexie, { type Table } from 'dexie';
import type {
  DailyActivity,
  Deck,
  FirebaseConfigData,
  ListeningExercise,
  ListeningProgress,
  UserSettings,
  VocabCard,
} from '../types';
import { STARTER_CARDS, STARTER_DECKS } from '../data/starterVocab';
import { STARTER_LISTENING_EXERCISES } from '../data/starterListening';

export class KotobaDatabase extends Dexie {
  decks!: Table<Deck, string>;
  cards!: Table<VocabCard, string>;
  exercises!: Table<ListeningExercise, string>;
  listeningProgress!: Table<ListeningProgress, string>;
  dailyActivity!: Table<DailyActivity, string>;
  settings!: Table<UserSettings, string>;

  constructor() {
    super('KotobaLabDB');
    this.version(1).stores({
      decks: 'id, language, updatedAt',
      cards: 'id, deckId, language, due, state, updatedAt',
      exercises: 'id, language, category, updatedAt',
      listeningProgress: 'exerciseId, updatedAt',
      dailyActivity: 'date, updatedAt',
      settings: 'id',
    });
  }
}

export const db = new KotobaDatabase();

export function getEnvFirebaseConfig(): FirebaseConfigData | undefined {
  const apiKey =
    import.meta.env.VITE_FIREBASE_API_KEY?.trim() || 'AIzaSyC2itq2WoAEYTK7RGPvkQtdzY7wi9JiKBs';
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() || 'kotoba-lab-1bf96';
  const appId =
    import.meta.env.VITE_FIREBASE_APP_ID?.trim() || '1:514958229615:web:8976ff2a1da2af49accd9a';
  const authDomain =
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || 'kotoba-lab-1bf96.firebaseapp.com';

  if (!apiKey || !projectId || !appId) return undefined;
  return {
    apiKey,
    authDomain: authDomain || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket:
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() ||
      'kotoba-lab-1bf96.firebasestorage.app',
    messagingSenderId:
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || '514958229615',
    appId,
  };
}

export function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const DEFAULT_SETTINGS: UserSettings = {
  id: 'singleton',
  activeLanguage: 'en',
  darkMode: false,
  autoSync: true,
  ttsRateEn: 0.9,
  ttsRateJp: 0.85,
  jpStudyMode: 'handwriting',
  autoPlayAudio: true,
};

export async function ensureSeededDatabase(): Promise<UserSettings> {
  const existingSettings = await db.settings.get('singleton');
  const envConfig = getEnvFirebaseConfig();

  if (!existingSettings) {
    const initialSettings: UserSettings = {
      ...DEFAULT_SETTINGS,
      firebaseConfig: envConfig,
    };
    await db.settings.put(initialSettings);
  } else if (!existingSettings.firebaseConfig && envConfig) {
    await db.settings.update('singleton', { firebaseConfig: envConfig });
  }

  const deckCount = await db.decks.count();
  if (deckCount === 0) {
    await db.decks.bulkPut(STARTER_DECKS);
    await db.cards.bulkPut(STARTER_CARDS);
  }

  const exCount = await db.exercises.count();
  if (exCount === 0) {
    await db.exercises.bulkPut(STARTER_LISTENING_EXERCISES);
  }

  return (await db.settings.get('singleton')) ?? DEFAULT_SETTINGS;
}

export async function recordActivity(
  type: 'review' | 'dictation' | 'handwriting',
  amount = 1
): Promise<void> {
  const date = getTodayKey();
  const existing = await db.dailyActivity.get(date);
  const now = Date.now();
  const next: DailyActivity = existing ?? {
    date,
    reviewsCount: 0,
    dictationCount: 0,
    handwritingCount: 0,
    updatedAt: now,
  };

  if (type === 'review') next.reviewsCount += amount;
  if (type === 'dictation') next.dictationCount += amount;
  if (type === 'handwriting') {
    next.handwritingCount += amount;
    next.reviewsCount += amount;
  }
  next.updatedAt = now;
  await db.dailyActivity.put(next);
}

export async function exportFullBackupJson(): Promise<string> {
  const [decks, cards, exercises, listeningProgress, dailyActivity] = await Promise.all([
    db.decks.toArray(),
    db.cards.toArray(),
    db.exercises.toArray(),
    db.listeningProgress.toArray(),
    db.dailyActivity.toArray(),
  ]);

  return JSON.stringify(
    {
      version: 1,
      exportedAt: Date.now(),
      decks,
      cards,
      exercises,
      listeningProgress,
      dailyActivity,
    },
    null,
    2
  );
}

export async function importFullBackupJson(raw: string): Promise<{ decks: number; cards: number; exercises: number }> {
  const data = JSON.parse(raw);
  const decks: Deck[] = Array.isArray(data.decks) ? data.decks : [];
  const cards: VocabCard[] = Array.isArray(data.cards) ? data.cards : [];
  const exercises: ListeningExercise[] = Array.isArray(data.exercises) ? data.exercises : [];
  const listeningProgress: ListeningProgress[] = Array.isArray(data.listeningProgress)
    ? data.listeningProgress
    : [];
  const dailyActivity: DailyActivity[] = Array.isArray(data.dailyActivity) ? data.dailyActivity : [];

  await db.transaction(
    'rw',
    [db.decks, db.cards, db.exercises, db.listeningProgress, db.dailyActivity],
    async () => {
      if (decks.length) await db.decks.bulkPut(decks);
      if (cards.length) await db.cards.bulkPut(cards);
      if (exercises.length) await db.exercises.bulkPut(exercises);
      if (listeningProgress.length) await db.listeningProgress.bulkPut(listeningProgress);
      if (dailyActivity.length) await db.dailyActivity.bulkPut(dailyActivity);
    }
  );

  return { decks: decks.length, cards: cards.length, exercises: exercises.length };
}
