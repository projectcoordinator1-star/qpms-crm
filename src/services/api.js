import axios from 'axios';

const configuredApiBase = import.meta.env.VITE_API_URL;
const localApiBase = import.meta.env.DEV ? 'http://localhost:4000' : '';
const API_BASE = (configuredApiBase || localApiBase).replace(/\/+$/, '');

console.log('[QPMS Mail API] Using API base:', API_BASE);

if (!API_BASE) {
  console.error('[QPMS Mail API] VITE_API_URL is required for production email calls.');
}

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (!API_BASE) {
    return Promise.reject(new Error('VITE_API_URL is missing. Configure the Render backend URL before sending mail.'));
  }
  return config;
});
