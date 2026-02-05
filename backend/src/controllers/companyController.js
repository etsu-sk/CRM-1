const Company = require('../models/Company');
const CompanyUser = require('../models/CompanyUser');
const { filterCompaniesByPermission } = require('../middleware/permissions');

// 法人一覧取得
exports.getCompanies = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const permission = filterCompaniesByPermission(req.user);

    let companies;
    let total;

    if (permission.type === 'all') {
      // 管理者：全法人取得
      companies = await Company.findAll(search, parseInt(limit), parseInt(offset));
      total = await Company.count(search);
    } else {
      // 一般ユーザー：担当法人のみ
      companies = await Company.findByUserId(permission.user_id, search, parseInt(limit), parseInt(offset));
      total = companies.length; // 簡易的な実装
    }

    res.json({
      companies,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('法人一覧取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 法人詳細取得
exports.getCompany = async (req, res) => {
  try {
    const { company_id } = req.params;
    const company = await Company.findById(company_id);

    if (!company) {
      return res.status(404).json({ error: '法人が見つかりません' });
    }

    // 担当者情報も取得
    const assignedUsers = await CompanyUser.findByCompanyId(company_id);

    res.json({
      ...company,
      assigned_users: assignedUsers
    });
  } catch (error) {
    console.error('法人詳細取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 法人作成
exports.createCompany = async (req, res) => {
  try {
    const companyData = req.body;

    if (!companyData.company_name) {
      return res.status(400).json({ error: '法人名は必須です' });
    }

    const company_id = await Company.create(companyData);

    // 作成者を担当者として割り当て
    if (req.user.role === 'user') {
      await CompanyUser.assign(company_id, req.user.user_id, 1);
    }

    res.status(201).json({
      message: '法人を作成しました',
      company_id
    });
  } catch (error) {
    console.error('法人作成エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 法人更新
exports.updateCompany = async (req, res) => {
  try {
    const { company_id } = req.params;
    const companyData = req.body;

    if (!companyData.company_name) {
      return res.status(400).json({ error: '法人名は必須です' });
    }

    await Company.update(company_id, companyData);

    res.json({ message: '法人情報を更新しました' });
  } catch (error) {
    console.error('法人更新エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 法人削除
exports.deleteCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    await Company.delete(company_id);

    res.json({ message: '法人を削除しました' });
  } catch (error) {
    console.error('法人削除エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 担当者割り当て
exports.assignUser = async (req, res) => {
  try {
    const { company_id } = req.params;
    const { user_id, is_primary } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'ユーザーIDが必要です' });
    }

    await CompanyUser.assign(company_id, user_id, is_primary || 0);

    res.json({ message: '担当者を割り当てました' });
  } catch (error) {
    console.error('担当者割り当てエラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 担当者解除
exports.unassignUser = async (req, res) => {
  try {
    const { company_id, user_id } = req.params;

    await CompanyUser.unassign(company_id, user_id);

    res.json({ message: '担当者を解除しました' });
  } catch (error) {
    console.error('担当者解除エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};
