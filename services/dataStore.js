const { getMongoStatus } = require('../config/db');
const { MongoUser, memoryUsers } = require('../models/User');
const { MongoComplaint, memoryComplaints } = require('../models/Complaint');
const { MongoMessage, memoryMessages } = require('../models/Message');
const bcrypt = require('bcryptjs');

const seedDefaultData = async () => {
  try {
    const shouldSeedDemoData = String(process.env.SEED_DEMO_DATA || '').toLowerCase() === 'true';
    if (!shouldSeedDemoData) {
      console.log('ℹ️ Demo data seeding is disabled. Starting with a clean empty state.');
      return;
    }

    const studentPass = await bcrypt.hash('student123', 10);
    const staffPass = await bcrypt.hash('staff123', 10);
    const adminPass = await bcrypt.hash('admin123', 10);

    const demoUsers = [
      {
        name: 'Aarav Student',
        email: 'student@campus.edu',
        password: studentPass,
        role: 'student',
        department: 'Hostel Block A-203',
        roomNumber: '203',
        hostel: 'Hostel Block A',
        rollNumber: 'CS2026-042'
      },
      {
        name: 'Rajesh Technician',
        email: '101',
        staffId: '101',
        employeeId: '101',
        password: staffPass,
        role: 'staff',
        department: 'Electrical & Maintenance'
      },
      {
        name: 'Chief Warden Admin',
        email: 'admin@campus.edu',
        password: adminPass,
        role: 'admin',
        department: 'Chief Warden Office'
      }
    ];

    for (const uData of demoUsers) {
      const existing = await findUserByEmail(uData.email);
      if (!existing) {
        await createUser(uData);
      } else {
        existing.password = uData.password;
        existing.role = uData.role;
        if (existing.save && getMongoStatus()) await existing.save();
      }
    }

    const existingComplaints = await getAllComplaints();
    if (existingComplaints.length === 0) {
      await createComplaint({
        studentName: 'Aarav Student',
        studentEmail: 'student@campus.edu',
        title: 'Room Fan & Light Not Working',
        category: 'Electrical',
        priority: 'High',
        location: 'Hostel Block A, Room 203',
        description: 'The ceiling fan in my room stopped working yesterday and light is flickering.'
      });

      const comp2 = await createComplaint({
        studentName: 'Aarav Student',
        studentEmail: 'student@campus.edu',
        title: 'Water Leakage in Bathroom',
        category: 'Water Problem',
        priority: 'Emergency',
        location: 'Hostel Block A, 2nd Floor Washroom',
        description: 'Pipeline leakage in the main washroom area.'
      });

      if (comp2 && comp2.ticketId) {
        await updateComplaintStatus(comp2.ticketId, {
          status: 'Assigned',
          assignedTo: 'Rajesh Technician',
          assignedStaffId: '101',
          note: 'Assigned to Rajesh Technician for immediate repair.',
          updatedBy: 'Chief Warden Admin'
        });
      }
    }

    console.log('✅ Demo accounts & complaints seeded successfully!');
  } catch (err) {
    console.error('Seed Error:', err);
  }
};

// Data methods
const findUserByEmail = async (identifier) => {
  if (!identifier) return null;
  const searchKey = identifier.trim().toLowerCase();

  if (getMongoStatus()) {
    try {
      const user = await MongoUser.findOne({
        $or: [
          { email: searchKey },
          { staffId: searchKey },
          { staffId: identifier.trim().toUpperCase() },
          { employeeId: searchKey }
        ]
      });
      if (user) return user;
    } catch (err) {
      // Mongo lookup error, check memory
    }
  }

  return memoryUsers.find(u => {
    if (!u) return false;
    const uEmail = (u.email || '').toLowerCase();
    const uStaffId = (u.staffId || '').toLowerCase();
    const uEmpId = (u.employeeId || '').toLowerCase();
    return (
      uEmail === searchKey ||
      uStaffId === searchKey ||
      uEmpId === searchKey ||
      uStaffId === identifier.trim().toLowerCase()
    );
  });
};

const createUser = async (userData) => {
  let createdUser = null;
  if (getMongoStatus()) {
    try {
      const user = new MongoUser(userData);
      createdUser = await user.save();
    } catch (err) {
      console.error('Mongo createUser error:', err.message);
    }
  }

  const memoryUser = {
    _id: createdUser ? createdUser._id : 'usr_' + Date.now(),
    ...userData,
    createdAt: new Date()
  };
  
  // Keep memory cache updated
  const existingIdx = memoryUsers.findIndex(u => (u.email || '').toLowerCase() === (userData.email || '').toLowerCase());
  if (existingIdx >= 0) {
    memoryUsers[existingIdx] = memoryUser;
  } else {
    memoryUsers.push(memoryUser);
  }

  return createdUser || memoryUser;
};

const getAllComplaints = async () => {
  if (getMongoStatus()) {
    try {
      const complaints = await MongoComplaint.find().sort({ createdAt: -1 });
      if (complaints && complaints.length > 0) return complaints;
    } catch (err) {
      // fallback to memory
    }
  }
  return [...memoryComplaints].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const getComplaintsByStudent = async (studentEmail) => {
  if (getMongoStatus()) {
    try {
      const complaints = await MongoComplaint.find({ studentEmail: studentEmail }).sort({ createdAt: -1 });
      if (complaints && complaints.length > 0) return complaints;
    } catch (err) {
      // fallback to memory
    }
  }
  return memoryComplaints
    .filter(c => c.studentEmail === studentEmail)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const getComplaintByTicketId = async (ticketId) => {
  if (getMongoStatus()) {
    try {
      const comp = await MongoComplaint.findOne({ ticketId });
      if (comp) return comp;
    } catch (err) {
      // fallback to memory
    }
  }
  return memoryComplaints.find(c => c.ticketId === ticketId);
};

const createComplaint = async (data) => {
  let count = memoryComplaints.length;
  if (getMongoStatus()) {
    try {
      count = await MongoComplaint.countDocuments();
    } catch (e) {}
  }

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

  let savedComp = null;
  if (getMongoStatus()) {
    try {
      const comp = new MongoComplaint(complaintData);
      savedComp = await comp.save();
    } catch (err) {
      console.error('Mongo createComplaint error:', err.message);
    }
  }

  const memoryComp = { _id: savedComp ? savedComp._id : 'cmp_' + Date.now(), ...complaintData };
  memoryComplaints.unshift(memoryComp);

  return savedComp || memoryComp;
};

const updateComplaintStatus = async (ticketId, { status, assignedTo, assignedStaffId, note, updatedBy }) => {
  const timestamp = new Date();
  
  let savedComp = null;
  if (getMongoStatus()) {
    try {
      const comp = await MongoComplaint.findOne({ ticketId });
      if (comp) {
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
        savedComp = await comp.save();
      }
    } catch (err) {}
  }

  const memComp = memoryComplaints.find(c => c.ticketId === ticketId);
  if (memComp) {
    if (status) memComp.status = status;
    if (assignedTo) memComp.assignedTo = assignedTo;
    if (assignedStaffId) memComp.assignedStaffId = assignedStaffId;
    
    memComp.timeline.push({
      status: status || memComp.status,
      updatedBy: updatedBy || 'Admin',
      note: note || `Status updated to ${status || memComp.status}`,
      timestamp
    });
    
    memComp.updatedAt = timestamp;
  }

  return savedComp || memComp || null;
};

const addFeedback = async (ticketId, { rating, feedback }) => {
  let savedComp = null;
  if (getMongoStatus()) {
    try {
      const comp = await MongoComplaint.findOne({ ticketId });
      if (comp) {
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
        savedComp = await comp.save();
      }
    } catch (err) {}
  }

  const memComp = memoryComplaints.find(c => c.ticketId === ticketId);
  if (memComp) {
    memComp.rating = rating;
    memComp.feedback = feedback;
    memComp.status = 'Closed';
    memComp.timeline.push({
      status: 'Closed',
      updatedBy: memComp.studentName,
      note: `Student left ${rating}★ rating & feedback: "${feedback}"`,
      timestamp: new Date()
    });
    memComp.updatedAt = new Date();
  }

  return savedComp || memComp || null;
};

const getMessagesByComplaint = async (ticketId) => {
  if (getMongoStatus()) {
    try {
      const msgs = await MongoMessage.find({ complaintId: ticketId }).sort({ createdAt: 1 });
      if (msgs && msgs.length > 0) return msgs;
    } catch (err) {}
  }

  return memoryMessages.filter(m => m.complaintId === ticketId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

const createMessage = async (msgData) => {
  const payload = {
    ...msgData,
    createdAt: new Date()
  };
  let savedMsg = null;
  if (getMongoStatus()) {
    try {
      const msg = new MongoMessage(payload);
      savedMsg = await msg.save();
    } catch (err) {}
  }

  const newMsg = { _id: savedMsg ? savedMsg._id : 'msg_' + Date.now(), ...payload };
  memoryMessages.push(newMsg);
  return savedMsg || newMsg;
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
    try {
      const staff = await MongoUser.find({ role: 'staff' }, 'name email staffId role department createdAt');
      if (staff && staff.length > 0) return staff;
    } catch (err) {}
  }

  return memoryUsers
    .filter(u => u.role === 'staff')
    .map(u => ({ name: u.name, email: u.email, staffId: u.staffId || u.email, role: u.role, department: u.department, createdAt: u.createdAt }));
};

const getAllStudents = async () => {
  if (getMongoStatus()) {
    try {
      const students = await MongoUser.find({ role: 'student' }, 'name email role department rollNumber hostel roomNo phone createdAt');
      if (students && students.length > 0) return students;
    } catch (err) {}
  }

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
