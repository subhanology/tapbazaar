import axios from 'axios';

// withCredentials is required so the HttpOnly JWT cookie is sent on every request
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

export default api;
