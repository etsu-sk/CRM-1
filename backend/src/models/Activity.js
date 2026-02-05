const { dbRun, dbGet, dbAll } = require('../config/database');

class Activity {
  // 活動履歴作成
  static async create(activityData) {
    const {
      company_id, activity_date, user_id, activity_type,
      content, next_action_date, next_action_content
    } = activityData;

    const sql = `
      INSERT INTO activities (
        company_id, activity_date, user_id, activity_type,
        content, next_action_date, next_action_content
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await dbRun(sql, [
      company_id, activity_date, user_id, activity_type,
      content, next_action_date, next_action_content
    ]);

    return result.id;
  }

  // IDで活動履歴取得
  static async findById(activity_id) {
    const sql = `
      SELECT a.*, u.name as user_name, c.company_name
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.user_id
      LEFT JOIN companies c ON a.company_id = c.company_id
      WHERE a.activity_id = ? AND a.is_deleted = 0
    `;
    return await dbGet(sql, [activity_id]);
  }

  // 法人IDで活動履歴一覧取得
  static async findByCompanyId(company_id) {
    const sql = `
      SELECT a.*, u.name as user_name
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.user_id
      WHERE a.company_id = ? AND a.is_deleted = 0
      ORDER BY a.activity_date DESC, a.created_at DESC
    `;
    return await dbAll(sql, [company_id]);
  }

  // ユーザーIDで活動履歴一覧取得
  static async findByUserId(user_id, limit = 50) {
    const sql = `
      SELECT a.*, c.company_name, u.name as user_name
      FROM activities a
      LEFT JOIN companies c ON a.company_id = c.company_id
      LEFT JOIN users u ON a.user_id = u.user_id
      WHERE a.user_id = ? AND a.is_deleted = 0
      ORDER BY a.activity_date DESC, a.created_at DESC
      LIMIT ?
    `;
    return await dbAll(sql, [user_id, limit]);
  }

  // 全活動履歴取得（管理者用）
  static async findAll(limit = 100, offset = 0) {
    const sql = `
      SELECT a.*, c.company_name, u.name as user_name
      FROM activities a
      LEFT JOIN companies c ON a.company_id = c.company_id
      LEFT JOIN users u ON a.user_id = u.user_id
      WHERE a.is_deleted = 0
      ORDER BY a.activity_date DESC, a.created_at DESC
      LIMIT ? OFFSET ?
    `;
    return await dbAll(sql, [limit, offset]);
  }

  // ネクストアクション一覧取得
  static async findNextActions(user_id = null, daysAhead = 30) {
    let sql = `
      SELECT a.*, c.company_name, u.name as user_name
      FROM activities a
      LEFT JOIN companies c ON a.company_id = c.company_id
      LEFT JOIN users u ON a.user_id = u.user_id
      WHERE a.is_deleted = 0
        AND a.next_action_date IS NOT NULL
        AND a.next_action_date <= date('now', '+' || ? || ' days')
    `;
    const params = [daysAhead];

    if (user_id) {
      sql += ` AND a.user_id = ?`;
      params.push(user_id);
    }

    sql += ` ORDER BY a.next_action_date ASC`;

    return await dbAll(sql, params);
  }

  // 期日超過アクション取得
  static async findOverdueActions(user_id = null) {
    let sql = `
      SELECT a.*, c.company_name, u.name as user_name
      FROM activities a
      LEFT JOIN companies c ON a.company_id = c.company_id
      LEFT JOIN users u ON a.user_id = u.user_id
      WHERE a.is_deleted = 0
        AND a.next_action_date IS NOT NULL
        AND a.next_action_date < date('now')
    `;
    const params = [];

    if (user_id) {
      sql += ` AND a.user_id = ?`;
      params.push(user_id);
    }

    sql += ` ORDER BY a.next_action_date ASC`;

    return await dbAll(sql, params);
  }

  // 活動履歴更新
  static async update(activity_id, activityData) {
    const {
      activity_date, activity_type, content,
      next_action_date, next_action_content
    } = activityData;

    const sql = `
      UPDATE activities
      SET activity_date = ?, activity_type = ?, content = ?,
          next_action_date = ?, next_action_content = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE activity_id = ? AND is_deleted = 0
    `;

    return await dbRun(sql, [
      activity_date, activity_type, content,
      next_action_date, next_action_content, activity_id
    ]);
  }

  // 活動履歴削除（論理削除）
  static async delete(activity_id) {
    const sql = `
      UPDATE activities
      SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP
      WHERE activity_id = ?
    `;
    return await dbRun(sql, [activity_id]);
  }
}

module.exports = Activity;
