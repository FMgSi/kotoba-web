import type { Deck, VocabCard } from '../types';
import { LEARN_APKG_CARDS } from './englishLearnDeck';

// Deterministic timestamps (in the past) so cards are immediately due & multi-device sync never clobbers real reviews
export const V2_SEED_TIME = 1795430000000;
export const V2_RETIRE_TIME = 1795436700000;

export const LEGACY_STARTER_DECK_IDS = [
  'deck-en-a2-ielts',
  'deck-jp-minna-1',
  'deck-jp-katakana-life',
];

export const LEGACY_STARTER_CARD_IDS = [
  ...Array.from({ length: 15 }, (_, i) => `en-${i + 1}`),
  ...Array.from({ length: 14 }, (_, i) => `jp-${i + 1}`),
  ...Array.from({ length: 6 }, (_, i) => `jp-k${i + 1}`),
];

export const STARTER_DECKS: Deck[] = [
  {
    id: 'deck-en-learn-apkg',
    name: 'learn (Anki Tiếng Anh — 202 thẻ)',
    language: 'en',
    description: 'Bộ từ vựng Tiếng Anh nhập trực tiếp từ file learn.apkg của bạn.',
    source: 'anki',
    createdAt: V2_SEED_TIME,
    updatedAt: V2_SEED_TIME,
  },
  {
    id: 'deck-jp-hiragana-basic',
    name: 'Bảng chữ cái Hiragana (46 chữ cơ bản)',
    language: 'jp',
    description: 'Luyện nghe, nhớ âm và viết tay cảm ứng từng chữ trong 46 chữ Hiragana cơ bản (あ → ん).',
    source: 'starter',
    createdAt: V2_SEED_TIME,
    updatedAt: V2_SEED_TIME,
  },
  {
    id: 'deck-jp-katakana-basic',
    name: 'Bảng chữ cái Katakana (46 chữ cơ bản)',
    language: 'jp',
    description: 'Luyện nghe, nhớ âm và viết tay cảm ứng từng chữ trong 46 chữ Katakana cơ bản (ア → ン).',
    source: 'starter',
    createdAt: V2_SEED_TIME,
    updatedAt: V2_SEED_TIME,
  },
];

function makeCard(
  id: string,
  deckId: string,
  language: 'en' | 'jp',
  front: string,
  back: string,
  extra: Partial<VocabCard> = {}
): VocabCard {
  return {
    id,
    deckId,
    language,
    front,
    back,
    due: V2_SEED_TIME,
    stability: 0,
    difficulty: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    state: 0,
    createdAt: V2_SEED_TIME,
    updatedAt: V2_SEED_TIME,
    ...extra,
  };
}

// [char, romaji, viGuide, exampleWord, exampleMeaning]
const HIRAGANA_46: [string, string, string, string, string][] = [
  ['あ', 'a', 'a (như "a")', 'あめ (ame)', 'mưa / kẹo'],
  ['い', 'i', 'i (như "i")', 'いぬ (inu)', 'con chó'],
  ['う', 'u', 'u (môi khép nhẹ, gần "ư")', 'うみ (umi)', 'biển'],
  ['え', 'e', 'e (như "ê" nhẹ)', 'えき (eki)', 'nhà ga'],
  ['お', 'o', 'o (như "ô" nhẹ)', 'おちゃ (ocha)', 'trà'],

  ['か', 'ka', 'ka (ca)', 'かさ (kasa)', 'cái ô'],
  ['き', 'ki', 'ki (ki)', 'き (ki)', 'cái cây'],
  ['く', 'ku', 'ku (cư)', 'くつ (kutsu)', 'đôi giày'],
  ['け', 'ke', 'ke (kê)', 'けさ (kesa)', 'sáng nay'],
  ['こ', 'ko', 'ko (cô)', 'こども (kodomo)', 'trẻ em'],

  ['さ', 'sa', 'sa (xa)', 'さかな (sakana)', 'con cá'],
  ['し', 'shi', 'shi (si / xi nhẹ)', 'しろ (shiro)', 'màu trắng'],
  ['す', 'su', 'su (xư)', 'すし (sushi)', 'sushi'],
  ['せ', 'se', 'se (xê)', 'せんせい (sensei)', 'giáo viên'],
  ['そ', 'so', 'so (xô)', 'そら (sora)', 'bầu trời'],

  ['た', 'ta', 'ta (ta)', 'たまご (tamago)', 'quả trứng'],
  ['ち', 'chi', 'chi (chi)', 'ちず (chizu)', 'bản đồ'],
  ['つ', 'tsu', 'tsu (tsư)', 'つくえ (tsukue)', 'cái bàn'],
  ['て', 'te', 'te (tê)', 'て (te)', 'bàn tay'],
  ['と', 'to', 'to (tô)', 'とけい (tokei)', 'đồng hồ'],

  ['な', 'na', 'na (na)', 'なつ (natsu)', 'mùa hè'],
  ['に', 'ni', 'ni (ni)', 'にほん (nihon)', 'Nhật Bản'],
  ['ぬ', 'nu', 'nu (nư)', 'いぬ (inu)', 'con chó'],
  ['ね', 'ne', 'ne (nê)', 'ねこ (neko)', 'con mèo'],
  ['の', 'no', 'no (nô)', 'のむ (nomu)', 'uống'],

  ['は', 'ha', 'ha (ha)', 'はな (hana)', 'bông hoa'],
  ['ひ', 'hi', 'hi (hi)', 'ひと (hito)', 'con người'],
  ['ふ', 'fu', 'fu (phư / hư nhẹ)', 'ふゆ (fuyu)', 'mùa đông'],
  ['へ', 'he', 'he (hê)', 'へや (heya)', 'căn phòng'],
  ['ほ', 'ho', 'ho (hô)', 'ほん (hon)', 'quyển sách'],

  ['ま', 'ma', 'ma (ma)', 'まど (mado)', 'cửa sổ'],
  ['み', 'mi', 'mi (mi)', 'みず (mizu)', 'nước'],
  ['む', 'mu', 'mu (mư)', 'むし (mushi)', 'côn trùng'],
  ['め', 'me', 'me (mê)', 'め (me)', 'đôi mắt'],
  ['も', 'mo', 'mo (mô)', 'もも (momo)', 'quả đào'],

  ['や', 'ya', 'ya (da / ia)', 'やま (yama)', 'ngọn núi'],
  ['ゆ', 'yu', 'yu (du / iu)', 'ゆき (yuki)', 'tuyết'],
  ['よ', 'yo', 'yo (dô / iô)', 'よる (yoru)', 'ban đêm'],

  ['ら', 'ra', 'ra (ra / la nhẹ)', 'らいねん (rainen)', 'năm sau'],
  ['り', 'ri', 'ri (ri / li nhẹ)', 'りんご (ringo)', 'quả táo'],
  ['る', 'ru', 'ru (rư / lư nhẹ)', 'くるま (kuruma)', 'xe ô tô'],
  ['れ', 're', 're (rê / lê nhẹ)', 'れいぞうこ (reizouko)', 'tủ lạnh'],
  ['ろ', 'ro', 'ro (rô / lô nhẹ)', 'ろく (roku)', 'số 6'],

  ['わ', 'wa', 'wa (oa)', 'わたし (watashi)', 'tôi'],
  ['を', 'wo', 'wo / o (trợ từ "ô")', 'みずを のむ (mizu o nomu)', 'uống nước'],
  ['ん', 'n', 'n (âm mũi "n/m/ng")', 'にほん (nihon)', 'Nhật Bản'],
];

const KATAKANA_46: [string, string, string, string, string][] = [
  ['ア', 'a', 'a (Katakana)', 'アイス (aisu)', 'kem'],
  ['イ', 'i', 'i (Katakana)', 'インク (inku)', 'mực'],
  ['ウ', 'u', 'u (Katakana)', 'ウイルス (uirusu)', 'vi-rút'],
  ['エ', 'e', 'e (Katakana)', 'エアコン (eakon)', 'máy lạnh'],
  ['オ', 'o', 'o (Katakana)', 'オレンジ (orenji)', 'quả cam'],

  ['カ', 'ka', 'ka (Katakana)', 'カメラ (kamera)', 'máy ảnh'],
  ['キ', 'ki', 'ki (Katakana)', 'キウイ (kiui)', 'quả kiwi'],
  ['ク', 'ku', 'ku (Katakana)', 'クラス (kurasu)', 'lớp học'],
  ['ケ', 'ke', 'ke (Katakana)', 'ケーキ (keeki)', 'bánh kem'],
  ['コ', 'ko', 'ko (Katakana)', 'コーヒー (koohii)', 'cà phê'],

  ['サ', 'sa', 'sa (Katakana)', 'サラダ (sarada)', 'xà lách'],
  ['シ', 'shi', 'shi (Katakana — 2 chấm nằm ngang)', 'シャツ (shatsu)', 'áo sơ mi'],
  ['ス', 'su', 'su (Katakana)', 'スポーツ (supootsu)', 'thể thao'],
  ['セ', 'se', 'se (Katakana)', 'セーター (seetaa)', 'áo len'],
  ['ソ', 'so', 'so (Katakana — 1 chấm dựng xuống)', 'ソファ (sofa)', 'ghế sofa'],

  ['タ', 'ta', 'ta (Katakana)', 'タクシー (takushii)', 'xe taxi'],
  ['チ', 'chi', 'chi (Katakana)', 'チーズ (chiizu)', 'phô mai'],
  ['ツ', 'tsu', 'tsu (Katakana — 2 chấm dựng đứng)', 'ツアー (tsuaa)', 'chuyến du lịch'],
  ['テ', 'te', 'te (Katakana)', 'テレビ (terebi)', 'tivi'],
  ['ト', 'to', 'to (Katakana)', 'トマト (tomato)', 'cà chua'],

  ['ナ', 'na', 'na (Katakana)', 'ナイフ (naifu)', 'con dao'],
  ['ニ', 'ni', 'ni (Katakana)', 'ニュース (nyuusu)', 'tin tức'],
  ['ヌ', 'nu', 'nu (Katakana)', 'ヌードル (nuudoru)', 'mì'],
  ['ネ', 'ne', 'ne (Katakana)', 'ネクタイ (nekutai)', 'cà vạt'],
  ['ノ', 'no', 'no (Katakana)', 'ノート (nooto)', 'quyển vở'],

  ['ハ', 'ha', 'ha (Katakana)', 'ハンバーガー (hanbaagaa)', 'bánh hamburger'],
  ['ヒ', 'hi', 'hi (Katakana)', 'ヒント (hinto)', 'gợi ý'],
  ['フ', 'fu', 'fu (Katakana)', 'フルーツ (furuutsu)', 'trái cây'],
  ['ヘ', 'he', 'he (Katakana)', 'ヘルメット (herumetto)', 'mũ bảo hiểm'],
  ['ホ', 'ho', 'ho (Katakana)', 'ホテル (hoteru)', 'khách sạn'],

  ['マ', 'ma', 'ma (Katakana)', 'マスク (masuku)', 'khẩu trang'],
  ['ミ', 'mi', 'mi (Katakana)', 'ミルク (miruku)', 'sữa'],
  ['ム', 'mu', 'mu (Katakana)', 'ムード (muudo)', 'tâm trạng'],
  ['メ', 'me', 'me (Katakana)', 'メモ (memo)', 'ghi chú'],
  ['モ', 'mo', 'mo (Katakana)', 'モニター (monitaa)', 'màn hình'],

  ['ヤ', 'ya', 'ya (Katakana)', 'ヤシ (yashi)', 'cây dừa'],
  ['ユ', 'yu', 'yu (Katakana)', 'ユニフォーム (yunifoomu)', 'đồng phục'],
  ['ヨ', 'yo', 'yo (Katakana)', 'ヨーグルト (yooguruto)', 'sữa chua'],

  ['ラ', 'ra', 'ra (Katakana)', 'ラーメン (raamen)', 'mì ramen'],
  ['リ', 'ri', 'ri (Katakana)', 'リスト (risuto)', 'danh sách'],
  ['ル', 'ru', 'ru (Katakana)', 'ルール (ruuru)', 'quy tắc'],
  ['レ', 're', 're (Katakana)', 'レモン (remon)', 'quả chanh'],
  ['ロ', 'ro', 'ro (Katakana)', 'ロボット (robotto)', 'rô-bốt'],

  ['ワ', 'wa', 'wa (Katakana)', 'ワイン (wain)', 'rượu vang'],
  ['ヲ', 'wo', 'wo / o (Katakana)', 'ヲ (wo)', 'âm wo trong Katakana'],
  ['ン', 'n', 'n (Katakana — chấm ngang, kéo lên)', 'パン (pan)', 'bánh mì'],
];

const ENGLISH_LEARN_CARDS: VocabCard[] = LEARN_APKG_CARDS.map((raw) =>
  makeCard(raw.id, 'deck-en-learn-apkg', 'en', raw.front, raw.back, {
    reading: raw.reading,
    example: raw.example,
    exampleVi: raw.exampleVi,
    tags: raw.tags ?? ['learn-apkg'],
  })
);

const HIRAGANA_CARDS: VocabCard[] = HIRAGANA_46.map(([ch, romaji, guide, ex, exVi], idx) =>
  makeCard(`jp-hira-${idx + 1}`, 'deck-jp-hiragana-basic', 'jp', ch, `${romaji}`, {
    reading: ch,
    romaji,
    example: ex,
    exampleVi: exVi,
    notes: `Cách đọc: ${guide}`,
    tags: ['hiragana', 'alphabet'],
  })
);

const KATAKANA_CARDS: VocabCard[] = KATAKANA_46.map(([ch, romaji, guide, ex, exVi], idx) =>
  makeCard(`jp-kata-${idx + 1}`, 'deck-jp-katakana-basic', 'jp', ch, `${romaji}`, {
    reading: ch,
    romaji,
    example: ex,
    exampleVi: exVi,
    notes: `Cách đọc: ${guide}`,
    tags: ['katakana', 'alphabet'],
  })
);

export const STARTER_CARDS: VocabCard[] = [
  ...ENGLISH_LEARN_CARDS,
  ...HIRAGANA_CARDS,
  ...KATAKANA_CARDS,
];
