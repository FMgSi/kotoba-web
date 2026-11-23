# KotobaLab — Web Tự Học Tiếng Anh & Tiếng Nhật Cá Nhân

Ứng dụng web tĩnh chạy miễn phí trên **GitHub Pages**, dùng **Firebase Firestore** làm backend đồng bộ tiến độ giữa Điện thoại, Laptop và PC.

## Tính năng chính

1. **Từ vựng chuẩn Anki (FSRS — `ts-fsrs`):**
   - **Tiếng Anh (A2 → IELTS):** Lật thẻ chuẩn Anki (`Again / Hard / Good / Easy`), phát âm tự động, phím tắt nhanh.
   - **Tiếng Nhật (Kana → N5):** Chế độ **viết tay cảm ứng trực tiếp trên màn hình** dùng engine offline **KanjiCanvas** (MIT, hỗ trợ 100% Hiragana, Katakana và 2.000+ Kanji). Nhìn nghĩa / nghe phát âm → vẽ tay → máy nhận diện ghép từ và xác nhận đúng sai từng ký tự.
   - **Nhập từ Anki:** Hỗ trợ tải file `.apkg`, `.csv`, `.tsv`, `.txt` hoặc kéo trực tiếp từ app **Anki Desktop** qua **AnkiConnect**.
2. **Luyện Nghe phong cách DailyDictation (`Listen & Type`):**
   - Nghe từng câu, chỉnh tốc độ (`0.6x–1.2x`), phím tắt `Ctrl` nghe lại, `Enter` kiểm tra, `Alt+H` gợi ý.
   - Chấm lỗi theo từng từ (ẩn `***` các từ sai để nghe lại), bấm vào từ lạ trong transcript để lưu thẳng vào bộ thẻ Anki.
   - Hỗ trợ **giọng đọc TTS có sẵn**, **video YouTube + phụ đề `.srt`/`.vtt`**, và **link MP3**.
3. **Tự động đăng nhập & Đồng bộ 1 chạm (Firebase):**
   - Lưu cục bộ trên IndexedDB (học offline mượt mà).
   - Kết nối Firebase Firestore miễn phí + tạo **Magic Auto-Login Bookmark Link**: lưu bookmark trên điện thoại/PC/laptop, mở lên là tự đăng nhập và đồng bộ luôn.

## Chạy thử trên máy tính

```bash
npm install
npm run dev
```

Xem chi tiết hướng dẫn nối **Firebase** và đưa web lên **GitHub Pages** tại file [`HUONG_DAN_FIREBASE_GITHUB.md`](./HUONG_DAN_FIREBASE_GITHUB.md).
