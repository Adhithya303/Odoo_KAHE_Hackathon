import api from './client';
export const getWeather = (city) => api.get(`/api/external/weather/${city}`);
export const getCurrency = (from, to) => api.get('/api/external/currency', { params: { from, to } });
