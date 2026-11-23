import Dexie, { type Table } from 'dexie';
import type {
  DailyActivity,
  Deck,
  FirebaseConfigData,
  ListeningExercise,
  ListeningProgress,
  StudyLessonProgress,
  UserSettings,
  VocabCard,
} from '../types';
import {
  LEGACY_STARTER_CARD_IDS,
  LEGACY_STARTER_DECK_IDS,
  STARTER_CARDS,
  STARTER_DECKS,
  V2_RETIRE_TIME,
} from '../data/starterVocab';
import { STARTER_LISTENING_EXERCISES } from '../data/starterListening';

const CURRENT_STARTER_VERSION = 2;

export class KotobaDatabase extends Dexie {
  decks!: Table<Deck, string>;
  cards!: Table<VocabCard, string>;
  exercises!: Table<ListeningExercise, string>;
  listeningProgress!: Table<ListeningProgress, string>;
  studyProgress!: Table<StudyLessonProgress, string>;
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
    this.version(2).stores({
      decks: 'id, language, updatedAt',
      cards: 'id, deckId, language, due, state, updatedAt',
      exercises: 'id, language, category, updatedAt',
      listeningProgress: 'exerciseId, updatedAt',
      studyProgress: 'lessonId, updatedAt',
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
      starterDataVersion: CURRENT_STARTER_VERSION,
    };
    await db.settings.put(initialSettings);
  } else if (!existingSettings.firebaseConfig && envConfig) {
    await db.settings.update('singleton', { firebaseConfig: envConfig });
  }

  const deckCount = await db.decks.count();
  const currentVersion = existingSettings?.starterDataVersion ?? 0;

  if (deckCount === 0) {
    await db.decks.bulkPut(STARTER_DECKS);
    await db.cards.bulkPut(STARTER_CARDS);
    await db.settings.update('singleton', { starterDataVersion: CURRENT_STARTER_VERSION });
  } else if (currentVersion < CURRENT_STARTER_VERSION) {
    // One-time upgrade to v2: retire old sample starter decks & seed user's learn.apkg + 2 separate Kana alphabet decks
    await db.transaction('rw', [db.decks, db.cards, db.settings], async () => {
      for (const oldDeckId of LEGACY_STARTER_DECK_IDS) {
        const d = await db.decks.get(oldDeckId);
        if (d && !d.deleted) {
          await db.decks.put({ ...d, deleted: true, updatedAt: V2_RETIRE_TIME });
        }
      }
      for (const oldCardId of LEGACY_STARTER_CARD_IDS) {
        const c = await db.cards.get(oldCardId);
        if (c && !c.deleted) {
          await db.cards.put({ ...c, deleted: true, updatedAt: V2_RETIRE_TIME });
        }
      }
      for (const newDeck of STARTER_DECKS) {
        const exists = await db.decks.get(newDeck.id);
        if (!exists) {
          await db.decks.put(newDeck);
        }
      }
      for (const newCard of STARTER_CARDS) {
        const exists = await db.cards.get(newCard.id);
        if (!exists) {
          await db.cards.put(newCard);
        }
      }
      await db.settings.update('singleton', { starterDataVersion: CURRENT_STARTER_VERSION });
    });
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
  const [decks, cards, exercises, listeningProgress, studyProgress, dailyActivity] = await Promise.all([
    db.decks.toArray(),
    db.cards.toArray(),
    db.exercises.toArray(),
    db.listeningProgress.toArray(),
    db.studyProgress.toArray(),
    db.dailyActivity.toArray(),
  ]);

  return JSON.stringify(
    {
      version: 2,
      exportedAt: Date.now(),
      decks,
      cards,
      exercises,
      listeningProgress,
      studyProgress,
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
  const studyProgress: StudyLessonProgress[] = Array.isArray(data.studyProgress)
    ? data.studyProgress
    : [];
  const dailyActivity: DailyActivity[] = Array.isArray(data.dailyActivity) ? data.dailyActivity : [];

  await db.transaction(
    'rw',
    [db.decks, db.cards, db.exercises, db.listeningProgress, db.studyProgress, db.dailyActivity],
    async () => {
      if (decks.length) await db.decks.bulkPut(decks);
      if (cards.length) await db.cards.bulkPut(cards);
      if (exercises.length) await db.exercises.bulkPut(exercises);
      if (listeningProgress.length) await db.listeningProgress.bulkPut(listeningProgress);
      if (studyProgress.length) await db.studyProgress.bulkPut(studyProgress);
      if (dailyActivity.length) await db.dailyActivity.bulkPut(dailyActivity);
    }
  );

  return { decks: decks.length, cards: cards.length, exercises: exercises.length };
}
