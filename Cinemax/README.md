# CinemaMax - Phiên bản HTML/CSS/JSON

Phiên bản thuần **HTML, CSS và JSON**, cấu trúc gọn tương tự project `src`.

## Cấu trúc

```
Cinemax/
├── customer/          # Trang khách (gom chung)
│   ├── index.html     # Trang chủ
│   ├── login.html     # Đăng nhập / Đăng ký
│   ├── movies.html    # Danh sách phim
│   ├── movie-detail.html
│   ├── booking.html
│   ├── seat-selection.html
│   ├── payment.html
│   └── theaters.html
├── admin/             # Trang quản trị
│   ├── index.html
│   ├── movies.html
│   ├── schedules.html
│   ├── transactions.html
│   ├── theaters.html
│   └── statistics.html
├── css/style.css
├── js/app.js
├── js/data.json
├── index.html         # Redirect → customer/index.html
├── package.json       # Script chạy (giống src)
└── server/           # Backend (tùy chọn)
```

## Cách chạy

### Cách 1: Static (nhanh, giống `npm run dev` của src)
```bash
cd Cinemax
npm run dev
```
Mở http://localhost:8080 → tự redirect sang customer.

### Cách 2: Có Backend (API, đăng nhập)
```bash
cd Cinemax
npm start
```
Mở http://localhost:3000 (trang khách), http://localhost:3000/admin/ (admin).

### Cách 3: Python
```bash
cd Cinemax
python -m http.server 8080
```

## URL

- **Trang khách:** `/` hoặc `/customer/index.html`
- **Đăng nhập:** `/customer/login.html`
- **Admin:** `/admin/`
