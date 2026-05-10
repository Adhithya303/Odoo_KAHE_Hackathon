import client from './client';

export const getPreferences = () => client.get('/api/auth/me/preferences');
export const savePreferences = (body) => client.post('/api/auth/me/preferences', body);
export const getSavedDestinations = () => client.get('/api/auth/saved-destinations');
export const saveDestination = (destId) => client.post(`/api/auth/saved-destinations/${destId}`);
export const unsaveDestination = (destId) => client.delete(`/api/auth/saved-destinations/${destId}`);
export const deleteAccount = () => client.delete('/api/auth/me');
