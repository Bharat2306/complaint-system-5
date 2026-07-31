const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { MongoComplaint } = require('../models/Complaint');
const { updateComplaintStatus, getComplaintsByStaff } = require('../services/dataStore');

// Middleware to check Staff role
const verifyStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access Denied: Staff access required.' });
};

// GET: /api/staff/complaints - Show complaints assigned to logged-in staff
router.get('/complaints', verifyToken, verifyStaff, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const complaints = await getComplaintsByStaff(userEmail, userEmail, '');

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (err) {
    console.error('Staff Complaints Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch assigned complaints.' });
  }
});

// PUT: /api/staff/update-status/:id - Update complaint status
router.put('/update-status/:id', verifyToken, verifyStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, workNotes, proofImage } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Please provide status.' });
    }

    const updated = await updateComplaintStatus(id, {
      status,
      note: workNotes || `Status updated to ${status}`,
      updatedBy: req.user.name || 'Staff'
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    res.json({
      success: true,
      message: `Complaint status updated to ${status}`,
      complaint: updated
    });
  } catch (err) {
    console.error('Staff Status Update Error:', err);
    res.status(500).json({ success: false, message: 'Failed to update complaint status.' });
  }
});

module.exports = router;
