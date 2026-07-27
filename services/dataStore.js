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

  const defaultComplaints = [
    {
      ticketId: 'CMP-1001',
      studentId: 'student@campus.edu',
      studentName: 'Aarav Sharma',
      studentEmail: 'student@campus.edu',
      title: 'Wi-Fi disconnects frequently in Hostel Block B 3rd Floor',
      category: 'Wi-Fi & IT',
      priority: 'High',
      location: 'Hostel Block B, Room 304',
      description: 'The Wi-Fi router on 3rd floor loses internet signal every 20 minutes. Unable to attend online lectures.',
      media: [
        { url: '/assets/sample_wifi.png', type: 'image', originalName: 'wifi_speedtest.png' }
      ],
      status: 'In Progress',
      assignedTo: 'Priya Patel (IT Support Staff)',
      assignedStaffId: 'itstaff@campus.edu',
      timeline: [
        { status: 'Pending', updatedBy: 'Aarav Sharma', note: 'Complaint submitted by student', timestamp: new Date(Date.now() - 86400000 * 2) },
        { status: 'Assigned', updatedBy: 'Admin', note: 'Assigned to IT Support Department', timestamp: new Date(Date.now() - 86400000 * 1.5) },
        { status: 'In Progress', updatedBy: 'Priya Patel', note: 'Technician investigating router configuration on 3rd floor', timestamp: new Date(Date.now() - 86400000 * 0.5) }
      ],
      rating: 0,
      feedback: '',
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(Date.now() - 86400000 * 0.5)
    },
    {
      ticketId: 'CMP-1002',
      studentId: 'student@campus.edu',
      studentName: 'Aarav Sharma',
      studentEmail: 'student@campus.edu',
      title: 'Water Leakage in Main Bathrooms',
      category: 'Maintenance',
      priority: 'Medium',
      location: 'Hostel Block B, 2nd Floor Washroom',
      description: 'Tap pipe is leaking continuously causing water logging in washroom area.',
      media: [],
      status: 'Pending',
      assignedTo: 'Unassigned',
      assignedStaffId: '',
      timeline: [
        { status: 'Pending', updatedBy: 'Aarav Sharma', note: 'Complaint submitted', timestamp: new Date(Date.now() - 3600000 * 4) }
      ],
      rating: 0,
      feedback: '',
      createdAt: new Date(Date.now() - 3600000 * 4),
      updatedAt: new Date(Date.now() - 3600000 * 4)
    },
    {
      ticketId: 'CMP-1003',
      studentId: 'student@campus.edu',
      studentName: 'Aarav Sharma',
      studentEmail: 'student@campus.edu',
      title: 'AC Noise in Library Quiet Zone',
      category: 'Academic',
      priority: 'Low',
      location: 'Central Library, 1st Floor',
      description: 'The split AC unit makes loud buzzing sounds interfering with self-study.',
      media: [],
      status: 'Resolved',
      assignedTo: 'Vikram Singh (Electrical Dept)',
      assignedStaffId: 'staff@campus.edu',
      timeline: [
        { status: 'Pending', updatedBy: 'Aarav Sharma', note: 'Complaint registered', timestamp: new Date(Date.now() - 86400000 * 5) },
        { status: 'In Progress', updatedBy: 'Vikram Singh', note: 'Filter cleaned and motor lubricated', timestamp: new Date(Date.now() - 86400000 * 3) },
        { status: 'Resolved', updatedBy: 'Vikram Singh', note: 'AC motor serviced and functioning quietly', timestamp: new Date(Date.now() - 86400000 * 1) }
      ],
      rating: 5,
      feedback: 'Very quick resolution! Thanks to the maintenance team.',
      createdAt: new Date(Date.now() - 86400000 * 5),
      updatedAt: new Date(Date.now() - 86400000 * 1)
    }
  ];

  const defaultMessages = [
    {
      complaintId: 'CMP-1001',
      senderId: 'student@campus.edu',
      senderName: 'Aarav Sharma',
      senderRole: 'student',
      text: 'Hello team, is someone checking the 3rd floor router today?',
      createdAt: new Date(Date.now() - 3600000 * 3)
    },
    {
      complaintId: 'CMP-1001',
      senderId: 'itstaff@campus.edu',
      senderName: 'Priya Patel (IT)',
      senderRole: 'staff',
      text: 'Hi Aarav, yes! I am currently replacing the network switch module. Will take 30 mins.',
      createdAt: new Date(Date.now() - 3600000 * 2)
    }
  ];

  if (getMongoStatus()) {
    try {
      const count = await MongoUser.countDocuments();
      if (count === 0) {
        await MongoUser.insertMany(defaultUsers);
        await MongoComplaint.insertMany(defaultComplaints);
        await MongoMessage.insertMany(defaultMessages);
        console.log('🌱 Seeded default Mongo database records');
      }
    } catch (e) {
      console.log('Error seeding Mongo:', e.message);
    }
  } else {
    if (memoryUsers.length === 0) {
      defaultUsers.forEach(u => memoryUsers.push({ ...u, _id: Date.now().toString() + Math.random() }));
      defaultComplaints.forEach(c => memoryComplaints.push({ ...c, _id: Date.now().toString() + Math.random() }));
      defaultMessages.forEach(m => memoryMessages.push({ ...m, _id: Date.now().toString() + Math.random() }));
      console.log('🌱 Seeded in-memory store records');
    }
  }
};

// Data methods
const findUserByEmail = async (identifier) => {
  if (!identifier) return null;
  const searchKey = identifier.trim().toLowerCase();
  if (getMongoStatus()) {
    return await MongoUser.findOne({
      $or: [
        { email: searchKey },
        { staffId: searchKey },
        { staffId: identifier.trim().toUpperCase() }
      ]
    });
  } else {
    return memoryUsers.find(u => 
      (u.email && u.email.toLowerCase() === searchKey) || 
      (u.staffId && u.staffId.toLowerCase() === searchKey) ||
      (u.staffId && u.staffId.toUpperCase() === identifier.trim().toUpperCase())
    );
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
