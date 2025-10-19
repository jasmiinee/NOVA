import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // or 'psa_token' — pick one name and stick to it
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handling — your login route is "/" not "/login"
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/'; // send to your LoginPage route
    }
    return Promise.reject(err.response?.data || err);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (email, password, employeeId) => api.post('/auth/signup', { email, password, employeeId }),
  me: () => api.get('/auth/me'),
};

export const apiService = {
  getCareerPathways: () => api.get('/pathways'),
};

export default api;
