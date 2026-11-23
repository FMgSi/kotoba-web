import { deleteApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc, type Firestore } from 'firebase/firestore';
import type {
  AuthUserInfo,
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
  return `${cfg.projectId}|${cfg.apiKey}|${cfg.appId}`;
}

function toAuthUserInfo(user: User | null): AuthUserInfo | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

export async function initFirebaseClient(
  config: FirebaseConfigData
): Promise<{ firestore: Firestore; auth: Auth }> {
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
      'kotoba-lab-auth'
    );
    activeDb = getFirestore(activeApp);
    activeAuth = getAuth(activeApp);
    activeConfigSignature = sig;

    try {
      await setPersistence(activeAuth, browserLocalPersistence);
    } catch {
      // Fallback to default persistence if browser restricts IndexedDB persistence
    }

    // Complete redirect sign-in if returning from mobile Google redirect flow
    try {
      await getRedirectResult(activeAuth);
    } catch {
      // Ignore redirect notice
    }
  }

  if (!activeAuth || !activeDb) {
    throw new Error('Không thể khởi tạo Firebase.');
  }
  return { firestore: activeDb, auth: activeAuth };
}

export async function subscribeGoogleAuth(
  config: FirebaseConfigData,
  callback: (user: AuthUserInfo | null) => void
): Promise<() => void> {
  const { auth } = await initFirebaseClient(config);
  return onAuthStateChanged(auth, (user) => {
    callback(toAuthUserInfo(user));
  });
}

export async function signInWithGoogleAccount(
  config: FirebaseConfigData
): Promise<AuthUserInfo | null> {
  const { auth } = await initFirebaseClient(config);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(auth, provider);
    return toAuthUserInfo(result.user);
  } catch (err) {
    const code = (err as { code?: string })?.code || '';
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/operation-not-supported-in-this-environment'
    ) {
      await signInWithRedirect(auth, provider);
      return null;
    }
    if (code === 'auth/unauthorized-domain') {
      throw new Error(
        `Domain "${window.location.hostname}" chưa được cấp phép trong Firebase Authentication → Settings → Authorized domains.`
      );
    }
    if (code === 'auth/operation-not-allowed') {
      throw new Error(
        'Bạn chưa bật nhà cung cấp Google trong Firebase Console → Authentication → Sign-in method → Google.'
      );
    }
    if (code === 'auth/popup-closed-by-user') {
      throw new Error('Bạn đã đóng cửa sổ đăng nhập Google.');
    }
    throw err;
  }
}

export async function signOutGoogleAccount(config: FirebaseConfigData): Promise<void> {
  const { auth } = await initFirebaseClient(config);
  await signOut(auth);
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
  return JSON.parse(JSON.stringify(value));
}

export interface SyncSummary {
  decksCount: number;
  cardsCount: number;
  exercisesCount: number;
  syncedAt: number;
}

export async function syncWithFirebase(config: FirebaseConfigData): Promise<SyncSummary> {
  const { firestore, auth } = await initFirebaseClient(config);
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Vui lòng đăng nhập tài khoản Google trước khi đồng bộ.');
  }

  const uid = currentUser.uid;
  const metaRef = doc(firestore, 'users', uid, 'kotoba_data', 'meta');
  const decksRef = doc(firestore, 'users', uid, 'kotoba_data', 'decks');
  const exercisesRef = doc(firestore, 'users', uid, 'kotoba_data', 'exercises');
  const progressRef = doc(firestore, 'users', uid, 'kotoba_data', 'progress');
  const activityRef = doc(firestore, 'users', uid, 'kotoba_data', 'activity');

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
      getDoc(doc(firestore, 'users', uid, 'kotoba_data', `cards_${i}`))
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

  const cardChunks = chunkArray(mergedCards, 300);
  await Promise.all([
    setDoc(metaRef, {
      cardChunks: cardChunks.length,
      email: currentUser.email,
      updatedAt: syncedAt,
    }),
    setDoc(decksRef, { items: sanitizeForFirestore(mergedDecks), updatedAt: syncedAt }),
    setDoc(exercisesRef, { items: sanitizeForFirestore(mergedExercises), updatedAt: syncedAt }),
    setDoc(progressRef, { items: sanitizeForFirestore(mergedProgress), updatedAt: syncedAt }),
    setDoc(activityRef, { items: sanitizeForFirestore(mergedActivity), updatedAt: syncedAt }),
    ...cardChunks.map((chunk, i) =>
      setDoc(doc(firestore, 'users', uid, 'kotoba_data', `cards_${i}`), {
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

export function parseFirebaseSnippet(input: string): Partial<FirebaseConfigData> | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const obj = JSON.parse(trimmed);
    if (obj && typeof obj === 'object') return obj;
  } catch {
    // Parse JS object literal copied from Firebase Console
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
