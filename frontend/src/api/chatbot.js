import api from './client';
export const sendMessage = (data) => api.post('/api/chatbot/message', data);
