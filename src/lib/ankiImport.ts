import JSZip from 'jszip';
import initSqlJs from 'sql.js';
import { decompress } from 'fzstd';
import type { Language, VocabCard } from '../types';

function stripHtml(raw: string): string {
  return raw
    .replace(/\[sound:[^\]]+\]/gi, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractReadingFromFurigana(text: string): { cleanFront: string; reading?: string } {
  if (/\[[^\]]+\]/.test(text)) {
    const cleanFront = text.replace(/\[[^\]]+\]/g, '').replace(/\s+/g, '').trim();
    let reading = '';
    const regex = /([^\s[\]]+)\[([^\]]+)\]|([^\s[\]]+)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match[2]) {
        reading += match[2];
      } else if (match[3]) {
        reading += match[3];
      }
    }
    return { cleanFront, reading: reading.trim() || undefined };
  }
  return { cleanFront: text.trim() };
}

function buildNewCard(
  deckId: string,
  language: Language,
  frontRaw: string,
  backRaw: string,
  extra: Partial<VocabCard> = {}
): VocabCard {
  const now = Date.now();
  const parsed =
    language === 'jp' ? extractReadingFromFurigana(frontRaw) : { cleanFront: frontRaw.trim() };
  return {
    id: `card-${now}-${Math.random().toString(36).slice(2, 9)}`,
    deckId,
    language,
    front: parsed.cleanFront,
    reading: extra.reading || parsed.reading,
    romaji: extra.romaji,
    back: backRaw.trim(),
    example: extra.example,
    exampleVi: extra.exampleVi,
    notes: extra.notes,
    tags: extra.tags ?? ['anki-import'],
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
  };
}

export async function importApkgFile(
  file: File,
  deckId: string,
  language: Language
): Promise<{ cards: VocabCard[]; detectedDeckName?: string }> {
  const zip = await JSZip.loadAsync(file);

  // Prefer modern Anki 2.1.50+ (zstd-compressed collection.anki21b), then collection.anki21, then legacy collection.anki2
  let dbBytes: Uint8Array | null = null;
  const anki21b = zip.file('collection.anki21b');
  if (anki21b) {
    const compressed = await anki21b.async('uint8array');
    dbBytes = decompress(compressed);
  } else {
    const legacyEntry = zip.file('collection.anki21') || zip.file('collection.anki2');
    if (legacyEntry) {
      dbBytes = await legacyEntry.async('uint8array');
    }
  }

  if (!dbBytes) {
    throw new Error(
      'Không tìm thấy database Anki trong file .apkg. Hãy kiểm tra lại file xuất từ Anki.'
    );
  }

  const SQL = await initSqlJs({
    locateFile: () => './sql-wasm.wasm',
    useOldExtensionFunctions: false,
  });
  const sqlDb = new SQL.Database(dbBytes);

  try {
    let detectedDeckName: string | undefined;

    // Anki 2.1.50+ stores decks in a dedicated `decks` table
    try {
      const decksRes = sqlDb.exec('SELECT name FROM decks');
      if (decksRes[0]?.values) {
        const names = decksRes[0].values
          .map((r) => String(r[0] ?? '').replace(/\x1f/g, ' :: '))
          .filter((n) => n && n !== 'Default');
        if (names.length > 0) detectedDeckName = names[0];
      }
    } catch {
      // Fall back to legacy col.decks JSON
      try {
        const colRes = sqlDb.exec('SELECT decks FROM col LIMIT 1');
        if (colRes[0]?.values?.[0]?.[0]) {
          const decksObj = JSON.parse(String(colRes[0].values[0][0]));
          const deckNames = Object.values(decksObj)
            .map((d) => (d as { name?: string })?.name)
            .filter((n): n is string => Boolean(n && n !== 'Default'));
          if (deckNames.length > 0) detectedDeckName = deckNames[0];
        }
      } catch {
        // Optional metadata
      }
    }

    const notesRes = sqlDb.exec('SELECT flds, tags FROM notes');
    const cards: VocabCard[] = [];

    if (notesRes[0]?.values) {
      for (const row of notesRes[0].values) {
        const fldsRaw = String(row[0] ?? '');
        const tagsRaw = String(row[1] ?? '').trim();
        const fields = fldsRaw.split('\x1f').map(stripHtml).filter(Boolean);
        if (fields.length < 2) continue;

        const front = fields[0];
        let back = fields[1];
        let reading: string | undefined;
        let example: string | undefined;

        if (language === 'jp' && fields.length >= 3 && /^[\u3040-\u30ff\s・ー]+$/.test(fields[1])) {
          reading = fields[1];
          back = fields[2];
          example = fields[3];
        } else if (language === 'en' && fields.length >= 3 && /^\/.*\/$/.test(fields[1])) {
          reading = fields[1];
          back = fields[2];
          example = fields[3];
        } else {
          example = fields[2];
        }

        if (!front || !back) continue;
        cards.push(
          buildNewCard(deckId, language, front, back, {
            reading,
            example,
            tags: tagsRaw ? tagsRaw.split(/\s+/).filter(Boolean) : ['anki'],
          })
        );
      }
    }

    return { cards, detectedDeckName };
  } finally {
    sqlDb.close();
  }
}

export function importPlainTextOrCsv(
  rawText: string,
  deckId: string,
  language: Language
): VocabCard[] {
  const lines = rawText
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  const cards: VocabCard[] = [];

  for (const line of lines) {
    let cols: string[];
    if (line.includes('\t')) {
      cols = line.split('\t');
    } else if (line.includes(';')) {
      cols = line.split(';');
    } else {
      cols = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          cols.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
      cols.push(current);
    }

    const cleaned = cols.map(stripHtml);
    if (cleaned.length < 2) continue;

    const front = cleaned[0];
    let back = cleaned[1];
    let reading: string | undefined;
    let example: string | undefined;

    if (cleaned.length >= 3) {
      if (language === 'jp' && /^[\u3040-\u30ff\s・ー]+$/.test(cleaned[1])) {
        reading = cleaned[1];
        back = cleaned[2];
        example = cleaned[3];
      } else if (language === 'en' && /^\/.*\/$/.test(cleaned[1])) {
        reading = cleaned[1];
        back = cleaned[2];
        example = cleaned[3];
      } else {
        reading = cleaned[2] || undefined;
        example = cleaned[3] || undefined;
      }
    }

    if (!front || !back) continue;
    cards.push(buildNewCard(deckId, language, front, back, { reading, example }));
  }

  return cards;
}

export async function ankiConnectRequest<T>(
  action: string,
  params: Record<string, unknown> = {},
  endpoint = 'http://127.0.0.1:8765'
): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, version: 6, params }),
  });

  if (!res.ok) {
    throw new Error(`AnkiConnect HTTP ${res.status}`);
  }
  const data = (await res.json()) as { result: T; error: string | null };
  if (data.error) {
    throw new Error(data.error);
  }
  return data.result;
}

export async function fetchAnkiConnectDecks(endpoint = 'http://127.0.0.1:8765'): Promise<string[]> {
  return ankiConnectRequest<string[]>('deckNames', {}, endpoint);
}

interface AnkiConnectNoteInfo {
  noteId: number;
  tags: string[];
  fields: Record<string, { value: string; order: number }>;
}

export async function pullDeckFromAnkiConnect(
  ankiDeckName: string,
  targetDeckId: string,
  language: Language,
  endpoint = 'http://127.0.0.1:8765'
): Promise<VocabCard[]> {
  const noteIds = await ankiConnectRequest<number[]>(
    'findNotes',
    { query: `deck:"${ankiDeckName.replace(/"/g, '\\"')}"` },
    endpoint
  );
  if (!noteIds.length) return [];

  const sliced = noteIds.slice(0, 500);
  const infos = await ankiConnectRequest<AnkiConnectNoteInfo[]>(
    'notesInfo',
    { notes: sliced },
    endpoint
  );

  const cards: VocabCard[] = [];
  for (const info of infos) {
    const orderedFields = Object.values(info.fields)
      .sort((a, b) => a.order - b.order)
      .map((f) => stripHtml(f.value))
      .filter(Boolean);
    if (orderedFields.length < 2) continue;

    const front = orderedFields[0];
    let back = orderedFields[1];
    let reading: string | undefined;
    let example: string | undefined;

    if (
      language === 'jp' &&
      orderedFields.length >= 3 &&
      /^[\u3040-\u30ff\s・ー]+$/.test(orderedFields[1])
    ) {
      reading = orderedFields[1];
      back = orderedFields[2];
      example = orderedFields[3];
    } else {
      example = orderedFields[2];
    }

    if (!front || !back) continue;
    cards.push(
      buildNewCard(targetDeckId, language, front, back, {
        reading,
        example,
        tags: info.tags.length ? info.tags : ['ankiconnect'],
      })
    );
  }

  return cards;
}
