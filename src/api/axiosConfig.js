import axios from 'axios';

// Determine the correct backend API URL:
// - In local development, use http://localhost:5000
// - In production (Vercel/Netlify), use the deployed backend URL
const getApiUrl = () => {
  // If REACT_APP_API_URL is set, use it (allows override)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, ''); // remove trailing slash
  }
  // If running on localhost, use local backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  // Otherwise, use the production backend
  return 'https://wintrustbk.vercel.app';
};

const API_URL = getApiUrl();

// Strip trailing '/api' if present
const baseURL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wintrust_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 by clearing token and dispatching event
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('wintrust_token');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;