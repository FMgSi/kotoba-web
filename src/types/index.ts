export type Language = 'en' | 'jp';

export type NavTab = 'dashboard' | 'vocab' | 'listening' | 'reading' | 'writing' | 'settings';

export type JpStudyMode = 'handwriting' | 'typing' | 'flip';

export interface Deck {
  id: string;
  name: string;
  language: Language;
  description: string;
  source?: 'starter' | 'anki' | 'custom';
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
}

export interface VocabCard {
  id: string;
  deckId: string;
  language: Language;
  front: string;
  reading?: string;
  romaji?: string;
  back: string;
  example?: string;
  exampleVi?: string;
  notes?: string;
  tags?: string[];
  due: number;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: 0 | 1 | 2 | 3;
  lastReview?: number;
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
}

export interface ListeningSegment {
  id: string;
  index: number;
  text: string;
  reading?: string;
  romaji?: string;
  translationVi?: string;
  startSec?: number;
  endSec?: number;
}

export interface ListeningExercise {
  id: string;
  title: string;
  language: Language;
  level: string;
  category: string;
  description?: string;
  audioType: 'tts' | 'youtube' | 'audioUrl';
  audioUrl?: string;
  youtubeId?: string;
  segments: ListeningSegment[];
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
}

export interface SegmentResult {
  bestInput: string;
  attempts: number;
  hintsUsed: number;
  completedAt: number;
}

export interface ListeningProgress {
  exerciseId: string;
  completedSegments: Record<string, SegmentResult>;
  lastSegmentIndex: number;
  updatedAt: number;
}

export interface DailyActivity {
  date: string;
  reviewsCount: number;
  dictationCount: number;
  handwritingCount: number;
  updatedAt: number;
}

export interface FirebaseConfigData {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  syncSpaceId?: string;
}

export interface AuthUserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserSettings {
  id: 'singleton';
  activeLanguage: Language;
  darkMode: boolean;
  autoSync: boolean;
  ttsRateEn: number;
  ttsRateJp: number;
  jpStudyMode: JpStudyMode;
  autoPlayAudio: boolean;
  firebaseConfig?: FirebaseConfigData;
  lastSyncedAt?: number;
  starterDataVersion?: number;
}

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'error';
