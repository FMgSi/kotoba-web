export type RecognitionScope = 'kana' | 'hiragana' | 'katakana' | 'kanji' | 'all';

type PatternTuple = [string, number, [number, number][][]];

export interface StrokeGuideData {
  char: string;
  strokeCount: number;
  /** Stroke polylines neatly fitted into 0..256 canvas coordinate space */
  strokes: [number, number][][];
}

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
let kanaLookupMap: Map<string, PatternTuple> | null = null;
let kanjiLookupMap: Map<string, PatternTuple> | null = null;
const normalizedGuideCache = new Map<string, StrokeGuideData | null>();

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
      if (window.KotobaKanaPatterns) {
        const map = new Map<string, PatternTuple>();
        for (const p of window.KotobaKanaPatterns.hiragana) map.set(p[0], p);
        for (const p of window.KotobaKanaPatterns.katakana) map.set(p[0], p);
        kanaLookupMap = map;
      }
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
        const map = new Map<string, PatternTuple>();
        for (const p of cachedKanjiPatterns) {
          if (!map.has(p[0])) map.set(p[0], p);
        }
        kanjiLookupMap = map;
      }
    })();
  }
  return kanjiPatternsLoadedPromise;
}

/**
 * Fit raw KanjiCanvas pattern strokes cleanly into a 256×256 square with comfortable margins,
 * preserving natural aspect ratio (so thin characters like 一 or 川 don't distort).
 */
function fitPatternToCanvas(pattern: PatternTuple, canvasSize = 256, pad = 34): StrokeGuideData {
  const rawStrokes = pattern[2] || [];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const stroke of rawStrokes) {
    for (const [x, y] of stroke) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (!Number.isFinite(minX)) {
    return { char: pattern[0], strokeCount: pattern[1], strokes: [] };
  }

  const rawW = Math.max(maxX - minX, 1);
  const rawH = Math.max(maxY - minY, 1);
  // Keep single-bar / narrow chars proportionate rather than inflating tiny height to full box
  const span = Math.max(rawW, rawH, 110);
  const usable = canvasSize - pad * 2;
  const scale = usable / span;

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const targetCenter = canvasSize / 2;

  const fitted: [number, number][][] = rawStrokes.map((stroke) =>
    stroke.map(([x, y]) => [
      targetCenter + (x - cx) * scale,
      targetCenter + (y - cy) * scale,
    ])
  );

  return {
    char: pattern[0],
    strokeCount: fitted.length || pattern[1],
    strokes: fitted,
  };
}

/**
 * Retrieve authentic stroke-order polylines for any Hiragana, Katakana, or Joyo Kanji (2,213 chars)
 * directly from the offline bundled KanjiCanvas pattern datasets.
 */
export async function getCharacterStrokeGuide(char: string): Promise<StrokeGuideData | null> {
  if (!char) return null;
  if (normalizedGuideCache.has(char)) {
    return normalizedGuideCache.get(char) ?? null;
  }

  await loadKanaRecognizer();
  let found = kanaLookupMap?.get(char);

  if (!found && /[\u4E00-\u9FAF]/.test(char)) {
    await loadFullKanjiPatterns();
    found = kanjiLookupMap?.get(char);
  }

  const guide = found ? fitPatternToCanvas(found) : null;
  normalizedGuideCache.set(char, guide);
  return guide;
}

export async function recognizeStrokes(
  strokes: [number, number][][],
  scope: RecognitionScope = 'kana'
): Promise<string[]> {
  if (!strokes.length) return [];

  await loadKanaRecognizer();
  if ((scope === 'all' || scope === 'kanji') && !cachedKanjiPatterns) {
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
  } else if (scope === 'kanji' && cachedKanjiPatterns) {
    activePatterns = cachedKanjiPatterns;
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

  // Fast geometric check for single horizontal line (一 in Kanji, ー in Katakana)
  let prefixBoost: string[] = [];
  if (safeStrokes.length === 1) {
    const pts = safeStrokes[0];
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const w = Math.max(...xs) - Math.min(...xs);
    const h = Math.max(...ys) - Math.min(...ys);
    if (w > 55 && h < 34) {
      if (scope === 'kanji') prefixBoost = ['一'];
      else if (scope === 'katakana' || scope === 'kana') prefixBoost = ['ー'];
      else if (scope === 'all') prefixBoost = ['一', 'ー'];
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

  return Array.from(new Set([...prefixBoost, ...candidates])).slice(0, 10);
}
