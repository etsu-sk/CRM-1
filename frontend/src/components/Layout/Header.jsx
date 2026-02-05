import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">CRMシステム</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {user?.name} ({user?.role === 'admin' ? '管理者' : '一般ユーザー'})
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
