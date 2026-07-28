const { getMongoStatus } = require('../config/db');
const { MongoUser, memoryUsers } = require('../models/User');
const { MongoComplaint, memoryComplaints } = require('../models/Complaint');
const { MongoMessage, memoryMessages } = require('../models/Message');
const bcrypt = require('bcryptjs');

const seedDefaultData = async () => {
  try {
    const studentPass = await bcrypt.hash('password123', 10);
    const userPass = await bcrypt.hash('bharat@123', 10);
    const adminPass = await bcrypt.hash('admin123', 10);
    const staffPass = await bcrypt.hash('staff123', 10);

    const defaultUsers = [
      { name: 'Bharat Rajput', email: 'br232006rajput@gmail.com', password: userPass, role: 'student', department: 'Block B-304' },
      { name: 'Demo Student', email: 'student@campus.edu', password: studentPass, role: 'student', department: 'Block A-101' },
      { name: 'Campus Admin', email: 'admin@campus.edu', password: adminPass, role: 'admin', department: 'Administration' },
      { name: 'Campus Admin', email: 'admin', password: adminPass, role: 'admin', department: 'Administration' },
      { name: 'Tech Staff', email: 'staff@campus.edu', staffId: 'STF-101', password: staffPass, role: 'staff', department: 'Electrical' },
      { name: 'Tech Staff', email: 'staff123', staffId: 'staff123', password: staffPass, role: 'staff', department: 'Electrical' },
      { name: 'Tech Staff', email: 'staff', staffId: 'staff', password: staffPass, role: 'staff', department: 'Electrical' }
    ];

    if (getMongoStatus()) {
      const count = await MongoUser.countDocuments();
      if (count === 0) {
        await MongoUser.create(defaultUsers);
        console.log('✅ Default Demo Users Seeded successfully in MongoDB.');
      }
    } else {
      if (memoryUsers.length === 0) {
        defaultUsers.forEach((u, i) => {
          memoryUsers.push({ _id: 'usr_' + (i + 1), ...u, createdAt: new Date() });
        });
        console.log('✅ Default Demo Users Seeded in Memory Storage.');
      }
    }
  } catch (err) {
    console.error('Seed Error:', err);
  }
};

// Data methods
const findUserByEmail = async (identifier) => {
  if (!identifier) return null;
  const searchKey = identifier.trim().toLowerCase();
  const escapedKey = searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (getMongoStatus()) {
    let user = await MongoUser.findOne({
      $or: [
        { email: searchKey },
        { email: new RegExp('^' + escapedKey + '(@.*)?$', 'i') },
        { staffId: searchKey },
        { staffId: identifier.trim().toUpperCase() },
        { staffId: new RegExp('^' + escapedKey + '$', 'i') }
      ]
    });
    if (!user) {
      user = await MongoUser.findOne({ email: new RegExp(escapedKey, 'i') });
    }
    return user;
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
        uStaffId === identifier.trim().toLowerCase() ||
        uEmail.includes(searchKey)
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
