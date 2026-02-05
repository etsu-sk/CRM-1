const CompanyUser = require('../models/CompanyUser');
const Activity = require('../models/Activity');

// 法人へのアクセス権限チェック
async function checkCompanyAccess(req, res, next) {
  const { company_id } = req.params;
  const user = req.user;

  // 管理者は全アクセス可能
  if (user.role === 'admin') {
    req.hasEditPermission = true;
    return next();
  }

  // 一般ユーザーは担当法人のみアクセス可能
  const isAssigned = await CompanyUser.isUserAssigned(company_id, user.user_id);

  if (!isAssigned) {
    return res.status(403).json({ error: 'この法人へのアクセス権限がありません' });
  }

  req.hasEditPermission = true;
  next();
}

// 法人編集権限チェック
async function checkCompanyEditPermission(req, res, next) {
  const { company_id } = req.params;
  const user = req.user;

  // 管理者は全編集可能
  if (user.role === 'admin') {
    return next();
  }

  // 一般ユーザーは担当法人のみ編集可能
  const isAssigned = await CompanyUser.isUserAssigned(company_id, user.user_id);

  if (!isAssigned) {
    return res.status(403).json({ error: 'この法人への編集権限がありません' });
  }

  next();
}

// 活動履歴編集権限チェック（登録者本人または管理者のみ）
async function checkActivityEditPermission(req, res, next) {
  const { activity_id } = req.params;
  const user = req.user;

  // 管理者は全編集可能
  if (user.role === 'admin') {
    return next();
  }

  // 一般ユーザーは自分が登録した活動履歴のみ編集可能
  const activity = await Activity.findById(activity_id);

  if (!activity) {
    return res.status(404).json({ error: '活動履歴が見つかりません' });
  }

  if (activity.user_id !== user.user_id) {
    return res.status(403).json({ error: 'この活動履歴の編集権限がありません' });
  }

  next();
}

// 法人一覧取得時の権限フィルタリング
function filterCompaniesByPermission(user) {
  // 管理者は全法人を取得
  if (user.role === 'admin') {
    return { type: 'all' };
  }

  // 一般ユーザーは担当法人のみ
  return { type: 'user', user_id: user.user_id };
}

module.exports = {
  checkCompanyAccess,
  checkCompanyEditPermission,
  checkActivityEditPermission,
  filterCompaniesByPermission
};
