import api from './client';
export const listTrips = (params) => api.get('/api/trips', { params });
export const createTrip = (data) => api.post('/api/trips', data);
export const getTrip = (id) => api.get(`/api/trips/${id}`);
export const updateTrip = (id, data) => api.put(`/api/trips/${id}`, data);
export const deleteTrip = (id) => api.delete(`/api/trips/${id}`);
export const duplicateTrip = (id) => api.post(`/api/trips/${id}/duplicate`);

// Stops
export const addStop = (tripId, data) => api.post(`/api/trips/${tripId}/stops`, data);
export const updateStop = (tripId, stopId, data) => api.put(`/api/trips/${tripId}/stops/${stopId}`, data);
export const removeStop = (tripId, stopId) => api.delete(`/api/trips/${tripId}/stops/${stopId}`);

// Itinerary
export const getItinerary = (id) => api.get(`/api/trips/${id}/itinerary`);
export const generateItinerary = (id, data) => api.post(`/api/trips/${id}/itinerary/generate`, data);
export const updateItinerary = (id, data) => api.put(`/api/trips/${id}/itinerary`, data);
export const addActivity = (id, data) => api.post(`/api/trips/${id}/itinerary/activities`, data);
export const reorderActivities = (id, data) => api.put(`/api/trips/${id}/itinerary/reorder`, data);

// AI Place Suggestions
export const suggestPlaces = (tripId, data) => api.post(`/api/trips/${tripId}/suggest-places`, data);
export const suggestPlacesGeneral = (data) => api.post(`/api/trips/suggest-places`, data);

// Copy
export const copyTrip = (id) => api.post(`/api/trips/${id}/copy`);

