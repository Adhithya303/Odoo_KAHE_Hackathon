import api from './client';
export const getBudget = (tripId) => api.get(`/api/trips/${tripId}/budget`);
export const predictBudget = (tripId, data) => api.post(`/api/trips/${tripId}/budget/predict`, data);
export const addBudgetItem = (tripId, data) => api.post(`/api/trips/${tripId}/budget/items`, data);
export const updateBudgetItem = (tripId, itemId, data) => api.put(`/api/trips/${tripId}/budget/items/${itemId}`, data);
export const deleteBudgetItem = (tripId, itemId) => api.delete(`/api/trips/${tripId}/budget/items/${itemId}`);
export const predictGlobalBudget = (data) => api.post('/api/budget/predict', data);
