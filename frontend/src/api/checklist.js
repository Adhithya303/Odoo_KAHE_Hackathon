import client from './client';

export const getChecklist = (tripId) => client.get(`/api/checklist/${tripId}`);
export const addItem = (tripId, body) => client.post(`/api/checklist/${tripId}`, body);
export const updateItem = (tripId, itemId, body) => client.patch(`/api/checklist/${tripId}/items/${itemId}`, body);
export const deleteItem = (tripId, itemId) => client.delete(`/api/checklist/${tripId}/items/${itemId}`);
export const resetChecklist = (tripId) => client.delete(`/api/checklist/${tripId}/reset`);
export const aiSuggestItems = (tripId) => client.post(`/api/checklist/${tripId}/ai-suggest`);
