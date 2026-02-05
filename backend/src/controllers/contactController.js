const Contact = require('../models/Contact');

// 担当者一覧取得（法人単位）
exports.getContacts = async (req, res) => {
  try {
    const { company_id } = req.params;
    const contacts = await Contact.findByCompanyId(company_id);

    res.json({ contacts });
  } catch (error) {
    console.error('担当者一覧取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 担当者詳細取得
exports.getContact = async (req, res) => {
  try {
    const { contact_id } = req.params;
    const contact = await Contact.findById(contact_id);

    if (!contact) {
      return res.status(404).json({ error: '担当者が見つかりません' });
    }

    res.json(contact);
  } catch (error) {
    console.error('担当者詳細取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 担当者作成
exports.createContact = async (req, res) => {
  try {
    const { company_id } = req.params;
    const contactData = { ...req.body, company_id };

    if (!contactData.name) {
      return res.status(400).json({ error: '担当者名は必須です' });
    }

    const contact_id = await Contact.create(contactData);

    res.status(201).json({
      message: '担当者を作成しました',
      contact_id
    });
  } catch (error) {
    console.error('担当者作成エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 担当者更新
exports.updateContact = async (req, res) => {
  try {
    const { contact_id } = req.params;
    const contactData = req.body;

    if (!contactData.name) {
      return res.status(400).json({ error: '担当者名は必須です' });
    }

    await Contact.update(contact_id, contactData);

    res.json({ message: '担当者情報を更新しました' });
  } catch (error) {
    console.error('担当者更新エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 担当者削除
exports.deleteContact = async (req, res) => {
  try {
    const { contact_id } = req.params;

    await Contact.delete(contact_id);

    res.json({ message: '担当者を削除しました' });
  } catch (error) {
    console.error('担当者削除エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};
