const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getAllComplaints,
  getComplaintsByStudent,
  getComplaintByTicketId,
  createComplaint,
  updateComplaintStatus,
  addFeedback,
  getAllStaff
} = require('../services/dataStore');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'file-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// GET complaints list (role based: student gets own, admin/staff gets all)
router.get('/', async (req, res) => {
  try {
    const { role, email } = req.query;

    if (role === 'student' && email) {
      const list = await getComplaintsByStudent(email);
      return res.json({ success: true, complaints: list });
    }

    // Admin & staff get all complaints
    const list = await getAllComplaints();
    res.json({ success: true, complaints: list });
  } catch (err) {
    console.error('Fetch complaints error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints.' });
  }
});

// GET single complaint by ticket ID
router.get('/:ticketId', async (req, res) => {
  try {
    const complaint = await getComplaintByTicketId(req.params.ticketId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }
    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST raise new complaint with image/video upload
router.post('/raise', upload.array('files', 5), async (req, res) => {
  try {
    const { title, category, priority, location, description, studentName, studentEmail } = req.body;

    if (!title || !category || !description || !studentEmail) {
      return res.status(400).json({ success: false, message: 'Please fill all required complaint details.' });
    }

    const media = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(f => {
        const isVideo = f.mimetype.startsWith('video/');
        media.push({
          url: '/uploads/' + f.filename,
          type: isVideo ? 'video' : 'image',
          originalName: f.originalname
        });
      });
    }

    const newComplaint = await createComplaint({
      title,
      category,
      priority: priority || 'Medium',
      location,
      description,
      studentName: studentName || 'Student',
      studentEmail,
      media
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully!',
      complaint: newComplaint
    });

  } catch (err) {
    console.error('Raise complaint error:', err);
    res.status(500).json({ success: false, message: 'Failed to register complaint.' });
  }
});

// PATCH status update
router.patch('/:ticketId/status', async (req, res) => {
  try {
    const { status, note, updatedBy } = req.body;
    const { ticketId } = req.params;

    const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const updated = await updateComplaintStatus(ticketId, {
      status,
      note,
      updatedBy: updatedBy || 'Staff/Admin'
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      complaint: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
});

// PATCH assign complaint to staff
router.patch('/:ticketId/assign', async (req, res) => {
  try {
    const { assignedTo, assignedStaffId, note, updatedBy } = req.body;
    const { ticketId } = req.params;

    const updated = await updateComplaintStatus(ticketId, {
      status: 'Assigned',
      assignedTo,
      assignedStaffId,
      note: note || `Assigned to ${assignedTo}`,
      updatedBy: updatedBy || 'Admin'
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    res.json({
      success: true,
      message: `Assigned successfully to ${assignedTo}`,
      complaint: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to assign complaint.' });
  }
});

// POST feedback & rating
router.post('/:ticketId/feedback', async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const { ticketId } = req.params;

    if (!rating) {
      return res.status(400).json({ success: false, message: 'Please provide a star rating.' });
    }

    const updated = await addFeedback(ticketId, {
      rating: Number(rating),
      feedback: feedback || ''
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    res.json({
      success: true,
      message: 'Thank you for your feedback! Complaint closed.',
      complaint: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit feedback.' });
  }
});

// GET list of staff members for dropdown assignment
router.get('/meta/staff', async (req, res) => {
  try {
    const staffList = await getAllStaff();
    res.json({ success: true, staff: staffList });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch staff list.' });
  }
});

module.exports = router;
