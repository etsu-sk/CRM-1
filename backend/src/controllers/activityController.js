const Activity = require('../models/Activity');

// 活動履歴一覧取得（法人単位）
exports.getActivities = async (req, res) => {
  try {
    const { company_id } = req.params;
    const activities = await Activity.findByCompanyId(company_id);

    res.json({ activities });
  } catch (error) {
    console.error('活動履歴一覧取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 活動履歴詳細取得
exports.getActivity = async (req, res) => {
  try {
    const { activity_id } = req.params;
    const activity = await Activity.findById(activity_id);

    if (!activity) {
      return res.status(404).json({ error: '活動履歴が見つかりません' });
    }

    res.json(activity);
  } catch (error) {
    console.error('活動履歴詳細取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 活動履歴作成
exports.createActivity = async (req, res) => {
  try {
    const { company_id } = req.params;
    const activityData = {
      ...req.body,
      company_id,
      user_id: req.user.user_id
    };

    if (!activityData.activity_date || !activityData.content) {
      return res.status(400).json({ error: '活動日付と内容は必須です' });
    }

    const activity_id = await Activity.create(activityData);

    res.status(201).json({
      message: '活動履歴を作成しました',
      activity_id
    });
  } catch (error) {
    console.error('活動履歴作成エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 活動履歴更新
exports.updateActivity = async (req, res) => {
  try {
    const { activity_id } = req.params;
    const activityData = req.body;

    if (!activityData.activity_date || !activityData.content) {
      return res.status(400).json({ error: '活動日付と内容は必須です' });
    }

    await Activity.update(activity_id, activityData);

    res.json({ message: '活動履歴を更新しました' });
  } catch (error) {
    console.error('活動履歴更新エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 活動履歴削除
exports.deleteActivity = async (req, res) => {
  try {
    const { activity_id } = req.params;

    await Activity.delete(activity_id);

    res.json({ message: '活動履歴を削除しました' });
  } catch (error) {
    console.error('活動履歴削除エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// ネクストアクション一覧取得
exports.getNextActions = async (req, res) => {
  try {
    const user = req.user;
    const { days = 30 } = req.query;

    let nextActions;
    if (user.role === 'admin') {
      // 管理者：全ネクストアクション
      nextActions = await Activity.findNextActions(null, parseInt(days));
    } else {
      // 一般ユーザー：自分のネクストアクションのみ
      nextActions = await Activity.findNextActions(user.user_id, parseInt(days));
    }

    res.json({ nextActions });
  } catch (error) {
    console.error('ネクストアクション取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 期日超過アクション取得
exports.getOverdueActions = async (req, res) => {
  try {
    const user = req.user;

    let overdueActions;
    if (user.role === 'admin') {
      overdueActions = await Activity.findOverdueActions();
    } else {
      overdueActions = await Activity.findOverdueActions(user.user_id);
    }

    res.json({ overdueActions });
  } catch (error) {
    console.error('期日超過アクション取得エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};
