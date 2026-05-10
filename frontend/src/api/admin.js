import client from './client';

export const getAdminStats = () => client.get('/api/admin/stats');
export const getAdminUsers = (params) => client.get('/api/admin/users', { params });
export const updateAdminUser = (userId, body) => client.patch(`/api/admin/users/${userId}`, body);
export const deleteAdminUser = (userId) => client.delete(`/api/admin/users/${userId}`);
export const getAdminTrips = (params) => client.get('/api/admin/trips', { params });
export const getAdminCommunity = (params) => client.get('/api/admin/community', { params });
export const deleteAdminPost = (postId) => client.delete(`/api/admin/community/${postId}`);
export const toggleAdminUserActive = (userId) => client.patch(`/api/admin/users/${userId}/toggle-active`);
