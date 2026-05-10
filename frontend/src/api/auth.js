import api from './client';
export const register = (data) => api.post('/api/auth/register', data);
export const login = (data) => api.post('/api/auth/login', data);
export const getMe = () => api.get('/api/auth/me');
export const updateMe = (data) => api.put('/api/auth/me', data);
export const savePreferences = (data) => api.post('/api/auth/me/preferences', data);
export const getPreferences = () => api.get('/api/auth/me/preferences');
export const logout = (refresh_token) => api.post('/api/auth/logout', { refresh_token });
