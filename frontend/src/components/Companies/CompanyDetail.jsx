import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyAPI, contactAPI, activityAPI, quotationAPI } from '../../services/api';

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  // フォーム状態
  const [showContactForm, setShowContactForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', department: '', position: '' });
  const [activityForm, setActivityForm] = useState({
    activity_date: new Date().toISOString().split('T')[0],
    activity_type: 'phone',
    content: '',
    next_action_date: '',
    next_action_content: ''
  });
  const [quotationForm, setQuotationForm] = useState({
    title: '',
    amount: '',
    quotation_date: '',
    notes: '',
    file: null
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [companyRes, contactsRes, activitiesRes, quotationsRes] = await Promise.all([
        companyAPI.getById(id),
        contactAPI.getByCompany(id),
        activityAPI.getByCompany(id),
        quotationAPI.getByCompany(id)
      ]);

      setCompany(companyRes.data);
      setContacts(contactsRes.data.contacts || []);
      setActivities(activitiesRes.data.activities || []);
      setQuotations(quotationsRes.data.quotations || []);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await contactAPI.create(id, contactForm);
      setShowContactForm(false);
      setContactForm({ name: '', email: '', phone: '', department: '', position: '' });
      loadData();
    } catch (error) {
      console.error('担当者作成エラー:', error);
      alert('担当者の作成に失敗しました');
    }
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    try {
      await activityAPI.create(id, activityForm);
      setShowActivityForm(false);
      setActivityForm({
        activity_date: new Date().toISOString().split('T')[0],
        activity_type: 'phone',
        content: '',
        next_action_date: '',
        next_action_content: ''
      });
      loadData();
    } catch (error) {
      console.error('活動履歴作成エラー:', error);
      alert('活動履歴の作成に失敗しました');
    }
  };

  const handleQuotationSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!quotationForm.file) {
        alert('ファイルを選択してください');
        return;
      }

      const formData = new FormData();
      formData.append('file', quotationForm.file);
      formData.append('title', quotationForm.title);
      formData.append('amount', quotationForm.amount);
      formData.append('quotation_date', quotationForm.quotation_date);
      formData.append('notes', quotationForm.notes);

      await quotationAPI.upload(id, formData);
      setShowQuotationForm(false);
      setQuotationForm({ title: '', amount: '', quotation_date: '', notes: '', file: null });
      loadData();
    } catch (error) {
      console.error('見積書アップロードエラー:', error);
      alert('見積書のアップロードに失敗しました');
    }
  };

  const handleQuotationDownload = async (quotation_id, file_name) => {
    try {
      const response = await quotationAPI.download(quotation_id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('ダウンロードエラー:', error);
      alert('ダウンロードに失敗しました');
    }
  };

  const handleQuotationDelete = async (quotation_id) => {
    if (!confirm('この見積書を削除しますか？')) return;
    try {
      await quotationAPI.delete(quotation_id);
      loadData();
    } catch (error) {
      console.error('見積書削除エラー:', error);
      alert('見積書の削除に失敗しました');
    }
  };

  const activityTypeLabel = {
    visit: '訪問',
    phone: '電話',
    email: 'メール',
    web_meeting: 'Web会議',
    other: 'その他'
  };

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (!company) {
    return <div className="text-center py-8">法人が見つかりません</div>;
  }

  return (
    <div>
      <button
        onClick={() => navigate('/companies')}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← 法人一覧に戻る
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{company.company_name}</h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-semibold">業種:</span> {company.industry}</div>
          <div><span className="font-semibold">電話:</span> {company.phone}</div>
          <div><span className="font-semibold">住所:</span> {company.address}</div>
          <div><span className="font-semibold">従業員数:</span> {company.employee_count}名</div>
        </div>
      </div>

      {/* タブ */}
      <div className="mb-4 border-b border-gray-200">
        <nav className="flex space-x-4">
          {['info', 'contacts', 'activities', 'quotations'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'info' && '基本情報'}
              {tab === 'contacts' && '取引先担当者'}
              {tab === 'activities' && '活動履歴'}
              {tab === 'quotations' && '見積書'}
            </button>
          ))}
        </nav>
      </div>

      {/* 取引先担当者タブ */}
      {activeTab === 'contacts' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">取引先担当者</h2>
            <button
              onClick={() => setShowContactForm(!showContactForm)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
            >
              + 担当者追加
            </button>
          </div>

          {showContactForm && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <form onSubmit={handleContactSubmit}>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">氏名 *</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">メール</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">電話</label>
                    <input
                      type="text"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">部署</label>
                    <input
                      type="text"
                      value={contactForm.department}
                      onChange={(e) => setContactForm({ ...contactForm, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm">
                    登録
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {contacts.length === 0 ? (
              <p className="p-4 text-gray-500">担当者が登録されていません</p>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">氏名</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">部署</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">メール</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">電話</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contacts.map(contact => (
                    <tr key={contact.contact_id}>
                      <td className="px-4 py-2 text-sm">{contact.name}</td>
                      <td className="px-4 py-2 text-sm">{contact.department}</td>
                      <td className="px-4 py-2 text-sm">{contact.email}</td>
                      <td className="px-4 py-2 text-sm">{contact.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 活動履歴タブ */}
      {activeTab === 'activities' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">活動履歴</h2>
            <button
              onClick={() => setShowActivityForm(!showActivityForm)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
            >
              + 活動記録追加
            </button>
          </div>

          {showActivityForm && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <form onSubmit={handleActivitySubmit}>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">活動日 *</label>
                    <input
                      type="date"
                      value={activityForm.activity_date}
                      onChange={(e) => setActivityForm({ ...activityForm, activity_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">種別</label>
                    <select
                      value={activityForm.activity_type}
                      onChange={(e) => setActivityForm({ ...activityForm, activity_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="visit">訪問</option>
                      <option value="phone">電話</option>
                      <option value="email">メール</option>
                      <option value="web_meeting">Web会議</option>
                      <option value="other">その他</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">内容 *</label>
                  <textarea
                    value={activityForm.content}
                    onChange={(e) => setActivityForm({ ...activityForm, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows="3"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">ネクストアクション日</label>
                    <input
                      type="date"
                      value={activityForm.next_action_date}
                      onChange={(e) => setActivityForm({ ...activityForm, next_action_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ネクストアクション内容</label>
                    <input
                      type="text"
                      value={activityForm.next_action_content}
                      onChange={(e) => setActivityForm({ ...activityForm, next_action_content: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm">
                    登録
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowActivityForm(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow">
            {activities.length === 0 ? (
              <p className="p-4 text-gray-500">活動履歴が登録されていません</p>
            ) : (
              <div className="divide-y divide-gray-200">
                {activities.map(activity => (
                  <div key={activity.activity_id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mr-2">
                          {activityTypeLabel[activity.activity_type]}
                        </span>
                        <span className="text-sm text-gray-600">{activity.activity_date}</span>
                      </div>
                      <span className="text-xs text-gray-500">{activity.user_name}</span>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">{activity.content}</p>
                    {activity.next_action_date && (
                      <div className="text-xs text-gray-600 bg-yellow-50 px-2 py-1 rounded">
                        Next: {activity.next_action_date} - {activity.next_action_content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 見積書タブ */}
      {activeTab === 'quotations' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">見積書</h2>
            <button
              onClick={() => setShowQuotationForm(!showQuotationForm)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
            >
              + 見積書アップロード
            </button>
          </div>

          {showQuotationForm && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <form onSubmit={handleQuotationSubmit}>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">タイトル *</label>
                    <input
                      type="text"
                      value={quotationForm.title}
                      onChange={(e) => setQuotationForm({ ...quotationForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">金額</label>
                    <input
                      type="number"
                      value={quotationForm.amount}
                      onChange={(e) => setQuotationForm({ ...quotationForm, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="円"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">見積日付</label>
                    <input
                      type="date"
                      value={quotationForm.quotation_date}
                      onChange={(e) => setQuotationForm({ ...quotationForm, quotation_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ファイル * (PDF, Excel, Word, 画像)</label>
                    <input
                      type="file"
                      accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setQuotationForm({ ...quotationForm, file: e.target.files[0] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">備考</label>
                  <textarea
                    value={quotationForm.notes}
                    onChange={(e) => setQuotationForm({ ...quotationForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows="2"
                  />
                </div>
                <div className="flex space-x-2">
                  <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm">
                    アップロード
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuotationForm(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {quotations.length === 0 ? (
              <p className="p-4 text-gray-500">見積書が登録されていません</p>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">タイトル</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">金額</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">見積日付</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">ファイル名</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">登録者</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quotations.map(quotation => (
                    <tr key={quotation.quotation_id}>
                      <td className="px-4 py-2 text-sm">{quotation.title}</td>
                      <td className="px-4 py-2 text-sm">
                        {quotation.amount ? `¥${Number(quotation.amount).toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-2 text-sm">{quotation.quotation_date || '-'}</td>
                      <td className="px-4 py-2 text-sm">{quotation.file_name}</td>
                      <td className="px-4 py-2 text-sm">{quotation.user_name}</td>
                      <td className="px-4 py-2 text-sm">
                        <button
                          onClick={() => handleQuotationDownload(quotation.quotation_id, quotation.file_name)}
                          className="text-blue-600 hover:underline mr-2"
                        >
                          ダウンロード
                        </button>
                        <button
                          onClick={() => handleQuotationDelete(quotation.quotation_id)}
                          className="text-red-600 hover:underline"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDetail;
