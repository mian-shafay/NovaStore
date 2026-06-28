// =============================================
// AXIOS API INSTANCE
// =============================================
// Axios is a library for making HTTP requests (like fetch, but better).
// We create a pre-configured instance so we don't have to repeat
// the base URL and auth header in every request.

import axios from 'axios';

// Create an axios instance with default settings.
// In production set VITE_API_URL (e.g. https://api.shafay.online/api) in the
// host's build env; locally it falls back to the dev backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// ---- REQUEST INTERCEPTOR ----
// This runs BEFORE every request is sent.
// It automatically adds the JWT token to the Authorization header.
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (saved during login/signup)
    const token = localStorage.getItem('token');
    if (token) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ---- RESPONSE INTERCEPTOR ----
// This runs AFTER every response is received.
// If we get a 401 (token expired/invalid), we clear the token and redirect to login.
api.interceptors.response.use(
  (response) => response, // If response is OK, just return it
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
