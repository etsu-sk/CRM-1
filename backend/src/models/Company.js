const { dbRun, dbGet, dbAll } = require('../config/database');

class Company {
  // 法人作成
  static async create(companyData) {
    const {
      company_name, company_name_kana, postal_code, address,
      phone, fax, industry, employee_count, established_date,
      website_url, notes
    } = companyData;

    const sql = `
      INSERT INTO companies (
        company_name, company_name_kana, postal_code, address,
        phone, fax, industry, employee_count, established_date,
        website_url, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await dbRun(sql, [
      company_name, company_name_kana, postal_code, address,
      phone, fax, industry, employee_count, established_date,
      website_url, notes
    ]);

    return result.id;
  }

  // IDで法人取得
  static async findById(company_id) {
    const sql = `
      SELECT * FROM companies
      WHERE company_id = ? AND is_deleted = 0
    `;
    return await dbGet(sql, [company_id]);
  }

  // 全法人取得
  static async findAll(searchTerm = '', limit = 100, offset = 0) {
    let sql = `
      SELECT * FROM companies
      WHERE is_deleted = 0
    `;
    const params = [];

    if (searchTerm) {
      sql += ` AND (company_name LIKE ? OR industry LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    sql += ` ORDER BY updated_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return await dbAll(sql, params);
  }

  // 担当ユーザーの法人を取得
  static async findByUserId(user_id, searchTerm = '', limit = 100, offset = 0) {
    let sql = `
      SELECT DISTINCT c.*
      FROM companies c
      INNER JOIN company_users cu ON c.company_id = cu.company_id
      WHERE c.is_deleted = 0
        AND cu.user_id = ?
        AND (cu.end_date IS NULL OR cu.end_date >= date('now'))
    `;
    const params = [user_id];

    if (searchTerm) {
      sql += ` AND (c.company_name LIKE ? OR c.industry LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    sql += ` ORDER BY c.updated_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return await dbAll(sql, params);
  }

  // 法人更新
  static async update(company_id, companyData) {
    const {
      company_name, company_name_kana, postal_code, address,
      phone, fax, industry, employee_count, established_date,
      website_url, notes
    } = companyData;

    const sql = `
      UPDATE companies
      SET company_name = ?, company_name_kana = ?, postal_code = ?,
          address = ?, phone = ?, fax = ?, industry = ?,
          employee_count = ?, established_date = ?, website_url = ?,
          notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE company_id = ? AND is_deleted = 0
    `;

    return await dbRun(sql, [
      company_name, company_name_kana, postal_code, address,
      phone, fax, industry, employee_count, established_date,
      website_url, notes, company_id
    ]);
  }

  // 法人削除（論理削除）
  static async delete(company_id) {
    const sql = `
      UPDATE companies
      SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP
      WHERE company_id = ?
    `;
    return await dbRun(sql, [company_id]);
  }

  // 法人件数取得
  static async count(searchTerm = '') {
    let sql = `SELECT COUNT(*) as count FROM companies WHERE is_deleted = 0`;
    const params = [];

    if (searchTerm) {
      sql += ` AND (company_name LIKE ? OR industry LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    const result = await dbGet(sql, params);
    return result.count;
  }
}

module.exports = Company;
