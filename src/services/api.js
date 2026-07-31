import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('complaint_token') || localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Service APIs
export const authService = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    if (response.data.token) {
      localStorage.setItem('complaint_token', response.data.token);
      localStorage.setItem('complaint_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('complaint_token', response.data.token);
      localStorage.setItem('complaint_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

// Complaint Service APIs
export const complaintService = {
  raiseComplaint: async (complaintData) => {
    const response = await api.post('/complaints/raise', complaintData);
    return response.data;
  },
  getStudentComplaints: async () => {
    const response = await api.get('/complaints');
    return response.data;
  },
  getStaffComplaints: async () => {
    const response = await api.get('/staff/complaints');
    return response.data;
  },
  getAllComplaints: async () => {
    const response = await api.get('/admin/complaints');
    return response.data;
  },
  updateStatus: async (id, statusData) => {
    const response = await api.put(`/staff/update-status/${id}`, statusData);
    return response.data;
  },
  assignStaff: async (id, assignData) => {
    const response = await api.put(`/admin/assign-staff/${id}`, assignData);
    return response.data;
  }
};

// Admin Service APIs
export const adminService = {
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  getComplaints: async () => {
    const response = await api.get('/admin/complaints');
    return response.data;
  }
};

export default api;
