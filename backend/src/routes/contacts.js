const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/auth');
const { checkCompanyAccess, checkCompanyEditPermission } = require('../middleware/permissions');

// 担当者一覧取得（法人単位）
router.get('/company/:company_id', authenticateToken, checkCompanyAccess, contactController.getContacts);

// 担当者作成
router.post('/company/:company_id', authenticateToken, checkCompanyEditPermission, contactController.createContact);

// 担当者詳細取得
router.get('/:contact_id', authenticateToken, contactController.getContact);

// 担当者更新
router.put('/:contact_id', authenticateToken, contactController.updateContact);

// 担当者削除
router.delete('/:contact_id', authenticateToken, contactController.deleteContact);

module.exports = router;
