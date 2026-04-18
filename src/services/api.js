import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://codingprofiletracker-backend.onrender.com/api',
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

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async ({ email, code, newPassword }) => {
  const response = await api.post('/auth/reset-password', { email, code, newPassword });
  return response.data;
};

// Dashboard Services
export const getDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export const getUserInfo = async () => {
  const response = await api.get('/dashboard/user');
  return response.data;
};

// Platform Specific Services
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

export const getGithubProfile = async (username) => {
  const response = await api.get(`/github/${username}`);
  return response.data;
};

export const getCodechefProfile = async (username) => {
  const response = await api.get(`/codechef/${username}`);
  return response.data;
};

export const getHackerrankProfile = async (username) => {
  const response = await api.get(`/hackerrank/${username}`);
  return response.data;
};

export const getHackerearthProfile = async (username) => {
  const response = await api.get(`/hackerearth/${username}`);
  return response.data;
};

// User Profile Services
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

// Resource Services
export const getResources = async (category = 'All') => {
  const response = await api.get('/resources', { params: { category } });
  return response.data;
};

export const createResource = async (resourceData) => {
  const response = await api.post('/resources', resourceData);
  return response.data;
};

export const updateResource = async (id, resourceData) => {
  const response = await api.put(`/resources/${id}`, resourceData);
  return response.data;
};

export const deleteResource = async (id) => {
  const response = await api.delete(`/resources/${id}`);
  return response.data;
};

// User Search & Public Profile Services
export const searchUsers = async (query) => {
  const response = await api.get('/users/search', { params: { q: query } });
  return response.data;
};

export const getPublicProfile = async (username) => {
  const response = await api.get(`/users/${username}`);
  return response.data;
};

export const checkUsername = async (username) => {
  const response = await api.get(`/users/check-username/${username}`);
  return response.data;
};

export default api;
