import axios from 'axios';
import { toast } from 'sonner';
import { getSanitizedApiUrl } from '../utils/config';

// In production (Render Static Site), VITE_API_URL is set to backend URL, e.g. https://store-rating-platform-nh1t.onrender.com
// In local development, if VITE_API_URL is empty, Vite's dev server proxy handles /api → http://localhost:5000
const cleanApiUrl = getSanitizedApiUrl();
const API_BASE_URL = cleanApiUrl ? `${cleanApiUrl}/api` : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('storehub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global 401 unauth / error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      'An unexpected error occurred. Please try again.';

    if (error.response?.status === 401) {
      localStorage.removeItem('storehub_token');
      localStorage.removeItem('storehub_user');
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register') &&
        window.location.pathname !== '/'
      ) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
