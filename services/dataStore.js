const { getMongoStatus } = require('../config/db');
const { MongoUser, memoryUsers } = require('../models/User');
const { MongoComplaint, memoryComplaints } = require('../models/Complaint');
const { MongoMessage, memoryMessages } = require('../models/Message');
const bcrypt = require('bcryptjs');

// Seed default users if empty
const seedDefaultData = async () => {
  const defaultUsers = [
    {
      name: 'Aarav Sharma (Student)',
      email: 'student@campus.edu',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
      department: 'Computer Science',
      roomNo: 'B-304',
      phone: '+91 9876543210'
    },
    {
      name: 'Dr. Rajesh Verma (Admin)',
      email: 'admin@campus.edu',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      department: 'Campus Administration',
      roomNo: 'Admin Block 101',
      phone: '+91 9876500001'
    },
    {
      name: 'Vikram Singh (Electrical Dept)',
      email: 'staff@campus.edu',
      staffId: 'STF-101',
      password: await bcrypt.hash('staff123', 10),
      role: 'staff',
      department: 'Maintenance & Electrical',
      roomNo: 'Workshop 02',
      phone: '+91 9876500002'
    },
    {
      name: 'Priya Patel (IT Support Staff)',
      email: 'itstaff@campus.edu',
      staffId: 'STF-102',
      password: await bcrypt.hash('staff123', 10),
      role: 'staff',
      department: 'IT & Wi-Fi Support',
      roomNo: 'Server Room 12',
      phone: '+91 9876500003'
    }
  ];

  if (getMongoStatus()) {
    try {
      const count = await MongoUser.countDocuments();
      if (count === 0) {
        await MongoUser.insertMany(defaultUsers);
        console.log('🌱 Seeded default Mongo user records');
      }
    } catch (e) {
      console.log('Error seeding Mongo:', e.message);
    }
  } else {
    if (memoryUsers.length === 0) {
      defaultUsers.forEach(u => memoryUsers.push({ ...u, _id: Date.now().toString() + Math.random() }));
      console.log('🌱 Seeded in-memory user records');
    }
  }
};

// Data methods
const findUserByEmail = async (identifier) => {
  if (!identifier) return null;
  const searchKey = identifier.trim().toLowerCase();
  const escapedKey = searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (getMongoStatus()) {
    return await MongoUser.findOne({
      $or: [
        { email: searchKey },
        { email: new RegExp('^' + escapedKey + '(@.*)?$', 'i') },
        { staffId: searchKey },
        { staffId: identifier.trim().toUpperCase() },
        { staffId: new RegExp('^' + escapedKey + '$', 'i') }
      ]
    });
  } else {
    return memoryUsers.find(u => {
      if (!u) return false;
      const uEmail = (u.email || '').toLowerCase();
      const uStaffId = (u.staffId || '').toLowerCase();
      const emailPrefix = uEmail.split('@')[0];
      return (
        uEmail === searchKey ||
        emailPrefix === searchKey ||
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

const getAllStaff = async () => {
  if (getMongoStatus()) {
    return await MongoUser.find({ role: 'staff' }, 'name email staffId role department');
  } else {
    return memoryUsers
      .filter(u => u.role === 'staff')
      .map(u => ({ name: u.name, email: u.email, staffId: u.staffId || u.email, role: u.role, department: u.department }));
  }
};

module.exports = {
  seedDefaultData,
  findUserByEmail,
  createUser,
  getAllComplaints,
  getComplaintsByStudent,
  getComplaintByTicketId,
  createComplaint,
  updateComplaintStatus,
  addFeedback,
  getMessagesByComplaint,
  createMessage,
  getAllStaff
};
