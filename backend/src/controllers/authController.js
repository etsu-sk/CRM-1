const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// ログイン
exports.login = async (req, res) => {
  try {
    const { login_id, password } = req.body;

    if (!login_id || !password) {
      return res.status(400).json({ error: 'ログインIDとパスワードが必要です' });
    }

    // ユーザー検索
    const user = await User.findByLoginId(login_id);

    if (!user) {
      return res.status(401).json({ error: 'ログインIDまたはパスワードが正しくありません' });
    }

    // パスワード検証
    const isValid = await User.verifyPassword(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'ログインIDまたはパスワードが正しくありません' });
    }

    // トークン生成
    const token = generateToken(user);

    // レスポンス
    res.json({
      token,
      user: {
        user_id: user.user_id,
        login_id: user.login_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 現在のユーザー情報取得
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);

    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    res.json({
      user_id: user.user_id,
      login_id: user.login_id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// パスワード変更
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: '現在のパスワードと新しいパスワードが必要です' });
    }

    // 現在のパスワード検証
    const user = await User.findById(req.user.user_id);
    const isValid = await User.verifyPassword(current_password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: '現在のパスワードが正しくありません' });
    }

    // パスワード更新
    await User.updatePassword(req.user.user_id, new_password);

    res.json({ message: 'パスワードを変更しました' });
  } catch (error) {
    console.error('パスワード変更エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};
