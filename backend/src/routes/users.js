const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// ユーザー一覧取得
router.get('/', authenticateToken, requireAdmin, userController.getUsers);

// ユーザー作成
router.post('/', authenticateToken, requireAdmin, userController.createUser);

// ユーザー詳細取得
router.get('/:user_id', authenticateToken, requireAdmin, userController.getUser);

// ユーザー更新
router.put('/:user_id', authenticateToken, requireAdmin, userController.updateUser);

// パスワードリセット
router.post('/:user_id/reset-password', authenticateToken, requireAdmin, userController.resetPassword);

// ユーザー無効化
router.post('/:user_id/deactivate', authenticateToken, requireAdmin, userController.deactivateUser);

module.exports = router;
