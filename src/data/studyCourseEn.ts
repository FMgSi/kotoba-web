import type { StudyLesson, StudyStage } from '../types';

export const EN_STUDY_STAGES: StudyStage[] = [
  {
    id: 'en-stage-1',
    language: 'en',
    order: 1,
    badge: 'Chặng 1 · Band 3.0 → 4.0',
    title: 'Xây Nền Phát Âm, Ngữ Pháp & Từ Vựng Cốt Lõi',
    goal: 'Vá lỗ hổng gốc rễ: phát âm chuẩn IPA, 6 thì quan trọng nhất, trật tự câu chuẩn và thói quen ôn từ Anki mỗi ngày (chưa vội cày đề IELTS).',
    estimatedTime: '6 tuần (~1.5–2 giờ/ngày)',
    recommendedBooks: [
      'English Grammar in Use / Essential Grammar in Use (Cambridge)',
      'English Pronunciation in Use (Elementary)',
      'Playlist Khóa "Nền" Tảng & Anki 1000 Từ Vựng — IELTS Từ Đầu by Thế Quang',
    ],
    youtubeChannel: {
      label: 'Kênh YouTube: IELTS Từ Đầu by Thế Quang (@ieltstudau)',
      url: 'https://www.youtube.com/@ieltstudau/playlists',
      source: 'YouTube · IELTS Từ Đầu',
    },
  },
  {
    id: 'en-stage-2',
    language: 'en',
    order: 2,
    badge: 'Chặng 2 · Band 4.0 → 5.0',
    title: 'Làm Quen 4 Kỹ Năng & Phương Pháp Streamline',
    goal: 'Nắm trọn tư duy Streamline Listening, Streamline Reading (Hard-Soft Keywords, T/F/NG), Streamline Writing Task 1 và Speaking Ma trận 4D.',
    estimatedTime: '8 tuần (~2 giờ/ngày)',
    recommendedBooks: [
      'Destination B1 (Grammar & Vocabulary)',
      'Get Ready for IELTS (Listening & Reading)',
      'Playlist Streamline Listening / Reading / Writing / Speaking (@ieltstudau)',
    ],
    youtubeChannel: {
      label: 'Tìm chuỗi Streamline của thầy Thế Quang',
      url: 'https://www.youtube.com/@ieltstudau/search?query=Streamline',
      source: 'YouTube · Streamline Series',
    },
  },
  {
    id: 'en-stage-3',
    language: 'en',
    order: 3,
    badge: 'Chặng 3 · Band 5.0 → 6.0+',
    title: 'Chiến Thuật Phòng Thi & Thực Chiến Đề Cambridge',
    goal: 'Xử lý các dạng bài ăn điểm Band 6.0+ (Matching Headings, Listening Part 3–4, Writing Task 2 PEEL & câu phức), luyện đề Cambridge 12–19 có bấm giờ.',
    estimatedTime: '6 tuần (~2–3 giờ/ngày)',
    recommendedBooks: [
      'Bộ đề Cambridge IELTS 12 → 19',
      'Destination B2 (Từ vựng & Ngữ pháp học thuật)',
      'Series Crack IELTS / Race to 8.0 / Đọc Báo Advanced (@ieltstudau)',
    ],
    youtubeChannel: {
      label: 'Series luyện đề thực chiến (@ieltstudau)',
      url: 'https://www.youtube.com/@ieltstudau/search?query=Crack+IELTS',
      source: 'YouTube · Crack IELTS',
    },
  },
];

export const EN_STUDY_LESSONS: StudyLesson[] = [
  // ================= STAGE 1: 3.0 -> 4.0 =================
  {
    id: 'en-l1',
    language: 'en',
    stageId: 'en-stage-1',
    order: 1,
    title: 'Bài 1: Phát âm IPA, Trọng âm & Tư duy Shadowing',
    subtitle: 'Sửa phát âm gốc để nghe rõ âm cuối (ending sounds) và không bị mất điểm khi nghe nối âm.',
    targetBandOrLevel: 'Band 3.0 → 3.5',
    durationLabel: 'Tuần 1–2',
    booksAndMaterials: [
      'Khóa "Nền" Tảng — IELTS Từ Đầu by Thế Quang',
      'English Pronunciation in Use (Unit 1–15: nguyên âm dài/ngắn, âm cuối -s/-ed)',
    ],
    resources: [
      {
        label: 'Xem Khóa "Nền" Tảng — IELTS Từ Đầu',
        url: 'https://www.youtube.com/@ieltstudau/search?query=N%E1%BB%81n+t%E1%BA%A3ng',
        source: 'YouTube · @ieltstudau',
      },
      {
        label: 'Luyện Shadowing & Phát âm trên @ieltstudau',
        url: 'https://www.youtube.com/@ieltstudau/search?query=Shadowing',
        source: 'YouTube · @ieltstudau',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Vì sao phát âm đúng giúp tăng điểm Listening?',
        body: 'Người ở band 3.0 thường không nghe được từ quen vì trong đầu nhớ sai phát âm (ví dụ thiếu âm cuối /s/, /t/, /d/ hoặc đặt sai trọng âm). Hãy luôn kiểm tra phiên âm IPA mỗi khi thêm từ mới vào Anki.',
        examples: [
          { text: 'sheep /ʃiːp/ vs ship /ʃɪp/', meaning: 'Nguyên âm dài /iː/ và ngắn /ɪ/ đổi hẳn nghĩa từ.' },
          { text: 'worked /wɜːrkt/ · played /pleɪd/ · wanted /ˈwɒntɪd/', meaning: '3 cách đọc đuôi -ed cực hay gặp khi nghe chép chính tả.' },
        ],
      },
      {
        heading: '2. Quy tắc trọng âm cơ bản (Word Stress)',
        body: 'Danh từ & tính từ 2 âm tiết thường nhấn âm 1 (PREsent, TAble); động từ 2 âm tiết thường nhấn âm 2 (preSENT, deCIDE). Từ có đuôi -tion / -sion / -ic luôn nhấn âm NGAY TRƯỚC nó (eduCAtion, ecoNOmic).',
        examples: [
          { text: 'in-for-MA-tion /ˌɪn.fəˈmeɪ.ʃən/', meaning: 'Đuôi -tion → nhấn vào âm MA.' },
          { text: 'de-VEL-op-ment /dɪˈvel.əp.mənt/', meaning: 'Đuôi -ment không làm đổi trọng âm của động từ gốc develop.' },
        ],
      },
    ],
    checklist: [
      'Xem 2 video đầu trong playlist Khóa "Nền" Tảng của thầy Thế Quang',
      'Tập đọc to 15 phút Shadowing theo 1 bài ngắn trong mục Luyện Nghe',
      'Ôn 20 thẻ từ vựng Tiếng Anh trong mục Từ vựng (Anki) và bấm nghe phát âm từng từ',
    ],
    vocabPack: [
      { front: 'pronunciation', reading: '/prəˌnʌnsiˈeɪʃn/', back: 'cách phát âm', example: 'Good pronunciation makes listening much easier.', exampleVi: 'Phát âm tốt giúp việc nghe dễ hơn nhiều.' },
      { front: 'syllable', reading: '/ˈsɪləbl/', back: 'âm tiết', example: 'The word "important" has three syllables.', exampleVi: 'Từ "important" có ba âm tiết.' },
      { front: 'accurate', reading: '/ˈækjərət/', back: 'chính xác', example: 'Try to be accurate with ending sounds.', exampleVi: 'Hãy cố gắng chính xác với các âm cuối.' },
      { front: 'fluent', reading: '/ˈfluːənt/', back: 'trôi chảy', example: 'Daily shadowing helps you become more fluent.', exampleVi: 'Shadowing mỗi ngày giúp bạn nói trôi chảy hơn.' },
    ],
    exercises: [
      {
        id: 'en-l1-q1',
        type: 'mcq',
        prompt: 'Từ nào dưới đây có đuôi "-ed" được phát âm là /ɪd/?',
        options: ['worked', 'watched', 'decided', 'played'],
        correctAnswer: 'decided',
        explanation: 'Đuôi -ed đọc là /ɪd/ khi động từ kết thúc bằng âm /t/ hoặc /d/ (decide → decided /dɪˈsaɪdɪd/).',
      },
      {
        id: 'en-l1-q2',
        type: 'mcq',
        prompt: 'Từ "economic" (thuộc về kinh tế) nhấn trọng âm vào âm tiết thứ mấy?',
        options: ['Âm 1 (E-co-no-mic)', 'Âm 2 (e-CO-no-mic)', 'Âm 3 (e-co-NO-mic)', 'Âm 4 (e-co-no-MIC)'],
        correctAnswer: 'Âm 3 (e-co-NO-mic)',
        explanation: 'Quy tắc vàng: từ kết thúc bằng đuôi -ic luôn nhấn trọng âm ngay trước nó → e-co-NO-mic.',
      },
      {
        id: 'en-l1-q3',
        type: 'mcq',
        prompt: 'Nghe câu sau và chọn từ xuất hiện trong câu:',
        audioText: 'Please check the price on the receipt before leaving the shop.',
        options: ['rice', 'price', 'prize', 'bright'],
        correctAnswer: 'price',
        explanation: 'Câu đọc là "Please check the price (/praɪs/) on the receipt..." — chú ý âm cuối /s/ (price = giá tiền) khác /z/ (prize = giải thưởng).',
      },
      {
        id: 'en-l1-q4',
        type: 'fill',
        prompt: 'Điền đúng từ còn thiếu (chú ý âm cuối số nhiều -s): "There are many modern ___ in this city." (nghĩa: tòa nhà)',
        correctAnswer: 'buildings',
        acceptedAnswers: ['buildings'],
        explanation: 'Sau "many" phải là danh từ số nhiều → buildings (phát âm có âm cuối /z/).',
      },
    ],
  },

  {
    id: 'en-l2',
    language: 'en',
    stageId: 'en-stage-1',
    order: 2,
    title: 'Bài 2: 6 Thì Cốt Lõi & Cấu Trúc Câu Chuẩn IELTS',
    subtitle: '85% đề IELTS dùng 6 thì này: Hiện tại đơn, Hiện tại tiếp diễn, Quá khứ đơn, Hiện tại hoàn thành, Tương lai & Bị động.',
    targetBandOrLevel: 'Band 3.5 → 4.0',
    durationLabel: 'Tuần 3–4',
    booksAndMaterials: [
      'English Grammar in Use (Unit 1–25 & Unit 42–44 Passive)',
      'Luyện đặt câu mỗi ngày từ bộ thẻ Anki của bạn',
    ],
    resources: [
      {
        label: 'Video ngữ pháp nền tảng — IELTS Từ Đầu',
        url: 'https://www.youtube.com/@ieltstudau/search?query=ng%E1%BB%AF+ph%C3%A1p',
        source: 'YouTube · @ieltstudau',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Phân biệt Quá khứ đơn (Past Simple) vs Hiện tại hoàn thành (Present Perfect)',
        body: 'Past Simple dùng cho mốc thời gian đã chấm dứt hoàn toàn (in 2010, yesterday, last year — rất hay dùng trong Writing Task 1 biểu đồ quá khứ). Present Perfect (have/has + V3) dùng cho xu hướng kéo dài từ quá khứ đến hiện tại (over the past decade, since 2015).',
        examples: [
          { text: 'Sales increased sharply in 2020.', meaning: 'Có mốc thời gian cụ thể "in 2020" → Quá khứ đơn.' },
          { text: 'Technology has changed the way people work over the last ten years.', meaning: 'Kéo dài đến hiện tại ("over the last ten years") → Hiện tại hoàn thành.' },
        ],
      },
      {
        heading: '2. Câu bị động (Passive Voice: be + V3/ed)',
        body: 'Cực kỳ quan trọng trong IELTS Reading và Writing Task 1 (mô tả quy trình Process / bản đồ Map). Khi không cần nhấn mạnh ai làm, hãy dùng bị động.',
        examples: [
          { text: 'A new library was built near the park in 2022.', meaning: 'Một thư viện mới đã được xây gần công viên năm 2022.' },
        ],
      },
    ],
    checklist: [
      'Làm hết 4 bài tập bên dưới đạt ít nhất 75%',
      'Tự viết 5 câu về bản thân dùng đủ Quá khứ đơn và Hiện tại hoàn thành',
      'Lưu bộ từ vựng của Bài 2 vào Anki SRS để ôn lặp lại',
    ],
    vocabPack: [
      { front: 'decade', reading: '/ˈdekeɪd/', back: 'thập kỷ (10 năm)', example: 'Online shopping has grown rapidly over the past decade.', exampleVi: 'Mua sắm trực tuyến đã phát triển nhanh trong thập kỷ qua.' },
      { front: 'construct', reading: '/kənˈstrʌkt/', back: 'xây dựng', example: 'A new bridge was constructed across the river.', exampleVi: 'Một cây cầu mới đã được xây bắc qua sông.' },
      { front: 'gradually', reading: '/ˈɡrædʒuəli/', back: 'dần dần, từ từ', example: 'The number of students increased gradually.', exampleVi: 'Số lượng học sinh tăng lên dần dần.' },
      { front: 'significant', reading: '/sɪɡˈnɪfɪkənt/', back: 'đáng kể, quan trọng', example: 'There was a significant change in the city center.', exampleVi: 'Đã có một sự thay đổi đáng kể ở trung tâm thành phố.' },
    ],
    exercises: [
      {
        id: 'en-l2-q1',
        type: 'mcq',
        prompt: 'Chọn đáp án đúng: "Between 2010 and 2015, the population of the town ___ by 20%."',
        options: ['has grown', 'grew', 'is growing', 'grows'],
        correctAnswer: 'grew',
        explanation: 'Mốc thời gian "Between 2010 and 2015" đã kết thúc hoàn toàn trong quá khứ → dùng Quá khứ đơn (grew).',
      },
      {
        id: 'en-l2-q2',
        type: 'fill',
        prompt: 'Chia đúng động từ trong ngoặc: "Over the past decade, remote work ___ (become) much more popular."',
        correctAnswer: 'has become',
        acceptedAnswers: ['has become'],
        explanation: 'Cụm "Over the past decade" diễn tả xu hướng từ quá khứ kéo dài tới hiện tại → Hiện tại hoàn thành (has become).',
      },
      {
        id: 'en-l2-q3',
        type: 'mcq',
        prompt: 'Chọn dạng bị động đúng: "Coffee beans ___ in the sun for several days before they are roasted."',
        options: ['dry', 'are dried', 'were drying', 'have drying'],
        correctAnswer: 'are dried',
        explanation: 'Mô tả quy trình chung (hiện tại đơn) ở thể bị động: be (are) + V3 (dried).',
      },
      {
        id: 'en-l2-q4',
        type: 'order',
        prompt: 'Sắp xếp thành câu hoàn chỉnh đúng ngữ pháp IELTS:',
        tokens: ['A new sports center', 'was built', 'in the north of', 'the city', 'in 2021.'],
        correctAnswer: 'A new sports center was built in the north of the city in 2021.',
        explanation: 'Trật tự chuẩn câu bị động mô tả bản đồ: Chủ ngữ + was built + nơi chốn + thời gian.',
      },
    ],
  },

  {
    id: 'en-l3',
    language: 'en',
    stageId: 'en-stage-1',
    order: 3,
    title: 'Bài 3: Từ Loại, Mệnh Đề Quan Hệ & Paraphrase Nền Tảng',
    subtitle: 'Hiểu đúng vị trí Danh/Động/Tính/Trạng từ và nối câu mượt bằng who/which/that — chìa khóa thoát band 4.0.',
    targetBandOrLevel: 'Band 3.5 → 4.0',
    durationLabel: 'Tuần 5–6',
    booksAndMaterials: [
      'English Grammar in Use (Unit 92–97 Relative Clauses)',
      'Anki 1000 Từ Vựng IELTS — IELTS Từ Đầu by Thế Quang',
    ],
    resources: [
      {
        label: 'Học từ vựng IELTS bằng Anki — Thế Quang',
        url: 'https://www.youtube.com/@ieltstudau/search?query=Anki',
        source: 'YouTube · @ieltstudau',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Trật tự cụm danh từ (Noun Phrase)',
        body: 'Trong tiếng Anh, Tính từ luôn đứng TRƯỚC Danh từ (a quiet neighborhood), còn Trạng từ bổ nghĩa cho Động từ hoặc Tính từ (increased rapidly / extremely useful). Biết rõ từ loại giúp bạn đoán ngay từ cần điền trong IELTS Listening & Reading Gap-fill!',
      },
      {
        heading: '2. Mệnh đề quan hệ (Relative Clauses) & Paraphrase',
        body: 'Dùng who (người), which (vật/sự việc), where (nơi chốn) để ghép 2 câu đơn rời rạc thành 1 câu phức tự nhiên. Ngoài ra, IELTS luôn đổi cách diễn đạt (Paraphrase): "important" ↔ "essential / crucial", "children" ↔ "young people".',
        examples: [
          { text: 'Students who study regularly make faster progress.', meaning: 'Những học sinh học đều đặn sẽ tiến bộ nhanh hơn.' },
          { text: 'Public transport is essential for reducing traffic jams.', meaning: 'Giao thông công cộng thiết yếu cho việc giảm tắc đường.' },
        ],
      },
    ],
    checklist: [
      'Hoàn thành 4 bài tập nhận diện từ loại và mệnh đề quan hệ',
      'Thực hành viết 3 cặp câu Paraphrase cho các chủ đề: Education, Environment, Health',
      'Ôn sạch thẻ Anki đến hạn trong ngày',
    ],
    vocabPack: [
      { front: 'essential', reading: '/ɪˈsenʃl/', back: 'thiết yếu (= very important)', example: 'Sleep is essential for good memory.', exampleVi: 'Giấc ngủ rất thiết yếu cho trí nhớ tốt.' },
      { front: 'beneficial', reading: '/ˌbenɪˈfɪʃl/', back: 'có lợi (= helpful)', example: 'Daily exercise is beneficial to mental health.', exampleVi: 'Tập thể dục hằng ngày có lợi cho sức khỏe tinh thần.' },
      { front: 'reduce', reading: '/rɪˈdjuːs/', back: 'làm giảm (= cut down)', example: 'Using buses helps reduce air pollution.', exampleVi: 'Đi xe buýt giúp giảm ô nhiễm không khí.' },
      { front: 'resident', reading: '/ˈrezɪdənt/', back: 'cư dân (= local people)', example: 'Local residents enjoy the new public park.', exampleVi: 'Cư dân địa phương rất thích công viên công cộng mới.' },
    ],
    exercises: [
      {
        id: 'en-l3-q1',
        type: 'mcq',
        prompt: 'Điền đúng từ loại: "Regular practice leads to a ___ improvement in listening skills."',
        options: ['notice', 'noticeably', 'noticeable', 'noticed'],
        correctAnswer: 'noticeable',
        explanation: 'Trước danh từ "improvement" và sau mạo từ "a" cần một Tính từ → noticeable (đáng chú ý).',
      },
      {
        id: 'en-l3-q2',
        type: 'fill',
        prompt: 'Điền đại từ quan hệ phù hợp (who / which / where): "This is the library ___ I usually prepare for my exams."',
        correctAnswer: 'where',
        acceptedAnswers: ['where'],
        explanation: 'Chỉ nơi chốn (tại thư viện = in which) → dùng where.',
      },
      {
        id: 'en-l3-q3',
        type: 'mcq',
        prompt: 'Câu nào Paraphrase sát nghĩa nhất với: "Many young people spend too much time on social media."?',
        options: [
          'A large number of teenagers devote excessive hours to online platforms.',
          'Old people hate using the internet every day.',
          'Social media is banned in most schools.',
          'Young people never use smartphones at home.',
        ],
        correctAnswer: 'A large number of teenagers devote excessive hours to online platforms.',
        explanation: 'Paraphrase chuẩn: Many → A large number of; young people → teenagers; spend too much time → devote excessive hours; social media → online platforms.',
      },
      {
        id: 'en-l3-q4',
        type: 'order',
        prompt: 'Ghép thành câu phức có mệnh đề quan hệ:',
        tokens: ['The course', 'which', 'I joined', 'last month', 'is very practical.'],
        correctAnswer: 'The course which I joined last month is very practical.',
        explanation: 'Mệnh đề quan hệ "which I joined last month" bổ nghĩa trực tiếp cho "The course".',
      },
    ],
  },

  // ================= STAGE 2: 4.0 -> 5.0 =================
  {
    id: 'en-l4',
    language: 'en',
    stageId: 'en-stage-2',
    order: 4,
    title: 'Bài 4: Streamline Listening Part 1 & 2 — Né Bẫy Thông Tin',
    subtitle: 'Cách đoán trước loại từ cần điền và né bẫy "nói rồi sửa lại" (distractors) cực phổ biến ở IELTS Listening.',
    targetBandOrLevel: 'Band 4.0 → 4.5',
    durationLabel: 'Tuần 7–8',
    booksAndMaterials: [
      'Playlist Streamline Listening — IELTS Từ Đầu by Thế Quang',
      'Get Ready for IELTS Listening + mục Luyện Nghe ngay trong KotobaLab',
    ],
    resources: [
      {
        label: 'Phương pháp Streamline Listening — Thế Quang',
        url: 'https://www.youtube.com/@ieltstudau/search?query=Streamline+Listening',
        source: 'YouTube · @ieltstudau',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Quy trình 3 bước Streamline Listening trước khi băng chạy',
        body: 'Bước 1: Đọc giới hạn từ (VD: ONE WORD AND/OR A NUMBER — viết 2 từ là mất điểm ngay!). Bước 2: Gạch chân từ khóa và dự đoán loại từ cần điền (tên riêng, số điện thoại, ngày, danh từ số ít/nhiều). Bước 3: Cảnh giác các từ đảo chiều như "actually", "sorry", "oh wait", "used to be".',
      },
      {
        heading: '2. Nghe chép chính tả (Dictation) để trị dứt điểm lỗi mất âm',
        body: 'Đừng chỉ check đáp án A/B/C rồi bỏ qua. Câu nào nghe sai, hãy sang mục Luyện Nghe (DailyDictation) nghe lại chậm 0.75x và chép ra từng từ để tai nhận diện nối âm.',
      },
    ],
    checklist: [
      'Xem 2 video trong playlist Streamline Listening của thầy Thế Quang',
      'Hoàn thành bài "IELTS Part 1 Warm-up: Library Membership" trong mục Luyện Nghe của KotobaLab',
      'Làm đủ 4 câu thực hành né bẫy Listening bên dưới',
    ],
    vocabPack: [
      { front: 'registration', reading: '/ˌredʒɪˈstreɪʃn/', back: 'việc đăng ký', example: 'Registration closes on Friday afternoon.', exampleVi: 'Việc đăng ký kết thúc vào chiều thứ Sáu.' },
      { front: 'accommodation', reading: '/əˌkɒməˈdeɪʃn/', back: 'chỗ ở (lưu ý 2 chữ c, 2 chữ m)', example: 'The university provides student accommodation.', exampleVi: 'Trường đại học cung cấp chỗ ở cho sinh viên.' },
      { front: 'deposit', reading: '/dɪˈpɒzɪt/', back: 'tiền đặt cọc', example: 'You need to pay a small deposit in advance.', exampleVi: 'Bạn cần trả trước một khoản tiền cọc nhỏ.' },
      { front: 'facility', reading: '/fəˈsɪləti/', back: 'cơ sở vật chất, tiện ích', example: 'The sports facility is open until 9 PM.', exampleVi: 'Khu tiện ích thể thao mở cửa đến 9 giờ tối.' },
    ],
    exercises: [
      {
        id: 'en-l4-q1',
        type: 'mcq',
        prompt: 'Nghe đoạn hội thoại ngắn (bẫy đổi giá tiền) — phí thành viên HIỆN TẠI là bao nhiêu?',
        audioText: 'Last year the gym membership was forty dollars per month, oh sorry, starting this month we raised it to forty five dollars.',
        options: ['$40', '$45', '$50', '$35'],
        correctAnswer: '$45',
        explanation: '$40 là giá năm ngoái (bẫy Distractor). Cụm "oh sorry, starting this month we raised it to forty five dollars" cho biết đáp án đúng là $45.',
      },
      {
        id: 'en-l4-q2',
        type: 'fill',
        prompt: 'Nghe và điền ĐÚNG 1 TỪ (tên ngày trong tuần) lịch hẹn cuối cùng được chốt:',
        audioText: 'Could we meet on Tuesday? Hmm, Tuesday is full. How about Thursday morning? Yes, Thursday works well.',
        correctAnswer: 'Thursday',
        acceptedAnswers: ['thursday'],
        explanation: 'Tuesday bị kín lịch (bẫy), hai người chốt lịch vào Thursday.',
      },
      {
        id: 'en-l4-q3',
        type: 'mcq',
        prompt: 'Nếu đề ghi "NO MORE THAN TWO WORDS AND/OR A NUMBER", đáp án nào sau đây HỢP LỆ?',
        options: ['the central city library', '25 Oak Street', 'very quiet study room', 'three big wooden tables'],
        correctAnswer: '25 Oak Street',
        explanation: '"25 Oak Street" gồm 1 số (25) và 2 từ (Oak Street) — đúng chuẩn tối đa 2 từ và/hoặc 1 số.',
      },
      {
        id: 'en-l4-q4',
        type: 'fill',
        prompt: 'Kiểm tra chính tả từ cực hay bị viết sai trong IELTS Part 1 (nghĩa: chỗ ở): a_c_m_o_a_i_n → gõ đủ từ:',
        correctAnswer: 'accommodation',
        acceptedAnswers: ['accommodation'],
        explanation: 'Mẹo nhớ của nhiều bạn band 8+: "accommodation" có 2 chữ c và 2 chữ m (double c, double m).',
      },
    ],
  },

  {
    id: 'en-l5',
    language: 'en',
    stageId: 'en-stage-2',
    order: 5,
    title: 'Bài 5: Streamline Reading — Hard/Soft Keywords & True/False/Not Given',
    subtitle: 'Trị dứt điểm lỗi nhầm lẫn giữa FALSE và NOT GIVEN bằng kỹ thuật quét từ khóa của thầy Thế Quang.',
    targetBandOrLevel: 'Band 4.5 → 5.0',
    durationLabel: 'Tuần 9–10',
    booksAndMaterials: [
      'Playlist Streamline Reading — IELTS Từ Đầu by Thế Quang',
      'Get Ready for IELTS Reading (Unit 1–6)',
    ],
    resources: [
      {
        label: 'Phương pháp Streamline Reading — Thế Quang',
        url: 'https://www.youtube.com/@ieltstudau/search?query=Streamline+Reading',
        source: 'YouTube · @ieltstudau',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Phân biệt Hard Keywords vs Soft Keywords',
        body: 'Hard Keywords là từ không thể paraphrase (tên riêng, năm, số liệu, thuật ngữ chuyên ngành) → dùng để định vị cực nhanh đoạn văn chứa đáp án. Soft Keywords là động từ/tính từ dễ bị đổi sang từ đồng nghĩa → dùng để so sánh đúng/sai.',
      },
      {
        heading: '2. Công thức phân biệt FALSE và NOT GIVEN',
        body: 'TRUE = bài đọc nói ý giống hệt (thường bằng từ đồng nghĩa). FALSE = bài đọc nói TRÁI NGƯỢC hoàn toàn (chứng minh được câu hỏi sai). NOT GIVEN = bài đọc KHÔNG hề nhắc tới mối liên hệ/so sánh đó (đừng tự suy diễn bằng kiến thức ngoài!).',
        examples: [
          { text: 'Bài đọc: "The museum opened in 1995." | Câu hỏi: "The museum opened in 1990."', meaning: '→ FALSE (1995 trái ngược 1990).' },
          { text: 'Bài đọc: "The museum opened in 1995." | Câu hỏi: "The museum is the oldest in the country."', meaning: '→ NOT GIVEN (không có thông tin so sánh nhất).' },
        ],
      },
    ],
    checklist: [
      'Xem video kỹ thuật Hard/Soft Keywords trong Streamline Reading (@ieltstudau)',
      'Làm trọn vẹn 4 câu thực hành T/F/NG bên dưới mà không đoán mò',
      'Ghi lại 5 cặp từ đồng nghĩa hay gặp vào bộ thẻ Anki',
    ],
    vocabPack: [
      { front: 'urban', reading: '/ˈɜːbən/', back: 'thuộc về đô thị (trái nghĩa: rural)', example: 'Urban areas often have better public transport.', exampleVi: 'Khu vực đô thị thường có giao thông công cộng tốt hơn.' },
      { front: 'rural', reading: '/ˈrʊərəl/', back: 'thuộc về nông thôn', example: 'Life in rural villages is peaceful.', exampleVi: 'Cuộc sống ở các làng quê rất yên bình.' },
      { front: 'decline', reading: '/dɪˈklaɪn/', back: 'sự suy giảm / giảm xuống (= drop, fall)', example: 'There has been a steady decline in print newspaper sales.', exampleVi: 'Doanh số báo in đã suy giảm đều đặn.' },
      { front: 'evidence', reading: '/ˈevɪdəns/', back: 'bằng chứng', example: 'Scientists found strong evidence supporting the theory.', exampleVi: 'Các nhà khoa học tìm thấy bằng chứng mạnh mẽ ủng hộ giả thuyết.' },
    ],
    exercises: [
      {
        id: 'en-l5-q1',
        type: 'mcq',
        context: 'Đoạn đọc: "In 2018, the city introduced free bicycles for university students to cut down on air pollution. Within six months, over 4,000 students signed up for the program."',
        prompt: 'Statement: "The free bicycle program was created to help reduce pollution." → TRUE, FALSE hay NOT GIVEN?',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'TRUE',
        explanation: '"cut down on air pollution" là paraphrase chính xác của "reduce pollution" → TRUE.',
      },
      {
        id: 'en-l5-q2',
        type: 'mcq',
        context: 'Đoạn đọc: "In 2018, the city introduced free bicycles for university students to cut down on air pollution. Within six months, over 4,000 students signed up for the program."',
        prompt: 'Statement: "More female students than male students joined the bicycle program." → TRUE, FALSE hay NOT GIVEN?',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'NOT GIVEN',
        explanation: 'Bài chỉ nói tổng hơn 4.000 sinh viên đăng ký, hoàn toàn KHÔNG so sánh nam và nữ → NOT GIVEN.',
      },
      {
        id: 'en-l5-q3',
        type: 'mcq',
        context: 'Đoạn đọc: "In 2018, the city introduced free bicycles for university students to cut down on air pollution."',
        prompt: 'Statement: "Students had to pay a small monthly fee to use the city bicycles." → TRUE, FALSE hay NOT GIVEN?',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'FALSE',
        explanation: 'Bài ghi rõ "free bicycles" (miễn phí), trái ngược trực tiếp với "pay a small monthly fee" → FALSE.',
      },
      {
        id: 'en-l5-q4',
        type: 'mcq',
        prompt: 'Trong câu "In 2018, Dr. Tanaka published a study about marine plastic", đâu là Hard Keyword tốt nhất để quét tìm vị trí trong bài đọc dài?',
        options: ['published', 'study', '2018 & Dr. Tanaka', 'about'],
        correctAnswer: '2018 & Dr. Tanaka',
        explanation: 'Số năm (2018) và tên riêng (Dr. Tanaka) không thể bị paraphrase nên mắt quét tìm ra đoạn văn chỉ trong 2 giây.',
      },
    ],
  },

  {
    id: 'en-l6',
    language: 'en',
    stageId: 'en-stage-2',
    order: 6,
    title: 'Bài 6: Streamline Writing Task 1 — Mô Tả Biểu Đồ Cơ Bản',
    subtitle: 'Khung 4 đoạn chuẩn ăn điểm Band 5.5–6.0 cho Line Graph / Bar Chart và bộ từ vựng mô tả xu hướng.',
    targetBandOrLevel: 'Band 4.5 → 5.0',
    durationLabel: 'Tuần 11–12',
    booksAndMaterials: [
      'Playlist Streamline Writing — IELTS Từ Đầu by Thế Quang',
      'Destination B1 (Unit từ nối & so sánh)',
    ],
    resources: [
      {
        label: 'Playlist Streamline Writing — Thế Quang',
        url: 'https://www.youtube.com/@ieltstudau/search?query=Streamline+Writing',
        source: 'YouTube · @ieltstudau',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Cấu trúc 4 đoạn chuẩn (tối thiểu 150 từ)',
        body: 'Đoạn 1 (Introduction): Paraphrase lại đề bài trong 1 câu (The chart illustrates...). Đoạn 2 (Overview — QUAN TRỌNG NHẤT): Tóm tắt 2 xu hướng lớn nhất, KHÔNG chèn số liệu chi tiết. Đoạn 3 & 4 (Body 1 & 2): Nhóm số liệu thông minh và so sánh.',
      },
      {
        heading: '2. Giới từ vàng với số liệu (tránh mất điểm ngữ pháp)',
        body: 'increase TO 50% (tăng ĐẾN mốc 50%) · increase BY 20% (tăng THÊM 20%) · stand AT 30% (ở mức 30%) · between 2010 and 2020 / from 2010 to 2020.',
        examples: [
          { text: 'Overall, the percentage of online shoppers rose significantly over the period.', meaning: 'Câu Overview mẫu mạch lạc, rõ xu hướng.' },
        ],
      },
    ],
    checklist: [
      'Xem 2 video hướng dẫn Writing Task 1 trong Streamline Writing',
      'Thuộc 4 cặp giới từ mô tả số liệu (to / by / at / from...to)',
      'Tập viết 1 đoạn Introduction + 1 đoạn Overview (60 từ) cho biểu đồ bất kỳ',
    ],
    vocabPack: [
      { front: 'illustrate', reading: '/ˈɪləstreɪt/', back: 'minh họa, cho thấy (dùng mở bài Task 1)', example: 'The bar chart illustrates electricity usage in four countries.', exampleVi: 'Biểu đồ cột minh họa mức tiêu thụ điện ở bốn quốc gia.' },
      { front: 'fluctuate', reading: '/ˈflʌktʃueɪt/', back: 'dao động lên xuống', example: 'Oil prices fluctuated slightly between 2015 and 2019.', exampleVi: 'Giá dầu dao động nhẹ từ năm 2015 đến 2019.' },
      { front: 'remain stable', reading: '/rɪˈmeɪn ˈsteɪbl/', back: 'giữ nguyên ổn định', example: 'The figure for water consumption remained stable at 20%.', exampleVi: 'Số liệu tiêu thụ nước giữ ổn định ở mức 20%.' },
      { front: 'dramatically', reading: '/drəˈmætɪkli/', back: 'một cách mạnh mẽ, đột ngột', example: 'Smartphone sales rose dramatically after 2012.', exampleVi: 'Doanh số smartphone tăng mạnh sau năm 2012.' },
    ],
    exercises: [
      {
        id: 'en-l6-q1',
        type: 'mcq',
        prompt: 'Năm 2015 số liệu là 30%, năm 2020 tăng lên thành 50% (tăng thêm 20%). Câu nào dùng giới từ ĐÚNG?',
        options: [
          'The figure increased by 50% in 2020.',
          'The figure increased to 50% in 2020.',
          'The figure increased at 50% in 2020.',
          'The figure increased of 50% in 2020.',
        ],
        correctAnswer: 'The figure increased to 50% in 2020.',
        explanation: 'Tăng ĐẾN mốc 50% dùng "increased to 50%"; nếu muốn nói mức chênh lệch 20% mới dùng "increased by 20%".',
      },
      {
        id: 'en-l6-q2',
        type: 'mcq',
        prompt: 'Trong đoạn Overview của IELTS Writing Task 1, điều nào NÊN TRÁNH?',
        options: [
          'Nêu xu hướng tăng/giảm chung',
          'Chỉ ra đối tượng cao nhất / thấp nhất',
          'Liệt kê quá nhiều con số chi tiết từng năm',
          'Bắt đầu bằng "Overall,"',
        ],
        correctAnswer: 'Liệt kê quá nhiều con số chi tiết từng năm',
        explanation: 'Overview chỉ tóm tắt bức tranh tổng quan; các con số chi tiết để dành cho Body 1 và Body 2.',
      },
      {
        id: 'en-l6-q3',
        type: 'fill',
        prompt: 'Điền 1 động từ phù hợp thay cho "shows" trong mở bài Task 1: "The line graph ___ how internet usage changed from 2010 to 2020." (bắt đầu bằng i...)',
        correctAnswer: 'illustrates',
        acceptedAnswers: ['illustrates', 'indicates'],
        explanation: '"illustrates" là động từ chuẩn học thuật thay thế tự nhiên cho "shows" trong mở bài Task 1.',
      },
      {
        id: 'en-l6-q4',
        type: 'order',
        prompt: 'Ghép thành câu mô tả xu hướng chuẩn Band 6.0:',
        tokens: ['Overall,', 'the number of', 'car users', 'increased steadily', 'over the ten-year period.'],
        correctAnswer: 'Overall, the number of car users increased steadily over the ten-year period.',
        explanation: 'Cấu trúc chuẩn: Overall, + chủ ngữ (the number of + N số nhiều) + V quá khứ + trạng từ + khoảng thời gian.',
      },
    ],
  },

  {
    id: 'en-l7',
    language: 'en',
    stageId: 'en-stage-2',
    order: 7,
    title: 'Bài 7: Streamline Speaking — Ma Trận 4D & Mở Rộng Ý Part 1–2',
    subtitle: 'Hết bí ý khi nói tiếng Anh nhờ công thức 4 bước (Trả lời → Lý do → Ví dụ → So sánh) từ thầy Thế Quang.',
    targetBandOrLevel: 'Band 4.5 → 5.0',
    durationLabel: 'Tuần 13–14',
    booksAndMaterials: [
      'Playlist Streamline Speaking (Ma trận 4D) — @ieltstudau',
      'Ghi âm điện thoại 10 phút/ngày trả lời chủ đề quen thuộc (Work, Study, Hometown, Hobbies)',
    ],
    resources: [
      {
        label: 'Streamline Speaking & Ma trận 4D — Thế Quang',
        url: 'https://www.youtube.com/@ieltstudau/search?query=Streamline+Speaking',
        source: 'YouTube · @ieltstudau',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Công thức kéo dài câu trả lời Part 1 (2–3 câu tự nhiên)',
        body: 'Giám khảo không chấm cao nếu bạn chỉ trả lời "Yes, I like music." Hãy luôn nối thêm Lý do (because/since) + Ví dụ cụ thể (for instance, whenever I feel stressed...) để đạt điểm Fluency & Coherence.',
        examples: [
          { text: 'Definitely! I listen to acoustic music almost every evening because it helps me unwind after a long day of studying.', meaning: 'Tự nhiên, có cụm "unwind" (thư giãn) ăn điểm từ vựng.' },
        ],
      },
      {
        heading: '2. Tư duy Ma trận 4D cho Speaking Part 2 (nói 2 phút)',
        body: 'Thay vì học thuộc 50 bài mẫu rời rạc, hãy gom các đề Part 2 về vài nhóm lớn (Con người, Địa điểm, Đồ vật, Trải nghiệm) và chuẩn bị 1–2 câu chuyện gốc giàu chi tiết có thể xoay linh hoạt sang nhiều đề.',
      },
    ],
    checklist: [
      'Xem video Ma trận 4D Speaking trên kênh @ieltstudau',
      'Tự ghi âm câu trả lời cho 3 câu hỏi: Hometown, Daily routine, Favorite hobby (mỗi câu 30 giây)',
      'Nghe lại bản ghi âm để tự phát hiện 3 lỗi phát âm âm cuối',
    ],
    vocabPack: [
      { front: 'unwind', reading: '/ˌʌnˈwaɪnd/', back: 'thư giãn, xả hơi sau giờ làm/học', example: 'Reading a novel helps me unwind before bed.', exampleVi: 'Đọc tiểu thuyết giúp tôi thư giãn trước khi ngủ.' },
      { front: 'memorable', reading: '/ˈmemərəbl/', back: 'đáng nhớ', example: 'That trip to Da Lat was truly memorable.', exampleVi: 'Chuyến đi Đà Lạt đó thật sự đáng nhớ.' },
      { front: 'hectic', reading: '/ˈhektɪk/', back: 'bận rộn, hối hả', example: 'I have a pretty hectic schedule on weekdays.', exampleVi: 'Tôi có lịch trình khá bận rộn vào các ngày trong tuần.' },
      { front: 'recharge my batteries', reading: '/ˌriːˈtʃɑːdʒ/', back: 'nạp lại năng lượng', example: 'I usually stay home on Sunday to recharge my batteries.', exampleVi: 'Tôi thường ở nhà vào Chủ nhật để nạp lại năng lượng.' },
    ],
    exercises: [
      {
        id: 'en-l7-q1',
        type: 'mcq',
        prompt: 'Giám khảo hỏi Part 1: "Do you prefer studying in the morning or at night?" — Câu trả lời nào đạt tiêu chí mở rộng ý tốt nhất?',
        options: [
          'In the morning.',
          'I prefer the morning because my mind is fresh and the house is completely quiet, which helps me focus on vocabulary.',
          'Yes, I study every day.',
          'Morning is good, night is bad.',
        ],
        correctAnswer: 'I prefer the morning because my mind is fresh and the house is completely quiet, which helps me focus on vocabulary.',
        explanation: 'Câu trả lời có lựa chọn rõ ràng + 2 lý do + mệnh đề quan hệ "which helps me..." rất tự nhiên và mạch lạc.',
      },
      {
        id: 'en-l7-q2',
        type: 'fill',
        prompt: 'Điền 1 động từ tự nhiên thay cho "relax" (nghĩa: xả hơi, thư giãn, bắt đầu bằng u...): "Listening to soft music helps me ___ after work."',
        correctAnswer: 'unwind',
        acceptedAnswers: ['unwind'],
        explanation: '"unwind" là động từ rất tự nhiên trong IELTS Speaking để nói về việc thư giãn sau giờ học/làm.',
      },
      {
        id: 'en-l7-q3',
        type: 'mcq',
        prompt: 'Khi nói Speaking Part 2 bị quên ý giữa chừng, cách xử lý tự nhiên nhất là gì?',
        options: [
          'Im lặng hoàn toàn chờ hết 2 phút',
          'Dùng từ nối câu giờ tự nhiên ("Another thing worth mentioning is...") rồi kể thêm cảm xúc/kết quả',
          'Xin giám khảo đổi sang đề khác',
          'Đọc lặp lại câu đầu tiên 3 lần',
        ],
        correctAnswer: 'Dùng từ nối câu giờ tự nhiên ("Another thing worth mentioning is...") rồi kể thêm cảm xúc/kết quả',
        explanation: 'Chuyển hướng sang cảm xúc, bài học rút ra hoặc kế hoạch tương lai giúp giữ mạch trôi chảy (Fluency).',
      },
      {
        id: 'en-l7-q4',
        type: 'order',
        prompt: 'Ghép thành câu mở đầu Speaking Part 1 tự nhiên:',
        tokens: ['To be honest,', 'I have a', 'pretty hectic schedule', 'on weekdays,'],
        correctAnswer: 'To be honest, I have a pretty hectic schedule on weekdays,',
        explanation: '"To be honest," giúp mở đầu tự nhiên giống người bản xứ + cụm "hectic schedule" ăn điểm từ vựng.',
      },
    ],
  },

  // ================= STAGE 3: 5.0 -> 6.0+ =================
  {
    id: 'en-l8',
    language: 'en',
    stageId: 'en-stage-3',
    order: 8,
    title: 'Bài 8: Reading Band 6.0 — Matching Headings & Đọc Ý Chính',
    subtitle: 'Cách đọc 2 câu đầu + câu cuối đoạn để chọn đúng tiêu đề (Heading) và né bẫy từ lặp giống hệt.',
    targetBandOrLevel: 'Band 5.0 → 5.5',
    durationLabel: 'Tuần 15–16',
    booksAndMaterials: [
      'Cambridge IELTS 12–16 (Test 1–2 Reading)',
      'Series Streamline Reading & Đọc Báo Advanced (@ieltstudau)',
    ],
    resources: [
      {
        label: 'Chữa bài Reading thực chiến — @ieltstudau',
        url: 'https://www.youtube.com/@ieltstudau/search?query=Reading+Matching+Headings',
        source: 'YouTube · @ieltstudau',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Đừng chọn Heading chỉ vì thấy 1 từ giống hệt trong đoạn!',
        body: 'Bẫy kinh điển của Cambridge IELTS: 1 chi tiết phụ (example) có chứa từ giống hệt trong Heading sai. Heading đúng phải bao quát TOÀN BỘ ý chính của đoạn (thường nằm ở câu chủ đề 1–2 hoặc sau từ chuyển hướng "However / Yet").',
      },
      {
        heading: '2. Chiến thuật làm bài trong 60 phút cho mục tiêu 6.0 (23–26/40 câu đúng)',
        body: 'Dành ~15 phút cho Passage 1 (ăn chắc 10–12 câu), ~20 phút cho Passage 2 (ăn 8–9 câu), và ~25 phút cho Passage 3 (ăn 6–7 câu). Không sa lầy quá 2 phút vào 1 câu khó.',
      },
    ],
    checklist: [
      'Làm 1 đề Reading Cambridge (Passage 1 & 2) có bấm giờ 35 phút',
      'Lập bảng "Keyword Table": cột trái là từ trong câu hỏi, cột phải là từ đồng nghĩa trong bài đọc',
      'Đạt 100% 4 câu bài tập Reading bên dưới',
    ],
    vocabPack: [
      { front: 'drawback', reading: '/ˈdrɔːbæk/', back: 'nhược điểm, hạn chế (= disadvantage)', example: 'The main drawback of solar energy is the high initial cost.', exampleVi: 'Nhược điểm chính của năng lượng mặt trời là chi phí ban đầu cao.' },
      { front: 'consequence', reading: '/ˈkɒnsɪkwəns/', back: 'hậu quả, hệ quả (= result)', example: 'Deforestation has serious environmental consequences.', exampleVi: 'Phá rừng gây ra những hậu quả môi trường nghiêm trọng.' },
      { front: 'adopt', reading: '/əˈdɒpt/', back: 'áp dụng (phương pháp/chính sách)', example: 'Many schools have adopted digital textbooks.', exampleVi: 'Nhiều trường học đã áp dụng sách giáo khoa điện tử.' },
      { front: 'alternative', reading: '/ɔːlˈtɜːnətɪv/', back: 'giải pháp thay thế', example: 'Electric cars offer a cleaner alternative to petrol vehicles.', exampleVi: 'Xe điện mang lại giải pháp thay thế sạch hơn xe xăng.' },
    ],
    exercises: [
      {
        id: 'en-l8-q1',
        type: 'mcq',
        context: 'Đoạn A: "For decades, plastic packaging was praised for being cheap and lightweight. However, recent marine surveys reveal that millions of tons of plastic enter the ocean annually, harming sea turtles, fish, and seabirds."',
        prompt: 'Chọn Heading phù hợp nhất cho Đoạn A:',
        options: [
          'i. The low cost of manufacturing plastic',
          'ii. The environmental damage caused by plastic waste',
          'iii. How to recycle plastic bottles at home',
          'iv. A brief history of sea turtles',
        ],
        correctAnswer: 'ii. The environmental damage caused by plastic waste',
        explanation: 'Câu đầu chỉ là nền ("For decades..."), ý chính nằm sau từ chuyển hướng "However" nói về rác nhựa gây hại sinh vật biển → ii. Đáp án i và iv là bẫy tiểu tiết.',
      },
      {
        id: 'en-l8-q2',
        type: 'mcq',
        prompt: 'Trong IELTS Reading, cụm từ "a major drawback" thường được paraphrase thành cụm nào sau đây?',
        options: ['a primary advantage', 'a significant disadvantage', 'a financial reward', 'an unexpected solution'],
        correctAnswer: 'a significant disadvantage',
        explanation: 'major = significant; drawback = disadvantage (nhược điểm).',
      },
      {
        id: 'en-l8-q3',
        type: 'fill',
        prompt: 'Điền 1 từ từ đoạn văn: "Many cities are now ___ electric buses as a cleaner alternative." (gốc: adopt — chia thì hiện tại tiếp diễn)',
        correctAnswer: 'adopting',
        acceptedAnswers: ['adopting'],
        explanation: '"are now adopting" = hiện đang áp dụng.',
      },
      {
        id: 'en-l8-q4',
        type: 'mcq',
        prompt: 'Để chắc chắn đạt Band 6.0 Reading (Academic), bạn cần đúng tối thiểu khoảng bao nhiêu câu trên 40 câu?',
        options: ['15–17 câu', '23–26 câu', '33–35 câu', '38–40 câu'],
        correctAnswer: '23–26 câu',
        explanation: 'Thang điểm chuẩn IELTS Academic Reading: 23–26 câu đúng tương ứng Band 6.0 (27–29 câu là Band 6.5).',
      },
    ],
  },

  {
    id: 'en-l9',
    language: 'en',
    stageId: 'en-stage-3',
    order: 9,
    title: 'Bài 9: Listening Part 3 & 4 — Bám Mạch Bài Giảng & Multiple Choice',
    subtitle: 'Cách dùng từ chỉ dẫn (signposting words) để không bị lạc mạch ở bài giảng Part 4 và xử lý câu trắc nghiệm 2 người bàn luận ở Part 3.',
    targetBandOrLevel: 'Band 5.5 → 6.0',
    durationLabel: 'Tuần 17–18',
    booksAndMaterials: [
      'Cambridge IELTS 14–19 (Listening Test 1–4)',
      'Live chữa đề Listening Part 3–4 — @ieltstudau',
    ],
    resources: [
      {
        label: 'Chiến thuật Listening Part 3 & 4 — @ieltstudau',
        url: 'https://www.youtube.com/@ieltstudau/search?query=Listening+Part+4',
        source: 'YouTube · @ieltstudau',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Mẹo ăn điểm Listening Part 3 (thảo luận học thuật)',
        body: 'Cả 3 đáp án A, B, C thường ĐỀU được nhắc tới trong đoạn hội thoại. Đáp án đúng là phương án được cả hai người ĐỒNG Ý cuối cùng (chú ý giọng đồng tình: "That makes sense", "You are right, let\'s go with that").',
      },
      {
        heading: '2. Signposting Words trong Part 4 (bài giảng độc thoại)',
        body: 'Giảng viên luôn dùng từ dẫn đường để báo hiệu sắp chuyển sang ý tiếp theo: "Moving on to...", "Another key factor is...", "In contrast to...". Bám các tiêu đề in đậm (subheadings) trên giấy đề để không bị trôi mất câu.',
      },
    ],
    checklist: [
      'Làm trọn 1 đề Listening Cambridge 16 (40 câu) không dừng băng',
      'Nghe chép lại 5 câu bị sai ở Part 3 hoặc Part 4 bằng cách tạo bài mới trong mục Luyện Nghe',
      'Hoàn thành 4 bài tập thực chiến bên dưới',
    ],
    vocabPack: [
      { front: 'factor', reading: '/ˈfæktə(r)/', back: 'nhân tố, yếu tố', example: 'Temperature is a key factor affecting plant growth.', exampleVi: 'Nhiệt độ là yếu tố then chốt ảnh hưởng đến sự phát triển của cây.' },
      { front: 'conduct', reading: '/kənˈdʌkt/', back: 'tiến hành (nghiên cứu/khảo sát)', example: 'They decided to conduct a survey among 200 students.', exampleVi: 'Họ quyết định tiến hành một cuộc khảo sát với 200 sinh viên.' },
      { front: 'evidence', reading: '/ˈevɪdəns/', back: 'bằng chứng', example: 'There is little evidence to support that claim.', exampleVi: 'Có rất ít bằng chứng ủng hộ nhận định đó.' },
      { front: 'hypothesis', reading: '/haɪˈpɒθəsɪs/', back: 'giả thuyết khoa học', example: 'The experiment proved their original hypothesis wrong.', exampleVi: 'Thí nghiệm đã chứng minh giả thuyết ban đầu của họ sai.' },
    ],
    exercises: [
      {
        id: 'en-l9-q1',
        type: 'mcq',
        prompt: 'Nghe đoạn thảo luận Part 3 — Hai sinh viên cuối cùng chọn chủ đề thuyết trình nào?',
        audioText: 'We could present about solar cars, or maybe ocean plastic. Well, another group already took solar cars. What about urban farming? Oh, that sounds fresh and easy to find data for. Let us do urban farming then.',
        options: ['Solar cars', 'Ocean plastic', 'Urban farming'],
        correctAnswer: 'Urban farming',
        explanation: 'Solar cars đã có nhóm khác chọn, ocean plastic bị lướt qua, cả hai chốt đồng ý chọn "urban farming" ("Let us do urban farming then").',
      },
      {
        id: 'en-l9-q2',
        type: 'fill',
        prompt: 'Nghe câu bài giảng Part 4 và điền ĐÚNG 1 TỪ còn thiếu: "Early explorers used the stars to measure ___ during long sea voyages."',
        audioText: 'Before modern GPS existed, early explorers used the stars to measure distance during long sea voyages.',
        correctAnswer: 'distance',
        acceptedAnswers: ['distance'],
        explanation: 'Giảng viên đọc rõ "measure distance" (đo khoảng cách).',
      },
      {
        id: 'en-l9-q3',
        type: 'mcq',
        prompt: 'Cụm từ nào sau đây là dấu hiệu giảng viên Part 4 chuẩn bị chuyển sang MỤC MỚI trên đề bài?',
        options: ['For example,', 'Moving on to the next aspect,', 'In other words,', 'Such as'],
        correctAnswer: 'Moving on to the next aspect,',
        explanation: '"Moving on to..." là cụm từ dẫn đường kinh điển báo hiệu chuyển sang phần tiếp theo.',
      },
      {
        id: 'en-l9-q4',
        type: 'order',
        prompt: 'Sắp xếp thành câu học thuật chuẩn Listening/Reading Part 4:',
        tokens: ['Researchers', 'conducted a survey', 'to examine', 'the main factors', 'behind sleep loss.'],
        correctAnswer: 'Researchers conducted a survey to examine the main factors behind sleep loss.',
        explanation: 'Collocation chuẩn học thuật: conduct a survey + to examine + factors behind...',
      },
    ],
  },

  {
    id: 'en-l10',
    language: 'en',
    stageId: 'en-stage-3',
    order: 10,
    title: 'Bài 10: Writing Task 2 Band 6.0+ — Khung PEEL & Câu Phức Ăn Điểm',
    subtitle: 'Triển khai bài luận 250+ từ mạch lạc không bị lạc đề, dùng câu phức nhượng bộ và từ nối học thuật chuẩn Band 6.0–6.5.',
    targetBandOrLevel: 'Band 5.5 → 6.0+',
    durationLabel: 'Tuần 19–20',
    booksAndMaterials: [
      'Playlist Streamline Writing Task 2 — @ieltstudau',
      'IELTS Advantage: Writing Skills & Destination B2',
    ],
    resources: [
      {
        label: 'Streamline Writing Task 2 — Thế Quang',
        url: 'https://www.youtube.com/@ieltstudau/search?query=Writing+Task+2',
        source: 'YouTube · @ieltstudau',
      },
    ],
    summaryPoints: [
      {
        heading: '1. Công thức viết Body Paragraph bằng PEEL',
        body: 'P (Point — 1 câu nêu luận điểm chính) → E (Explain — giải thích tại sao) → E (Example — ví dụ ngắn thực tế) → L (Link — chốt lại kết quả). Chỉ cần 2 đoạn Body theo đúng PEEL là đủ 260–280 từ cực chặt chẽ.',
      },
      {
        heading: '2. 3 cấu trúc câu phức giúp chắc chắn Band 6.0+ Grammar',
        body: '1) Nhượng bộ: Although / While + S + V, S + V. 2) Điều kiện: If governments invest in..., ... will... 3) Mệnh đề quan hệ nối kết quả: ..., which leads to + N.',
        examples: [
          { text: 'Although online courses offer great flexibility, they require strong self-discipline.', meaning: 'Câu phức nhượng bộ ngắn gọn, rõ ý, đúng ngữ pháp.' },
        ],
      },
    ],
    checklist: [
      'Lập dàn ý 5 phút + viết hoàn chỉnh 1 bài Writing Task 2 (250+ từ) trong 40 phút',
      'Tự kiểm tra 4 tiêu chí: Trả lời đủ đề? Có Overview/Thesis? Có từ nối? Có ít nhất 3 câu phức?',
      'Hoàn thành bài kiểm tra tổng kết Chặng 3 bên dưới để chốt mốc Band 6.0!',
    ],
    vocabPack: [
      { front: 'self-discipline', reading: '/ˌself ˈdɪsəplɪn/', back: 'tính tự giác, kỷ luật bản thân', example: 'Self-study requires a high level of self-discipline.', exampleVi: 'Tự học đòi hỏi mức độ tự giác cao.' },
      { front: 'flexibility', reading: '/ˌfleksəˈbɪləti/', back: 'sự linh hoạt', example: 'Remote work gives employees greater flexibility.', exampleVi: 'Làm việc từ xa mang lại sự linh hoạt lớn hơn cho nhân viên.' },
      { front: 'furthermore', reading: '/ˌfɜːðəˈmɔː(r)/', back: 'hơn nữa (từ nối học thuật bổ sung ý)', example: 'Furthermore, public transport reduces carbon emissions.', exampleVi: 'Hơn nữa, giao thông công cộng giúp giảm khí thải carbon.' },
      { front: 'inevitable', reading: '/ɪnˈevɪtəbl/', back: 'không thể tránh khỏi', example: 'Technological change is inevitable in modern society.', exampleVi: 'Sự thay đổi công nghệ là điều không thể tránh khỏi trong xã hội hiện đại.' },
    ],
    exercises: [
      {
        id: 'en-l10-q1',
        type: 'mcq',
        prompt: 'Chọn câu đúng ngữ pháp (chú ý lỗi cực hay gặp ở Band 5.0 khi dùng "Although"):',
        options: [
          'Although working from home saves time, but it can feel lonely.',
          'Although working from home saves time, it can feel lonely.',
          'Although save time, working from home can feel lonely.',
          'Despite working from home saves time, it can feel lonely.',
        ],
        correctAnswer: 'Although working from home saves time, it can feel lonely.',
        explanation: 'Trong tiếng Anh KHÔNG bao giờ dùng "Although ... but ..." cùng lúc! Và "Despite" chỉ đi với Danh từ/V-ing, không đi với mệnh đề S+V.',
      },
      {
        id: 'en-l10-q2',
        type: 'mcq',
        prompt: 'Trong đoạn văn PEEL, câu "For instance, commuters in big cities can save up to an hour daily by taking the metro." đóng vai trò gì?',
        options: ['Point (Luận điểm)', 'Example (Ví dụ minh họa)', 'Thesis Statement (Câu luận đề mở bài)', 'Conclusion (Kết bài)'],
        correctAnswer: 'Example (Ví dụ minh họa)',
        explanation: '"For instance," báo hiệu câu Ví dụ cụ thể làm sáng tỏ luận điểm.',
      },
      {
        id: 'en-l10-q3',
        type: 'fill',
        prompt: 'Điền 1 từ nối chỉ kết quả phù hợp: "Traffic congestion wastes millions of hours each year; ___, governments should invest more in public transport." (therefore / however)',
        correctAnswer: 'therefore',
        acceptedAnswers: ['therefore'],
        explanation: 'Vế sau là hệ quả/giải pháp rút ra từ vế trước → dùng "therefore" (do đó).',
      },
      {
        id: 'en-l10-q4',
        type: 'order',
        prompt: 'Ghép thành câu phức Band 6.5 hoàn chỉnh:',
        tokens: ['Although', 'technology', 'improves communication,', 'face-to-face interaction', 'remains essential.'],
        correctAnswer: 'Although technology improves communication, face-to-face interaction remains essential.',
        explanation: 'Cấu trúc nhượng bộ sắc gọn, từ vựng học thuật (face-to-face interaction, remains essential).',
      },
    ],
  },
];
