import React, { useState } from 'react';
import { X, Youtube, FileAudio, Sparkles } from 'lucide-react';
import type { Language, ListeningExercise, ListeningSegment } from '../../types';
import {
  extractYouTubeId,
  parseSubtitlesToSegments,
  splitPlainTextToSegments,
} from '../../lib/dictation';
import { db } from '../../lib/db';

interface CreateExerciseModalProps {
  language: Language;
  onClose: () => void;
  onCreated: (exercise: ListeningExercise) => void;
}

export const CreateExerciseModal: React.FC<CreateExerciseModalProps> = ({
  language,
  onClose,
  onCreated,
}) => {
  const [sourceType, setSourceType] = useState<'tts' | 'youtube' | 'audioUrl'>('tts');
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState(language === 'en' ? 'A2 / IELTS 3.5' : 'N5 / Minna');
  const [category, setCategory] = useState(
    language === 'en' ? 'Short Stories / Tự tạo' : 'Minna / Tự tạo'
  );
  const [mediaUrl, setMediaUrl] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !scriptText.trim()) {
      setError('Vui lòng nhập tiêu đề và nội dung kịch bản / phụ đề.');
      return;
    }

    let youtubeId: string | undefined;
    if (sourceType === 'youtube') {
      const id = extractYouTubeId(mediaUrl);
      if (!id) {
        setError('Link YouTube không hợp lệ (vd: https://www.youtube.com/watch?v=...).');
        return;
      }
      youtubeId = id;
    }

    let segments: ListeningSegment[];
    if (scriptText.includes('-->')) {
      segments = parseSubtitlesToSegments(scriptText);
    } else {
      segments = splitPlainTextToSegments(scriptText, language);
    }

    if (!segments.length) {
      setError('Không tách được câu nào từ nội dung bạn nhập.');
      return;
    }

    const now = Date.now();
    const exercise: ListeningExercise = {
      id: `ex-${language}-${now}`,
      title: title.trim(),
      language,
      level: level.trim() || 'Tự chọn',
      category: category.trim() || 'Cá nhân',
      description:
        sourceType === 'youtube'
          ? 'Bài nghe tạo từ video YouTube & phụ đề'
          : sourceType === 'audioUrl'
          ? 'Bài nghe từ file audio MP3'
          : 'Bài nghe chép chính tả đọc bằng giọng TTS',
      audioType: sourceType,
      youtubeId,
      audioUrl: sourceType === 'audioUrl' ? mediaUrl.trim() : undefined,
      segments,
      createdAt: now,
      updatedAt: now,
    };

    await db.exercises.put(exercise);
    onCreated(exercise);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Tạo bài nghe mới ({language === 'en' ? '🇬🇧 English' : '🇯🇵 Tiếng Nhật'})
            </h3>
            <p className="text-xs text-slate-500">
              Dán đoạn văn sách Cambridge / Minna, hoặc dán link YouTube + phụ đề .SRT/.VTT
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Audio Source Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'tts', label: 'Văn bản (TTS tự đọc)', icon: Sparkles },
              { id: 'youtube', label: 'YouTube + Phụ đề', icon: Youtube },
              { id: 'audioUrl', label: 'Link MP3 + SRT', icon: FileAudio },
            ].map((item) => {
              const Icon = item.icon;
              const active = sourceType === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSourceType(item.id as 'tts' | 'youtube' | 'audioUrl')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                    active
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Tên bài nghe *
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'vd: Cambridge 15 Test 1 - Part 1 hoặc BBC 6 Minute English'
                  : 'vd: Minna no Nihongo Bài 3 - Kaiwa'
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Trình độ
              </label>
              <input
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Nguồn / Danh mục
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          {sourceType !== 'tts' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                {sourceType === 'youtube' ? 'Link video YouTube *' : 'Link trực tiếp file MP3 *'}
              </label>
              <input
                required
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder={
                  sourceType === 'youtube'
                    ? 'https://www.youtube.com/watch?v=...'
                    : 'https://example.com/audio.mp3'
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {sourceType === 'tts'
                ? 'Nội dung bài nghe (mỗi dòng 1 câu hoặc dán cả đoạn văn, hệ thống tự tách câu) *'
                : 'Phụ đề có mốc thời gian (.SRT / .VTT) *'}
            </label>
            <textarea
              required
              rows={7}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder={
                sourceType === 'tts'
                  ? language === 'en'
                    ? 'Today is a sunny day.\nI go to the park with my friends.\nWe drink coffee and talk about our plans.'
                    : 'おはようございます。\nきょうは いい てんきですね。\nにほんごを べんきょうします。'
                  : '1\n00:00:01,000 --> 00:00:04,500\nHello everyone, welcome back to the channel.\n\n2\n00:00:05,000 --> 00:00:08,200\nToday we will practice English listening together.'
              }
              className="font-jp w-full rounded-xl border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700"
          >
            Tạo bài nghe & Bắt đầu luyện
          </button>
        </form>
      </div>
    </div>
  );
};
