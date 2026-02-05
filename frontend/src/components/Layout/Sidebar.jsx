import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const menuItems = [
    { path: '/', label: 'ダッシュボード', icon: '📊' },
    { path: '/companies', label: '法人管理', icon: '🏢' },
    { path: '/users', label: 'ユーザー管理', icon: '👥', adminOnly: true }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems
            .filter(item => !item.adminOnly || isAdmin())
            .map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-md transition ${
                    isActive(item.path)
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
