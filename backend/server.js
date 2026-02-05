const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const User = require('./src/models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ルート
const authRoutes = require('./src/routes/auth');
const companyRoutes = require('./src/routes/companies');
const contactRoutes = require('./src/routes/contacts');
const activityRoutes = require('./src/routes/activities');
const userRoutes = require('./src/routes/users');
const quotationRoutes = require('./src/routes/quotations');

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quotations', quotationRoutes);

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CRM API is running' });
});

// 本番環境: フロントエンドの静的ファイルを配信
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  // SPA用: API以外のルートはindex.htmlを返す
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'エンドポイントが見つかりません' });
    }
  });
}

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('エラー:', err);
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

// サーバー起動
app.listen(PORT, async () => {
  console.log(`CRM APIサーバーが起動しました: http://localhost:${PORT}`);

  // 初期管理者ユーザー作成
  try {
    await User.createInitialAdmin();
  } catch (error) {
    console.error('初期ユーザー作成エラー:', error);
  }
});

module.exports = app;
