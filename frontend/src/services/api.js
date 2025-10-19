import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

};

export default api;