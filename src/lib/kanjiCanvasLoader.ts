export type RecognitionScope = 'kana' | 'hiragana' | 'katakana' | 'all';

type PatternTuple = [string, number, [number, number][][]];

interface KanjiCanvasGlobal {
  refPatterns: PatternTuple[];
  momentNormalize: (id: string) => [number, number][][];
  extractFeatures: (norm: [number, number][][], interval: number) => [number, number][][];
  coarseClassification: (features: [number, number][][]) => [number, number][];
  fineClassification: (features: [number, number][][], coarse: [number, number][]) => string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    KanjiCanvas?: KanjiCanvasGlobal;
    KotobaKanaPatterns?: {
      hiragana: PatternTuple[];
      katakana: PatternTuple[];
    };
  }
}

let coreLoadedPromise: Promise<void> | null = null;
let kanjiPatternsLoadedPromise: Promise<void> | null = null;
let cachedKanjiPatterns: PatternTuple[] | null = null;

function loadScriptOnce(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-kotoba-src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.kotobaSrc = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Không tải được script nhận diện: ${src}`));
    document.head.appendChild(script);
  });
}

export async function loadKanaRecognizer(): Promise<void> {
  if (!coreLoadedPromise) {
    coreLoadedPromise = (async () => {
      await loadScriptOnce('./kanjicanvas/kanji-canvas.min.js');
      await loadScriptOnce('./kanjicanvas/kana-patterns.js');
    })();
  }
  return coreLoadedPromise;
}

export async function loadFullKanjiPatterns(): Promise<void> {
  await loadKanaRecognizer();
  if (!kanjiPatternsLoadedPromise) {
    kanjiPatternsLoadedPromise = (async () => {
      await loadScriptOnce('./kanjicanvas/ref-patterns.js');
      if (window.KanjiCanvas?.refPatterns?.length) {
        cachedKanjiPatterns = [...window.KanjiCanvas.refPatterns];
      }
    })();
  }
  return kanjiPatternsLoadedPromise;
}

export async function recognizeStrokes(
  strokes: [number, number][][],
  scope: RecognitionScope = 'kana'
): Promise<string[]> {
  if (!strokes.length) return [];

  await loadKanaRecognizer();
  if (scope === 'all' && !cachedKanjiPatterns) {
    await loadFullKanjiPatterns();
  }

  const KC = window.KanjiCanvas;
  const kana = window.KotobaKanaPatterns;
  if (!KC || !kana) return [];

  let activePatterns: PatternTuple[];
  if (scope === 'hiragana') {
    activePatterns = kana.hiragana;
  } else if (scope === 'katakana') {
    activePatterns = kana.katakana;
  } else if (scope === 'all' && cachedKanjiPatterns) {
    activePatterns = [...kana.hiragana, ...kana.katakana, ...cachedKanjiPatterns];
  } else {
    activePatterns = [...kana.hiragana, ...kana.katakana];
  }

  KC.refPatterns = activePatterns;

  // Ensure every stroke has >= 2 points and non-zero x/y variance so KanjiCanvas momentNormalize never produces NaN
  const safeStrokes: [number, number][][] = strokes
    .filter((s) => s.length > 0)
    .map((s) =>
      s.length === 1
        ? [s[0], [s[0][0] + 1, s[0][1] + 1]]
        : s.map((pt) => [pt[0], pt[1]] as [number, number])
    );

  if (!safeStrokes.length) return [];

  const allPts = safeStrokes.flat();
  const minX = Math.min(...allPts.map((p) => p[0]));
  const maxX = Math.max(...allPts.map((p) => p[0]));
  const minY = Math.min(...allPts.map((p) => p[1]));
  const maxY = Math.max(...allPts.map((p) => p[1]));
  const lastStroke = safeStrokes[safeStrokes.length - 1];
  const lastPt = lastStroke[lastStroke.length - 1];
  if (maxX - minX < 2) {
    lastStroke.push([Math.min(255, lastPt[0] + 2), lastPt[1]]);
  }
  if (maxY - minY < 2) {
    lastStroke.push([lastPt[0], Math.min(255, lastPt[1] + 2)]);
  }

  // Special fast-check for single horizontal bar ー in katakana/kana mode
  if (safeStrokes.length === 1 && (scope === 'katakana' || scope === 'kana')) {
    const pts = safeStrokes[0];
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const w = Math.max(...xs) - Math.min(...xs);
    const h = Math.max(...ys) - Math.min(...ys);
    if (w > 60 && h < 28) {
      KC['recordedPattern_kotoba'] = safeStrokes;
      const norm = KC.momentNormalize('kotoba');
      const feat = KC.extractFeatures(norm, 20);
      const coarse = KC.coarseClassification(feat);
      const raw = KC.fineClassification(feat, coarse);
      const list = raw.trim().split(/\s+/).filter(Boolean);
      return Array.from(new Set(['ー', ...list])).slice(0, 8);
    }
  }

  KC['recordedPattern_kotoba'] = safeStrokes;
  const norm = KC.momentNormalize('kotoba');
  const features = KC.extractFeatures(norm, 20);
  const coarse = KC.coarseClassification(features);
  const resultStr = KC.fineClassification(features, coarse);

  const candidates = resultStr
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return Array.from(new Set(candidates)).slice(0, 8);
}
