import axios from 'axios';
import { API_BASE } from '../utils/constants';

const api = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } });

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — auto refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        if (refresh) {
          const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, { refresh_token: refresh });
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          orig.headers.Authorization = `Bearer ${data.access_token}`;
          return api(orig);
        }
      } catch { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); window.location.href = '/login'; }
    }
    return Promise.reject(error);
  }
);

export default api;
