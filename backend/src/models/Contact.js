const { dbRun, dbGet, dbAll } = require('../config/database');

class Contact {
  // 担当者作成
  static async create(contactData) {
    const {
      company_id, name, name_kana, department, position,
      email, phone, mobile_phone, notes
    } = contactData;

    const sql = `
      INSERT INTO contacts (
        company_id, name, name_kana, department, position,
        email, phone, mobile_phone, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await dbRun(sql, [
      company_id, name, name_kana, department, position,
      email, phone, mobile_phone, notes
    ]);

    return result.id;
  }

  // IDで担当者取得
  static async findById(contact_id) {
    const sql = `
      SELECT * FROM contacts
      WHERE contact_id = ? AND is_deleted = 0
    `;
    return await dbGet(sql, [contact_id]);
  }

  // 法人IDで担当者一覧取得
  static async findByCompanyId(company_id) {
    const sql = `
      SELECT * FROM contacts
      WHERE company_id = ? AND is_deleted = 0
      ORDER BY created_at DESC
    `;
    return await dbAll(sql, [company_id]);
  }

  // 担当者更新
  static async update(contact_id, contactData) {
    const {
      name, name_kana, department, position,
      email, phone, mobile_phone, notes
    } = contactData;

    const sql = `
      UPDATE contacts
      SET name = ?, name_kana = ?, department = ?, position = ?,
          email = ?, phone = ?, mobile_phone = ?, notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE contact_id = ? AND is_deleted = 0
    `;

    return await dbRun(sql, [
      name, name_kana, department, position,
      email, phone, mobile_phone, notes, contact_id
    ]);
  }

  // 担当者削除（論理削除）
  static async delete(contact_id) {
    const sql = `
      UPDATE contacts
      SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP
      WHERE contact_id = ?
    `;
    return await dbRun(sql, [contact_id]);
  }
}

module.exports = Contact;
