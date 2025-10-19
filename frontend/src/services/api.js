import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API__URL || 'http://localhost:3001/api';

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
}
// API methods
export const apiService = {
    // Health
    health: () => api.get('/health'),
    
    //Employees
    listEmployees: () => api.get('/employees'),
    getEmployee: (employeeId) => api.get(`/employees/${employeeId}`),
    getEmployeeSkills: (employeeId) => api.get(`/employees/${employeeId}/skills`),
    
    // Skills
    listSkills: (functionArea) => {
        const qs = functionArea ? `?function_area=${encodeURIComponent(functionArea)}` : "";
        return api.get(`/skills${qs}`);
    },
    listFunctionAreas: () => api.get('/taxonomy/function-areas'),

    // Career Pathways
    assessPathways: (payload) => api.post('/pathways/assess', payload),
    getLatestPathways: (employeeId) => api.get(`/pathways/latest/${employeeId}`),
    getPathwaysHistory: (employeeId, limit = 20) => api.get(`/pathways/history/${employeeId}?limit=${limit}`),
}

export default api;
