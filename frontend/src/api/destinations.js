import api from './client';
export const listDestinations = (params) => api.get('/api/destinations', { params });
export const getDestination = (id) => api.get(`/api/destinations/${id}`);
export const searchDestinations = (q) => api.get('/api/destinations/search', { params: { q } });
export const filterDestinations = (params) => api.get('/api/destinations/filter', { params });
export const getTrending = (limit = 10) => api.get('/api/destinations/trending', { params: { limit } });
export const getRecommendations = () => api.get('/api/recommendations/for-me');
export const searchByQuery = (query) => api.post('/api/recommendations/by-query', { query });
