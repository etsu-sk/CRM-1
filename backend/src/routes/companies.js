const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticateToken } = require('../middleware/auth');
const { checkCompanyAccess, checkCompanyEditPermission } = require('../middleware/permissions');

// 法人一覧取得
router.get('/', authenticateToken, companyController.getCompanies);

// 法人作成
router.post('/', authenticateToken, companyController.createCompany);

// 法人詳細取得
router.get('/:company_id', authenticateToken, checkCompanyAccess, companyController.getCompany);

// 法人更新
router.put('/:company_id', authenticateToken, checkCompanyEditPermission, companyController.updateCompany);

// 法人削除
router.delete('/:company_id', authenticateToken, checkCompanyEditPermission, companyController.deleteCompany);

// 担当者割り当て
router.post('/:company_id/users', authenticateToken, checkCompanyEditPermission, companyController.assignUser);

// 担当者解除
router.delete('/:company_id/users/:user_id', authenticateToken, checkCompanyEditPermission, companyController.unassignUser);

module.exports = router;
