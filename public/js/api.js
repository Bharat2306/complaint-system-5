// API Service Layer for Smart Complaint System

const API_BASE = '/api';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('complaint_token') || localStorage.getItem('token');
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const API = {
  // Auth APIs
  login: async (email, password, role) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, role })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('complaint_token', data.token);
    }
    return data;
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('complaint_token', data.token);
    }
    return data;
  },

  getProfile: async () => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  // Admin APIs
  getAdminUsers: async () => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  getAdminComplaints: async () => {
    const res = await fetch(`${API_BASE}/admin/complaints`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  // Staff APIs
  getStaffComplaints: async () => {
    const res = await fetch(`${API_BASE}/staff/complaints`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  // Complaints APIs
  getComplaints: async (role, email, staffId, department) => {
    const params = { role: role || '' };
    if (email) params.email = email;
    if (staffId) params.staffId = staffId;
    if (department) params.department = department;
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/complaints?${query}`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  getComplaintById: async (ticketId) => {
    const res = await fetch(`${API_BASE}/complaints/${ticketId}`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  raiseComplaint: async (formData) => {
    const res = await fetch(`${API_BASE}/complaints/raise`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return await res.json();
  },

  updateStatus: async (ticketId, status, note, updatedBy) => {
    const res = await fetch(`${API_BASE}/complaints/${ticketId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, note, updatedBy })
    });
    return await res.json();
  },

  assignStaff: async (ticketId, assignedTo, assignedStaffId, note, updatedBy) => {
    const res = await fetch(`${API_BASE}/complaints/${ticketId}/assign`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ assignedTo, assignedStaffId, note, updatedBy })
    });
    return await res.json();
  },

  submitFeedback: async (ticketId, rating, feedback) => {
    const res = await fetch(`${API_BASE}/complaints/${ticketId}/feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rating, feedback })
    });
    return await res.json();
  },

  getStaffList: async () => {
    const res = await fetch(`${API_BASE}/complaints/meta/staff`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  getStudentList: async () => {
    const res = await fetch(`${API_BASE}/complaints/meta/students`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/complaints/meta/analytics`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  // Support Chat APIs
  getChatMessages: async (ticketId) => {
    const res = await fetch(`${API_BASE}/chat/${ticketId}`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  sendChatMessage: async (ticketId, messageData) => {
    const res = await fetch(`${API_BASE}/chat/${ticketId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(messageData)
    });
    return await res.json();
  }
};
