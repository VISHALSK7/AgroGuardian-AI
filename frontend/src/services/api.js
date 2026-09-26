import axios from 'axios';

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ag_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

import { useAppStore } from '../store/useAppStore';

// Response interceptor with differentiated error mapping
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.response?.data?.error || '';
    const hadToken = !!localStorage.getItem('ag_token');
    const isAuthError =
      message.toLowerCase().includes('expired') ||
      message.toLowerCase().includes('invalid') ||
      message.toLowerCase().includes('token');

    if (
      status === 401 &&
      hadToken &&
      isAuthError &&
      window.location.pathname !== '/login'
    ) {
      useAppStore.getState().logout();
      window.location.href = '/login';
    }

    // Attach user-friendly descriptive messages based on exact failure type
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
        error.userFriendlyMessage = "Analysis is taking longer than expected. Please try again.";
      } else if (error.code === 'ERR_NETWORK' || error.message?.toLowerCase().includes('network')) {
        error.userFriendlyMessage = "Backend server is unavailable. Please check your network connection.";
      } else {
        error.userFriendlyMessage = "Unable to connect to the AgroGuardian backend service.";
      }
    } else {
      if (status === 400) {
        error.userFriendlyMessage = error.response.data?.message || "Invalid image. Please upload a clear crop leaf image.";
      } else if (status === 422) {
        error.userFriendlyMessage = error.response.data?.message || "Image could not be processed.";
      } else if (status === 504) {
        error.userFriendlyMessage = "External AI service timed out. Please try again.";
      } else if (status === 500) {
        error.userFriendlyMessage = error.response.data?.message || "An internal server error occurred during analysis.";
      } else {
        error.userFriendlyMessage = message || "An unexpected error occurred.";
      }
    }

    return Promise.reject(error);
  }
);

// ── Authentication ────────────────────────────────────────────────────────
export const authService = {
  login: (data) => API.post('/auth/login', data),
  signup: (data) => API.post('/auth/signup', data),
  googleAuth: (credential) => API.post('/auth/google', { credential }),
  sendOtp: (data) => API.post('/auth/send-otp', data),
  verifyOtp: (data) => API.post('/auth/verify-otp', data),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

export const userService = {
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
  uploadAvatar: (fd) => API.put('/auth/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ── Disease Detection ─────────────────────────────────────────────────────
export const diseaseService = {
  detectDisease: (formData) =>
    API.post('/predict/disease', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }),
  getHistory: (params) => API.get('/disease/history', { params }),
};

// ── Weather & Disease Spread ──────────────────────────────────────────
export const weatherService = {
  getForecast: (days = 7, city = 'Mysore,IN') =>
    API.get('/weather', { params: { days, city } }),
  predictFuture: (data) => API.post('/predict/weather-engine', data),
};

// ── Government Schemes ────────────────────────────────────────────────────
export const schemesService = {
  getSchemes: (params) => API.get('/schemes', { params }),
  getSchemeById: (id) => API.get(`/schemes/${id}`),
  applyScheme: (data) => API.post('/schemes/apply', data),
};

// ── Chatbot ───────────────────────────────────────────────────────────────
export const chatService = {
  sendMessage: (data) => API.post('/chatbot/', data),
  getHistory: (params) => API.get('/chatbot/history', { params }),
};

export const predictDisease = (formData) => API.post("/predict/disease", formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 });
export const getWeather = (city) => API.get(`/weather?city=${city}`);
export const chat = (data) => API.post("/chatbot/", data);

export default API;
