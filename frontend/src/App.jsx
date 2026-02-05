import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import CompanyList from './components/Companies/CompanyList';
import CompanyDetail from './components/Companies/CompanyDetail';
import UserList from './components/Users/UserList';

// 認証が必要なルートを保護するコンポーネント
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
};

// 管理者専用ルート
const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();

  if (!isAdmin()) {
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/companies" element={
            <ProtectedRoute>
              <CompanyList />
            </ProtectedRoute>
          } />

          <Route path="/companies/:id" element={
            <ProtectedRoute>
              <CompanyDetail />
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute>
              <AdminRoute>
                <UserList />
              </AdminRoute>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
