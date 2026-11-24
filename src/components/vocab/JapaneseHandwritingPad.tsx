import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Undo2,
  Trash2,
  Check,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  Play,
  Square,
  Hash,
} from 'lucide-react';
import {
  getCharacterStrokeGuide,
  loadFullKanjiPatterns,
  loadKanaRecognizer,
  recognizeStrokes,
  type RecognitionScope,
  type StrokeGuideData,
} from '../../lib/kanjiCanvasLoader';

interface JapaneseHandwritingPadProps {
  onCommitChar: (char: string) => void;
  defaultScope?: RecognitionScope;
  compact?: boolean;
  /** Target character for optional ghost tracing, stroke-order animation, and stroke count hint */
  guideChar?: string;
  /** Start with faint tracing guide active (e.g. after tapping "Tô theo nét mẫu") */
  initialTrace?: boolean;
  /** Optional slot prompt like "Chữ 2/4" */
  slotLabel?: string;
  /** Called if user presses Enter when canvas is empty */
  onEmptyEnter?: () => void;
}

type StyledPoint = [number, number, number]; // [x, y, width]

const QUICK_KANA = ['っ', 'ゃ', 'ゅ', 'ょ', 'ー', 'ッ', 'ャ', 'ュ', 'ョ'];

const STROKE_COLORS_LIGHT = [
  '#4f46e5',
  '#0284c7',
  '#0d9488',
  '#d97706',
  '#e11d48',
  '#7c3aed',
  '#059669',
  '#2563eb',
];

const STROKE_COLORS_DARK = [
  '#f2f3f5',
  '#8ea1e1',
  '#57f287',
  '#fee75c',
  '#eb459e',
  '#b4beff',
  '#6ee7b7',
  '#7dd3fc',
];

const SCOPE_OPTIONS: { id: RecognitionScope; label: string }[] = [
  { id: 'kanji', label: 'Chỉ Kanji' },
  { id: 'hiragana', label: 'Hiragana' },
  { id: 'katakana', label: 'Katakana' },
  { id: 'kana', label: 'Hira + Kata' },
  { id: 'all', label: 'Tất cả' },
];

function strokeLength(pts: [number, number][]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  return Math.max(len, 1);
}

function drawSmoothPolyline(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  progress = 1
): [number, number] | null {
  if (!pts.length) return null;
  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0][0], pts[0][1], ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    return pts[0];
  }

  const total = strokeLength(pts);
  const targetDist = total * Math.max(0, Math.min(1, progress));
  let walked = 0;

  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  let tip: [number, number] = pts[0];

  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (walked + seg >= targetDist) {
      const remain = targetDist - walked;
      const t = seg > 0 ? remain / seg : 1;
      const nx = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t;
      const ny = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t;
      ctx.lineTo(nx, ny);
      tip = [nx, ny];
      break;
    }
    ctx.lineTo(pts[i][0], pts[i][1]);
    walked += seg;
    tip = pts[i];
  }
  ctx.stroke();
  return tip;
}

export const JapaneseHandwritingPad: React.FC<JapaneseHandwritingPadProps> = ({
  onCommitChar,
  defaultScope = 'kana',
  compact = false,
  guideChar,
  initialTrace = false,
  slotLabel,
  onEmptyEnter,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<StyledPoint[][]>([]);
  const currentStrokeRef = useRef<StyledPoint[] | null>(null);
  const lastMoveTimeRef = useRef<number>(0);
  const isDrawingRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const animRafRef = useRef<number | null>(null);
  const animStateRef = useRef<{ strokeIdx: number; progress: number } | null>(null);

  const [scope, setScope] = useState<RecognitionScope>(defaultScope);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [strokeCount, setStrokeCount] = useState(0);
  const [loadingEngine, setLoadingEngine] = useState(true);
  const [engineError, setEngineError] = useState<string | null>(null);

  const [strokeGuide, setStrokeGuide] = useState<StrokeGuideData | null>(null);
  const [showTrace, setShowTrace] = useState(initialTrace);
  const [showStrokeNums, setShowStrokeNums] = useState(true);
  const [isAnimatingGuide, setIsAnimatingGuide] = useState(false);

  const CANVAS_SIZE = 256;

  // Keep scope synced when defaultScope changes (e.g. moving across cards)
  useEffect(() => {
    setScope(defaultScope);
  }, [defaultScope]);

  // Keep trace toggle synced with initialTrace
  useEffect(() => {
    setShowTrace(initialTrace);
  }, [initialTrace, guideChar]);

  // Load recognition datasets
  useEffect(() => {
    let active = true;
    setLoadingEngine(true);
    setEngineError(null);
    const loadPromise =
      scope === 'all' || scope === 'kanji' ? loadFullKanjiPatterns() : loadKanaRecognizer();
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

  // Load authentic stroke-order guide for the current target character
  useEffect(() => {
    let active = true;
    setStrokeGuide(null);
    if (!guideChar) return;
    void getCharacterStrokeGuide(guideChar).then((data) => {
      if (active) setStrokeGuide(data);
    });
    return () => {
      active = false;
    };
  }, [guideChar]);

  const stopGuideAnimation = useCallback(() => {
    if (animRafRef.current) {
      cancelAnimationFrame(animRafRef.current);
      animRafRef.current = null;
    }
    animStateRef.current = null;
    setIsAnimatingGuide(false);
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const isDark = document.documentElement.classList.contains('dark');

    // Layer 1: Faint ghost trace guide (when user toggles "Tô mờ")
    if (showTrace && guideChar) {
      ctx.save();
      if (strokeGuide && strokeGuide.strokes.length > 0) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 8;
        ctx.strokeStyle = isDark ? 'rgba(181, 186, 193, 0.18)' : 'rgba(99, 102, 241, 0.16)';
        ctx.fillStyle = ctx.strokeStyle;

        strokeGuide.strokes.forEach((pts, idx) => {
          drawSmoothPolyline(ctx, pts, 1);
          // Highlight the next stroke to write in soft Blurple!
          if (idx === strokesRef.current.length && !animStateRef.current) {
            ctx.save();
            ctx.strokeStyle = isDark ? 'rgba(142, 161, 225, 0.45)' : 'rgba(79, 70, 229, 0.35)';
            ctx.lineWidth = 8.5;
            drawSmoothPolyline(ctx, pts, 1);
            const start = pts[0];
            if (start) {
              ctx.fillStyle = isDark ? '#5865f2' : '#4f46e5';
              ctx.beginPath();
              ctx.arc(start[0], start[1], 7.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 9px Inter, sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(String(idx + 1), start[0], start[1] + 0.5);
            }
            ctx.restore();
          }
        });
      } else {
        // Fallback crisp faint glyph
        ctx.font = '600 176px "Noto Sans JP", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isDark ? 'rgba(181, 186, 193, 0.15)' : 'rgba(99, 102, 241, 0.14)';
        ctx.fillText(guideChar, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 8);
      }
      ctx.restore();
    }

    // Layer 2: Live Stroke-Order Animation ("Chạy nét mẫu")
    if (animStateRef.current && strokeGuide && strokeGuide.strokes.length > 0) {
      const { strokeIdx, progress } = animStateRef.current;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Faint skeleton of all strokes
      ctx.lineWidth = 7;
      ctx.strokeStyle = isDark ? 'rgba(181, 186, 193, 0.14)' : 'rgba(148, 163, 184, 0.24)';
      strokeGuide.strokes.forEach((pts) => drawSmoothPolyline(ctx, pts, 1));

      // Completed strokes
      for (let i = 0; i < strokeIdx; i++) {
        const pts = strokeGuide.strokes[i];
        ctx.strokeStyle = isDark ? '#8ea1e1' : '#4f46e5';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 6.5;
        drawSmoothPolyline(ctx, pts, 1);

        const start = pts[0];
        if (start) {
          ctx.fillStyle = isDark ? '#383a40' : '#eef2ff';
          ctx.beginPath();
          ctx.arc(start[0], start[1], 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = isDark ? '#dbdee1' : '#4338ca';
          ctx.font = 'bold 9px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(i + 1), start[0], start[1] + 0.5);
        }
      }

      // Active animated stroke
      const activePts = strokeGuide.strokes[strokeIdx];
      if (activePts) {
        ctx.strokeStyle = isDark ? '#57f287' : '#e11d48';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 7.5;
        const tip = drawSmoothPolyline(ctx, activePts, progress);

        const start = activePts[0];
        if (start) {
          ctx.fillStyle = isDark ? '#248046' : '#e11d48';
          ctx.beginPath();
          ctx.arc(start[0], start[1], 8.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(strokeIdx + 1), start[0], start[1] + 0.5);
        }

        if (tip) {
          ctx.fillStyle = isDark ? '#fee75c' : '#f59e0b';
          ctx.beginPath();
          ctx.arc(tip[0], tip[1], 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Layer 3: User's Calligraphic Velocity-Sensitive Strokes
    const allStrokes = [...strokesRef.current];
    if (currentStrokeRef.current && currentStrokeRef.current.length > 0) {
      allStrokes.push(currentStrokeRef.current);
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const palette = isDark ? STROKE_COLORS_DARK : STROKE_COLORS_LIGHT;

    allStrokes.forEach((stroke, idx) => {
      const strokeColor = palette[idx % palette.length];
      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = strokeColor;

      if (stroke.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke[0][0], stroke[0][1], stroke[0][2] / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Variable-width quadratic segments for authentic brush/gel-pen feel
        for (let i = 1; i < stroke.length; i++) {
          const p0 = stroke[i - 1];
          const p1 = stroke[i];
          const midX = (p0[0] + p1[0]) / 2;
          const midY = (p0[1] + p1[1]) / 2;
          const prevMidX = i === 1 ? p0[0] : (stroke[i - 2][0] + p0[0]) / 2;
          const prevMidY = i === 1 ? p0[1] : (stroke[i - 2][1] + p0[1]) / 2;

          ctx.lineWidth = (p0[2] + p1[2]) / 2;
          ctx.beginPath();
          ctx.moveTo(prevMidX, prevMidY);
          ctx.quadraticCurveTo(p0[0], p0[1], midX, midY);
          if (i === stroke.length - 1) {
            ctx.lineTo(p1[0], p1[1]);
          }
          ctx.stroke();
        }
      }

      // Subtle stroke-number start dot for committed strokes
      if (showStrokeNums && idx < strokesRef.current.length && stroke[0]) {
        ctx.save();
        ctx.fillStyle = isDark ? 'rgba(30, 31, 34, 0.85)' : 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.arc(stroke[0][0], stroke[0][1], 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = strokeColor;
        ctx.font = 'bold 8.5px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(idx + 1), stroke[0][0], stroke[0][1] + 0.5);
        ctx.restore();
      }
    });
  }, [showTrace, showStrokeNums, guideChar, strokeGuide]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
    };
  }, []);

  const handlePlayStrokeAnimation = useCallback(() => {
    if (!strokeGuide || strokeGuide.strokes.length === 0) return;
    if (isAnimatingGuide) {
      stopGuideAnimation();
      redrawCanvas();
      return;
    }

    setIsAnimatingGuide(true);
    let idx = 0;
    let strokeStartTs = performance.now();
    const PER_STROKE_MS = 520;
    const PAUSE_BETWEEN_MS = 160;

    const tick = (now: number) => {
      const elapsed = now - strokeStartTs;
      if (elapsed <= PER_STROKE_MS) {
        animStateRef.current = { strokeIdx: idx, progress: elapsed / PER_STROKE_MS };
        redrawCanvas();
        animRafRef.current = requestAnimationFrame(tick);
      } else if (elapsed <= PER_STROKE_MS + PAUSE_BETWEEN_MS) {
        animStateRef.current = { strokeIdx: idx, progress: 1 };
        redrawCanvas();
        animRafRef.current = requestAnimationFrame(tick);
      } else {
        idx += 1;
        if (idx >= strokeGuide.strokes.length) {
          // Hold final frame briefly then finish cleanly
          animStateRef.current = null;
          animRafRef.current = null;
          setIsAnimatingGuide(false);
          redrawCanvas();
          return;
        }
        strokeStartTs = now;
        animRafRef.current = requestAnimationFrame(tick);
      }
    };

    animRafRef.current = requestAnimationFrame(tick);
  }, [strokeGuide, isAnimatingGuide, stopGuideAnimation, redrawCanvas]);

  const runRecognition = useCallback(async () => {
    if (!strokesRef.current.length) {
      setCandidates([]);
      return;
    }
    try {
      const plainStrokes: [number, number][][] = strokesRef.current.map((s) =>
        s.map(([x, y]) => [x, y])
      );
      const results = await recognizeStrokes(plainStrokes, scope);
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
    }, 75);
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
    if (isAnimatingGuide) stopGuideAnimation();
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const [x, y] = getPoint(e);
    lastMoveTimeRef.current = performance.now();
    currentStrokeRef.current = [[x, y, 5.8]];
    redrawCanvas();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    e.preventDefault();
    const [x, y] = getPoint(e);
    const prev = currentStrokeRef.current[currentStrokeRef.current.length - 1];
    const dist = Math.hypot(x - prev[0], y - prev[1]);
    const minDist = e.pointerType === 'pen' ? 1.4 : 2.0;

    if (dist >= minDist) {
      const now = performance.now();
      const dt = Math.max(now - lastMoveTimeRef.current, 6);
      const velocity = dist / dt; // px/ms
      // Natural calligraphy taper: slow = thick (~6.5), fast = crisp (~3.6)
      const targetWidth = Math.max(3.6, Math.min(6.6, 6.4 - velocity * 1.9));
      const smoothedWidth = prev[2] * 0.65 + targetWidth * 0.35;
      lastMoveTimeRef.current = now;
      currentStrokeRef.current.push([x, y, smoothedWidth]);
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

  const handleUndo = useCallback(() => {
    if (!strokesRef.current.length) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    strokesRef.current = strokesRef.current.slice(0, -1);
    setStrokeCount(strokesRef.current.length);
    redrawCanvas();
    if (strokesRef.current.length === 0) {
      setCandidates([]);
    } else {
      scheduleRecognition();
    }
  }, [redrawCanvas, scheduleRecognition]);

  const handleClear = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    stopGuideAnimation();
    strokesRef.current = [];
    currentStrokeRef.current = null;
    setStrokeCount(0);
    setCandidates([]);
    redrawCanvas();
  }, [redrawCanvas, stopGuideAnimation]);

  const handlePickCandidate = useCallback(
    (ch: string) => {
      onCommitChar(ch);
      handleClear();
    },
    [onCommitChar, handleClear]
  );

  // Desktop keyboard shortcuts: Ctrl+Z undo, Esc clear, Enter commit #1 (or verify if empty)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (strokesRef.current.length > 0) {
          e.preventDefault();
          handleUndo();
        }
      } else if (e.key === 'Escape') {
        if (strokesRef.current.length > 0 || isAnimatingGuide) {
          e.preventDefault();
          handleClear();
        }
      } else if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
        if (candidates.length > 0) {
          e.preventDefault();
          handlePickCandidate(candidates[0]);
        } else if (strokesRef.current.length === 0 && onEmptyEnter) {
          e.preventDefault();
          onEmptyEnter();
        }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [candidates, handleUndo, handleClear, handlePickCandidate, isAnimatingGuide, onEmptyEnter]);

  const expectedStrokes = strokeGuide?.strokeCount;

  return (
    <div className="space-y-3">
      {/* Recognition Scope Selector + Stroke Counter */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {SCOPE_OPTIONS.map((item) => (
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

        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
          {slotLabel && (
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
              {slotLabel}
            </span>
          )}
          <span>
            {loadingEngine
              ? 'Đang tải nhận diện...'
              : expectedStrokes
              ? `${strokeCount} / ${expectedStrokes} nét`
              : `${strokeCount} nét`}
          </span>
        </div>
      </div>

      {engineError && (
        <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          {engineError}
        </div>
      )}

      {/* Touch Writing Pad + Controls */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <div
            className={`writing-grid relative overflow-hidden rounded-2xl border-2 border-indigo-200 bg-white shadow-inner dark:border-[#3f4147] dark:bg-[#1e1f22] ${
              compact ? 'h-56 w-56' : 'h-[272px] w-[272px] sm:h-[288px] sm:w-[288px]'
            }`}
          >
            {/* Subtle center crosshair */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-full w-px border-l border-dashed border-indigo-200/80 dark:border-[#3f4147]" />
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-px w-full border-t border-dashed border-indigo-200/80 dark:border-[#3f4147]" />
            </div>

            {strokeCount === 0 && !loadingEngine && !showTrace && !isAnimatingGuide && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-slate-300 dark:text-[#4e5058]">
                <span className="text-xs font-semibold">
                  {scope === 'kanji'
                    ? 'Viết chữ Kanji vào ô này'
                    : 'Dùng tay / chuột viết 1 chữ vào đây'}
                </span>
                {expectedStrokes && (
                  <span className="mt-1 text-[11px] opacity-80">({expectedStrokes} nét mẫu)</span>
                )}
              </div>
            )}

            {loadingEngine && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/85 dark:bg-[#1e1f22]/90">
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
              style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
              className="relative z-10 h-full w-full cursor-crosshair select-none"
            />
          </div>

          {/* Primary Canvas Action Row */}
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokeCount === 0}
              title="Hoàn tác 1 nét (Ctrl+Z)"
              className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Hoàn tác
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={strokeCount === 0 && !isAnimatingGuide}
              title="Xóa toàn bộ bảng (Esc)"
              className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-rose-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xóa bảng
            </button>
            <button
              type="button"
              onClick={() => setShowStrokeNums((v) => !v)}
              title="Hiện / ẩn số thứ tự nét đã viết"
              className={`rounded-xl border px-2.5 py-2 text-xs font-semibold transition ${
                showStrokeNums
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <Hash className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Stroke-Order Practice Aid Row (Offline Ghost Trace + Animated Stroke Guide) */}
          {guideChar && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowTrace((v) => !v)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
                  showTrace
                    ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {showTrace ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showTrace ? 'Ẩn tô mờ' : 'Tô mờ mẫu'}
              </button>

              {strokeGuide && strokeGuide.strokes.length > 0 && (
                <button
                  type="button"
                  onClick={handlePlayStrokeAnimation}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
                    isAnimatingGuide
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'border-slate-200 bg-white text-indigo-700 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300'
                  }`}
                >
                  {isAnimatingGuide ? (
                    <Square className="h-3 w-3 fill-current" />
                  ) : (
                    <Play className="h-3 w-3 fill-current" />
                  )}
                  {isAnimatingGuide ? 'Dừng nét' : 'Xem nét viết'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Recognition Candidates Panel */}
        <div className="flex w-full flex-1 flex-col justify-between gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-[#232428]">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                Máy nhận diện (chạm để chọn)
              </span>
              <span className="hidden text-[10px] text-slate-400 sm:inline">
                Enter chọn #1 · Ctrl+Z hoàn tác
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
                    Chọn chữ nhận diện:
                  </span>
                  <span className="font-jp rounded-lg bg-white/20 px-3 py-0.5 text-2xl font-bold">
                    {candidates[0]}
                  </span>
                </button>

                {/* Top 10 candidates */}
                <div className="grid grid-cols-5 gap-1.5">
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
              <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-3 text-center text-xs text-slate-400 dark:border-slate-700">
                <p>
                  {scope === 'kanji'
                    ? 'Viết từng nét chữ Kanji vào ô bên trái.'
                    : 'Viết từng chữ Hiragana / Katakana vào ô bên trái.'}
                </p>
                <p className="mt-1">
                  {guideChar
                    ? 'Quên nét? Bấm "Xem nét viết" hoặc "Tô mờ mẫu" để tập viết theo!'
                    : 'Chạm chữ đúng để ghép thành từ hoàn chỉnh!'}
                </p>
              </div>
            )}
          </div>

          {/* Quick small-kana helpers (hidden in pure Kanji mode to keep workspace clean) */}
          {scope !== 'kanji' && (
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
          )}
        </div>
      </div>
    </div>
  );
};
