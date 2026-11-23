import type { StudyLesson, StudyStage } from '../types';

export const JP_STUDY_STAGES: StudyStage[] = [
  {
    id: 'jp-stage-1',
    language: 'jp',
    order: 1,
    badge: 'Chặng 1 · 0 → Tiền N5',
    title: 'Làm Chủ 2 Bảng Chữ Cái & Quy Tắc Phát Âm',
    goal: 'Thuộc làu 46 Hiragana, 46 Katakana, âm đục, âm ghép, trường âm và âm ngắt (っ) để đọc-viết mượt trước khi vào Minna no Nihongo.',
    estimatedTime: '2 tuần (~1 giờ/ngày)',
    recommendedBooks: [
      '2 Deck Hiragana (46 chữ) & Katakana (46 chữ) viết tay ngay trong KotobaLab',
      'Video Nhập môn & Bảng chữ cái — Kênh YouTube Dũng Mori (@DungMori)',
    ],
    youtubeChannel: {
      label: 'Kênh YouTube: Dũng Mori (@DungMori)',
      url: 'https://www.youtube.com/@DungMori/playlists',
      source: 'YouTube · Dũng Mori',
    },
  },
  {
    id: 'jp-stage-2',
    language: 'jp',
    order: 2,
    badge: 'Chặng 2 · JLPT N5',
    title: 'Nền Tảng Sơ Cấp — Minna no Nihongo Bài 1–25 & 100 Kanji',
    goal: 'Nắm chắc khung câu SOV, trợ từ nền tảng, chia 3 nhóm động từ (ます・て・ない・た), thể thông thường và ~100 Kanji N5.',
    estimatedTime: '10 tuần (~1.5–2 giờ/ngày)',
    recommendedBooks: [
      'Minna no Nihongo Sơ cấp 1 (Bản tiếng Nhật + Giải thích ngữ pháp, Bài 1–25)',
      'Series Ngữ pháp & Tổng hợp N5 — Dũng Mori (@DungMori)',
      'Kanji Look and Learn / 100 Kanji N5',
    ],
    youtubeChannel: {
      label: 'Tổng hợp bài giảng N5 — Dũng Mori',
      url: 'https://www.youtube.com/@DungMori/search?query=N5+Minna',
      source: 'YouTube · Dũng Mori N5',
    },
  },
  {
    id: 'jp-stage-3',
    language: 'jp',
    order: 3,
    badge: 'Chặng 3 · JLPT N4',
    title: 'Tăng Tốc Sơ Trung Cấp — Minna Bài 26–50 & 300 Kanji',
    goal: 'Thành thạo thể Khả năng, Ý chí, Điều kiện (と/ば/たら/なら), Bị động, Sai khiến, Cho-Nhận và Kính ngữ cơ bản để đỗ chắc JLPT N4.',
    estimatedTime: '12 tuần (~1.5–2 giờ/ngày)',
    recommendedBooks: [
      'Minna no Nihongo Sơ cấp 2 (Bài 26–50)',
      'Series Tất cả ngữ pháp N4 — Dũng Mori (@DungMori)',
      'Mimikara Oboeru N4 (Từ vựng & Nghe hiểu)',
    ],
    youtubeChannel: {
      label: 'Tổng hợp ngữ pháp & Minna N4 — Dũng Mori',
      url: 'https://www.youtube.com/@DungMori/search?query=N4',
      source: 'YouTube · Dũng Mori N4',
    },
  },
  {
    id: 'jp-stage-4',
    language: 'jp',
    order: 4,
    badge: 'Chặng 4 · JLPT N3',
    title: 'Chinh Phục Trung Cấp JLPT N3 (~650 Kanji)',
    goal: 'Nắm trọn hệ thống ngữ pháp trung cấp theo sắc thái, từ ghép Kanji (Jukugo), kỹ thuật Đọc hiểu & Nghe hiểu N3 để thi đỗ N3 tự tin.',
    estimatedTime: '16 tuần (~2 giờ/ngày)',
    recommendedBooks: [
      'Shin Kanzen Master N3 (Ngữ pháp & Đọc hiểu)',
      'Mimikara Oboeru N3 (Từ vựng & Ngữ pháp)',
      'Series Ngữ pháp & Chữa đề N3 — Dũng Mori (@DungMori)',
    ],
    youtubeChannel: {
      label: 'Tổng hợp Ngữ pháp & Đề thi N3 — Dũng Mori',
      url: 'https://www.youtube.com/@DungMori/search?query=N3',
      source: 'YouTube · Dũng Mori N3',
    },
  },
];

export const JP_STUDY_LESSONS: StudyLesson[] = [
  // ================= STAGE 1: 0 -> Pre-N5 =================
  {
    id: 'jp-l1',
    language: 'jp',
    stageId: 'jp-stage-1',
    order: 1,
    title: 'Bài 1: Âm Đục, Âm Ghép, Trường Âm & Âm Ngắt (っ)',
    subtitle: 'Sau khi thuộc 46 Hiragana & 46 Katakana, đây là 4 quy tắc sống còn để đọc đúng mọi từ tiếng Nhật.',
    targetBandOrLevel: '0 → Tiền N5',
    durationLabel: 'Tuần 1–2',
    booksAndMaterials: [
      '2 Deck viết tay Hiragana & Katakana trong mục Từ vựng của KotobaLab',
      'Video hướng dẫn phát âm & bảng chữ cái — Dũng Mori',
    ],
    resources: [
      {
        label: 'Học Bảng chữ cái & Phát âm — Dũng Mori',
        url: 'https://www.youtube.com/@DungMori/search?query=b%E1%BA%A3ng+ch%E1%BB%AF+c%C3%A1i',
        source: 'YouTube · @DungMori',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Âm đục (゛/゜) & Âm ghép (ゃ・ゅ・ょ nhỏ)',
        body: 'Thêm dấu phẩy ゛ (tenten) biến hàng か→が, さ→ざ, た→だ, は→ば; thêm vòng tròn ゜ (maru) biến は→ぱ. Khi ghép chữ hàng い với ゃ/ゅ/ょ nhỏ sẽ thành 1 âm duy nhất: き + ゃ = きゃ (kya), し + ゅ = しゅ (shu).',
        examples: [
          { text: 'びょういん (byouin) vs びよういん (biyouin)', meaning: 'Chữ ょ nhỏ (bệnh viện) khác hoàn toàn chữ よ to (tiệm làm tóc)!' },
        ],
      },
      {
        heading: '2. Trường âm (kéo dài 2 nhịp) & Âm ngắt (っ nhỏ)',
        body: 'Trường âm kéo dài nguyên âm (Katakana dùng dấu gạch ー như コーヒー; Hiragana thêm あ/い/う/え/お). Âm ngắt っ nhỏ tạo 1 nhịp dừng rồi gấp đôi phụ âm sau (きって = kitte). Sai độ dài âm sẽ đổi hẳn nghĩa từ!',
        examples: [
          { text: 'おばさん (cô/bác gái) vs おばあさん (bà)', meaning: 'Chỉ khác 1 trường âm あ!' },
          { text: 'きて (hãy đến) vs きって (tem thư)', meaning: 'Chỉ khác 1 âm ngắt っ nhỏ!' },
        ],
      },
    ],
    checklist: [
      'Luyện viết tay xong ít nhất 20 chữ Hiragana trong mục Từ vựng',
      'Luyện viết tay xong ít nhất 20 chữ Katakana trong mục Từ vựng',
      'Đạt 100% 4 bài tập phân biệt âm đục, trường âm & âm ngắt bên dưới',
    ],
    vocabPack: [
      { front: 'おばあさん', reading: 'おばあさん', romaji: 'obaasan', back: 'bà (có trường âm あ)', example: 'おばあさんは げんきです。', exampleVi: 'Bà vẫn khỏe mạnh.' },
      { front: 'きって', reading: 'きって', romaji: 'kitte', back: 'tem thư (có âm ngắt っ)', example: 'きってを かいます。', exampleVi: 'Tôi mua tem thư.' },
      { front: 'びょういん', reading: 'びょういん', romaji: 'byouin', back: 'bệnh viện (âm ghép びょ)', example: 'びょういんへ いきます。', exampleVi: 'Tôi đi đến bệnh viện.' },
      { front: 'コーヒー', reading: 'コーヒー', romaji: 'koohii', back: 'cà phê (trường âm Katakana ー)', example: 'コーヒーが すきです。', exampleVi: 'Tôi thích cà phê.' },
    ],
    exercises: [
      {
        id: 'jp-l1-q1',
        type: 'mcq',
        prompt: 'Từ nào sau đây có nghĩa là "bệnh viện" (byouin)?',
        options: ['びよういん', 'びょういん', 'ぴょういん', 'びょいん'],
        correctAnswer: 'びょういん',
        explanation: 'びょういん (びょ + う + い + ん) là bệnh viện; びよういん (chữ よ to) là tiệm làm tóc!',
      },
      {
        id: 'jp-l1-q2',
        type: 'mcq',
        prompt: 'Nghe phát âm và chọn từ đúng:',
        audioText: 'きって',
        options: ['きて (hãy đến)', 'きって (tem thư)', 'きいて (hãy nghe)'],
        correctAnswer: 'きって (tem thư)',
        explanation: 'Âm ngắt っ tạo 1 nhịp dừng rõ ở giữa (kit-te = tem thư).',
      },
      {
        id: 'jp-l1-q3',
        type: 'fill',
        prompt: 'Gõ chữ Hiragana tương ứng với Romaji "gakkou" (trường học — có âm ngắt っ và trường âm う):',
        correctAnswer: 'がっこう',
        acceptedAnswers: ['がっこう', 'gakkou'],
        explanation: 'ga (が) + kk (っ + こ) + u (う) = がっこう.',
      },
      {
        id: 'jp-l1-q4',
        type: 'mcq',
        prompt: 'Trong Katakana, trường âm (kéo dài nguyên âm) được viết bằng ký hiệu nào?',
        options: ['っ nhỏ', 'ー (dấu gạch ngang)', '゛ (tenten)', '゜ (maru)'],
        correctAnswer: 'ー (dấu gạch ngang)',
        explanation: 'Katakana dùng dấu gạch trường âm ー (ví dụ: コーヒー, ケーキ, ノート).',
      },
    ],
  },

  // ================= STAGE 2: N5 =================
  {
    id: 'jp-l2',
    language: 'jp',
    stageId: 'jp-stage-2',
    order: 2,
    title: 'Bài 2 (N5): Minna Bài 1–5 — Khung Câu SOV & 6 Trợ Từ Cốt Lõi',
    subtitle: 'Nắm vững trật tự Chủ ngữ – Tân ngữ – Động từ (SOV) và bộ trợ từ cơ bản は・の・も・へ・で・に.',
    targetBandOrLevel: 'JLPT N5 · Minna 1–5',
    durationLabel: 'Tuần 3–4',
    booksAndMaterials: [
      'Minna no Nihongo Sơ cấp 1 — Bài 1 đến Bài 5',
      'Video bài giảng Minna Bài 1–5 — Dũng Mori',
    ],
    resources: [
      {
        label: 'Học Minna no Nihongo Bài 1–5 — Dũng Mori',
        url: 'https://www.youtube.com/@DungMori/search?query=Minna+b%C3%A0i+1',
        source: 'YouTube · @DungMori',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Cấu trúc câu tiếng Nhật ngược với tiếng Việt (Động từ ở CUỐI câu)',
        body: 'Câu danh từ: N1 は N2 です (N1 là N2). Phủ định: N1 は N2 じゃありません. Hỏi: thêm か ở cuối câu.',
        examples: [
          { text: 'わたしは がくせいです。', meaning: 'Tôi là học sinh.' },
          { text: 'これは にほんごの ほんです。', meaning: 'Đây là quyển sách tiếng Nhật (N1 の N2 = N2 của N1).' },
        ],
      },
      {
        heading: '2. 3 Trợ từ đi lại (Minna Bài 5) cực hay nhầm',
        body: 'へ (e): chỉ phương hướng đi tới đâu (にほんへ いきます). で (de): chỉ phương tiện di chuyển (でんしゃで いきます). に (ni): chỉ mốc thời gian cụ thể (7じに おきます).',
        examples: [
          { text: 'まいにち バスで がっこうへ いきます。', meaning: 'Mỗi ngày tôi đi đến trường bằng xe buýt.' },
        ],
      },
    ],
    checklist: [
      'Xem video giải thích Minna Bài 1–5 trên kênh Dũng Mori',
      'Luyện nghe bài "Minna Bài 1 & Bài 2" trong mục Luyện Nghe của KotobaLab',
      'Lưu bộ từ vựng Bài 2 vào Anki và tập viết tay',
    ],
    vocabPack: [
      { front: 'いきます', reading: 'いきます', romaji: 'ikimasu', back: 'đi (Kanji: 行きます)', example: 'あした とうきょうへ いきます。', exampleVi: 'Ngày mai tôi đi Tokyo.' },
      { front: 'きます', reading: 'きます', romaji: 'kimasu', back: 'đến (Kanji: 来ます)', example: 'べとなむから きました。', exampleVi: 'Tôi đến từ Việt Nam.' },
      { front: 'かえります', reading: 'かえります', romaji: 'kaerimasu', back: 'về (nhà/nước) (Kanji: 帰ります)', example: '6じに うちへ かえります。', exampleVi: '6 giờ tôi về nhà.' },
      { front: 'でんしゃ', reading: 'でんしゃ', romaji: 'densha', back: 'tàu điện (Kanji: 電車)', example: 'でんしゃで かいしゃへ いきます。', exampleVi: 'Tôi đi đến công ty bằng tàu điện.' },
    ],
    exercises: [
      {
        id: 'jp-l2-q1',
        type: 'mcq',
        prompt: 'Chọn trợ từ đúng: "わたしは まいにち じてんしゃ (___) がっこうへ いきます。" (đi học bằng xe đạp)',
        options: ['に', 'で', 'を', 'の'],
        correctAnswer: 'で',
        explanation: 'Trợ từ で đứng sau phương tiện di chuyển (じてんしゃで = bằng xe đạp).',
      },
      {
        id: 'jp-l2-q2',
        type: 'fill',
        prompt: 'Điền 1 chữ Hiragana trợ từ thích hợp: "これは わたし (___) かさです。" (Cái ô của tôi)',
        correctAnswer: 'の',
        acceptedAnswers: ['の', 'no'],
        explanation: 'Trợ từ の biểu thị sở hữu: わたしの かさ (cái ô của tôi).',
      },
      {
        id: 'jp-l2-q3',
        type: 'mcq',
        prompt: 'Điền trợ từ chỉ mốc thời gian cụ thể: "あさ 6じ (___) おきます。"',
        options: ['に', 'で', 'へ', 'は'],
        correctAnswer: 'に',
        explanation: 'Trợ từ に đi sau mốc thời gian có con số cụ thể (6じに = vào lúc 6 giờ).',
      },
      {
        id: 'jp-l2-q4',
        type: 'order',
        prompt: 'Sắp xếp câu đúng chuẩn tiếng Nhật (Nghĩa: Tôi đi Nhật Bản bằng máy bay):',
        tokens: ['わたしは', 'ひこうきで', 'にほんへ', 'いきます。'],
        correctAnswer: 'わたしは ひこうきで にほんへ いきます。',
        explanation: 'Trật tự tự nhiên: Chủ ngữ (わたしは) → Phương tiện (ひこうきで) → Đích đến (にほんへ) → Động từ cuối câu (いきます).',
      },
    ],
  },

  {
    id: 'jp-l3',
    language: 'jp',
    stageId: 'jp-stage-2',
    order: 3,
    title: 'Bài 3 (N5): Minna Bài 6–12 — Tính Từ い / な, Quá Khứ & So Sánh',
    subtitle: 'Phân biệt chính xác 2 nhóm tính từ tiếng Nhật, cách chia phủ định/quá khứ và cấu trúc so sánh.',
    targetBandOrLevel: 'JLPT N5 · Minna 6–12',
    durationLabel: 'Tuần 5–6',
    booksAndMaterials: [
      'Minna no Nihongo Sơ cấp 1 — Bài 6 đến Bài 12',
      'Video Ngữ pháp Minna Bài 8–12 — Dũng Mori',
    ],
    resources: [
      {
        label: 'Cách chia tính từ い & な — Dũng Mori',
        url: 'https://www.youtube.com/@DungMori/search?query=t%C3%ADnh+t%E1%BB%AB+N5',
        source: 'YouTube · @DungMori',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Bảng chia Tính từ đuôi い vs Tính từ đuôi な',
        body: 'Tính từ い (vd: おいしい): Phủ định bỏ い thêm くない (おいしくない), Quá khứ bỏ い thêm かった (おいしかった). Chú ý ngoại lệ: いい → よくない / よかった!\nTính từ な (vd: しずか, きれい): Chia giống Danh từ → しずかじゃありません / しずかでした. Khi đứng trước danh từ phải giữ な (しずかな まち).',
        examples: [
          { text: 'きのうは あつかったです。', meaning: 'Hôm qua trời đã nóng (あつい → あつかった).' },
          { text: 'きれい (な-adj!) → きれいな はな', meaning: 'Cảnh giác: きれい, ゆうめい, きらい kết thúc bằng い nhưng là Tính từ đuôi な!' },
        ],
      },
      {
        heading: '2. Câu so sánh (Minna Bài 12)',
        body: 'A は B より [Tính từ] です (A ... hơn B). So sánh nhất: [Phạm vi] で A が いちばん [Tính từ] です.',
      },
    ],
    checklist: [
      'Thuộc lòng 4 tính từ đuôi な "giả dạng" đuôi い: きれい, ゆうめい, きらい, げんき',
      'Đặt 3 câu so sánh dùng より và いちばん',
      'Đạt 100% 4 bài tập chia tính từ bên dưới',
    ],
    vocabPack: [
      { front: 'おいしい', reading: 'おいしい', romaji: 'oishii', back: 'ngon (い-adj)', example: 'にほんの ラーメンは おいしいです。', exampleVi: 'Mì ramen của Nhật rất ngon.' },
      { front: 'きれい', reading: 'きれい', romaji: 'kirei', back: 'đẹp, sạch sẽ (な-adj!)', example: 'へやは とても きれいです。', exampleVi: 'Căn phòng rất sạch đẹp.' },
      { front: 'しずか', reading: 'しずか', romaji: 'shizuka', back: 'yên tĩnh (な-adj)', example: 'ここは しずかな ところです。', exampleVi: 'Ở đây là một nơi yên tĩnh.' },
      { front: 'いそがしい', reading: 'いそがしい', romaji: 'isogashii', back: 'bận rộn (い-adj)', example: 'きのうは いそがしかったです。', exampleVi: 'Hôm qua tôi đã rất bận.' },
    ],
    exercises: [
      {
        id: 'jp-l3-q1',
        type: 'mcq',
        prompt: 'Chia đúng quá khứ của tính từ "いい" (tốt): "きのうの てんきは ___ です。"',
        options: ['いかった', 'よかった', 'いでした', 'いいかった'],
        correctAnswer: 'よかった',
        explanation: 'いい là tính từ bất quy tắc duy nhất: いい → よくない → よかった → よくなかった.',
      },
      {
        id: 'jp-l3-q2',
        type: 'mcq',
        prompt: 'Chọn cách ghép ĐÚNG với danh từ (nghĩa: bông hoa đẹp):',
        options: ['きれい はな', 'きれいな はな', 'きれいの はな', 'きれいで はな'],
        correctAnswer: 'きれいな はな',
        explanation: 'きれい là Tính từ đuôi な (bẫy kinh điển N5!) nên khi bổ nghĩa danh từ phải thêm な → きれいな はな.',
      },
      {
        id: 'jp-l3-q3',
        type: 'fill',
        prompt: 'Chia thể phủ định của "たかい" (đắt): "この かばんは ___ です。" (không đắt)',
        correctAnswer: 'たかくない',
        acceptedAnswers: ['たかくない', 'takakunai'],
        explanation: 'Tính từ đuôi い phủ định: bỏ い + くない → たかくない.',
      },
      {
        id: 'jp-l3-q4',
        type: 'order',
        prompt: 'Ghép thành câu so sánh đúng (Nghĩa: Mùa hè nóng hơn mùa xuân):',
        tokens: ['なつは', 'はるより', 'あついです。'],
        correctAnswer: 'なつは はるより あついです。',
        explanation: 'Mẫu so sánh: A は B より [Adj] です.',
      },
    ],
  },

  {
    id: 'jp-l4',
    language: 'jp',
    stageId: 'jp-stage-2',
    order: 4,
    title: 'Bài 4 (N5): Minna Bài 13–19 — Chia 3 Nhóm Động Từ & Thể て・ない・た',
    subtitle: 'Bài học QUAN TRỌNG NHẤT của cả chặng N5: làm chủ chia thể động từ để mở khóa 80% ngữ pháp tiếng Nhật.',
    targetBandOrLevel: 'JLPT N5 · Minna 13–19',
    durationLabel: 'Tuần 7–9',
    booksAndMaterials: [
      'Minna no Nihongo Sơ cấp 1 — Bài 14 (Thể て), Bài 17 (Thể ない), Bài 19 (Thể た)',
      'Video Bài hát chia thể て siêu dễ nhớ — Dũng Mori',
    ],
    resources: [
      {
        label: 'Cách chia 3 nhóm động từ & Thể て — Dũng Mori',
        url: 'https://www.youtube.com/@DungMori/search?query=chia+th%E1%BB%83+%E3%81%A6',
        source: 'YouTube · @DungMori',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Phân loại 3 Nhóm Động Từ (từ thể ます)',
        body: '• Nhóm III (chỉ 2 từ): きます (đến), します (làm) và [N + します].\n• Nhóm II: Trước ます là cột え (たべます, ねます) + ~10 động từ đặc biệt cột い (みます, おきます, かります, います, できます...).\n• Nhóm I: Toàn bộ động từ còn lại trước ます là cột い (かきます, のみます, はなします...).',
      },
      {
        heading: '2. Quy tắc chia Thể て (và Thể た chia hệt vậy, chỉ đổi て→た)',
        body: '• Nhóm II & III: Bỏ ます + て (たべます → たべて, します → して).\n• Nhóm I: い・ち・り → って | み・び・に → んで | き → いて (ngoại lệ いきます → いって!) | ぎ → いで | し → して.',
        examples: [
          { text: 'ここに なまえを かいて ください。', meaning: 'Hãy viết tên vào đây (Vて + ください).' },
          { text: 'にほんへ いった ことが あります。', meaning: 'Tôi đã từng đi Nhật (Vた + ことが あります).' },
        ],
      },
    ],
    checklist: [
      'Nghe và nhẩm thuộc bài vè chia thể て (i-chi-ri tte, mi-bi-ni nde, ki-ite, gi-ide, shi-shite)',
      'Tự chia 10 động từ sang cả 3 thể: て, ない, た',
      'Đạt 100% 4 câu thực hành chia thể bên dưới',
    ],
    vocabPack: [
      { front: 'かきます', reading: 'かきます', romaji: 'kakimasu', back: 'viết (Nhóm I → かいて)', example: 'ノートに かんじを かいて ください。', exampleVi: 'Hãy viết Kanji vào vở.' },
      { front: 'のみます', reading: 'のみます', romaji: 'nomimasu', back: 'uống (Nhóm I → のんで)', example: 'みずを のんで います。', exampleVi: 'Tôi đang uống nước.' },
      { front: 'たべます', reading: 'たべます', romaji: 'tabemasu', back: 'ăn (Nhóm II → たべて)', example: 'ここで たべても いいですか。', exampleVi: 'Tôi ăn ở đây có được không?' },
      { front: 'わすれます', reading: 'わすれます', romaji: 'wasuremasu', back: 'quên (Nhóm II → わすれないで)', example: 'かさを わすれないで ください。', exampleVi: 'Xin đừng quên ô.' },
    ],
    exercises: [
      {
        id: 'jp-l4-q1',
        type: 'mcq',
        prompt: 'Chia động từ "のみます" (uống — Nhóm I) sang Thể て:',
        options: ['のみて', 'のんで', 'のって', 'のいて'],
        correctAnswer: 'のんで',
        explanation: 'Động từ Nhóm I kết thúc bằng み (mi-bi-ni → んで): のみます → のんで.',
      },
      {
        id: 'jp-l4-q2',
        type: 'fill',
        prompt: 'Chia ngoại lệ cực hay ra thi: "いきます" (đi) sang Thể て (gõ Hiragana):',
        correctAnswer: 'いって',
        acceptedAnswers: ['いって', 'itte'],
        explanation: 'いきます là ngoại lệ nổi tiếng nhất của Nhóm I: không phải いいて mà là いって!',
      },
      {
        id: 'jp-l4-q3',
        type: 'mcq',
        prompt: 'Hoàn thành câu "Tôi đã từng ăn sushi": "すしを ___ ことが あります。"',
        options: ['たべる', 'たべて', 'たべた', 'たべない'],
        correctAnswer: 'たべた',
        explanation: 'Mẫu diễn tả kinh nghiệm "đã từng làm gì": Vた + ことが あります → たべた ことが あります.',
      },
      {
        id: 'jp-l4-q4',
        type: 'order',
        prompt: 'Ghép câu dấu sao (Nghĩa: Tôi chụp ảnh ở đây có được không?):',
        tokens: ['ここで', 'しゃしんを', 'とっても', 'いいですか。'],
        correctAnswer: 'ここで しゃしんを とっても いいですか。',
        explanation: 'Mẫu xin phép: Vても いいですか (とります → とって + も いいですか).',
      },
    ],
  },

  {
    id: 'jp-l5',
    language: 'jp',
    stageId: 'jp-stage-2',
    order: 5,
    title: 'Bài 5 (N5): Minna Bài 20–25 — Thể Thông Thường, Bổ Nghĩa & 100 Kanji N5',
    subtitle: 'Chốt hạ trình độ JLPT N5: chuyển từ lịch sự sang thể thông thường (ふつうけい) và bắt đầu đọc Kanji N5.',
    targetBandOrLevel: 'JLPT N5 · Chốt N5',
    durationLabel: 'Tuần 10–12',
    booksAndMaterials: [
      'Minna no Nihongo Sơ cấp 1 — Bài 20 đến Bài 25',
      'Video Tổng hợp tất cả Ngữ pháp N5 + 100 Kanji N5 — Dũng Mori',
    ],
    resources: [
      {
        label: 'Tổng hợp toàn bộ ngữ pháp N5 — Dũng Mori',
        url: 'https://www.youtube.com/@DungMori/search?query=T%E1%BA%A5t+c%E1%BA%A3+ng%E1%BB%AF+ph%C3%A1p+N5',
        source: 'YouTube · @DungMori',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Thể thông thường (Plain Form) & `～と思います`',
        body: 'Trước と おもいます (tôi nghĩ là...) và と いいました (đã nói là...) BẮT BUỘC dùng thể thông thường (Vる / Vない / Vた / い-adj bỏ です / な-adj & N + だ).',
        examples: [
          { text: 'あしたは あめが ふると おもいます。', meaning: 'Tôi nghĩ ngày mai trời sẽ mưa (ふります → ふる).' },
          { text: 'これは きのう かった ほんです。', meaning: 'Đây là quyển sách tôi đã mua hôm qua (mệnh đề bổ nghĩa đứng TRƯỚC danh từ).' },
        ],
      },
      {
        heading: '2. Bắt đầu bật chế độ "Kana + Kanji" khi ôn Kanji N5',
        body: 'Khi xong Bài 25 Minna, hãy bắt đầu nạp các chữ Kanji N5 nền tảng (日・月・火・水・木・金・土・人・学・生・先・本・食・行・見) vào Anki và chọn chế độ "Kana + Kanji" trên bảng viết tay KotobaLab để tập viết Kanji!',
      },
    ],
    checklist: [
      'Xem video Tổng hợp toàn bộ ngữ pháp N5 của Dũng Mori để hệ thống hóa Bài 1–25',
      'Thử làm 1 đề thi thử JLPT N5 hoàn chỉnh',
      'Lưu 4 từ Kanji N5 của bài vào Anki và thử viết tay ở chế độ "Kana + Kanji"',
    ],
    vocabPack: [
      { front: '日本', reading: 'にほん', romaji: 'nihon', back: 'Nhật Bản (NHẬT BẢN)', example: '日本へ 行きたいです。', exampleVi: 'Tôi muốn đi Nhật Bản.' },
      { front: '学生', reading: 'がくせい', romaji: 'gakusei', back: 'học sinh, sinh viên (HỌC SINH)', example: 'わたしは 大学の 学生です。', exampleVi: 'Tôi là sinh viên đại học.' },
      { front: '先生', reading: 'せんせい', romaji: 'sensei', back: 'giáo viên (TIÊN SINH)', example: '先生に 質問しました。', exampleVi: 'Tôi đã hỏi giáo viên.' },
      { front: '食べる', reading: 'たべる', romaji: 'taberu', back: 'ăn — thể từ điển (THỰC)', example: '毎日 野菜を 食べます。', exampleVi: 'Mỗi ngày tôi ăn rau.' },
    ],
    exercises: [
      {
        id: 'jp-l5-q1',
        type: 'mcq',
        prompt: 'Điền đúng thể trước "とおもいます": "にほんごは おもしろい ___ と おもいます。"',
        options: ['です', 'だ', '(không thêm gì)', 'な'],
        correctAnswer: '(không thêm gì)',
        explanation: 'Tính từ đuôi い ở thể thông thường giữ nguyên đuôi い (KHÔNG thêm だ và bỏ です) → おもしろいと おもいます.',
      },
      {
        id: 'jp-l5-q2',
        type: 'mcq',
        prompt: 'Cách đọc đúng của từ Kanji N5 "学生" là gì?',
        options: ['せんせい', 'がくせい', 'がっこう', 'だいがく'],
        correctAnswer: 'がくせい',
        explanation: '学生 đọc là がくせい (học sinh/sinh viên); 先生 là せんせい.',
      },
      {
        id: 'jp-l5-q3',
        type: 'fill',
        prompt: 'Chuyển động từ "みます" (xem) sang thể từ điển (Plain Form — Vる):',
        correctAnswer: 'みる',
        acceptedAnswers: ['みる', 'miru'],
        explanation: 'みます là động từ Nhóm II: bỏ ます + る → みる.',
      },
      {
        id: 'jp-l5-q4',
        type: 'order',
        prompt: 'Ghép thành câu có mệnh đề bổ nghĩa danh từ (Nghĩa: Đây là chiếc bánh mẹ tôi đã làm):',
        tokens: ['これは', 'ははが', 'つくった', 'ケーキです。'],
        correctAnswer: 'これは ははが つくった ケーキです。',
        explanation: 'Trong mệnh đề bổ nghĩa danh từ, chủ ngữ phụ dùng trợ từ が (ははが つくった) và đứng ngay trước danh từ ケーキ.',
      },
    ],
  },

  // ================= STAGE 3: N4 =================
  {
    id: 'jp-l6',
    language: 'jp',
    stageId: 'jp-stage-3',
    order: 6,
    title: 'Bài 6 (N4): Minna Bài 26–32 — Thể Khả Năng, Thể Ý Chí & ～んです',
    subtitle: 'Bước vào N4: nói năng lực bản thân, dự định tương lai và giải thích lý do tự nhiên như người Nhật.',
    targetBandOrLevel: 'JLPT N4 · Minna 26–32',
    durationLabel: 'Tuần 13–15',
    booksAndMaterials: [
      'Minna no Nihongo Sơ cấp 2 — Bài 26 đến Bài 32',
      'Series Ngữ pháp Minna Sơ cấp 2 — Dũng Mori',
    ],
    resources: [
      {
        label: 'Học Minna N4 Bài 26–32 — Dũng Mori',
        url: 'https://www.youtube.com/@DungMori/search?query=Minna+b%C3%A0i+27',
        source: 'YouTube · @DungMori',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Thể Khả năng (Potential Form — Minna Bài 27)',
        body: '• Nhóm I: đổi cột い → cột え + ます (はなします → はなせます).\n• Nhóm II: bỏ ます + られます (たべます → たべられます).\n• Nhóm III: きます → こられます | します → できます.\nLưu ý: Trợ từ を thường chuyển thành が (にほんごが はなせます).',
      },
      {
        heading: '2. Thể Ý chí (Volitional Form — Minna Bài 31)',
        body: 'Nhóm I đổi cột い → cột お + う (いきます → いこう); Nhóm II bỏ ます + よう (たべます → たべよう). Dùng trong mẫu: V(ý chí) + と おもっています (tôi đang dự định...).',
        examples: [
          { text: 'らいねん N3を うけようと おもっています。', meaning: 'Năm sau tôi đang dự định thi N3.' },
        ],
      },
    ],
    checklist: [
      'Học kỹ cách chia Thể Khả năng & Thể Ý chí (bước đệm quan trọng của N4)',
      'Đặt 3 câu với ～んです để giải thích lý do / hoàn cảnh',
      'Hoàn thành 4 bài tập N4 bên dưới',
    ],
    vocabPack: [
      { front: '話せます', reading: 'はなせます', romaji: 'hanasemasu', back: 'có thể nói (thể khả năng của 話します)', example: '少し 日本語が 話せます。', exampleVi: 'Tôi có thể nói một chút tiếng Nhật.' },
      { front: '予約する', reading: 'よやくする', romaji: 'yoyaku suru', back: 'đặt chỗ trước (DỰ ƯỚC)', example: 'ホテルを 予約しようと 思っています。', exampleVi: 'Tôi dự định sẽ đặt phòng khách sạn.' },
      { front: '習慣', reading: 'しゅうかん', romaji: 'shuukan', back: 'thói quen, tập quán (TẬP QUÁN)', example: '毎日 勉強する 習慣が 大切です。', exampleVi: 'Thói quen học mỗi ngày rất quan trọng.' },
      { front: '予定', reading: 'よてい', romaji: 'yotei', back: 'dự định, lịch trình (DỰ ĐỊNH)', example: '週末の 予定は ありますか。', exampleVi: 'Cuối tuần bạn có dự định gì không?' },
    ],
    exercises: [
      {
        id: 'jp-l6-q1',
        type: 'mcq',
        prompt: 'Chuyển "かきます" (viết — Nhóm I) sang Thể Khả năng (có thể viết):',
        options: ['かきられます', 'かけます', 'かきます', 'かこう'],
        correctAnswer: 'かけます',
        explanation: 'Nhóm I đổi cột い (き) sang cột え (け) + ます → かけます (có thể viết).',
      },
      {
        id: 'jp-l6-q2',
        type: 'mcq',
        prompt: 'Chọn trợ từ chuẩn với thể khả năng: "わたしは かんじ (___) よめます。"',
        options: ['を', 'が', 'に', 'で'],
        correctAnswer: 'が',
        explanation: 'Động từ ở thể khả năng thường dùng trợ từ が thay cho を → かんじが よめます.',
      },
      {
        id: 'jp-l6-q3',
        type: 'fill',
        prompt: 'Chia "いきます" (đi) sang Thể Ý chí (Volitional) để ghép vào "___ と おもっています":',
        correctAnswer: 'いこう',
        acceptedAnswers: ['いこう', 'ikou'],
        explanation: 'Nhóm I đổi き → こ + う → いこう (dự định đi).',
      },
      {
        id: 'jp-l6-q4',
        type: 'order',
        prompt: 'Ghép thành câu giải thích tự nhiên dùng ～んです (Nghĩa: Vì bị đau đầu nên tôi về sớm):',
        tokens: ['あたまが', 'いたいんですから、', 'はやく', 'かえります。'],
        correctAnswer: 'あたまが いたいんですから、 はやく かえります。',
        explanation: '～んです tạo sắc thái giải thích hoàn cảnh cho người nghe hiểu lý do.',
      },
    ],
  },

  {
    id: 'jp-l7',
    language: 'jp',
    stageId: 'jp-stage-3',
    order: 7,
    title: 'Bài 7 (N4): Minna Bài 33–38 — 4 Mẫu Điều Kiện & Tự/Tha Động Từ',
    subtitle: 'Phân biệt rành mạch と・ば・たら・なら và cặp Tự động từ / Tha động từ (hay ra nhất đề JLPT N4).',
    targetBandOrLevel: 'JLPT N4 · Minna 33–38',
    durationLabel: 'Tuần 16–18',
    booksAndMaterials: [
      'Minna no Nihongo Sơ cấp 2 — Bài 29, 35, 36',
      'Video phân biệt と・ば・たら・なら — Dũng Mori',
    ],
    resources: [
      {
        label: 'Phân biệt と・ば・たら・なら — Dũng Mori',
        url: 'https://www.youtube.com/@DungMori/search?query=%E3%81%A8+%E3%81%B0+%E3%81%9F%E3%82%89+%E3%81%AA%E3%82%89',
        source: 'YouTube · @DungMori',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Phân biệt nhanh 4 câu điều kiện',
        body: '• と: Quy luật tự nhiên, bấm nút máy móc, chỉ đường (mùa xuân đến thì hoa nở) — Vế sau KHÔNG dùng mệnh lệnh/ý chí.\n• たら: Đa năng nhất! Dùng được cả ý chí, lời mời, giả định (nếu trời mưa thì ở nhà nhé).\n• ば: Điều kiện giả định logic (nếu chăm học thì sẽ đỗ).\n• なら: Tiếp nhận chủ đề người kia vừa nhắc ("Nếu là đi Nhật thì...").',
      },
      {
        heading: '2. Tự động từ (が) vs Tha động từ (を)',
        body: 'Tự động từ chỉ trạng thái tự nhiên đi với が (ドアが あいています = cửa đang mở). Tha động từ có người tác động đi với を (ドアを あけます = tôi mở cửa).',
      },
    ],
    checklist: [
      'Học thuộc 10 cặp Tự động từ / Tha động từ hay thi nhất (あく/あける, しまる/しめる, つく/つける, きえる/けす, はじまる/はじめる)',
      'Đặt 4 câu ví dụ tương ứng với と, ば, たら, なら',
      'Đạt 100% 4 bài tập bên dưới',
    ],
    vocabPack: [
      { front: '開きます', reading: 'あきます', romaji: 'akimasu', back: '(cửa) tự mở — Tự động từ (đi với が)', example: 'ドアが 開いています。', exampleVi: 'Cửa đang mở.' },
      { front: '開けます', reading: 'あけます', romaji: 'akemasu', back: 'mở (cửa) — Tha động từ (đi với を)', example: '窓を 開けて ください。', exampleVi: 'Hãy mở cửa sổ ra.' },
      { front: '消えます', reading: 'きえます', romaji: 'kiemasu', back: '(đèn/lửa) tắt — Tự động từ', example: '電気が 消えました。', exampleVi: 'Đèn đã tắt.' },
      { front: '消します', reading: 'けします', romaji: 'keshimasu', back: 'tắt (đèn/điều hòa) — Tha động từ', example: '寝る前に 電気を 消します。', exampleVi: 'Trước khi ngủ tôi tắt đèn.' },
    ],
    exercises: [
      {
        id: 'jp-l7-q1',
        type: 'mcq',
        prompt: 'Điền đúng động từ: "へやの でんきが ___ います。" (đèn trong phòng đang bật — trạng thái)',
        options: ['つけて', 'ついて', 'けして', 'あけて'],
        correctAnswer: 'ついて',
        explanation: 'Trợ từ が + trạng thái đang bật → phải dùng Tự động từ つきます → ついています.',
      },
      {
        id: 'jp-l7-q2',
        type: 'mcq',
        prompt: 'Hoàn thành câu chỉ quy luật máy móc: "この ボタンを おす ___、きっぷが でます。"',
        options: ['と', 'なら', 'て', 'ながら'],
        correctAnswer: 'と',
        explanation: 'Thao tác máy móc hiển nhiên xảy ra kết quả (bấm nút này thì vé ra) → Vる + と.',
      },
      {
        id: 'jp-l7-q3',
        type: 'fill',
        prompt: 'Chia thể điều kiện たら của "ふります" (mưa): "あした あめが ___、でかけません。"',
        correctAnswer: 'ふったら',
        acceptedAnswers: ['ふったら', 'futtara'],
        explanation: 'Thể た của ふります là ふった + ら → ふったら.',
      },
      {
        id: 'jp-l7-q4',
        type: 'mcq',
        prompt: 'Bạn nói: "Hè này tôi muốn đi du lịch Nhật Bản." Người kia đáp: "Nếu đi Nhật thì Kyoto đẹp lắm!" — Dùng mẫu điều kiện nào tự nhiên nhất?',
        options: ['にほんへ いくと', 'にほんへ いくなら', 'にほんへ いけば'],
        correctAnswer: 'にほんへ いくなら',
        explanation: 'なら dùng để đón chủ đề người đối diện vừa nhắc tới rồi đưa ra lời khuyên/gợi ý.',
      },
    ],
  },

  {
    id: 'jp-l8',
    language: 'jp',
    stageId: 'jp-stage-3',
    order: 8,
    title: 'Bài 8 (N4): Minna Bài 39–45 — Bị Động, Sai Khiến & Cho-Nhận',
    subtitle: 'Chinh phục "bộ ba khó nhằn" nhất N4 bằng công thức nhận diện chủ ngữ & trợ từ に cực rõ ràng.',
    targetBandOrLevel: 'JLPT N4 · Minna 39–45',
    durationLabel: 'Tuần 19–21',
    booksAndMaterials: [
      'Minna no Nihongo Sơ cấp 2 — Bài 37 (Bị động), Bài 41 (Cho nhận), Bài 48 (Sai khiến)',
      'Video phân biệt Bị động & Sai khiến — Dũng Mori',
    ],
    resources: [
      {
        label: 'Bị động & Sai khiến tiếng Nhật — Dũng Mori',
        url: 'https://www.youtube.com/@DungMori/search?query=b%E1%BB%8B+%C4%91%E1%BB%99ng+sai+khi%E1%BA%BFn',
        source: 'YouTube · @DungMori',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Thể Bị động (Passive — Bài 37)',
        body: '• Nhóm I: cột い → cột あ + れます (しかります → しかられます).\n• Nhóm II: bỏ ます + られます (ほめます → ほめられます).\n• Nhóm III: きます → こられます | します → されます.\nĐối tượng gây ra hành động luôn đi với trợ từ に (せんせいに ほめられました = được cô khen).',
      },
      {
        heading: '2. Cho - Nhận (あげる・もらう・くれる)',
        body: '• あげる: Tôi/người khác cho người khác (hướng RA ngoài).\n• くれる: Người khác cho TÔI / người nhà tôi (hướng VÀO tôi!).\n• もらう: Tôi nhận TỪ ai đó (đi với に / から).',
        examples: [
          { text: 'ともだちが にほんごを おしえて くれました。', meaning: 'Bạn tôi đã dạy tiếng Nhật cho tôi (hướng vào tôi → くれます).' },
        ],
      },
    ],
    checklist: [
      'Phân biệt rõ lúc nào dùng くれる (người khác làm cho mình) vs もらう (mình nhận từ người khác)',
      'Tập chia 5 động từ sang Bị động và Sai khiến',
      'Làm đúng 4 câu thực hành bên dưới',
    ],
    vocabPack: [
      { front: '褒めます', reading: 'ほめます', romaji: 'homemasu', back: 'khen ngợi (Bị động: 褒められます)', example: '先生に 褒められました。', exampleVi: 'Tôi đã được thầy giáo khen.' },
      { front: '叱ります', reading: 'しかります', romaji: 'shikarimasu', back: 'mắng (Bị động: 叱られます)', example: '母に 叱られました。', exampleVi: 'Tôi đã bị mẹ mắng.' },
      { front: '手伝います', reading: 'てつだいます', romaji: 'tetsudaimasu', back: 'giúp đỡ', example: '兄が 引っ越しを 手伝って くれました。', exampleVi: 'Anh trai đã giúp tôi chuyển nhà.' },
      { front: '参加します', reading: 'さんかします', romaji: 'sanka shimasu', back: 'tham gia (THAM GIA)', example: '会議に 参加させて ください。', exampleVi: 'Xin hãy cho phép tôi tham gia cuộc họp.' },
    ],
    exercises: [
      {
        id: 'jp-l8-q1',
        type: 'mcq',
        prompt: 'Điền từ đúng (Nghĩa: Bạn tôi đã cho tôi quyển từ điển): "ともだちが わたしに じしょを ___。"',
        options: ['あげました', 'くれました', 'もらいました', 'やりました'],
        correctAnswer: 'くれました',
        explanation: 'Chủ ngữ là "ともだちが" thực hiện hành động hướng VÀO "わたしに" → bắt buộc dùng くれました!',
      },
      {
        id: 'jp-l8-q2',
        type: 'mcq',
        prompt: 'Điền đúng động từ Bị động: "わたしは せんせいに ___。" (Tôi đã được thầy giáo khen)',
        options: ['ほめました', 'ほめられました', 'ほめさせました', 'ほめられます'],
        correctAnswer: 'ほめられました',
        explanation: 'ほめます (Nhóm II) chia bị động quá khứ → ほめられました.',
      },
      {
        id: 'jp-l8-q3',
        type: 'fill',
        prompt: 'Điền 1 trợ từ chỉ người gây ra hành động bị động: "あめ (___) ふられて、ぬれました。" (Bị mưa rơi trúng nên ướt)',
        correctAnswer: 'に',
        acceptedAnswers: ['に', 'ni'],
        explanation: 'Trong câu bị động, tác nhân gây ra hành động luôn đi với trợ từ に (あめに ふられて).',
      },
      {
        id: 'jp-l8-q4',
        type: 'order',
        prompt: 'Ghép thành câu nhờ vả / xin phép dùng Sai khiến (Nghĩa: Xin hãy cho tôi nghỉ hôm nay):',
        tokens: ['きょうは', 'はやく', 'かえらせて', 'ください。'],
        correctAnswer: 'きょうは はやく かえらせて ください。',
        explanation: 'Mẫu V(sai khiến thể て) + ください = "Xin hãy cho phép tôi làm..." (cực lịch sự và hay gặp trong N4–N3!).',
      },
    ],
  },

  {
    id: 'jp-l9',
    language: 'jp',
    stageId: 'jp-stage-3',
    order: 9,
    title: 'Bài 9 (N4): Minna Bài 46–50 — Phỏng Đoán & Kính Ngữ Cơ Bản',
    subtitle: 'Phân biệt そう・よう・らしい và 2 loại Kính ngữ (Tôn kính ngữ & Khiêm nhường ngữ) để chốt chắc JLPT N4.',
    targetBandOrLevel: 'JLPT N4 · Chốt N4',
    durationLabel: 'Tuần 22–24',
    booksAndMaterials: [
      'Minna no Nihongo Sơ cấp 2 — Bài 47, 49, 50',
      'Video Tổng hợp toàn bộ Ngữ pháp N4 & Kính ngữ — Dũng Mori',
    ],
    resources: [
      {
        label: 'Tổng hợp toàn bộ ngữ pháp N4 — Dũng Mori',
        url: 'https://www.youtube.com/@DungMori/search?query=T%E1%BA%A5t+c%E1%BA%A3+ng%E1%BB%AF+ph%C3%A1p+N4',
        source: 'YouTube · @DungMori',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Phân biệt 2 kiểu `そう` (Cực hay bẫy ở JLPT N4–N3!)',
        body: '• V bỏ ます / Adj bỏ い + そうです = "Trông có vẻ..." (nhìn bằng mắt: おいしそうです = trông có vẻ ngon).\n• Thể thông thường + そうです = "Nghe nói là..." (truyền đạt tin: てんきよほうに よると、あしたは あめだそうです).',
      },
      {
        heading: '2. Kính ngữ đặc biệt phải thuộc lòng (Bài 49–50)',
        body: '• Tôn kính ngữ (nâng hành động của sếp/khách lên): いきます/きます/います → いらっしゃいます | たべます/のみます → めしあがります | いいます → おっしゃいます.\n• Khiêm nhường ngữ (hạ hành động của MÌNH xuống): いきます/きます → まいります | いいます → もうします | みます → はいけんします.',
      },
    ],
    checklist: [
      'Học thuộc bảng 8 cặp động từ Kính ngữ đặc biệt (いらっしゃいます, まいります, めしあがります, いただきます...)',
      'Làm 1 đề thi thử JLPT N4 đầy đủ 3 phần',
      'Hoàn thành 4 câu kiểm tra chốt N4 bên dưới',
    ],
    vocabPack: [
      { front: 'いらっしゃいます', reading: 'いらっしゃいます', romaji: 'irasshaimasu', back: 'đi / đến / ở (Tôn kính ngữ)', example: '社長は もう いらっしゃいましたか。', exampleVi: 'Giám đốc đã đến chưa ạ?' },
      { front: 'まいります', reading: 'まいります', romaji: 'mairimasu', back: 'đi / đến (Khiêm nhường ngữ — dùng cho mình)', example: 'ベトナムから まいりました。', exampleVi: 'Tôi đến từ Việt Nam ạ.' },
      { front: 'もうします', reading: 'もうします', romaji: 'moushimasu', back: 'nói / tên là (Khiêm nhường ngữ)', example: 'ホアンと もうします。', exampleVi: 'Tôi tên là Hoàng ạ.' },
      { front: 'めしあがります', reading: 'めしあがります', romaji: 'meshiagarimasu', back: 'ăn / uống (Tôn kính ngữ)', example: 'どうぞ めしあがって ください。', exampleVi: 'Xin mời anh/chị dùng bữa ạ.' },
    ],
    exercises: [
      {
        id: 'jp-l9-q1',
        type: 'mcq',
        prompt: 'Nhìn chiếc bánh trông rất ngon, bạn nói thế nào?',
        options: ['おいしいそうです', 'おいしそうです', 'おいしかったそうです', 'おいしくそうです'],
        correctAnswer: 'おいしそうです',
        explanation: 'Trông có vẻ (nhìn trực quan): Tính từ い bỏ い + そうです → おいしそうです (còn おいしいそうです lại nghĩa là "nghe nói ngon").',
      },
      {
        id: 'jp-l9-q2',
        type: 'mcq',
        prompt: 'Trong buổi phỏng vấn, khi tự giới thiệu "Tôi đến từ Việt Nam", dùng động từ Khiêm nhường ngữ nào chuẩn nhất?',
        options: ['いらっしゃいました', 'まいりました', 'めしあがりました', 'おっしゃいました'],
        correctAnswer: 'まいりました',
        explanation: 'Nói về bản thân mình (hạ mình xuống) dùng Khiêm nhường ngữ まいります → べとなむから まいりました.',
      },
      {
        id: 'jp-l9-q3',
        type: 'mcq',
        prompt: 'Hỏi thầy giáo "Thầy có uống cà phê không ạ?", dùng Tôn kính ngữ nào đúng?',
        options: ['いただきますか', 'めしあがりますか', 'もうしますか', 'まいりますか'],
        correctAnswer: 'めしあがりますか',
        explanation: 'Hành động ăn/uống của thầy giáo (nâng lên) dùng Tôn kính ngữ めしあがります.',
      },
      {
        id: 'jp-l9-q4',
        type: 'order',
        prompt: 'Ghép thành câu truyền đạt thông tin (Nghĩa: Theo dự báo thời tiết, nghe nói ngày mai sẽ có tuyết):',
        tokens: ['てんきよほうに', 'よると、', 'あしたは', 'ゆきが', 'ふるそうです。'],
        correctAnswer: 'てんきよほうに よると、 あしたは ゆきが ふるそうです。',
        explanation: 'Mẫu truyền đạt nguồn tin chuẩn N4–N3: [Nguồn] に よると、... [Thể thông thường] そうです.',
      },
    ],
  },

  // ================= STAGE 4: N3 =================
  {
    id: 'jp-l10',
    language: 'jp',
    stageId: 'jp-stage-4',
    order: 10,
    title: 'Bài 10 (N3): Ngữ Pháp N3 Phần 1 — Nguyên Nhân, Nhượng Bộ & Thời Điểm',
    subtitle: 'Chuyển sang trung cấp N3: nắm sắc thái tinh tế của おかげで / せいで, うちに, たびに và にもかかわらず.',
    targetBandOrLevel: 'JLPT N3 · Trung cấp 1',
    durationLabel: 'Tuần 25–29',
    booksAndMaterials: [
      'Shin Kanzen Master N3 Ngữ pháp (Chương 1–4) hoặc Mimikara Oboeru N3',
      'Series Tổng hợp Ngữ pháp N3 — Dũng Mori',
    ],
    resources: [
      {
        label: 'Tổng hợp Ngữ pháp N3 — Dũng Mori',
        url: 'https://www.youtube.com/@DungMori/search?query=ng%E1%BB%AF+ph%C3%A1p+N3',
        source: 'YouTube · @DungMori',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Sắc thái Nguyên nhân tích cực vs tiêu cực (Cực hay thi N3!)',
        body: '• ～おかげで / ～おかげだ: "Nhờ có..." (chỉ kết quả TỐT, lòng biết ơn).\n• ～せいで / ～せいだ: "Tại vì..." (chỉ kết quả XẤU, đổ lỗi).\n• ～ために: Nguyên nhân trung lập (trang trọng hơn から/ので).',
        examples: [
          { text: '毎日 練習した おかげで、N3に 合格しました。', meaning: 'Nhờ luyện tập mỗi ngày nên tôi đã đỗ N3.' },
          { text: '寝坊した せいで、電車に 遅れました。', meaning: 'Tại ngủ quên nên tôi đã bị trễ tàu.' },
        ],
      },
      {
        heading: '2. Thời điểm & Tần suất trung cấp',
        body: '• ～うちに: "Tranh thủ lúc còn..." (冷めないうちに 食べてください = Hãy ăn khi còn chưa nguội).\n• ～たびに: "Cứ mỗi lần... thì lại..." (この写真を 見るたびに、家族を 思い出す).',
      },
    ],
    checklist: [
      'Lập bảng so sánh 4 mẫu nguyên nhân: おかげで, せいで, ために, によって',
      'Đặt 1 câu cá nhân cho mỗi mẫu ngữ pháp ở trên',
      'Đạt 100% 4 câu thực chiến JLPT N3 bên dưới',
    ],
    vocabPack: [
      { front: '合格', reading: 'ごうかく', romaji: 'goukaku', back: 'thi đỗ (HỢP CÁCH)', example: 'おかげで N3に 合格できました。', exampleVi: 'Nhờ đó tôi đã có thể thi đỗ N3.' },
      { front: '寝坊', reading: 'ねぼう', romaji: 'nebou', back: 'ngủ quên, dậy muộn', example: '寝坊した せいで 遅刻しました。', exampleVi: 'Tại ngủ quên nên tôi đi muộn.' },
      { front: '思い出す', reading: 'おもいだす', romaji: 'omoidasu', back: 'nhớ lại, hồi tưởng', example: 'この曲を 聞くたびに、高校時代を 思い出す。', exampleVi: 'Mỗi lần nghe bài hát này tôi lại nhớ thời cấp 3.' },
      { front: '影響', reading: 'えいきょう', romaji: 'eikyou', back: 'ảnh hưởng (ẢNH HƯỞNG)', example: '天気は 仕事に 大きな 影響を 与える。', exampleVi: 'Thời tiết gây ảnh hưởng lớn đến công việc.' },
    ],
    exercises: [
      {
        id: 'jp-l10-q1',
        type: 'mcq',
        prompt: 'Chọn đáp án đúng sắc thái N3: "せんせいが ていねいに おしえて くれた ___、にほんごが じょうずに なりました。"',
        options: ['せいで', 'おかげで', 'たびに', 'わりに'],
        correctAnswer: 'おかげで',
        explanation: 'Kết quả tốt đẹp (giỏi tiếng Nhật hơn) nhờ sự giúp đỡ của cô giáo → bắt buộc dùng おかげで.',
      },
      {
        id: 'jp-l10-q2',
        type: 'mcq',
        prompt: 'Chọn đáp án đúng: "わすれない ___、メモに かいて おきます。" (Tranh thủ lúc chưa quên thì ghi chú sẵn)',
        options: ['うちに', 'せいで', 'たびに', 'とおりに'],
        correctAnswer: 'うちに',
        explanation: 'Vない + うちに = "tranh thủ lúc còn chưa..." (わすれないうちに = tranh thủ lúc chưa quên).',
      },
      {
        id: 'jp-l10-q3',
        type: 'fill',
        prompt: 'Điền mẫu ngữ pháp nghĩa "cứ mỗi lần..." (3 chữ Hiragana): "にほんへ いく ___、おみやげを かいます。"',
        correctAnswer: 'たびに',
        acceptedAnswers: ['たびに', 'tabini'],
        explanation: 'Vる / Nの + たびに = "cứ mỗi lần... thì lại...".',
      },
      {
        id: 'jp-l10-q4',
        type: 'order',
        prompt: 'Câu sắp xếp dấu sao ★ chuẩn JLPT N3 (Nghĩa: Tại vì trời mưa to nên trận đấu bị hủy):',
        tokens: ['おおあめの', 'せいで、', 'しあいが', 'ちゅうしに', 'なりました。'],
        correctAnswer: 'おおあめの せいで、 しあいが ちゅうしに なりました。',
        explanation: 'Danh từ + の + せいで (kết quả xấu: trận đấu bị hủy ちゅうしに なりました).',
      },
    ],
  },

  {
    id: 'jp-l11',
    language: 'jp',
    stageId: 'jp-stage-4',
    order: 11,
    title: 'Bài 11 (N3): Ngữ Pháp N3 Phần 2 — Sắc Thái Phủ Định & Đọc Hiểu Ý Tác Giả',
    subtitle: 'Làm chủ わけではない, ことにする/ことになる, っぱなし và kỹ thuật đọc tìm quan điểm tác giả (筆者の考え).',
    targetBandOrLevel: 'JLPT N3 · Trung cấp 2',
    durationLabel: 'Tuần 30–34',
    booksAndMaterials: [
      'Shin Kanzen Master N3 Đọc hiểu & Ngữ pháp',
      'Đọc 1 bài báo NHK News Web Easy mỗi ngày (có sẵn Furigana & Audio)',
    ],
    resources: [
      {
        label: 'Luyện đọc hiểu N3 miễn phí — NHK News Web Easy',
        url: 'https://www3.nhk.or.jp/news/easy/',
        source: 'NHK News Web Easy (Miễn phí)',
      },
      {
        label: 'Kỹ thuật đọc hiểu N3 — Dũng Mori',
        url: 'https://www.youtube.com/@DungMori/search?query=%C4%91%E1%BB%8Dc+hi%E1%BB%83u+N3',
        source: 'YouTube · @DungMori',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Các cấu trúc hay xuất hiện trong bài Đọc hiểu N3',
        body: '• ～わけではない: "Không hẳn là..." (phủ định một phần — hay xuất hiện khi tác giả phản bác định kiến).\n• ～ことにする (tự mình quyết định) vs ～ことになる (quyết định khách quan / quy định từ bên ngoài).\n• ～てしまう: Làm xong hết / Lỡ làm mất (tiếc nuối).',
        examples: [
          { text: '高いものが いつも いい わけではない。', meaning: 'Không hẳn đồ đắt lúc nào cũng tốt.' },
          { text: '来月 東京へ 出張する ことに なりました。', meaning: 'Công ty đã quyết định tháng sau tôi đi công tác Tokyo.' },
        ],
      },
      {
        heading: '2. Mẹo đọc hiểu N3: Tìm câu chốt của tác giả',
        body: 'Ý chính của tác giả hiếm khi nằm ở câu mở đầu. Hãy chú ý các từ báo hiệu quan điểm: しかし / だが (nhưng), つまり (tóm lại là), ～のではないか (chẳng phải là... sao?), ～べきだ (nên...).',
      },
    ],
    checklist: [
      'Đọc 2 bài tin ngắn trên NHK News Web Easy và lưu 10 từ mới vào Anki',
      'Phân biệt rõ ことにする (tự quyết) và ことになる (được quyết định)',
      'Hoàn thành 4 câu đọc hiểu & ngữ pháp N3 bên dưới',
    ],
    vocabPack: [
      { front: '出張', reading: 'しゅっちょう', romaji: 'shucchou', back: 'đi công tác (XUẤT TRƯƠNG)', example: '来週 大阪へ 出張する ことに なった。', exampleVi: 'Tuần sau có lịch tôi đi công tác Osaka.' },
      { front: '解決', reading: 'かいけつ', romaji: 'kaiketsu', back: 'giải quyết (GIẢI QUYẾT)', example: 'みんなで 問題を 解決しましょう。', exampleVi: 'Hãy cùng nhau giải quyết vấn đề.' },
      { front: '筆者', reading: 'ひっしゃ', romaji: 'hissha', back: 'tác giả bài viết (BÚT GIẢ)', example: '筆者の 考えに 最も 近いものを 選びなさい。', exampleVi: 'Hãy chọn đáp án gần nhất với suy nghĩ của tác giả.' },
      { front: '努力', reading: 'どりょく', romaji: 'doryoku', back: 'nỗ lực (NỖ LỰC)', example: '毎日の 努力が 成功に つながる。', exampleVi: 'Nỗ lực mỗi ngày dẫn đến thành công.' },
    ],
    exercises: [
      {
        id: 'jp-l11-q1',
        type: 'mcq',
        prompt: 'Chọn đáp án đúng: "にほんごが きらいな ___ が、かんじが むずかしいと おもいます。" (Không hẳn là ghét tiếng Nhật, nhưng tôi thấy Kanji khó)',
        options: ['わけではない', 'にちがいない', 'はずだ', 'ことにした'],
        correctAnswer: 'わけではない',
        explanation: 'Phủ định nhẹ / phủ định một phần ("không hẳn là...") → わけではない.',
      },
      {
        id: 'jp-l11-q2',
        type: 'mcq',
        prompt: 'Bạn TỰ đặt mục tiêu cho bản thân mỗi ngày học 30 phút. Chọn mẫu câu đúng:',
        options: [
          'まいにち 30ぷん べんきょうする ことに しています。',
          'まいにち 30ぷん べんきょうする ことに なっています。',
          'まいにち 30ぷん べんきょうする せいです。',
        ],
        correctAnswer: 'まいにち 30ぷん べんきょうする ことに しています。',
        explanation: 'ことに しています diễn tả thói quen do CHÍNH BẢN THÂN tự quyết định và duy trì; ことに なっています là quy định của tập thể/công ty.',
      },
      {
        id: 'jp-l11-q3',
        type: 'mcq',
        context: 'Đoạn đọc N3: "スマホは とても べんりだ。しかし、ねる まえに ながい じかん つかうと、すいみんの しつが さがる。だから、ねる 30ぷん まえには スマホを おく べきだと おもう。"',
        prompt: 'Tác giả (筆者) muốn khuyên điều gì nhất?',
        options: [
          'Không nên mua điện thoại thông minh nữa.',
          'Nên đặt điện thoại xuống 30 phút trước khi ngủ để ngủ ngon hơn.',
          'Điện thoại không có lợi ích gì cả.',
        ],
        correctAnswer: 'Nên đặt điện thoại xuống 30 phút trước khi ngủ để ngủ ngon hơn.',
        explanation: 'Sau từ chuyển hướng しかし và kết luận だから, tác giả nhấn mạnh "ねる 30ぷん まえには スマホを おく べきだ".',
      },
      {
        id: 'jp-l11-q4',
        type: 'fill',
        prompt: 'Điền 1 cụm thể hiện "lỡ làm mất / đã quên béng": "かぎを うちへ わすれて ___。" (chuyển しまいます sang quá khứ lịch sự)',
        correctAnswer: 'しまいました',
        acceptedAnswers: ['しまいました', 'shimaimashita'],
        explanation: 'Vて + しまいました diễn tả sự tiếc nuối khi lỡ làm điều gì đó (lỡ quên chìa khóa ở nhà).',
      },
    ],
  },

  {
    id: 'jp-l12',
    language: 'jp',
    stageId: 'jp-stage-4',
    order: 12,
    title: 'Bài 12 (N3): Chiến Thuật Nghe Hiểu (Choukai), Kanji Ghép & Luyện Đề N3',
    subtitle: 'Tổng ôn 30 ngày cuối trước kỳ thi JLPT N3: xử lý 5 Mondai Nghe hiểu, mẹo đoán Kanji ghép (Jukugo) và phân bổ thời gian.',
    targetBandOrLevel: 'JLPT N3 · Về đích N3',
    durationLabel: 'Tuần 35–40',
    booksAndMaterials: [
      'Bộ đề thi JLPT N3 chính thức các năm gần đây (2018–2025)',
      'Mimikara Oboeru N3 Nghe hiểu + Video Chữa đề N3 (@DungMori)',
    ],
    resources: [
      {
        label: 'Chữa đề & Chiến thuật thi JLPT N3 — Dũng Mori',
        url: 'https://www.youtube.com/@DungMori/search?query=ch%E1%BB%AFa+%C4%91%E1%BB%81+N3',
        source: 'YouTube · @DungMori',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Chiến thuật 5 phần Nghe hiểu JLPT N3 (40 phút)',
        body: '• Mondai 1 (Hành động tiếp theo): Tập trung đúng nhân vật đề hỏi (男の人 hay 女の人?), chú ý câu "まず / 先に" (làm trước tiên).\n• Mondai 2 (Điểm chính): Tranh thủ 15 giây trống đọc trước 4 đáp án.\n• Mondai 4 (Phản xạ nhanh 1 câu): Bắt ngay các mẫu nói tắt văn nói (～ちゃう = ～てしまう, ～とく = ～ておく, ～なきゃ = ～なければならない)!',
      },
      {
        heading: '2. Học 650 Kanji N3 theo cụm từ ghép (Jukugo) & Âm Hán Việt',
        body: 'Người Việt có lợi thế cực lớn nhờ âm Hán Việt! Thay vì học chữ rời, hãy gom các từ cùng 1 chữ Kanji: 決 (QUYẾT) → 決定 (quyết định), 解決 (giải quyết), 決心 (quyết tâm).',
      },
    ],
    checklist: [
      'Thuộc 5 dạng nói tắt kinh điển của Mondai 4 Nghe hiểu N3 (ちゃう・とく・てる・なきゃ・って)',
      'Giải ít nhất 3 đề thi thử JLPT N3 trọn vẹn bấm giờ (mục tiêu ≥ 95/180 điểm, không liệt môn nào dưới 19/60)',
      'Hoàn thành bài kiểm tra tổng kết N3 bên dưới!',
    ],
    vocabPack: [
      { front: '決定', reading: 'けってい', romaji: 'kettei', back: 'quyết định (QUYẾT ĐỊNH)', example: '日程が 決定しました。', exampleVi: 'Lịch trình đã được quyết định.' },
      { front: '経験', reading: 'けいけん', romaji: 'keiken', back: 'kinh nghiệm (KINH NGHIỆM)', example: 'いい 経験に なりました。', exampleVi: 'Đó đã trở thành một kinh nghiệm quý báu.' },
      { front: '準備', reading: 'じゅんび', romaji: 'junbi', back: 'chuẩn bị (CHUẨN BỊ)', example: '試験の 準備は できていますか。', exampleVi: 'Bạn đã chuẩn bị cho kỳ thi xong chưa?' },
      { front: '確認', reading: 'かくにん', romaji: 'kakunin', back: 'xác nhận (XÁC NHẬN)', example: 'メールを 確認して ください。', exampleVi: 'Vui lòng xác nhận lại email.' },
    ],
    exercises: [
      {
        id: 'jp-l12-q1',
        type: 'mcq',
        prompt: 'Trong Mondai 4 Nghe hiểu N3 (văn nói), cụm "もう たべちゃった" là dạng nói tắt của mẫu nào?',
        options: ['もう たべて おいた', 'もう たべて しまった', 'もう たべなければ ならない', 'もう たべて いる'],
        correctAnswer: 'もう たべて しまった',
        explanation: 'Văn nói siêu phổ biến ở N3: ～てしまう → ～ちゃう (quá khứ: ～ちゃった) = đã ăn hết mất rồi.',
      },
      {
        id: 'jp-l12-q2',
        type: 'mcq',
        prompt: 'Nghe câu nói ngắn (Mondai 1): Người đàn ông sẽ làm gì TRƯỚC TIÊN?',
        audioText: 'かいぎの しりょう、コピーした？ あ、これから する ところだよ。そのまえに、ぶちょうに メールを おくらなきゃ。',
        options: ['Photo tài liệu cuộc họp', 'Gửi email cho trưởng phòng', 'Vào phòng họp ngay'],
        correctAnswer: 'Gửi email cho trưởng phòng',
        explanation: 'Cụm "そのまえに、ぶちょうに メールを おくらなきゃ" (Trước đó tôi phải gửi mail cho trưởng phòng đã!) → hành động làm TRƯỚC TIÊN là gửi email.',
      },
      {
        id: 'jp-l12-q3',
        type: 'mcq',
        prompt: 'Cách đọc đúng của từ ghép Kanji N3 "準備" (CHUẨN BỊ) là gì?',
        options: ['じゅんび', 'じゅんぴ', 'しゅんび', 'じゅび'],
        correctAnswer: 'じゅんび',
        explanation: '準 (じゅん) + 備 (び) = じゅんび (chuẩn bị).',
      },
      {
        id: 'jp-l12-q4',
        type: 'order',
        prompt: 'Ghép thành câu văn nói chuẩn N3 (Nghĩa: Trước khi họp hãy đặt sẵn tài liệu trên bàn nhé):',
        tokens: ['かいぎの', 'まえに、', 'しりょうを', 'つくえに', 'おいといてね。'],
        correctAnswer: 'かいぎの まえに、 しりょうを つくえに おいといてね。',
        explanation: 'おいといて là dạng nói tắt của おいておいて (Vておく = làm sẵn trước) — gặp liên tục trong nghe hiểu N3!',
      },
    ],
  },
];
