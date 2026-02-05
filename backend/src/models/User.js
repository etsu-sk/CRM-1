const { dbRun, dbGet, dbAll } = require('../config/database');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

class User {
  // ユーザー作成
  static async create(userData) {
    const { login_id, password, name, email, role = 'user' } = userData;
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const sql = `
      INSERT INTO users (login_id, password_hash, name, email, role, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `;

    try {
      const result = await dbRun(sql, [login_id, password_hash, name, email, role]);
      return result.id;
    } catch (error) {
      throw new Error('ユーザー作成エラー: ' + error.message);
    }
  }

  // ログインIDでユーザー検索
  static async findByLoginId(login_id) {
    const sql = `SELECT * FROM users WHERE login_id = ? AND is_active = 1`;
    return await dbGet(sql, [login_id]);
  }

  // IDでユーザー検索
  static async findById(user_id) {
    const sql = `SELECT * FROM users WHERE user_id = ? AND is_active = 1`;
    return await dbGet(sql, [user_id]);
  }

  // 全ユーザー取得
  static async findAll() {
    const sql = `
      SELECT user_id, login_id, name, email, role, is_active, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `;
    return await dbAll(sql);
  }

  // パスワード検証
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // ユーザー更新
  static async update(user_id, userData) {
    const { name, email, role, is_active } = userData;
    const sql = `
      UPDATE users
      SET name = ?, email = ?, role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `;
    return await dbRun(sql, [name, email, role, is_active, user_id]);
  }

  // パスワード更新
  static async updatePassword(user_id, newPassword) {
    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const sql = `
      UPDATE users
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `;
    return await dbRun(sql, [password_hash, user_id]);
  }

  // ユーザー無効化（論理削除）
  static async deactivate(user_id) {
    const sql = `
      UPDATE users
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `;
    return await dbRun(sql, [user_id]);
  }

  // 初期管理者ユーザー作成
  static async createInitialAdmin() {
    const existingAdmin = await this.findByLoginId('admin');
    if (!existingAdmin) {
      await this.create({
        login_id: 'admin',
        password: 'admin',
        name: '管理者',
        email: 'admin@example.com',
        role: 'admin'
      });
      console.log('初期管理者ユーザーを作成しました (login_id: admin, password: admin)');
    }
  }
}

module.exports = User;
