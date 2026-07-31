const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getMongoStatus } = require('../config/db');
const { MongoUser } = require('../models/User');
const { MongoComplaint } = require('../models/Complaint');
const { getAllComplaints, updateComplaintStatus, getAllStudents, getAllStaff, findUserByEmail } = require('../services/dataStore');

// Middleware to check Admin role
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access Denied: Admin access required.' });
};

// GET: /api/admin/users - Return all users
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    let users = [];
    if (getMongoStatus()) {
      users = await MongoUser.find({}, '-password').sort({ createdAt: -1 });
    } else {
      const students = await getAllStudents();
      const staff = await getAllStaff();
      users = [...students, ...staff];
    }
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    console.error('Admin Users Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users list.' });
  }
});

// GET: /api/admin/complaints - Return all complaints
router.get('/complaints', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const complaints = await getAllComplaints();
    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (err) {
    console.error('Admin Complaints Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints.' });
  }
});

// PUT: /api/admin/assign-staff/:id - Assign complaint to staff
router.put('/assign-staff/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId, staffName, expectedDate } = req.body;

    const staffUser = await findUserByEmail(staffId);

    const updateFields = {
      status: 'Assigned',
      assignedTo: staffName || (staffUser ? staffUser.name : 'Staff Technician'),
      assignedStaffId: staffId,
      assignedStaff: staffUser && staffUser._id ? staffUser._id : null,
      expectedDate: expectedDate || ''
    };

    const updated = await updateComplaintStatus(id, updateFields);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    res.json({
      success: true,
      message: 'Complaint assigned to staff successfully.',
      complaint: updated
    });
  } catch (err) {
    console.error('Admin Assign Error:', err);
    res.status(500).json({ success: false, message: 'Failed to assign complaint.' });
  }
});

module.exports = router;
