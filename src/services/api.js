import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  'http://localhost:4000';

console.log('[QPMS Mail API] Using API base:', API_BASE);

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});