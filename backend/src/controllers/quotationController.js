const Quotation = require('../models/Quotation');
const path = require('path');
const fs = require('fs');

// 見積書一覧取得（法人単位）
exports.getQuotations = async (req, res) => {
  try {
    const { company_id } = req.params;
    const quotations = await Quotation.findByCompanyId(company_id);

    res.json({ quotations });
  } catch (error) {
    console.error('見積書一覧取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 見積書詳細取得
exports.getQuotation = async (req, res) => {
  try {
    const { quotation_id } = req.params;
    const quotation = await Quotation.findById(quotation_id);

    if (!quotation) {
      return res.status(404).json({ error: '見積書が見つかりません' });
    }

    res.json(quotation);
  } catch (error) {
    console.error('見積書詳細取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 見積書アップロード
exports.uploadQuotation = async (req, res) => {
  try {
    const { company_id } = req.params;
    const { title, amount, quotation_date, notes } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'ファイルが必要です' });
    }

    if (!title) {
      return res.status(400).json({ error: 'タイトルは必須です' });
    }

    const quotationData = {
      company_id,
      user_id: req.user.user_id,
      title,
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_size: req.file.size,
      file_type: req.file.mimetype,
      amount: amount || null,
      quotation_date: quotation_date || null,
      notes: notes || null
    };

    const quotation_id = await Quotation.create(quotationData);

    res.status(201).json({
      message: '見積書をアップロードしました',
      quotation_id
    });
  } catch (error) {
    console.error('見積書アップロードエラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 見積書ダウンロード
exports.downloadQuotation = async (req, res) => {
  try {
    const { quotation_id } = req.params;
    const quotation = await Quotation.findById(quotation_id);

    if (!quotation) {
      return res.status(404).json({ error: '見積書が見つかりません' });
    }

    const filePath = quotation.file_path;

    // ファイルが存在するか確認
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'ファイルが見つかりません' });
    }

    // ファイルをダウンロード
    res.download(filePath, quotation.file_name, (err) => {
      if (err) {
        console.error('ファイルダウンロードエラー:', err);
        res.status(500).json({ error: 'ファイルのダウンロードに失敗しました' });
      }
    });
  } catch (error) {
    console.error('見積書ダウンロードエラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 見積書更新
exports.updateQuotation = async (req, res) => {
  try {
    const { quotation_id } = req.params;
    const quotationData = req.body;

    if (!quotationData.title) {
      return res.status(400).json({ error: 'タイトルは必須です' });
    }

    await Quotation.update(quotation_id, quotationData);

    res.json({ message: '見積書情報を更新しました' });
  } catch (error) {
    console.error('見積書更新エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 見積書削除
exports.deleteQuotation = async (req, res) => {
  try {
    const { quotation_id } = req.params;

    await Quotation.delete(quotation_id);

    res.json({ message: '見積書を削除しました' });
  } catch (error) {
    console.error('見積書削除エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};
