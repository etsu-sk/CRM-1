const { dbRun, dbGet, dbAll } = require('../config/database');

class Quotation {
  // 見積書作成
  static async create(quotationData) {
    const {
      company_id, user_id, title, file_name, file_path,
      file_size, file_type, amount, quotation_date, notes
    } = quotationData;

    const sql = `
      INSERT INTO quotations (
        company_id, user_id, title, file_name, file_path,
        file_size, file_type, amount, quotation_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await dbRun(sql, [
      company_id, user_id, title, file_name, file_path,
      file_size, file_type, amount, quotation_date, notes
    ]);

    return result.id;
  }

  // IDで見積書取得
  static async findById(quotation_id) {
    const sql = `
      SELECT q.*, u.name as user_name, c.company_name
      FROM quotations q
      LEFT JOIN users u ON q.user_id = u.user_id
      LEFT JOIN companies c ON q.company_id = c.company_id
      WHERE q.quotation_id = ? AND q.is_deleted = 0
    `;
    return await dbGet(sql, [quotation_id]);
  }

  // 法人IDで見積書一覧取得
  static async findByCompanyId(company_id) {
    const sql = `
      SELECT q.*, u.name as user_name
      FROM quotations q
      LEFT JOIN users u ON q.user_id = u.user_id
      WHERE q.company_id = ? AND q.is_deleted = 0
      ORDER BY q.quotation_date DESC, q.created_at DESC
    `;
    return await dbAll(sql, [company_id]);
  }

  // 全見積書取得（管理者用）
  static async findAll(limit = 100, offset = 0) {
    const sql = `
      SELECT q.*, c.company_name, u.name as user_name
      FROM quotations q
      LEFT JOIN companies c ON q.company_id = c.company_id
      LEFT JOIN users u ON q.user_id = u.user_id
      WHERE q.is_deleted = 0
      ORDER BY q.quotation_date DESC, q.created_at DESC
      LIMIT ? OFFSET ?
    `;
    return await dbAll(sql, [limit, offset]);
  }

  // 見積書更新
  static async update(quotation_id, quotationData) {
    const { title, amount, quotation_date, notes } = quotationData;

    const sql = `
      UPDATE quotations
      SET title = ?, amount = ?, quotation_date = ?, notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE quotation_id = ? AND is_deleted = 0
    `;

    return await dbRun(sql, [title, amount, quotation_date, notes, quotation_id]);
  }

  // 見積書削除（論理削除）
  static async delete(quotation_id) {
    const sql = `
      UPDATE quotations
      SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP
      WHERE quotation_id = ?
    `;
    return await dbRun(sql, [quotation_id]);
  }
}

module.exports = Quotation;
