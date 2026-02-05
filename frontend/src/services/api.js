import axios from 'axios';

// 開発環境では localhost:3000、本番環境では相対パス
const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:3000/api';

// Axiosインスタンス作成
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// リクエストインターセプター（トークン付与）
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 認証API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data)
};

// 法人API
export const companyAPI = {
  getAll: (params) => api.get('/companies', { params }),
  getById: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
  assignUser: (id, data) => api.post(`/companies/${id}/users`, data),
  unassignUser: (companyId, userId) => api.delete(`/companies/${companyId}/users/${userId}`)
};

// 担当者API
export const contactAPI = {
  getByCompany: (companyId) => api.get(`/contacts/company/${companyId}`),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (companyId, data) => api.post(`/contacts/company/${companyId}`, data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`)
};

// 活動履歴API
export const activityAPI = {
  getByCompany: (companyId) => api.get(`/activities/company/${companyId}`),
  getById: (id) => api.get(`/activities/${id}`),
  create: (companyId, data) => api.post(`/activities/company/${companyId}`, data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
  getNextActions: (params) => api.get('/activities/next-actions', { params }),
  getOverdue: () => api.get('/activities/overdue')
};

// ユーザーAPI
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  resetPassword: (id, data) => api.post(`/users/${id}/reset-password`, data),
  deactivate: (id) => api.post(`/users/${id}/deactivate`)
};

// 見積書API
export const quotationAPI = {
  getByCompany: (companyId) => api.get(`/quotations/company/${companyId}`),
  getById: (id) => api.get(`/quotations/${id}`),
  upload: (companyId, formData) => {
    return api.post(`/quotations/company/${companyId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  download: (id) => {
    return api.get(`/quotations/${id}/download`, {
      responseType: 'blob'
    });
  },
  update: (id, data) => api.put(`/quotations/${id}`, data),
  delete: (id) => api.delete(`/quotations/${id}`)
};

export default api;
