import React, { useState } from 'react';
import {
  Cloud,
  RefreshCw,
  Copy,
  Check,
  Download,
  Upload,
  Link2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import type { FirebaseConfigData, UserSettings } from '../types';
import {
  generateMagicSyncUrl,
  parseFirebaseSnippet,
  syncWithFirebase,
} from '../lib/firebaseSync';
import { db, exportFullBackupJson, importFullBackupJson } from '../lib/db';

interface SettingsSyncPageProps {
  settings: UserSettings;
  onSettingsChanged: (next: UserSettings) => Promise<void>;
  onSynced: () => Promise<void>;
}

const FIRESTORE_RULES_SNIPPET = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Chỉ cho phép truy cập đúng không gian cá nhân của bạn (đổi tên mã bí mật bên dưới)
    match /kotoba_spaces/{spaceId}/data/{docId} {
      allow read, write: if spaceId == "THAY_BANG_MA_DONG_BO_CUA_BAN";
    }
  }
}`;

export const SettingsSyncPage: React.FC<SettingsSyncPageProps> = ({
  settings,
  onSettingsChanged,
  onSynced,
}) => {
  const existing = settings.firebaseConfig;
  const [apiKey, setApiKey] = useState(existing?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(existing?.authDomain || '');
  const [projectId, setProjectId] = useState(existing?.projectId || '');
  const [appId, setAppId] = useState(existing?.appId || '');
  const [syncSpaceId, setSyncSpaceId] = useState(existing?.syncSpaceId || 'my-kotoba-2026');
  const [snippetInput, setSnippetInput] = useState('');

  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [copiedKey, setCopiedKey] = useState<'magic' | 'rules' | null>(null);

  const currentConfig: FirebaseConfigData | null =
    apiKey.trim() && projectId.trim() && appId.trim() && syncSpaceId.trim()
      ? {
          apiKey: apiKey.trim(),
          authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
          projectId: projectId.trim(),
          appId: appId.trim(),
          syncSpaceId: syncSpaceId.trim(),
        }
      : null;

  const magicUrl = currentConfig ? generateMagicSyncUrl(currentConfig) : '';

  function handleParseSnippet() {
    const parsed = parseFirebaseSnippet(snippetInput);
    if (!parsed) {
      setStatusMsg({
        type: 'error',
        text: 'Không đọc được firebaseConfig. Hãy copy nguyên đoạn const firebaseConfig = { ... } từ Firebase Console.',
      });
      return;
    }
    if (parsed.apiKey) setApiKey(parsed.apiKey);
    if (parsed.authDomain) setAuthDomain(parsed.authDomain);
    if (parsed.projectId) setProjectId(parsed.projectId);
    if (parsed.appId) setAppId(parsed.appId);
    setStatusMsg({
      type: 'success',
      text: 'Đã điền tự động thông tin Firebase! Hãy đặt Mã đồng bộ cá nhân rồi bấm "Lưu & Đồng bộ ngay".',
    });
  }

  async function handleSaveAndSync(e: React.FormEvent) {
    e.preventDefault();
    if (!currentConfig) {
      setStatusMsg({ type: 'error', text: 'Vui lòng điền đủ apiKey, projectId, appId và Mã đồng bộ.' });
      return;
    }

    setBusy(true);
    setStatusMsg(null);
    try {
      const updatedSettings: UserSettings = {
        ...settings,
        firebaseConfig: currentConfig,
      };
      await onSettingsChanged(updatedSettings);
      const res = await syncWithFirebase(currentConfig);
      await onSynced();
      setStatusMsg({
        type: 'success',
        text: `Kết nối & đồng bộ Firebase thành công! (${res.decksCount} bộ thẻ · ${res.cardsCount} từ vựng · ${res.exercisesCount} bài nghe).`,
      });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text:
          err instanceof Error
            ? `Lỗi đồng bộ Firebase: ${err.message}. Hãy kiểm tra bạn đã bật Firestore Database và dán đúng Rules chưa.`
            : 'Lỗi kết nối Firebase.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function copyText(text: string, which: 'magic' | 'rules') {
    await navigator.clipboard.writeText(text);
    setCopiedKey(which);
    window.setTimeout(() => setCopiedKey(null), 2000);
  }

  async function handleExportBackup() {
    const json = await exportFullBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kotoba-lab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const raw = await file.text();
      const res = await importFullBackupJson(raw);
      await onSynced();
      setStatusMsg({
        type: 'success',
        text: `Khôi phục thành công ${res.decks} bộ thẻ, ${res.cards} từ vựng, ${res.exercises} bài nghe!`,
      });
    } catch {
      setStatusMsg({ type: 'error', text: 'File backup JSON không hợp lệ.' });
    } finally {
      e.target.value = '';
    }
  }

  async function updateAudioPreference(patch: Partial<UserSettings>) {
    const next = { ...settings, ...patch };
    await db.settings.put(next);
    await onSettingsChanged(next);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Firebase Connection Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Cloud className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Kết nối Firebase & Tự động đăng nhập đa thiết bị
            </h1>
            <p className="text-xs text-slate-500">
              Lưu toàn bộ thẻ Anki, tiến độ ôn tập & bài nghe trên Cloud Firestore miễn phí
            </p>
          </div>
        </div>

        {/* 3-Step Quick Guide */}
        <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs leading-relaxed text-indigo-950 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-200">
          <p className="font-bold">3 bước nối Firebase cực nhanh (chỉ làm 1 lần, miễn phí trọn đời):</p>
          <ol className="mt-1.5 list-decimal space-y-1 pl-4">
            <li>
              Vào <b>console.firebase.google.com</b> → Tạo project mới → Vào mục <b>Build → Firestore Database → Create database</b>.
            </li>
            <li>
              Vào <b>Project Settings (bánh răng) → Your apps → Web (&lt;/&gt;)</b> → Register app → Copy đoạn <code>firebaseConfig</code> dán vào ô bên dưới.
            </li>
            <li>
              Lưu xong sẽ có <b>Magic Auto-Login Link</b>: chỉ cần lưu bookmark link đó trên Điện thoại / PC / Laptop → mở lên là tự đăng nhập & đồng bộ luôn!
            </li>
          </ol>
        </div>

        {statusMsg && (
          <div
            className={`mt-4 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Quick Snippet Paste */}
        <div className="mt-5 space-y-2">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
            Dán nhanh đoạn <code>const firebaseConfig = &#123; ... &#125;</code> từ Firebase Console:
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <textarea
              rows={3}
              value={snippetInput}
              onChange={(e) => setSnippetInput(e.target.value)}
              placeholder={'const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  projectId: "kotoba-lab-123",\n  appId: "1:123456:web:abc..."\n};'}
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              type="button"
              onClick={handleParseSnippet}
              className="shrink-0 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300"
            >
              Tự động điền
            </button>
          </div>
        </div>

        {/* Config Fields */}
        <form onSubmit={handleSaveAndSync} className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                apiKey *
              </label>
              <input
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                projectId *
              </label>
              <input
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="kotoba-lab-xxxx"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                appId *
              </label>
              <input
                required
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:xxxx:web:xxxx"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                authDomain
              </label>
              <input
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="project-id.firebaseapp.com"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <label className="mb-1 block text-xs font-bold text-emerald-900 dark:text-emerald-300">
              Mã đồng bộ cá nhân (Sync Space ID — đặt thật riêng tư, giống mật khẩu phòng học của bạn) *
            </label>
            <input
              required
              value={syncSpaceId}
              onChange={(e) => setSyncSpaceId(e.target.value)}
              placeholder="vd: batru-study-secret-8899"
              className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 font-mono text-sm font-bold text-emerald-900 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
              Lưu cấu hình & Đồng bộ ngay
            </button>

            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={settings.autoSync}
                onChange={(e) => void updateAudioPreference({ autoSync: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600"
              />
              Tự động đồng bộ nền sau khi học
            </label>
          </div>
        </form>

        {/* Magic Auto-Login Link */}
        {magicUrl && (
          <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/60 p-4 dark:border-violet-900/50 dark:bg-violet-950/30">
            <div className="flex items-center gap-2 text-sm font-bold text-violet-900 dark:text-violet-200">
              <Link2 className="h-4 w-4" />
              Link Tự Đăng Nhập (Magic Bookmark Link cho Điện thoại / Laptop / PC)
            </div>
            <p className="mt-1 text-xs text-violet-800/80 dark:text-violet-300/80">
              Gửi link này qua Zalo/Messenger của riêng bạn rồi mở trên điện thoại hoặc máy tính khác: mở link là tự nhận cấu hình Firebase, tự đăng nhập và đồng bộ luôn!
            </p>
            <div className="mt-2.5 flex gap-2">
              <input
                readOnly
                value={magicUrl}
                className="flex-1 truncate rounded-xl border border-violet-200 bg-white px-3 py-2 font-mono text-xs text-slate-700 dark:border-violet-800 dark:bg-slate-900 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={() => void copyText(magicUrl, 'magic')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700"
              >
                {copiedKey === 'magic' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedKey === 'magic' ? 'Đã copy!' : 'Copy link'}
              </button>
            </div>
          </div>
        )}

        {/* Firestore Security Rules */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Firestore Security Rules (Dán vào tab Rules trên Firebase Console)
            </span>
            <button
              type="button"
              onClick={() =>
                void copyText(
                  FIRESTORE_RULES_SNIPPET.replace(
                    'THAY_BANG_MA_DONG_BO_CUA_BAN',
                    syncSpaceId.trim() || 'my-kotoba-2026'
                  ),
                  'rules'
                )
              }
              className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200"
            >
              {copiedKey === 'rules' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedKey === 'rules' ? 'Đã copy' : 'Copy Rules'}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-[11px] leading-relaxed text-emerald-300">
            {FIRESTORE_RULES_SNIPPET.replace(
              'THAY_BANG_MA_DONG_BO_CUA_BAN',
              syncSpaceId.trim() || 'my-kotoba-2026'
            )}
          </pre>
        </div>
      </div>

      {/* Study & Backup Preferences */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <Sliders className="h-4 w-4 text-indigo-500" />
            Tùy chỉnh giọng đọc & học tập
          </h2>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Tốc độ đọc Tiếng Anh</span>
                <span>{settings.ttsRateEn}x</span>
              </div>
              <input
                type="range"
                min={0.6}
                max={1.3}
                step={0.05}
                value={settings.ttsRateEn}
                onChange={(e) => void updateAudioPreference({ ttsRateEn: Number(e.target.value) })}
                className="mt-1 w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Tốc độ đọc Tiếng Nhật</span>
                <span>{settings.ttsRateJp}x</span>
              </div>
              <input
                type="range"
                min={0.6}
                max={1.2}
                step={0.05}
                value={settings.ttsRateJp}
                onChange={(e) => void updateAudioPreference({ ttsRateJp: Number(e.target.value) })}
                className="mt-1 w-full accent-rose-600"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={settings.autoPlayAudio}
                onChange={(e) => void updateAudioPreference({ autoPlayAudio: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600"
              />
              Tự động đọc phát âm khi mở thẻ từ vựng mới
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Sao lưu & Khôi phục thủ công (JSON)
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Dùng để lưu 1 bản dự phòng toàn bộ từ vựng, tiến độ Anki và bài nghe về máy tính bất cứ lúc nào.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleExportBackup}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
            >
              <Download className="h-4 w-4" />
              Xuất file Backup (.json)
            </button>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              <Upload className="h-4 w-4" />
              Khôi phục từ JSON
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
