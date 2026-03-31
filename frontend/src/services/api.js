import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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

export const mentorAPI = {
  // Get skills taxonomy
  getSkillsTaxonomy: async () => {
    const response = await fetch(
      `${API_BASE_URL}/mentors/skills-taxonomy`
    );
    if (!response.ok) throw new Error('Failed to fetch skills');
    return response.json();
  },

  // Check if user is already a mentor
  checkIfMentor: async (employeeId) => {
    const response = await fetch(
      `${API_BASE_URL}/mentors/check-if-mentor/${employeeId}`
    );
    if (!response.ok) throw new Error('Failed to check mentor status');
    return response.json();
  },

  // Get mentor matches for a mentee
  getMentorMatches: async (employeeId) => {
    const response = await fetch(
      `${API_BASE_URL}/mentors/matches/${employeeId}`
    );
    if (!response.ok) throw new Error('Failed to fetch mentor matches');
    return response.json();
  },

  // Register as a mentor
  registerAsMentor: async (employeeId, data) => {
    const response = await fetch(
      `${API_BASE_URL}/mentors/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employeeId,
          mentoring_skills: data.mentoring_skills,
          max_mentees: data.max_mentees,
          bio: data.bio
        })
      }
    );
    if (!response.ok) throw new Error('Failed to register as mentor');
    return response.json();
  },

  // Request mentorship from a mentor
  requestMentorship: async (menteeId, mentorId, goals, message, frequency, preferredTime) => {
    const response = await fetch(
      `${API_BASE_URL}/mentors/request-mentorship`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentee_id: menteeId,
          mentor_id: mentorId,
          goals,
          message,
          frequency,
          preferred_time: preferredTime
        })
      }
    );
    if (!response.ok) throw new Error('Failed to request mentorship');
    return response.json();
  },

  // Get pending mentoring requests for a mentor
  getMentoringRequests: async (mentorEmployeeId) => {
    const response = await fetch(
      `${API_BASE_URL}/mentors/requests/${mentorEmployeeId}`
    );
    if (!response.ok) throw new Error('Failed to fetch mentoring requests');
    return response.json();
  },

  // Respond to a mentorship request (accept/reject)
  respondToRequest: async (requestId, response) => {
    const res = await fetch(
      `${API_BASE_URL}/mentors/respond-to-request`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          response
        })
      }
    );
    if (!res.ok) throw new Error('Failed to respond to request');
    return res.json();
  },

  // Get active mentorships for a mentor
  getActiveMentorships: async (mentorEmployeeId) => {
    const response = await fetch(
      `${API_BASE_URL}/mentors/active-mentorships/${mentorEmployeeId}`
    );
    if (!response.ok) throw new Error('Failed to fetch active mentorships');
    return response.json();
  },

  // Get active mentors for a mentee
  getMyActiveMentors: async (menteeId) => {
    const response = await fetch(
      `${API_BASE_URL}/mentors/my-mentors/${menteeId}`
    );
    if (!response.ok) throw new Error('Failed to fetch your mentors');
    return response.json();
  },

  // Get aggregate mentorship stats for dashboard
  getMentorStats: async (employeeId) => {
    const response = await fetch(
      `${API_BASE_URL}/mentors/stats/${employeeId}`
    );
    if (!response.ok) throw new Error('Failed to fetch mentor stats');
    return response.json();
  },

  // Schedule a mentoring session
  scheduleSession: async (mentorshipId, proposedDate, proposedTime, agenda, sessionType) => {
    const response = await fetch(
      `${API_BASE_URL}/mentors/schedule-session`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorship_id: mentorshipId,
          proposed_date: proposedDate,
          proposed_time: proposedTime,
          agenda,
          session_type: sessionType
        })
      }
    );
    if (!response.ok) throw new Error('Failed to schedule session');
    return response.json();
  },

  // End a mentorship
  endMentorship: async (mentorshipId, feedback, rating) => {
    const response = await fetch(
      `${API_BASE_URL}/mentors/end-mentorship`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorship_id: mentorshipId,
          feedback,
          rating
        })
      }
    );
    if (!response.ok) throw new Error('Failed to end mentorship');
    return response.json();
  },

  // Get mentee's pending mentorship requests
  getMyPendingRequests: async (menteeId) => {
    const response = await fetch(
      `${API_BASE_URL}/mentors/my-requests/${menteeId}`
    );
    if (!response.ok) throw new Error('Failed to fetch your requests');
    return response.json();
  },

  // Cancel a pending mentorship request
  cancelRequest: async (requestId) => {
    const response = await fetch(
      `${API_BASE_URL}/mentors/cancel-request`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId })
      }
    );
    if (!response.ok) throw new Error('Failed to cancel request');
    return response.json();
  }
};

export default api;
