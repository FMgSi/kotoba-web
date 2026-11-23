import React from 'react';
import { BookOpenCheck, PenLine, Clock } from 'lucide-react';
import type { Language } from '../types';

interface ComingSoonPageProps {
  skill: 'reading' | 'writing';
  language: Language;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ skill, language }) => {
  const isReading = skill === 'reading';
  const Icon = isReading ? BookOpenCheck : PenLine;

  const roadmap = isReading
    ? language === 'en'
      ? [
          'Giao diện chia đôi màn hình chuẩn IELTS Reading (bài đọc bên trái, câu hỏi bên phải)',
          'Highlight đoạn văn & click tra từ mới gửi thẳng sang bộ thẻ Anki',
          'Nhập bài đọc từ sách Cambridge IELTS hoặc nguồn miễn phí (BBC / VOA / Breaking News English)',
        ]
      : [
          'Bài đọc Minna no Nihongo & NHK News Web Easy có nút bật/tắt Furigana',
          'Đánh dấu giải thích mẫu ngữ pháp N5 → N3 theo sách ngữ pháp',
          'Bấm trực tiếp vào từ mới trong bài đọc để lưu sang bộ viết tay Anki',
        ]
    : language === 'en'
    ? [
        'Khung luyện IELTS Writing Task 1 & Task 2 có đếm từ, bấm giờ & dàn ý gợi ý',
        'Bài tập viết lại câu (Paraphrasing) phù hợp mục tiêu từ 3.0 lên 5.5–6.5',
        'Tùy chọn gắn Gemini API cá nhân để sửa lỗi ngữ pháp & gợi ý cách viết tự nhiên',
      ]
    : [
        'Bài tập chia thể động từ / tính từ (ます, て, ない, た) bám sát Minna no Nihongo',
        'Điền trợ từ (は / が / に / で / を) và sắp xếp câu dấu sao (★)',
        'Dịch câu Việt → Nhật kết hợp bảng viết tay cảm ứng & chấm ngữ pháp',
      ];

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-indigo-300 bg-white p-8 text-center shadow-sm dark:border-indigo-900 dark:bg-slate-900">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
        <Icon className="h-7 w-7" />
      </div>
      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
        <Clock className="h-3.5 w-3.5" />
        Giai đoạn 2 — Tạm để sau theo kế hoạch
      </div>
      <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
        {isReading ? 'Luyện Đọc (Reading)' : 'Luyện Viết & Ngữ pháp (Writing)'} —{' '}
        {language === 'en' ? '🇬🇧 Tiếng Anh' : '🇯🇵 Tiếng Nhật'}
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Hiện tại hãy tập trung xây nền vững với <b>Từ vựng (Anki / Viết tay JP)</b> và <b>Luyện Nghe (DailyDictation)</b>. Khi sẵn sàng, mình sẽ mở khóa tiếp phần này:
      </p>

      <ul className="mt-6 space-y-2.5 text-left text-sm text-slate-700 dark:text-slate-300">
        {roadmap.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
              {idx + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
