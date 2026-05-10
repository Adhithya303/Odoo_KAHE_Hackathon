import client from './client';

export const getFeed = (params) => client.get('/api/community', { params });
export const getPost = (postId) => client.get(`/api/community/${postId}`);
export const createPost = (body) => client.post('/api/community', body);
export const updatePost = (postId, body) => client.put(`/api/community/${postId}`, body);
export const deletePost = (postId) => client.delete(`/api/community/${postId}`);
export const toggleLike = (postId) => client.post(`/api/community/${postId}/like`);
export const addComment = (postId, content) => client.post(`/api/community/${postId}/comments`, { content });
export const deleteComment = (postId, commentId) => client.delete(`/api/community/${postId}/comments/${commentId}`);
export const shareTrip = (tripId) => client.post(`/api/community/share-trip/${tripId}`);
export const getChatMessages = (params) => client.get('/api/community/chat/messages', { params });
export const sendChatMessage = (body) => client.post('/api/community/chat/messages', body);
