# Hướng Dẫn Bảo Mật Firebase Bằng Tài Khoản Google (Chỉ Làm 1 Lần)

Web KotobaLab đã được cấu hình sẵn để **đăng nhập Google 1 lần duy nhất** trên từng thiết bị (PC, Laptop, Điện thoại), sau đó tự động giữ đăng nhập và đồng bộ dữ liệu riêng tư chỉ cho đúng Gmail của bạn.

---

## Bước 1: Bật đăng nhập Google trên Firebase Console
1. Mở project **`kotoba-lab`** tại [console.firebase.google.com](https://console.firebase.google.com/).
2. Menu bên trái chọn **`Security` → `Authentication`** (hoặc **`Build` → `Authentication`**) → bấm **`Get started`**.
3. Trong tab **`Sign-in method`**:
   - Bấm **`Google`** → gạt công tắc **`Enable`**.
   - Chọn **Support email** là Gmail của bạn → bấm **`Save`**.
4. Chuyển sang tab **`Settings` → `Authorized domains`**:
   - Bấm **`Add domain`** → nhập **`fmgsi.github.io`** → bấm **`Add`**.
   *(Bước này giúp Google cho phép đăng nhập từ trang GitHub Pages `https://fmgsi.github.io/kotoba-web/`.)*

---

## Bước 2: Khóa Firestore Rules theo đúng Gmail của bạn
1. Ở menu bên trái bấm **`Firestore`** → chọn tab **`Rules`**.
2. Xóa toàn bộ rule cũ và dán đoạn sau (thay đúng Gmail của bạn nếu khác):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/kotoba_data/{docId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId
        && request.auth.token.email == "batrunghoang832@gmail.com";
    }
  }
}
```

3. Bấm **`Publish`**.

---

## Bước 3: Sử dụng hằng ngày
- Mở **https://fmgsi.github.io/kotoba-web/** trên máy tính, laptop và điện thoại.
- Bấm **`Đăng nhập Google`** ở góc trên phải **đúng 1 lần duy nhất** trên mỗi thiết bị.
- Từ lần sau mở link lên là **tự đăng nhập & tự đồng bộ luôn**, còn người lạ truy cập link sẽ **không thể đọc hoặc sửa dữ liệu Firestore của bạn**.
