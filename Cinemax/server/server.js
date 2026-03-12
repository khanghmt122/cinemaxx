/**
 * CinemaMax Backend - Express + MongoDB (basic)
 * Chạy: cd server && npm install && npm start
 * Mặc định: MongoDB local mongodb://127.0.0.1:27017/cinemamax
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Thư mục gốc chứa index.html, admin/, js/data.json
const ROOT = path.join(__dirname, '..');
const DATA_JSON_PATH = path.join(ROOT, 'js', 'data.json');

app.use(cors());
app.use(express.json());

// ----- MongoDB -----
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cinemamax';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('Đã kết nối MongoDB:', MONGO_URI);
    await ensureSeedUsers();
  })
  .catch((err) => {
    console.error('Lỗi kết nối MongoDB, backend vẫn chạy nhưng auth sẽ lỗi:', err.message);
  });

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // demo: lưu plain, thực tế cần hash
    name: { type: String, required: true },
    phone: { type: String },
    role: { type: String, default: 'user', enum: ['admin', 'user'] }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

async function ensureSeedUsers() {
  const count = await User.estimatedDocumentCount();
  if (count > 0) return;
  const seed = [
    {
      email: 'admin@cinemamax.vn',
      password: 'admin123',
      name: 'CinemaMax Admin',
      phone: '0900000000',
      role: 'admin'
    },
    {
      email: 'user1@gmail.com',
      password: 'user123',
      name: 'User 1',
      phone: '0900000001',
      role: 'user'
    }
  ];
  await User.insertMany(seed);
  console.log('Đã seed tài khoản mặc định vào MongoDB.');
}

// ----- Helpers -----
function readJson(filePath, defaultValue) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return defaultValue !== undefined ? defaultValue : {};
  }
}

// --- API: Dữ liệu rạp (phim, suất chiếu, thống kê...) từ data.json ---
app.get('/api/data', function (req, res) {
  const data = readJson(DATA_JSON_PATH, {});
  res.json(data);
});

// --- API: Đăng nhập (user trong MongoDB) ---
app.post('/api/auth/login', async function (req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Thiếu email hoặc mật khẩu' });
  }
  try {
    const user = await User.findOne({ email: email.toLowerCase(), password }).lean();
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// --- API: Đăng ký (lưu user vào MongoDB) ---
app.post('/api/auth/register', async function (req, res) {
  const { name, email, phone, password } = req.body || {};
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
  }
  try {
    const existing = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      role: 'user'
    });
    const { password: _, ...safeUser } = user.toObject();
    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// --- Serve file tĩnh: trang khách (customer/*) và admin (admin/*) ---
app.use(express.static(ROOT));

// Fallback: chỉ cho file tồn tại, còn lại 404 (không phải SPA)
app.get('*', function (req, res, next) {
  if (req.path.startsWith('/api/')) return next();
  const filePath = path.join(ROOT, req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) return res.sendFile(filePath);
  res.status(404).send('Not found');
});

app.listen(PORT, function () {
  console.log('CinemaMax Backend đang chạy: http://localhost:' + PORT);
  console.log('  - Trang khách: http://localhost:' + PORT + '/customer/index.html');
  console.log('  - Đăng nhập:   http://localhost:' + PORT + '/customer/login.html');
  console.log('  - Admin:       http://localhost:' + PORT + '/admin/');
});
