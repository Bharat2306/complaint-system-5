const { getMongoStatus } = require('../config/db');
const { MongoUser, memoryUsers } = require('../models/User');
const { MongoComplaint, memoryComplaints } = require('../models/Complaint');
const { MongoMessage, memoryMessages } = require('../models/Message');
const bcrypt = require('bcryptjs');

const seedDefaultData = async () => {
  try {
    console.log('ℹ️ System initialized with zero pre-seeded users. Ready for fresh user registrations.');
  } catch (err) {
    console.error('Seed Error:', err);
  }
};

// Data methods
const findUserByEmail = async (identifier) => {
  if (!identifier) return null;
  const searchKey = identifier.trim().toLowerCase();

  if (getMongoStatus()) {
    let user = await MongoUser.findOne({
      $or: [
        { email: searchKey },
        { staffId: searchKey },
        { staffId: identifier.trim().toUpperCase() }
      ]
    });
    return user;
  } else {
    return memoryUsers.find(u => {
      if (!u) return false;
      const uEmail = (u.email || '').toLowerCase();
      const uStaffId = (u.staffId || '').toLowerCase();
      return (
        uEmail === searchKey ||
        uStaffId === searchKey ||
        uStaffId === identifier.trim().toLowerCase()
      );
    });
  }
};

const createUser = async (userData) => {
  if (getMongoStatus()) {
    const user = new MongoUser(userData);
    return await user.save();
  } else {
    const newUser = {
      _id: 'usr_' + Date.now(),
      ...userData,
      createdAt: new Date()
    };
    memoryUsers.push(newUser);
    return newUser;
  }
};

const getAllComplaints = async () => {
  if (getMongoStatus()) {
    return await MongoComplaint.find().sort({ createdAt: -1 });
  } else {
    return [...memoryComplaints].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

const getComplaintsByStudent = async (studentEmail) => {
  if (getMongoStatus()) {
    return await MongoComplaint.find({ studentEmail: studentEmail }).sort({ createdAt: -1 });
  } else {
    return memoryComplaints
      .filter(c => c.studentEmail === studentEmail)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

const getComplaintByTicketId = async (ticketId) => {
  if (getMongoStatus()) {
    return await MongoComplaint.findOne({ ticketId });
  } else {
    return memoryComplaints.find(c => c.ticketId === ticketId);
  }
};

const createComplaint = async (data) => {
  // Generate ticket ID
  const count = getMongoStatus() 
    ? await MongoComplaint.countDocuments() 
    : memoryComplaints.length;
  
  const ticketId = `CMP-${1000 + count + 1}`;
  
  const complaintData = {
    ticketId,
    studentId: data.studentEmail,
    studentName: data.studentName,
    studentEmail: data.studentEmail,
    title: data.title,
    category: data.category,
    priority: data.priority || 'Medium',
    location: data.location || '',
    description: data.description,
    media: data.media || [],
    status: 'Pending',
    assignedTo: 'Unassigned',
    assignedStaffId: '',
    timeline: [
      { status: 'Pending', updatedBy: data.studentName, note: 'Complaint registered by student', timestamp: new Date() }
    ],
    rating: 0,
    feedback: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  if (getMongoStatus()) {
    const comp = new MongoComplaint(complaintData);
    return await comp.save();
  } else {
    const newComp = { _id: 'cmp_' + Date.now(), ...complaintData };
    memoryComplaints.push(newComp);
    return newComp;
  }
};

const updateComplaintStatus = async (ticketId, { status, assignedTo, assignedStaffId, note, updatedBy }) => {
  const timestamp = new Date();
  
  if (getMongoStatus()) {
    const comp = await MongoComplaint.findOne({ ticketId });
    if (!comp) return null;
    
    if (status) comp.status = status;
    if (assignedTo) comp.assignedTo = assignedTo;
    if (assignedStaffId) comp.assignedStaffId = assignedStaffId;
    
    comp.timeline.push({
      status: status || comp.status,
      updatedBy: updatedBy || 'Admin',
      note: note || `Status updated to ${status || comp.status}`,
      timestamp
    });
    
    comp.updatedAt = timestamp;
    return await comp.save();
  } else {
    const comp = memoryComplaints.find(c => c.ticketId === ticketId);
    if (!comp) return null;
    
    if (status) comp.status = status;
    if (assignedTo) comp.assignedTo = assignedTo;
    if (assignedStaffId) comp.assignedStaffId = assignedStaffId;
    
    comp.timeline.push({
      status: status || comp.status,
      updatedBy: updatedBy || 'Admin',
      note: note || `Status updated to ${status || comp.status}`,
      timestamp
    });
    
    comp.updatedAt = timestamp;
    return comp;
  }
};

const addFeedback = async (ticketId, { rating, feedback }) => {
  if (getMongoStatus()) {
    const comp = await MongoComplaint.findOne({ ticketId });
    if (!comp) return null;
    comp.rating = rating;
    comp.feedback = feedback;
    comp.status = 'Closed';
    comp.timeline.push({
      status: 'Closed',
      updatedBy: comp.studentName,
      note: `Student left ${rating}★ rating & feedback: "${feedback}"`,
      timestamp: new Date()
    });
    comp.updatedAt = new Date();
    return await comp.save();
  } else {
    const comp = memoryComplaints.find(c => c.ticketId === ticketId);
    if (!comp) return null;
    comp.rating = rating;
    comp.feedback = feedback;
    comp.status = 'Closed';
    comp.timeline.push({
      status: 'Closed',
      updatedBy: comp.studentName,
      note: `Student left ${rating}★ rating & feedback: "${feedback}"`,
      timestamp: new Date()
    });
    comp.updatedAt = new Date();
    return comp;
  }
};

const getMessagesByComplaint = async (ticketId) => {
  if (getMongoStatus()) {
    return await MongoMessage.find({ complaintId: ticketId }).sort({ createdAt: 1 });
  } else {
    return memoryMessages.filter(m => m.complaintId === ticketId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }
};

const createMessage = async (msgData) => {
  const payload = {
    ...msgData,
    createdAt: new Date()
  };
  if (getMongoStatus()) {
    const msg = new MongoMessage(payload);
    return await msg.save();
  } else {
    const newMsg = { _id: 'msg_' + Date.now(), ...payload };
    memoryMessages.push(newMsg);
    return newMsg;
  }
};

const getComplaintsByStaff = async (email, staffId, department) => {
  const all = await getAllComplaints();
  const lowerEmail = (email || '').toLowerCase();
  const lowerStaffId = (staffId || email || '').toLowerCase();
  const lowerDept = (department || '').toLowerCase();

  const filtered = all.filter(c => {
    if (c.assignedStaffId && (c.assignedStaffId.toLowerCase() === lowerStaffId || c.assignedStaffId.toLowerCase() === lowerEmail)) return true;
    if (c.assignedTo && (c.assignedTo.toLowerCase().includes(lowerStaffId) || c.assignedTo.toLowerCase().includes(lowerEmail))) return true;
    if (lowerDept && c.category && (c.category.toLowerCase().includes(lowerDept) || lowerDept.includes(c.category.toLowerCase()))) return true;
    return false;
  });

  return filtered.length > 0 ? filtered : all;
};

const getAllStaff = async () => {
  if (getMongoStatus()) {
    return await MongoUser.find({ role: 'staff' }, 'name email staffId role department createdAt');
  } else {
    return memoryUsers
      .filter(u => u.role === 'staff')
      .map(u => ({ name: u.name, email: u.email, staffId: u.staffId || u.email, role: u.role, department: u.department, createdAt: u.createdAt }));
  }
};

const getAllStudents = async () => {
  if (getMongoStatus()) {
    return await MongoUser.find({ role: 'student' }, 'name email role department rollNumber hostel roomNo phone createdAt');
  } else {
    return memoryUsers
      .filter(u => u.role === 'student')
      .map(u => ({
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        rollNumber: u.rollNumber || '',
        hostel: u.hostel || '',
        roomNo: u.roomNo || '',
        phone: u.phone || '',
        createdAt: u.createdAt
      }));
  }
};

const getAnalyticsData = async () => {
  const all = await getAllComplaints();
  const total = all.length;
  if (total === 0) {
    return {
      total: 0,
      categories: { Hostel: 0, Electrical: 0, Mess: 0, Internet: 0, Classroom: 0, Cleanliness: 0, Water: 0, Other: 0 },
      avgResolutionTime: 'N/A'
    };
  }

  const catCounts = {};
  all.forEach(c => {
    const cat = c.category || 'Other';
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });

  const catPercents = {};
  Object.keys(catCounts).forEach(cat => {
    catPercents[cat] = Math.round((catCounts[cat] / total) * 100);
  });

  return {
    total,
    categories: catPercents,
    counts: catCounts,
    avgResolutionTime: '1-2 Days'
  };
};

module.exports = {
  seedDefaultData,
  findUserByEmail,
  createUser,
  getAllComplaints,
  getComplaintsByStudent,
  getComplaintsByStaff,
  getComplaintByTicketId,
  createComplaint,
  updateComplaintStatus,
  addFeedback,
  getMessagesByComplaint,
  createMessage,
  getAllStaff,
  getAllStudents,
  getAnalyticsData
};
