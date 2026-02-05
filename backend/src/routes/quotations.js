const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const quotationController = require('../controllers/quotationController');
const { authenticateToken } = require('../middleware/auth');
const { checkCompanyAccess, checkCompanyEditPermission } = require('../middleware/permissions');

// アップロードディレクトリの作成
const uploadDir = path.join(__dirname, '../../uploads/quotations');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'quotation-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // 許可するファイルタイプ
  const allowedTypes = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('許可されていないファイルタイプです'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// 見積書一覧取得（法人単位）
router.get('/company/:company_id', authenticateToken, checkCompanyAccess, quotationController.getQuotations);

// 見積書アップロード
router.post('/company/:company_id', authenticateToken, checkCompanyEditPermission, upload.single('file'), quotationController.uploadQuotation);

// 見積書詳細取得
router.get('/:quotation_id', authenticateToken, quotationController.getQuotation);

// 見積書ダウンロード
router.get('/:quotation_id/download', authenticateToken, quotationController.downloadQuotation);

// 見積書更新
router.put('/:quotation_id', authenticateToken, quotationController.updateQuotation);

// 見積書削除
router.delete('/:quotation_id', authenticateToken, quotationController.deleteQuotation);

module.exports = router;
