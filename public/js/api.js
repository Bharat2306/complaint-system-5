// API Service Layer for Smart Complaint System

const API_BASE = '/api';

const API = {
  // Auth APIs
  login: async (email, password, role) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    return await res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
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
    const res = await fetch(`${API_BASE}/complaints?${query}`);
    return await res.json();
  },

  getComplaintById: async (ticketId) => {
    const res = await fetch(`${API_BASE}/complaints/${ticketId}`);
    return await res.json();
  },

  raiseComplaint: async (formData) => {
    const res = await fetch(`${API_BASE}/complaints/raise`, {
      method: 'POST',
      body: formData // FormData with files
    });
    return await res.json();
  },

  updateStatus: async (ticketId, status, note, updatedBy) => {
    const res = await fetch(`${API_BASE}/complaints/${ticketId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note, updatedBy })
    });
    return await res.json();
  },

  assignStaff: async (ticketId, assignedTo, assignedStaffId, note, updatedBy) => {
    const res = await fetch(`${API_BASE}/complaints/${ticketId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedTo, assignedStaffId, note, updatedBy })
    });
    return await res.json();
  },

  submitFeedback: async (ticketId, rating, feedback) => {
    const res = await fetch(`${API_BASE}/complaints/${ticketId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, feedback })
    });
    return await res.json();
  },

  getStaffList: async () => {
    const res = await fetch(`${API_BASE}/complaints/meta/staff`);
    return await res.json();
  },

  getStudentList: async () => {
    const res = await fetch(`${API_BASE}/complaints/meta/students`);
    return await res.json();
  },

  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/complaints/meta/analytics`);
    return await res.json();
  },

  // Support Chat APIs
  getChatMessages: async (ticketId) => {
    const res = await fetch(`${API_BASE}/chat/${ticketId}`);
    return await res.json();
  },

  sendChatMessage: async (ticketId, messageData) => {
    const res = await fetch(`${API_BASE}/chat/${ticketId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });
    return await res.json();
  }
};
