# Hướng Dẫn Kết Nối Firebase & Đưa Web Lên GitHub Pages

Chỉ mất khoảng **5 phút** và **hoàn toàn miễn phí**.

---

## Phần 1: Tạo Backend Firebase (Miễn phí - Spark Plan)

1. Truy cập [https://console.firebase.google.com/](https://console.firebase.google.com/) và đăng nhập bằng tài khoản Google của bạn.
2. Bấm **Create a project** (đặt tên ví dụ `kotoba-lab`, có thể tắt Google Analytics cho nhanh).
3. Tạo cơ sở dữ liệu lưu tiến độ:
   - Ở menu bên trái chọn **Build → Firestore Database → Create database**.
   - Chọn khu vực gần Việt Nam nhất (ví dụ `asia-southeast1` - Singapore).
   - Chọn **Start in production mode** → bấm **Create**.
4. Mở quyền truy cập cho riêng mã đồng bộ cá nhân của bạn:
   - Trong **Firestore Database**, chuyển sang tab **Rules**.
   - Dán đoạn rule sau (đổi `batru-kotoba-secret-2026` thành một chuỗi bí mật do riêng bạn đặt):

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /kotoba_spaces/{spaceId}/data/{docId} {
         allow read, write: if spaceId == "batru-kotoba-secret-2026";
       }
     }
   }
   ```

   - Bấm **Publish**.
5. Lấy cấu hình kết nối (`firebaseConfig`):
   - Bấm biểu tượng **Bánh răng (Project settings)** ở góc trên trái → cuộn xuống mục **Your apps** → bấm biểu tượng **Web (`</>`)**.
   - Đặt tên app (vd `kotoba-web`) → bấm **Register app** (không cần tick Firebase Hosting).
   - Copy toàn bộ đoạn `const firebaseConfig = { ... };`.

---

## Phần 2: Cách để mở link trên ĐT / Laptop / PC là "Tự đăng nhập luôn"

Có **2 cách** (bạn có thể chọn cách nào tiện nhất):

### Cách A (Dễ nhất — Không cần chỉnh code): Dùng Magic Bookmark Link
1. Mở trang web KotobaLab trên máy tính → vào mục **Đồng bộ Firebase (Sync)**.
2. Dán đoạn `firebaseConfig` vừa copy vào ô **Dán nhanh** → bấm **Tự động điền**.
3. Nhập **Mã đồng bộ cá nhân** trùng khớp với chuỗi bạn đã đặt trong Firestore Rules (vd `batru-kotoba-secret-2026`).
4. Bấm **Lưu cấu hình & Đồng bộ ngay**.
5. Copy đường link ở mục **Link Tự Đăng Nhập (Magic Bookmark Link)** và gửi sang điện thoại / laptop rồi lưu thành Bookmark (hoặc **Thêm vào màn hình chính** trên điện thoại).
   - Từ giờ mỗi khi bấm mở web trên bất kỳ thiết bị nào, web sẽ **tự nhớ cấu hình, tự đăng nhập và tự đồng bộ luôn**!

### Cách B (Cắm cứng vào bản build GitHub Pages): Dùng GitHub Secrets
Nếu bạn muốn ai mở đúng link GitHub Pages của bạn (chỉ mình bạn biết) là tự động nối sẵn Firebase mà không cần Magic Link:
1. Vào GitHub Repository của bạn → **Settings → Secrets and variables → Actions → New repository secret**.
2. Thêm lần lượt các secret:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_SYNC_SPACE_ID` (chính là mã bí mật bạn đặt ở Bước 4)
3. Mỗi lần GitHub Actions build lại, cấu hình sẽ tự động được nạp sẵn.

---

## Phần 3: Đưa trang web lên GitHub Pages

1. Tạo một repository mới trên GitHub (ví dụ `kotoba-lab`).
2. Mở Terminal/PowerShell trong thư mục `c:\Users\batru\Documents\kotoba-lab` và chạy:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: KotobaLab EN & JP study app"
   git branch -M main
   git remote add origin https://github.com/<TEN_GITHUB_CUA_BAN>/kotoba-lab.git
   git push -u origin main
   ```

3. Trên GitHub, vào **Settings → Pages**:
   - Ở mục **Build and deployment → Source**, chọn **GitHub Actions**.
4. Chờ khoảng 1 phút để workflow **Deploy KotobaLab to GitHub Pages** chạy xong.
5. Truy cập trang web của bạn tại: `https://<TEN_GITHUB_CUA_BAN>.github.io/kotoba-lab/`.
