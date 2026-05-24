import axios from 'axios';

/**
 * API Base URL Strategy:
 * - Docker / Dev (Nginx or Vite proxy): VITE_API_BASE_URL is not set → use relative '/api'
 *   (Vite proxy in dev, Nginx proxy in Docker both forward /api → backend:8080)
 * - Vercel + Railway: VITE_API_BASE_URL = 'https://your-backend.up.railway.app'
 *   → full URL used so Vercel can reach Railway directly
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15s timeout — prevents hanging requests in production
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear session and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock'),
};

export const customerApi = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  getHistory: (id, params) => api.get(`/customers/${id}/history`, { params }),
  getPayments: (id, params) => api.get(`/customers/${id}/payments`, { params }),
};

export const saleApi = {
  create: (data) => api.post('/sales', data),
  getAll: (params) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
};

export const paymentApi = {
  record: (data) => api.post('/payments', data),
  getHistory: (params) => api.get('/payments/history', { params }),
};

export const debtApi = {
  getAll: (params) => api.get('/debts', { params }),
};

export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

export default api;
