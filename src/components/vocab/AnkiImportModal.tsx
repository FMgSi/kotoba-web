import React, { useState } from 'react';
import { Upload, RefreshCw, Plus, X, FileText, CheckCircle2, AlertCircle, Link2 } from 'lucide-react';
import type { Deck, Language, VocabCard } from '../../types';
import {
  fetchAnkiConnectDecks,
  importApkgFile,
  importPlainTextOrCsv,
  pullDeckFromAnkiConnect,
} from '../../lib/ankiImport';
import { db } from '../../lib/db';

interface AnkiImportModalProps {
  language: Language;
  decks: Deck[];
  defaultDeckId?: string;
  onClose: () => void;
  onImported: () => void;
}

export const AnkiImportModal: React.FC<AnkiImportModalProps> = ({
  language,
  decks,
  defaultDeckId,
  onClose,
  onImported,
}) => {
  const langDecks = decks.filter((d) => d.language === language && !d.deleted);
  const [tab, setTab] = useState<'file' | 'ankiconnect' | 'manual'>('file');
  const [selectedDeckId, setSelectedDeckId] = useState<string>(defaultDeckId || langDecks[0]?.id || 'NEW');
  const [newDeckName, setNewDeckName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manual form
  const [front, setFront] = useState('');
  const [reading, setReading] = useState('');
  const [romaji, setRomaji] = useState('');
  const [back, setBack] = useState('');
  const [example, setExample] = useState('');
  const [exampleVi, setExampleVi] = useState('');

  // Quick paste
  const [pasteText, setPasteText] = useState('');

  // AnkiConnect
  const [ankiUrl, setAnkiUrl] = useState('http://127.0.0.1:8765');
  const [ankiDecks, setAnkiDecks] = useState<string[]>([]);
  const [pickedAnkiDeck, setPickedAnkiDeck] = useState('');

  async function resolveDeckId(fallbackName: string): Promise<string> {
    if (selectedDeckId !== 'NEW' && selectedDeckId) return selectedDeckId;
    const now = Date.now();
    const id = `deck-${language}-${now}`;
    const name = newDeckName.trim() || fallbackName;
    await db.decks.put({
      id,
      name,
      language,
      description: 'Bộ thẻ nhập từ Anki / cá nhân',
      source: 'anki',
      createdAt: now,
      updatedAt: now,
    });
    return id;
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      let cards: VocabCard[] = [];
      let deckId: string;

      if (file.name.toLowerCase().endsWith('.apkg')) {
        const tempId = selectedDeckId === 'NEW' ? `deck-${language}-${Date.now()}` : selectedDeckId;
        const result = await importApkgFile(file, tempId, language);
        if (selectedDeckId === 'NEW') {
          const now = Date.now();
          await db.decks.put({
            id: tempId,
            name: newDeckName.trim() || result.detectedDeckName || file.name.replace(/\.apkg$/i, ''),
            language,
            description: `Nhập từ file Anki (${file.name})`,
            source: 'anki',
            createdAt: now,
            updatedAt: now,
          });
        }
        deckId = tempId;
        cards = result.cards.map((c) => ({ ...c, deckId }));
      } else {
        const text = await file.text();
        deckId = await resolveDeckId(file.name.replace(/\.(csv|tsv|txt)$/i, ''));
        cards = importPlainTextOrCsv(text, deckId, language);
      }

      if (!cards.length) {
        throw new Error('Không đọc được thẻ nào từ file. Hãy kiểm tra định dạng mặt trước / mặt sau.');
      }

      await db.cards.bulkPut(cards);
      setMessage({ type: 'success', text: `Đã nhập thành công ${cards.length} thẻ vào bộ từ!` });
      onImported();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Lỗi khi nhập file Anki.',
      });
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  async function handlePasteImport() {
    if (!pasteText.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const deckId = await resolveDeckId(`Bộ từ ${language.toUpperCase()} mới`);
      const cards = importPlainTextOrCsv(pasteText, deckId, language);
      if (!cards.length) {
        throw new Error('Hãy nhập mỗi dòng dạng: từ vựng [Tab hoặc dấu phẩy] nghĩa tiếng Việt');
      }
      await db.cards.bulkPut(cards);
      setPasteText('');
      setMessage({ type: 'success', text: `Đã thêm ${cards.length} thẻ mới!` });
      onImported();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Lỗi nhập dữ liệu.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleConnectAnki() {
    setBusy(true);
    setMessage(null);
    try {
      const list = await fetchAnkiConnectDecks(ankiUrl);
      setAnkiDecks(list);
      if (list.length > 0) setPickedAnkiDeck(list[0]);
      setMessage({ type: 'success', text: `Đã kết nối Anki PC! Tìm thấy ${list.length} bộ thẻ.` });
    } catch {
      setMessage({
        type: 'error',
        text: 'Không kết nối được AnkiConnect (127.0.0.1:8765). Hãy chắc chắn Anki trên PC đang mở, đã cài add-on 2055492159 và thêm domain web này vào webCorsOriginList.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function handlePullAnkiDeck() {
    if (!pickedAnkiDeck) return;
    setBusy(true);
    setMessage(null);
    try {
      const deckId = await resolveDeckId(pickedAnkiDeck);
      const cards = await pullDeckFromAnkiConnect(pickedAnkiDeck, deckId, language, ankiUrl);
      if (!cards.length) {
        throw new Error('Bộ thẻ này trên Anki chưa có note hợp lệ.');
      }
      await db.cards.bulkPut(cards);
      setMessage({
        type: 'success',
        text: `Đã kéo ${cards.length} thẻ từ Anki "${pickedAnkiDeck}" lên web!`,
      });
      onImported();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Lỗi kéo thẻ Anki.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleManualAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const deckId = await resolveDeckId(`Từ vựng ${language === 'en' ? 'Tiếng Anh' : 'Tiếng Nhật'}`);
      const now = Date.now();
      await db.cards.put({
        id: `card-${now}-${Math.random().toString(36).slice(2, 8)}`,
        deckId,
        language,
        front: front.trim(),
        reading: reading.trim() || undefined,
        romaji: romaji.trim() || undefined,
        back: back.trim(),
        example: example.trim() || undefined,
        exampleVi: exampleVi.trim() || undefined,
        due: now,
        stability: 0,
        difficulty: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        reps: 0,
        lapses: 0,
        state: 0,
        createdAt: now,
        updatedAt: now,
      });
      setFront('');
      setReading('');
      setRomaji('');
      setBack('');
      setExample('');
      setExampleVi('');
      setMessage({ type: 'success', text: 'Đã thêm thẻ mới vào lịch học hôm nay!' });
      onImported();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Thêm từ vựng {language === 'en' ? '🇬🇧 Tiếng Anh' : '🇯🇵 Tiếng Nhật'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nhập từ file Anki (.apkg / .csv / .txt), kéo thẳng từ Anki Desktop, hoặc tự tạo thẻ
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Target deck selector */}
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Lưu vào bộ thẻ:
            </label>
            <select
              value={selectedDeckId}
              onChange={(e) => setSelectedDeckId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {langDecks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
              <option value="NEW">+ Tạo bộ thẻ mới...</option>
            </select>
            {selectedDeckId === 'NEW' && (
              <input
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="Tên bộ thẻ mới (vd: Minna Bài 3)"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            )}
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-slate-200 px-6 dark:border-slate-800">
          {[
            { id: 'file', label: 'File Anki (.apkg / .csv)', icon: Upload },
            { id: 'ankiconnect', label: 'AnkiConnect (PC)', icon: Link2 },
            { id: 'manual', label: 'Tạo thẻ tay', icon: Plus },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id as 'file' | 'ankiconnect' | 'manual');
                  setMessage(null);
                }}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-4 p-6">
          {message && (
            <div
              className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {tab === 'file' && (
            <div className="space-y-5">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/40 px-6 py-8 text-center transition hover:border-indigo-500 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/20">
                <Upload className="mb-2 h-8 w-8 text-indigo-500" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Chọn file từ Anki (.apkg, .csv, .tsv, .txt)
                </span>
                <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Trong Anki chọn Export → <b>Anki Deck Package (.apkg)</b> (tick Support older Anki versions) hoặc <b>Notes in Plain Text (.txt)</b>
                </span>
                <input
                  type="file"
                  accept=".apkg,.csv,.tsv,.txt"
                  disabled={busy}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <FileText className="h-3.5 w-3.5" />
                  Hoặc dán nhanh danh sách từ (mỗi dòng 1 từ, cách nhau bằng Tab hoặc dấu phẩy)
                </label>
                <textarea
                  rows={4}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={
                    language === 'jp'
                      ? 'ありがとう, cảm ơn\nせんせい, giáo viên\nコーヒー, cà phê'
                      : 'morning, buổi sáng\nlibrary, thư viện\nimprove, cải thiện'
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  onClick={handlePasteImport}
                  disabled={busy || !pasteText.trim()}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Nhập danh sách đã dán
                </button>
              </div>
            </div>
          )}

          {tab === 'ankiconnect' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                <p className="font-bold">Cách gửi từ trực tiếp từ app Anki trên máy tính:</p>
                <ol className="mt-1.5 list-decimal space-y-1 pl-4">
                  <li>Mở Anki Desktop → Tools → Add-ons → Get Add-ons → nhập mã <code>2055492159</code> (AnkiConnect).</li>
                  <li>Vào Config của AnkiConnect, thêm địa chỉ web của bạn (hoặc <code>"*"</code>) vào mục <code>webCorsOriginList</code> rồi khởi động lại Anki.</li>
                  <li>Bấm <b>Kết nối Anki PC</b> bên dưới → chọn bộ thẻ cần gửi lên web!</li>
                </ol>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={ankiUrl}
                  onChange={(e) => setAnkiUrl(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  onClick={handleConnectAnki}
                  disabled={busy}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
                  Kết nối Anki PC
                </button>
              </div>

              {ankiDecks.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <select
                    value={pickedAnkiDeck}
                    onChange={(e) => setPickedAnkiDeck(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    {ankiDecks.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handlePullAnkiDeck}
                    disabled={busy}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Kéo bộ thẻ lên web
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'manual' && (
            <form onSubmit={handleManualAdd} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {language === 'jp' ? 'Từ tiếng Nhật (Kana hoặc Kanji) *' : 'Từ tiếng Anh *'}
                  </label>
                  <input
                    required
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    placeholder={language === 'jp' ? 'vd: ありがとう hoặc 学生' : 'vd: schedule'}
                    className="font-jp w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Nghĩa tiếng Việt *
                  </label>
                  <input
                    required
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    placeholder={language === 'jp' ? 'vd: cảm ơn' : 'vd: lịch trình'}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {language === 'jp' ? 'Cách đọc Hiragana (nếu mặt trước có Kanji)' : 'Phiên âm IPA'}
                  </label>
                  <input
                    value={reading}
                    onChange={(e) => setReading(e.target.value)}
                    placeholder={language === 'jp' ? 'vd: がくせい' : 'vd: /ˈʃedʒuːl/'}
                    className="font-jp w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                {language === 'jp' && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Romaji (gợi ý)
                    </label>
                    <input
                      value={romaji}
                      onChange={(e) => setRomaji(e.target.value)}
                      placeholder="vd: arigatou"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Câu ví dụ (tùy chọn)
                </label>
                <input
                  value={example}
                  onChange={(e) => setExample(e.target.value)}
                  placeholder={language === 'jp' ? 'わたしは がくせいです。' : 'I have a busy schedule.'}
                  className="font-jp w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Dịch ví dụ (tùy chọn)
                </label>
                <input
                  value={exampleVi}
                  onChange={(e) => setExampleVi(e.target.value)}
                  placeholder="Nghĩa tiếng Việt của câu ví dụ"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Lưu thẻ mới
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
