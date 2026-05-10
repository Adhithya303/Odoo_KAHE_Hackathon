import client from './client';

export const getNotes = (tripId, params) => client.get(`/api/notes/${tripId}`, { params });
export const createNote = (tripId, body) => client.post(`/api/notes/${tripId}`, body);
export const updateNote = (tripId, noteId, body) => client.put(`/api/notes/${tripId}/${noteId}`, body);
export const deleteNote = (tripId, noteId) => client.delete(`/api/notes/${tripId}/${noteId}`);
export const pinNote = (tripId, noteId) => client.patch(`/api/notes/${tripId}/${noteId}/pin`);
