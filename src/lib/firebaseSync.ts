import { deleteApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc, type Firestore } from 'firebase/firestore';
import type {
  DailyActivity,
  Deck,
  FirebaseConfigData,
  ListeningExercise,
  ListeningProgress,
  VocabCard,
} from '../types';
import { db } from './db';

let activeApp: FirebaseApp | null = null;
let activeDb: Firestore | null = null;
let activeAuth: Auth | null = null;
let activeConfigSignature = '';

function configSignature(cfg: FirebaseConfigData): string {
  return `${cfg.projectId}|${cfg.apiKey}|${cfg.appId}|${cfg.syncSpaceId}`;
}

export async function ensureFirebaseReady(
  config: FirebaseConfigData
): Promise<{ firestore: Firestore; uid: string }> {
  const sig = configSignature(config);
  if (!activeApp || activeConfigSignature !== sig) {
    for (const app of getApps()) {
      await deleteApp(app);
    }
    activeApp = initializeApp(
      {
        apiKey: config.apiKey.trim(),
        authDomain: config.authDomain?.trim() || `${config.projectId.trim()}.firebaseapp.com`,
        projectId: config.projectId.trim(),
        storageBucket: config.storageBucket?.trim() || `${config.projectId.trim()}.firebasestorage.app`,
        messagingSenderId: config.messagingSenderId?.trim() || undefined,
        appId: config.appId.trim(),
      },
      'kotoba-lab-sync'
    );
    activeDb = getFirestore(activeApp);
    activeAuth = getAuth(activeApp);
    activeConfigSignature = sig;
  }

  if (!activeAuth || !activeDb) {
    throw new Error('Không thể khởi tạo Firebase.');
  }

  // Silent auto-login via Firebase Anonymous Auth (persists automatically in browser IndexedDB)
  let uid = activeAuth.currentUser?.uid || 'anonymous-fallback';
  try {
    if (!activeAuth.currentUser) {
      const cred = await signInAnonymously(activeAuth);
      uid = cred.user.uid;
    }
  } catch (err) {
    // Allow Firestore sync even if user hasn't turned on Anonymous Auth yet (e.g., rules only check workspace key)
    console.warn('Firebase Anonymous Auth notice:', err);
  }

  return { firestore: activeDb, uid };
}

function mergeByUpdatedAt<T extends { updatedAt: number }>(
  localItems: T[],
  remoteItems: T[],
  getId: (item: T) => string
): T[] {
  const map = new Map<string, T>();
  for (const item of remoteItems) {
    map.set(getId(item), item);
  }
  for (const item of localItems) {
    const id = getId(item);
    const existing = map.get(id);
    if (!existing || item.updatedAt >= existing.updatedAt) {
      map.set(id, item);
    }
  }
  return Array.from(map.values());
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks.length ? chunks : [[]];
}

function sanitizeForFirestore<T>(value: T): T {
  // Firestore rejects explicit `undefined` values
  return JSON.parse(JSON.stringify(value));
}

export interface SyncSummary {
  decksCount: number;
  cardsCount: number;
  exercisesCount: number;
  syncedAt: number;
}

export async function syncWithFirebase(config: FirebaseConfigData): Promise<SyncSummary> {
  const spaceId = config.syncSpaceId.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  if (!spaceId) {
    throw new Error('Vui lòng nhập Mã đồng bộ cá nhân (Sync Space ID).');
  }

  const { firestore } = await ensureFirebaseReady(config);

  const metaRef = doc(firestore, 'kotoba_spaces', spaceId, 'data', 'meta');
  const decksRef = doc(firestore, 'kotoba_spaces', spaceId, 'data', 'decks');
  const exercisesRef = doc(firestore, 'kotoba_spaces', spaceId, 'data', 'exercises');
  const progressRef = doc(firestore, 'kotoba_spaces', spaceId, 'data', 'progress');
  const activityRef = doc(firestore, 'kotoba_spaces', spaceId, 'data', 'activity');

  const [metaSnap, decksSnap, exercisesSnap, progressSnap, activitySnap] = await Promise.all([
    getDoc(metaRef),
    getDoc(decksRef),
    getDoc(exercisesRef),
    getDoc(progressRef),
    getDoc(activityRef),
  ]);

  const remoteCardChunksCount = (metaSnap.data()?.cardChunks as number) || 1;
  const remoteCards: VocabCard[] = [];
  const chunkSnaps = await Promise.all(
    Array.from({ length: remoteCardChunksCount }, (_, i) =>
      getDoc(doc(firestore, 'kotoba_spaces', spaceId, 'data', `cards_${i}`))
    )
  );
  for (const snap of chunkSnaps) {
    const items = snap.data()?.items as VocabCard[] | undefined;
    if (Array.isArray(items)) remoteCards.push(...items);
  }

  const remoteDecks = (decksSnap.data()?.items as Deck[]) || [];
  const remoteExercises = (exercisesSnap.data()?.items as ListeningExercise[]) || [];
  const remoteProgress = (progressSnap.data()?.items as ListeningProgress[]) || [];
  const remoteActivity = (activitySnap.data()?.items as DailyActivity[]) || [];

  const [localDecks, localCards, localExercises, localProgress, localActivity] = await Promise.all([
    db.decks.toArray(),
    db.cards.toArray(),
    db.exercises.toArray(),
    db.listeningProgress.toArray(),
    db.dailyActivity.toArray(),
  ]);

  const mergedDecks = mergeByUpdatedAt(localDecks, remoteDecks, (d) => d.id);
  const mergedCards = mergeByUpdatedAt(localCards, remoteCards, (c) => c.id);
  const mergedExercises = mergeByUpdatedAt(localExercises, remoteExercises, (e) => e.id);
  const mergedProgress = mergeByUpdatedAt(localProgress, remoteProgress, (p) => p.exerciseId);
  const mergedActivity = mergeByUpdatedAt(localActivity, remoteActivity, (a) => a.date);

  const syncedAt = Date.now();

  // Save merged state back to local IndexedDB
  await db.transaction(
    'rw',
    [db.decks, db.cards, db.exercises, db.listeningProgress, db.dailyActivity, db.settings],
    async () => {
      if (mergedDecks.length) await db.decks.bulkPut(mergedDecks);
      if (mergedCards.length) await db.cards.bulkPut(mergedCards);
      if (mergedExercises.length) await db.exercises.bulkPut(mergedExercises);
      if (mergedProgress.length) await db.listeningProgress.bulkPut(mergedProgress);
      if (mergedActivity.length) await db.dailyActivity.bulkPut(mergedActivity);
      await db.settings.update('singleton', { lastSyncedAt: syncedAt });
    }
  );

  // Push merged state back to Firestore (chunk cards 300/doc to stay well under 1MB limit)
  const cardChunks = chunkArray(mergedCards, 300);
  await Promise.all([
    setDoc(metaRef, { cardChunks: cardChunks.length, updatedAt: syncedAt }),
    setDoc(decksRef, { items: sanitizeForFirestore(mergedDecks), updatedAt: syncedAt }),
    setDoc(exercisesRef, { items: sanitizeForFirestore(mergedExercises), updatedAt: syncedAt }),
    setDoc(progressRef, { items: sanitizeForFirestore(mergedProgress), updatedAt: syncedAt }),
    setDoc(activityRef, { items: sanitizeForFirestore(mergedActivity), updatedAt: syncedAt }),
    ...cardChunks.map((chunk, i) =>
      setDoc(doc(firestore, 'kotoba_spaces', spaceId, 'data', `cards_${i}`), {
        items: sanitizeForFirestore(chunk),
        updatedAt: syncedAt,
      })
    ),
  ]);

  return {
    decksCount: mergedDecks.filter((d) => !d.deleted).length,
    cardsCount: mergedCards.filter((c) => !c.deleted).length,
    exercisesCount: mergedExercises.filter((e) => !e.deleted).length,
    syncedAt,
  };
}

export function generateMagicSyncUrl(config: FirebaseConfigData): string {
  const payload = JSON.stringify(config);
  const encoded = btoa(unescape(encodeURIComponent(payload)));
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  return `${baseUrl}#sync=${encoded}`;
}

export function extractMagicSyncFromHash(): FirebaseConfigData | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash || '';
  const match = hash.match(/sync=([A-Za-z0-9+/=_-]+)/);
  if (!match?.[1]) return null;
  try {
    const decoded = decodeURIComponent(escape(atob(match[1])));
    const parsed = JSON.parse(decoded) as FirebaseConfigData;
    if (parsed.apiKey && parsed.projectId && parsed.appId && parsed.syncSpaceId) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export function parseFirebaseSnippet(input: string): Partial<FirebaseConfigData> | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Try JSON directly first
  try {
    const obj = JSON.parse(trimmed);
    if (obj && typeof obj === 'object') return obj;
  } catch {
    // Parse JS object literal copied directly from Firebase Console
  }

  const pick = (key: string): string | undefined => {
    const re = new RegExp(`["']?${key}["']?\\s*:\\s*["']([^"']+)["']`);
    return trimmed.match(re)?.[1];
  };

  const apiKey = pick('apiKey');
  const projectId = pick('projectId');
  const appId = pick('appId');
  if (!apiKey && !projectId) return null;

  return {
    apiKey: apiKey || '',
    authDomain: pick('authDomain') || (projectId ? `${projectId}.firebaseapp.com` : ''),
    projectId: projectId || '',
    storageBucket: pick('storageBucket') || '',
    messagingSenderId: pick('messagingSenderId') || '',
    appId: appId || '',
  };
}
