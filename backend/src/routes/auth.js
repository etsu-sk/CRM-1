const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// ログイン
router.post('/login', authController.login);

// 現在のユーザー情報取得
router.get('/me', authenticateToken, authController.me);

// パスワード変更
router.post('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
