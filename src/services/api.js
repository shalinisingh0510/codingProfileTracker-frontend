import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to include JWT token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Dashboard Services
export const getDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

// Platform Specific Services (Optional but good for scalability)
export const getLeetCodeProfile = async (username) => {
  const response = await api.get(`/leetcode/${username}`);
  return response.data;
};

export const getCodeforcesProfile = async (handle) => {
  const response = await api.get(`/codeforces/${handle}`);
  return response.data;
};

export const getGfgProfile = async (username) => {
  const response = await api.get(`/gfg/${username}`);
  return response.data;
};

export default api;
