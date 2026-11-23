import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Undo2, Trash2, Check, Loader2, Sparkles } from 'lucide-react';
import {
  loadFullKanjiPatterns,
  loadKanaRecognizer,
  recognizeStrokes,
  type RecognitionScope,
} from '../../lib/kanjiCanvasLoader';

interface JapaneseHandwritingPadProps {
  onCommitChar: (char: string) => void;
  defaultScope?: RecognitionScope;
  compact?: boolean;
}

const QUICK_KANA = ['っ', 'ゃ', 'ゅ', 'ょ', 'ー', 'ッ'];

const STROKE_COLORS = [
  '#4f46e5',
  '#0284c7',
  '#0d9488',
  '#d97706',
  '#e11d48',
  '#7c3aed',
  '#059669',
  '#2563eb',
];

export const JapaneseHandwritingPad: React.FC<JapaneseHandwritingPadProps> = ({
  onCommitChar,
  defaultScope = 'kana',
  compact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<[number, number][][]>([]);
  const currentStrokeRef = useRef<[number, number][] | null>(null);
  const isDrawingRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const [scope, setScope] = useState<RecognitionScope>(defaultScope);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [strokeCount, setStrokeCount] = useState(0);
  const [loadingEngine, setLoadingEngine] = useState(true);
  const [engineError, setEngineError] = useState<string | null>(null);

  const CANVAS_SIZE = 256;

  useEffect(() => {
    let active = true;
    setLoadingEngine(true);
    setEngineError(null);
    const loadPromise = scope === 'all' ? loadFullKanjiPatterns() : loadKanaRecognizer();
    loadPromise
      .then(() => {
        if (active) setLoadingEngine(false);
      })
      .catch((err) => {
        if (active) {
          setEngineError(err instanceof Error ? err.message : 'Lỗi tải bộ nhận diện chữ viết.');
          setLoadingEngine(false);
        }
      });
    return () => {
      active = false;
    };
  }, [scope]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const allStrokes = [...strokesRef.current];
    if (currentStrokeRef.current && currentStrokeRef.current.length > 0) {
      allStrokes.push(currentStrokeRef.current);
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5.5;

    allStrokes.forEach((stroke, idx) => {
      ctx.strokeStyle = STROKE_COLORS[idx % STROKE_COLORS.length];
      ctx.fillStyle = STROKE_COLORS[idx % STROKE_COLORS.length];

      if (stroke.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke[0][0], stroke[0][1], 3, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      ctx.beginPath();
      ctx.moveTo(stroke[0][0], stroke[0][1]);
      for (let i = 1; i < stroke.length - 1; i++) {
        const midX = (stroke[i][0] + stroke[i + 1][0]) / 2;
        const midY = (stroke[i][1] + stroke[i + 1][1]) / 2;
        ctx.quadraticCurveTo(stroke[i][0], stroke[i][1], midX, midY);
      }
      const last = stroke[stroke.length - 1];
      ctx.lineTo(last[0], last[1]);
      ctx.stroke();
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    redrawCanvas();
  }, [redrawCanvas]);

  const runRecognition = useCallback(async () => {
    if (!strokesRef.current.length) {
      setCandidates([]);
      return;
    }
    try {
      const results = await recognizeStrokes(strokesRef.current, scope);
      setCandidates(results);
    } catch {
      // Ignore transient recognition error
    }
  }, [scope]);

  // Re-run recognition automatically when scope changes
  useEffect(() => {
    if (!loadingEngine && strokesRef.current.length > 0) {
      void runRecognition();
    }
  }, [scope, loadingEngine, runRecognition]);

  const scheduleRecognition = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      void runRecognition();
    }, 140);
  }, [runRecognition]);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>): [number, number] {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE;
    return [
      Math.max(0, Math.min(CANVAS_SIZE, x)),
      Math.max(0, Math.min(CANVAS_SIZE, y)),
    ];
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pt = getPoint(e);
    currentStrokeRef.current = [pt];
    redrawCanvas();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    e.preventDefault();
    const pt = getPoint(e);
    const prev = currentStrokeRef.current[currentStrokeRef.current.length - 1];
    const dist = Math.hypot(pt[0] - prev[0], pt[1] - prev[1]);
    if (dist >= 2.2) {
      currentStrokeRef.current.push(pt);
      redrawCanvas();
    }
  }

  function finishStroke() {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (currentStrokeRef.current && currentStrokeRef.current.length > 0) {
      strokesRef.current = [...strokesRef.current, currentStrokeRef.current];
      currentStrokeRef.current = null;
      setStrokeCount(strokesRef.current.length);
      redrawCanvas();
      scheduleRecognition();
    }
  }

  function handleUndo() {
    if (!strokesRef.current.length) return;
    strokesRef.current = strokesRef.current.slice(0, -1);
    setStrokeCount(strokesRef.current.length);
    redrawCanvas();
    if (strokesRef.current.length === 0) {
      setCandidates([]);
    } else {
      scheduleRecognition();
    }
  }

  function handleClear() {
    strokesRef.current = [];
    currentStrokeRef.current = null;
    setStrokeCount(0);
    setCandidates([]);
    redrawCanvas();
  }

  function handlePickCandidate(ch: string) {
    onCommitChar(ch);
    handleClear();
  }

  return (
    <div className="space-y-3">
      {/* Recognition Scope Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'kana', label: 'Hira + Kata' },
              { id: 'hiragana', label: 'Hiragana' },
              { id: 'katakana', label: 'Katakana' },
              { id: 'all', label: 'Kana + Kanji' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setScope(item.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                scope === item.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-slate-400">
          {loadingEngine ? 'Đang tải nhận diện...' : `${strokeCount} nét`}
        </span>
      </div>

      {engineError && (
        <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          {engineError}
        </div>
      )}

      {/* Touch Writing Pad + Controls */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <div
            className={`writing-grid relative overflow-hidden rounded-2xl border-2 border-indigo-200 bg-white shadow-inner dark:border-indigo-900/70 dark:bg-slate-950 ${
              compact ? 'h-52 w-52' : 'h-64 w-64 sm:h-64 sm:w-64'
            }`}
          >
            {/* Subtle center crosshair */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-full w-px border-l border-dashed border-indigo-200/80 dark:border-indigo-900/70" />
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-px w-full border-t border-dashed border-indigo-200/80 dark:border-indigo-900/70" />
            </div>

            {strokeCount === 0 && !loadingEngine && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-slate-300 dark:text-slate-700">
                <span className="font-jp text-4xl font-bold opacity-50">あ</span>
                <span className="mt-1 text-xs font-medium">Dùng tay / chuột viết 1 chữ vào đây</span>
              </div>
            )}

            {loadingEngine && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-950/80">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                <span className="mt-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Đang nạp bộ nhận diện...
                </span>
              </div>
            )}

            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishStroke}
              onPointerCancel={finishStroke}
              style={{ touchAction: 'none' }}
              className="relative z-10 h-full w-full cursor-crosshair select-none"
            />
          </div>

          <div className="mt-2 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokeCount === 0}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Hoàn tác nét
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={strokeCount === 0}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-rose-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xóa bảng
            </button>
          </div>
        </div>

        {/* Recognition Candidates Panel */}
        <div className="flex w-full flex-1 flex-col justify-between gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                Máy nhận diện (chạm để chọn chữ)
              </span>
            </div>

            {candidates.length > 0 ? (
              <div className="space-y-2.5">
                {/* Best match highlight button */}
                <button
                  type="button"
                  onClick={() => handlePickCandidate(candidates[0])}
                  className="flex w-full items-center justify-between rounded-xl bg-indigo-600 px-4 py-2.5 text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99]"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Check className="h-4 w-4" />
                    Thêm chữ nhận diện:
                  </span>
                  <span className="font-jp rounded-lg bg-white/20 px-3 py-0.5 text-2xl font-bold">
                    {candidates[0]}
                  </span>
                </button>

                {/* Alternative candidates */}
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-4">
                  {candidates.map((ch, idx) => (
                    <button
                      key={`${ch}-${idx}`}
                      type="button"
                      onClick={() => handlePickCandidate(ch)}
                      className={`font-jp flex h-12 items-center justify-center rounded-xl border text-2xl font-bold transition active:scale-95 ${
                        idx === 0
                          ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-200'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-28 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 dark:border-slate-700">
                <p>Viết từng chữ Hiragana / Katakana vào ô bên cạnh.</p>
                <p className="mt-1">Chạm chữ đúng để ghép thành từ hoàn chỉnh!</p>
              </div>
            )}
          </div>

          {/* Quick small-kana helpers */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400">Âm ghép / trường âm:</span>
            {QUICK_KANA.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => onCommitChar(ch)}
                className="font-jp rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
