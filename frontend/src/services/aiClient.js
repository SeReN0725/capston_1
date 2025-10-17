import { apiFetch } from './apiClient';

export const askAI = async (message, opts = {}) => {
  return apiFetch('/ask', { method: 'POST', body: { message, ...opts } });
};