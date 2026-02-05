import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { activityAPI } from '../../services/api';

const Dashboard = () => {
  const [nextActions, setNextActions] = useState([]);
  const [overdueActions, setOverdueActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [nextRes, overdueRes] = await Promise.all([
        activityAPI.getNextActions({ days: 30 }),
        activityAPI.getOverdue()
      ]);

      setNextActions(nextRes.data.nextActions || []);
      setOverdueActions(overdueRes.data.overdueActions || []);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      {/* 期日超過アクション */}
      {overdueActions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-red-800 mb-3">
            期日超過アクション ({overdueActions.length}件)
          </h2>
          <div className="space-y-2">
            {overdueActions.map(action => (
              <div key={action.activity_id} className="bg-white p-3 rounded border border-red-300">
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      to={`/companies/${action.company_id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {action.company_name}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">{action.next_action_content}</p>
                  </div>
                  <span className="text-xs text-red-600 font-semibold">
                    {action.next_action_date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ネクストアクション一覧 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          今後のネクストアクション (30日以内)
        </h2>
        {nextActions.length === 0 ? (
          <p className="text-gray-500">予定されているアクションはありません</p>
        ) : (
          <div className="space-y-3">
            {nextActions.map(action => (
              <div key={action.activity_id} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link
                      to={`/companies/${action.company_id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {action.company_name}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">{action.next_action_content}</p>
                    <p className="text-xs text-gray-500 mt-1">担当: {action.user_name}</p>
                  </div>
                  <span className="text-sm text-gray-600 ml-4">
                    {action.next_action_date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
