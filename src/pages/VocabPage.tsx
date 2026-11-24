import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Play,
  Search,
  Trash2,
  Volume2,
  BookOpen,
  PenTool,
  Layers,
  Upload,
  Sparkles,
  Filter,
} from 'lucide-react';
import type { Deck, JpStudyMode, Language, VocabCard } from '../types';
import { applyFsrsReview, getDueQueue, isCardMastered, type ReviewRating } from '../lib/fsrs';
import { db, recordActivity } from '../lib/db';
import { speakText } from '../lib/tts';
import { AnkiImportModal } from '../components/vocab/AnkiImportModal';
import { EnglishAnkiReview } from '../components/vocab/EnglishAnkiReview';
import { JapaneseHandwritingReview } from '../components/vocab/JapaneseHandwritingReview';

interface VocabPageProps {
  language: Language;
  studyingDeckId: string | null;
  practiceAllMode: boolean;
  activeLessonTag: string | null;
  decks: Deck[];
  cards: VocabCard[];
  jpStudyMode: JpStudyMode;
  ttsRate: number;
  autoPlay: boolean;
  onStartStudy: (deckId: string, practiceAll: boolean, lessonTag?: string) => void;
  onExitStudy: () => void;
  onChangeJpMode: (mode: JpStudyMode) => void;
  onDataChanged: () => Promise<void>;
}

function extractLessonTag(tags?: string[]): string | null {
  if (!tags?.length) return null;
  return tags.find((t) => /^bai-\d{2}$/.test(t)) ?? null;
}

function formatLessonLabel(tag: string): string {
  const num = Number(tag.replace('bai-', ''));
  return Number.isFinite(num) ? `Bài ${num}` : tag;
}

export const VocabPage: React.FC<VocabPageProps> = ({
  language,
  studyingDeckId,
  practiceAllMode,
  activeLessonTag,
  decks,
  cards,
  jpStudyMode,
  ttsRate,
  autoPlay,
  onStartStudy,
  onExitStudy,
  onChangeJpMode,
  onDataChanged,
}) => {
  const [browsingDeckId, setBrowsingDeckId] = useState<string | null>(null);
  const [deckLessonSelections, setDeckLessonSelections] = useState<Record<string, string>>({});
  const [browseLessonFilter, setBrowseLessonFilter] = useState<string>('');
  const [browseLimit, setBrowseLimit] = useState(60);
  const [showImport, setShowImport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const langDecks = useMemo(
    () => decks.filter((d) => d.language === language && !d.deleted),
    [decks, language]
  );

  const langCards = useMemo(
    () => cards.filter((c) => c.language === language && !c.deleted),
    [cards, language]
  );

  const activeDeck = useMemo(
    () => langDecks.find((d) => d.id === studyingDeckId),
    [langDecks, studyingDeckId]
  );

  const studyQueue = useMemo(() => {
    if (!studyingDeckId) return [];
    let deckCards =
      studyingDeckId === 'ALL'
        ? langCards
        : langCards.filter((c) => c.deckId === studyingDeckId);

    if (activeLessonTag) {
      deckCards = deckCards.filter((c) => c.tags?.includes(activeLessonTag));
    }

    if (practiceAllMode) {
      return [...deckCards].sort((a, b) => a.due - b.due);
    }
    return getDueQueue(deckCards);
  }, [studyingDeckId, langCards, practiceAllMode, activeLessonTag]);

  const browseLessonTags = useMemo(() => {
    const base = browsingDeckId
      ? langCards.filter((c) => c.deckId === browsingDeckId)
      : langCards;
    const set = new Set<string>();
    for (const c of base) {
      const tag = extractLessonTag(c.tags);
      if (tag) set.add(tag);
    }
    return Array.from(set).sort();
  }, [browsingDeckId, langCards]);

  const filteredBrowseCards = useMemo(() => {
    let base = browsingDeckId
      ? langCards.filter((c) => c.deckId === browsingDeckId)
      : langCards;

    if (browseLessonFilter) {
      base = base.filter((c) => c.tags?.includes(browseLessonFilter));
    }

    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(
      (c) =>
        c.front.toLowerCase().includes(q) ||
        c.back.toLowerCase().includes(q) ||
        (c.reading && c.reading.toLowerCase().includes(q)) ||
        (c.romaji && c.romaji.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q))
    );
  }, [browsingDeckId, langCards, browseLessonFilter, searchQuery]);

  useEffect(() => {
    setBrowsingDeckId(null);
    setBrowseLessonFilter('');
    setBrowseLimit(60);
  }, [language]);

  useEffect(() => {
    setBrowseLimit(60);
    if (browseLessonFilter && !browseLessonTags.includes(browseLessonFilter)) {
      setBrowseLessonFilter('');
    }
  }, [browsingDeckId, browseLessonFilter, browseLessonTags, searchQuery]);

  async function handleRateCard(
    card: VocabCard,
    rating: ReviewRating,
    usedHandwriting = false
  ) {
    const updated = applyFsrsReview(card, rating);
    await db.cards.put(updated);
    await recordActivity(usedHandwriting ? 'handwriting' : 'review', 1);
    await onDataChanged();
  }

  async function handleDeleteCard(card: VocabCard) {
    await db.cards.put({ ...card, deleted: true, updatedAt: Date.now() });
    await onDataChanged();
  }

  async function handleDeleteDeck(deck: Deck) {
    if (!window.confirm(`Xóa bộ thẻ "${deck.name}"?`)) return;
    const now = Date.now();
    await db.decks.put({ ...deck, deleted: true, updatedAt: now });
    const deckCards = langCards.filter((c) => c.deckId === deck.id);
    if (deckCards.length) {
      await db.cards.bulkPut(deckCards.map((c) => ({ ...c, deleted: true, updatedAt: now })));
    }
    if (browsingDeckId === deck.id) setBrowsingDeckId(null);
    await onDataChanged();
  }

  function speakBrowseCard(card: VocabCard) {
    // For single-Kanji cards, speak a clean reading or example word so Japanese TTS sounds natural
    if (card.language === 'jp' && card.tags?.includes('kanji')) {
      const firstExample = card.example?.split(/[、,（(]/)[0]?.trim();
      const firstReading = card.reading?.split(/[・/／]/)[0]?.trim();
      speakText(firstExample || firstReading || card.front, 'jp', ttsRate);
      return;
    }
    speakText(card.front, card.language, ttsRate);
  }

  // Active Study View
  if (studyingDeckId) {
    const baseTitle =
      studyingDeckId === 'ALL'
        ? `Tất cả thẻ ${language === 'en' ? 'Tiếng Anh' : 'Tiếng Nhật'}`
        : activeDeck?.name || 'Bộ thẻ';
    const deckTitle = activeLessonTag
      ? `${baseTitle} · ${formatLessonLabel(activeLessonTag)}`
      : baseTitle;

    if (language === 'jp') {
      return (
        <JapaneseHandwritingReview
          queue={studyQueue}
          deckName={deckTitle}
          studyMode={jpStudyMode}
          ttsRate={ttsRate}
          autoPlay={autoPlay}
          onChangeMode={onChangeJpMode}
          onRate={(card, rating, usedHandwriting) => handleRateCard(card, rating, usedHandwriting)}
          onExit={onExitStudy}
        />
      );
    }

    return (
      <EnglishAnkiReview
        queue={studyQueue}
        deckName={deckTitle}
        ttsRate={ttsRate}
        autoPlay={autoPlay}
        onRate={(card, rating) => handleRateCard(card, rating, false)}
        onExit={onExitStudy}
      />
    );
  }

  const totalDue = getDueQueue(langCards).length;
  const totalMastered = langCards.filter(isCardMastered).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
              Anki FSRS Engine
            </span>
            {language === 'jp' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
                <PenTool className="h-3 w-3" />
                Viết tay & Nét mẫu
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {language === 'en'
              ? 'Từ vựng Tiếng Anh (Chuẩn Anki)'
              : 'Từ vựng & Kanji Tiếng Nhật (Viết tay & Anki)'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {language === 'en'
              ? 'Ôn thẻ theo thuật toán FSRS, nhập trực tiếp file .apkg / .csv hoặc kéo từ Anki PC.'
              : 'Luyện Kana, Từ vựng N5 & Kanji N5 theo giáo trình Minna Tập 1 — có tô mờ theo nét mẫu và chấm viết tay tự động.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300"
          >
            <Upload className="h-4 w-4" />
            Nhập từ Anki / Thêm thẻ
          </button>

          {totalDue > 0 && (
            <button
              onClick={() => onStartStudy('ALL', false)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700"
            >
              <Play className="h-4 w-4 fill-current" />
              Học ngay ({totalDue} thẻ đến hạn)
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold text-slate-500">Cần ôn hôm nay</div>
          <div className="mt-1 text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {totalDue}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold text-slate-500">Tổng số thẻ</div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
            {langCards.length}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold text-slate-500">Đã thuộc sâu (&ge;7 ngày)</div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {totalMastered}
          </div>
        </div>
      </div>

      {/* Decks Grid */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800 dark:text-slate-100">
          <Layers className="h-4 w-4 text-indigo-500" />
          Danh sách bộ thẻ ({langDecks.length})
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {langDecks.map((deck) => {
            const allDeckCards = langCards.filter((c) => c.deckId === deck.id);
            const lessonTags = Array.from(
              new Set(
                allDeckCards
                  .map((c) => extractLessonTag(c.tags))
                  .filter((t): t is string => Boolean(t))
              )
            ).sort();
            const pickedLesson = deckLessonSelections[deck.id] || '';
            const scopedCards = pickedLesson
              ? allDeckCards.filter((c) => c.tags?.includes(pickedLesson))
              : allDeckCards;

            const dueCount = getDueQueue(scopedCards).length;
            const newCount = scopedCards.filter((c) => c.state === 0).length;
            const masteredCount = scopedCards.filter(isCardMastered).length;
            const selected = browsingDeckId === deck.id;

            return (
              <div
                key={deck.id}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-5 transition dark:bg-slate-900 ${
                  selected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-indigo-300 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {deck.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {deck.description}
                      </p>
                    </div>
                    {deck.source !== 'starter' && (
                      <button
                        onClick={() => handleDeleteDeck(deck)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                        title="Xóa bộ thẻ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Lesson picker for Minna 1–25 decks */}
                  {lessonTags.length > 1 && (
                    <div className="mt-3 flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <select
                        value={pickedLesson}
                        onChange={(e) =>
                          setDeckLessonSelections((prev) => ({
                            ...prev,
                            [deck.id]: e.target.value,
                          }))
                        }
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-[#3f4147] dark:bg-[#1e1f22] dark:text-[#dbdee1]"
                      >
                        <option value="">
                          Tất cả ({lessonTags.length} bài · {allDeckCards.length} thẻ)
                        </option>
                        {lessonTags.map((tag) => {
                          const cnt = allDeckCards.filter((c) => c.tags?.includes(tag)).length;
                          return (
                            <option key={tag} value={tag}>
                              {formatLessonLabel(tag)} ({cnt} thẻ)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                  <div className="mt-3.5 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-lg bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      Đến hạn: {dueCount}
                    </span>
                    <span className="rounded-lg bg-sky-50 px-2.5 py-1 font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                      Mới: {newCount}
                    </span>
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Thuộc: {masteredCount}/{scopedCards.length}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() =>
                      onStartStudy(deck.id, dueCount === 0, pickedLesson || undefined)
                    }
                    disabled={scopedCards.length === 0}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-40"
                  >
                    {language === 'jp' ? (
                      <PenTool className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" />
                    )}
                    {dueCount > 0
                      ? language === 'jp'
                        ? `Viết tay ôn (${dueCount})`
                        : `Ôn ngay (${dueCount})`
                      : 'Luyện thêm tất cả'}
                  </button>
                  <button
                    onClick={() => {
                      const nextId = selected ? null : deck.id;
                      setBrowsingDeckId(nextId);
                      setBrowseLessonFilter(nextId ? pickedLesson : '');
                    }}
                    className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {selected ? 'Ẩn thẻ' : 'Xem từ'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Browser */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Kho từ vựng {browsingDeckId ? 'trong bộ đã chọn' : 'tất cả'} ({filteredBrowseCards.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {browseLessonTags.length > 0 && (
              <select
                value={browseLessonFilter}
                onChange={(e) => setBrowseLessonFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-[#3f4147] dark:bg-[#1e1f22] dark:text-[#dbdee1]"
              >
                <option value="">Tất cả các bài</option>
                {browseLessonTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {formatLessonLabel(tag)}
                  </option>
                ))}
              </select>
            )}

            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm từ, Kanji hoặc nghĩa..."
                className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-[#3f4147] dark:bg-[#1e1f22] dark:text-[#f2f3f5] dark:placeholder:text-[#949ba4] dark:focus:border-[#5865f2] dark:focus:bg-[#1e1f22]"
              />
            </div>
            <button
              onClick={() => setShowImport(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-[#5865f2] dark:text-white dark:hover:bg-[#4752c4]"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm thẻ
            </button>
          </div>
        </div>

        {filteredBrowseCards.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">
            <Sparkles className="mx-auto mb-2 h-8 w-8 opacity-40" />
            Chưa có từ nào khớp tìm kiếm.
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBrowseCards.slice(0, browseLimit).map((card) => {
                const lessonTag = extractLessonTag(card.tags);
                return (
                  <div
                    key={card.id}
                    className="flex items-center justify-between gap-3 py-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-jp text-base font-bold text-slate-900 dark:text-white">
                          {card.front}
                        </span>
                        {card.reading && card.reading !== card.front && (
                          <span className="font-jp text-xs text-slate-500 dark:text-slate-400">
                            {card.reading}
                          </span>
                        )}
                        {card.romaji && (
                          <span className="text-xs text-slate-400">({card.romaji})</span>
                        )}
                        {lessonTag && (
                          <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                            {formatLessonLabel(lessonTag)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                        {card.back}
                      </div>
                      {card.notes && (
                        <div className="mt-0.5 truncate text-[11px] text-slate-400">
                          {card.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="hidden rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 sm:inline dark:bg-slate-800 dark:text-slate-400">
                        {card.reps === 0 ? 'Mới' : `Ôn ${card.reps} lần`}
                      </span>
                      <button
                        onClick={() => speakBrowseCard(card)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950"
                        title="Phát âm"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                        title="Xóa thẻ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredBrowseCards.length > browseLimit && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setBrowseLimit((n) => n + 80)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Xem thêm ({filteredBrowseCards.length - browseLimit} thẻ còn lại)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showImport && (
        <AnkiImportModal
          language={language}
          decks={decks}
          defaultDeckId={browsingDeckId || undefined}
          onClose={() => setShowImport(false)}
          onImported={() => {
            void onDataChanged();
          }}
        />
      )}
    </div>
  );
};
