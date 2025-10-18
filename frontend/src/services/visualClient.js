import { apiFetch } from './apiClient';

export const requestVisuals = async (payload = {}) => {
  return apiFetch('/visualize', { method: 'POST', body: payload });
};