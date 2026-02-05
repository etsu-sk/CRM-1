const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticateToken } = require('../middleware/auth');
const { checkCompanyAccess, checkCompanyEditPermission, checkActivityEditPermission } = require('../middleware/permissions');

// ネクストアクション一覧取得
router.get('/next-actions', authenticateToken, activityController.getNextActions);

// 期日超過アクション取得
router.get('/overdue', authenticateToken, activityController.getOverdueActions);

// 活動履歴一覧取得（法人単位）
router.get('/company/:company_id', authenticateToken, checkCompanyAccess, activityController.getActivities);

// 活動履歴作成
router.post('/company/:company_id', authenticateToken, checkCompanyEditPermission, activityController.createActivity);

// 活動履歴詳細取得
router.get('/:activity_id', authenticateToken, activityController.getActivity);

// 活動履歴更新
router.put('/:activity_id', authenticateToken, checkActivityEditPermission, activityController.updateActivity);

// 活動履歴削除
router.delete('/:activity_id', authenticateToken, checkActivityEditPermission, activityController.deleteActivity);

module.exports = router;
