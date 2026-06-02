import axios from 'axios';

const API = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ──────────────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: handle 401 ─────────────────────────
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
};

// ── Tasks ─────────────────────────────────────────────────────
export const tasksAPI = {
  getAll:  (params) => API.get('/tasks', { params }),
  getOne:  (id)     => API.get(`/tasks/${id}`),
  create:  (data)   => API.post('/tasks', data),
  update:  (id, data) => API.put(`/tasks/${id}`, data),
  delete:  (id)     => API.delete(`/tasks/${id}`),
};

// ── User ──────────────────────────────────────────────────────
export const userAPI = {
  me:        () => API.get('/users/me'),
  dashboard: () => API.get('/users/me/dashboard'),
};

export default API;
