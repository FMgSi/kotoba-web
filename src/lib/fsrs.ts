import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type Grade } from 'ts-fsrs';
import type { VocabCard } from '../types';

const scheduler = fsrs(
  generatorParameters({
    enable_fuzz: true,
    maximum_interval: 36500,
    request_retention: 0.9,
  })
);

export type ReviewRating = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy

function safeDate(ms: unknown, fallback = Date.now()): Date {
  const n = typeof ms === 'number' && Number.isFinite(ms) && ms > 0 ? ms : fallback;
  return new Date(n);
}

function toFsrsCard(vc: VocabCard): Card {
  if (!vc.reps || vc.state === 0) {
    return createEmptyCard(safeDate(vc.due));
  }
  return {
    due: safeDate(vc.due),
    stability: Number.isFinite(vc.stability) ? vc.stability : 0,
    difficulty: Number.isFinite(vc.difficulty) ? vc.difficulty : 0,
    elapsed_days: Number.isFinite(vc.elapsedDays) ? vc.elapsedDays : 0,
    scheduled_days: Number.isFinite(vc.scheduledDays) ? vc.scheduledDays : 0,
    learning_steps: 0,
    reps: Number.isFinite(vc.reps) ? vc.reps : 0,
    lapses: Number.isFinite(vc.lapses) ? vc.lapses : 0,
    state: ([0, 1, 2, 3].includes(vc.state) ? vc.state : 0) as 0 | 1 | 2 | 3,
    last_review: vc.lastReview ? safeDate(vc.lastReview) : undefined,
  };
}

function toGrade(rating: ReviewRating): Grade {
  switch (rating) {
    case 1:
      return Rating.Again;
    case 2:
      return Rating.Hard;
    case 3:
      return Rating.Good;
    case 4:
      return Rating.Easy;
  }
}

export function formatIntervalVi(dueMs: number, nowMs: number): string {
  const diffSec = Math.max(60, Math.round((dueMs - nowMs) / 1000));
  const mins = Math.round(diffSec / 60);
  if (mins < 60) return `${mins} phút`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} giờ`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} ngày`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} tháng`;
  const years = (days / 365).toFixed(1);
  return `${years} năm`;
}

export function previewRatings(vc: VocabCard): Record<ReviewRating, string> {
  const now = new Date();
  const fsrsCard = toFsrsCard(vc);
  const outcomes = scheduler.repeat(fsrsCard, now);
  const nowMs = now.getTime();
  return {
    1: formatIntervalVi(outcomes[Rating.Again].card.due.getTime(), nowMs),
    2: formatIntervalVi(outcomes[Rating.Hard].card.due.getTime(), nowMs),
    3: formatIntervalVi(outcomes[Rating.Good].card.due.getTime(), nowMs),
    4: formatIntervalVi(outcomes[Rating.Easy].card.due.getTime(), nowMs),
  };
}

export function applyFsrsReview(vc: VocabCard, rating: ReviewRating): VocabCard {
  const now = new Date();
  const fsrsCard = toFsrsCard(vc);
  const outcomes = scheduler.repeat(fsrsCard, now);
  const next = outcomes[toGrade(rating)].card;

  return {
    ...vc,
    due: next.due.getTime(),
    stability: next.stability,
    difficulty: next.difficulty,
    elapsedDays: next.elapsed_days,
    scheduledDays: next.scheduled_days,
    reps: next.reps,
    lapses: next.lapses,
    state: next.state as 0 | 1 | 2 | 3,
    lastReview: now.getTime(),
    updatedAt: now.getTime(),
  };
}

export function getDueQueue(cards: VocabCard[], nowMs = Date.now()): VocabCard[] {
  const active = cards.filter((c) => !c.deleted && c.due <= nowMs);
  return active.sort((a, b) => {
    // Relearning & Learning first, then overdue reviews, then new cards
    const priority = (s: number) => (s === 1 || s === 3 ? 0 : s === 2 ? 1 : 2);
    const pa = priority(a.state);
    const pb = priority(b.state);
    if (pa !== pb) return pa - pb;
    return a.due - b.due;
  });
}

export function isCardMastered(card: VocabCard): boolean {
  return card.state === 2 && card.scheduledDays >= 7;
}
