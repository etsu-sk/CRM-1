const { dbRun, dbGet, dbAll } = require('../config/database');

class CompanyUser {
  // 担当者割り当て
  static async assign(company_id, user_id, is_primary = 0, start_date = null) {
    const sql = `
      INSERT INTO company_users (company_id, user_id, is_primary, start_date)
      VALUES (?, ?, ?, ?)
    `;

    const result = await dbRun(sql, [
      company_id, user_id, is_primary,
      start_date || new Date().toISOString().split('T')[0]
    ]);

    return result.id;
  }

  // 法人の担当者一覧取得
  static async findByCompanyId(company_id) {
    const sql = `
      SELECT cu.*, u.name as user_name, u.email
      FROM company_users cu
      INNER JOIN users u ON cu.user_id = u.user_id
      WHERE cu.company_id = ?
        AND (cu.end_date IS NULL OR cu.end_date >= date('now'))
      ORDER BY cu.is_primary DESC, cu.created_at ASC
    `;
    return await dbAll(sql, [company_id]);
  }

  // ユーザーの担当法人一覧取得
  static async findByUserId(user_id) {
    const sql = `
      SELECT cu.*, c.company_name
      FROM company_users cu
      INNER JOIN companies c ON cu.company_id = c.company_id
      WHERE cu.user_id = ?
        AND c.is_deleted = 0
        AND (cu.end_date IS NULL OR cu.end_date >= date('now'))
      ORDER BY cu.is_primary DESC, cu.created_at DESC
    `;
    return await dbAll(sql, [user_id]);
  }

  // ユーザーが法人の担当者かチェック
  static async isUserAssigned(company_id, user_id) {
    const sql = `
      SELECT * FROM company_users
      WHERE company_id = ? AND user_id = ?
        AND (end_date IS NULL OR end_date >= date('now'))
    `;
    const result = await dbGet(sql, [company_id, user_id]);
    return !!result;
  }

  // 担当解除
  static async unassign(company_id, user_id) {
    const sql = `
      UPDATE company_users
      SET end_date = date('now')
      WHERE company_id = ? AND user_id = ?
        AND (end_date IS NULL OR end_date >= date('now'))
    `;
    return await dbRun(sql, [company_id, user_id]);
  }

  // 主担当変更
  static async setPrimary(company_id, user_id) {
    // まず全員を副担当に
    await dbRun(`
      UPDATE company_users
      SET is_primary = 0
      WHERE company_id = ?
    `, [company_id]);

    // 指定ユーザーを主担当に
    const sql = `
      UPDATE company_users
      SET is_primary = 1
      WHERE company_id = ? AND user_id = ?
    `;
    return await dbRun(sql, [company_id, user_id]);
  }
}

module.exports = CompanyUser;
