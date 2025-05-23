import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// Interceptor to automatically set JWT from localStorage
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    // Set both header formats for maximum compatibility
    config.headers['x-auth-token'] = token;
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;