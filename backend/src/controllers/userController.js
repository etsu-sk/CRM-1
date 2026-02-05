const User = require('../models/User');

// ユーザー一覧取得
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ users });
  } catch (error) {
    console.error('ユーザー一覧取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// ユーザー詳細取得
exports.getUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    // パスワードハッシュを除外
    const { password_hash, ...userData } = user;

    res.json(userData);
  } catch (error) {
    console.error('ユーザー詳細取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// ユーザー作成
exports.createUser = async (req, res) => {
  try {
    const { login_id, password, name, email, role } = req.body;

    if (!login_id || !password || !name || !email) {
      return res.status(400).json({ error: '必須項目が不足しています' });
    }

    // ログインID重複チェック
    const existing = await User.findByLoginId(login_id);
    if (existing) {
      return res.status(400).json({ error: 'このログインIDは既に使用されています' });
    }

    const user_id = await User.create({ login_id, password, name, email, role });

    res.status(201).json({
      message: 'ユーザーを作成しました',
      user_id
    });
  } catch (error) {
    console.error('ユーザー作成エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// ユーザー更新
exports.updateUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { name, email, role, is_active } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: '名前とメールアドレスは必須です' });
    }

    await User.update(user_id, { name, email, role, is_active });

    res.json({ message: 'ユーザー情報を更新しました' });
  } catch (error) {
    console.error('ユーザー更新エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// パスワードリセット
exports.resetPassword = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({ error: '新しいパスワードが必要です' });
    }

    await User.updatePassword(user_id, new_password);

    res.json({ message: 'パスワードをリセットしました' });
  } catch (error) {
    console.error('パスワードリセットエラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// ユーザー無効化
exports.deactivateUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    // 自分自身を無効化できないようにする
    if (parseInt(user_id) === req.user.user_id) {
      return res.status(400).json({ error: '自分自身を無効化することはできません' });
    }

    await User.deactivate(user_id);

    res.json({ message: 'ユーザーを無効化しました' });
  } catch (error) {
    console.error('ユーザー無効化エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};
