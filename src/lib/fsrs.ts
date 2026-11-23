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

function toFsrsCard(vc: VocabCard): Card {
  if (vc.reps === 0 && vc.state === 0) {
    return createEmptyCard(new Date(vc.due || Date.now()));
  }
  return {
    due: new Date(vc.due),
    stability: vc.stability,
    difficulty: vc.difficulty,
    elapsed_days: vc.elapsedDays,
    scheduled_days: vc.scheduledDays,
    learning_steps: 0,
    reps: vc.reps,
    lapses: vc.lapses,
    state: vc.state,
    last_review: vc.lastReview ? new Date(vc.lastReview) : undefined,
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
