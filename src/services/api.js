import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, '') ||
  'http://localhost:4000';

console.log('[myQPMS Mail API] Using API base:', API_BASE);

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (!API_BASE) {
    return Promise.reject(
      new Error('VITE_API_URL is missing.')
    );
  }
  return config;
});
