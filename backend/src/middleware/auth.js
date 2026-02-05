const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT秘密鍵（本番環境では環境変数から読み込む）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '24h';

// JWT生成
function generateToken(user) {
  const payload = {
    user_id: user.user_id,
    login_id: user.login_id,
    name: user.name,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// JWT検証ミドルウェア
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: '認証トークンが必要です' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // ユーザーが存在し、有効かチェック
    const user = await User.findById(decoded.user_id);
    if (!user) {
      return res.status(401).json({ error: 'ユーザーが見つかりません' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'トークンが無効です' });
  }
}

// 管理者権限チェック
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '管理者権限が必要です' });
  }
  next();
}

module.exports = {
  generateToken,
  authenticateToken,
  requireAdmin,
  JWT_SECRET
};
