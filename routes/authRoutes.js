const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');
const { findUserByEmail, createUser } = require('../services/dataStore');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_smart_complaint_2026_jwt';

// Helper for user signup
const handleSignUp = async (req, res) => {
  try {
    const { name, email, password, role, phone, rollNumber, employeeId, department, year, hostel, roomNumber, roomNo } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter Name, Email/ID, and Password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const userRole = role && ['student', 'admin', 'staff'].includes(role) ? role : 'student';

    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser) {
      const label = userRole === 'staff' ? 'Staff Unique ID' : 'Email/ID';
      return res.status(400).json({ success: false, message: `An account with this ${label} already exists.` });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const newUser = await createUser({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      phone: phone || '',
      role: userRole,
      rollNumber: rollNumber || '',
      employeeId: employeeId || (userRole === 'staff' ? cleanEmail : ''),
      staffId: userRole === 'staff' ? cleanEmail : '',
      department: department ? department.trim() : (userRole === 'staff' ? 'Technician' : 'General'),
      year: year || '',
      hostel: hostel || '',
      roomNumber: roomNumber || roomNo || '',
      roomNo: roomNo || roomNumber || ''
    });

    // Generate JWT Token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userPayload = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      phone: newUser.phone || '',
      rollNumber: newUser.rollNumber || '',
      employeeId: newUser.employeeId || newUser.staffId || '',
      staffId: newUser.staffId || '',
      hostel: newUser.hostel || '',
      roomNumber: newUser.roomNumber || newUser.roomNo || ''
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: userPayload
    });

  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ==================== SIGNUP / REGISTER ENDPOINTS ====================
router.post('/signup', handleSignUp);
router.post('/register', handleSignUp);

// ==================== USER LOGIN ====================
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter Email/ID and Password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await findUserByEmail(cleanEmail);

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found. Please check your details or Register.' });
    }

    if (role && user.role !== role) {
      return res.status(400).json({ success: false, message: `Account found, but it is registered as a ${user.role.toUpperCase()}, not a ${role.toUpperCase()}. Please select the correct account type.` });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect password.' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      staffId: user.staffId || user.employeeId || '',
      employeeId: user.employeeId || user.staffId || '',
      role: user.role,
      department: user.department,
      rollNumber: user.rollNumber || '',
      hostel: user.hostel || '',
      roomNo: user.roomNo || user.roomNumber || '',
      roomNumber: user.roomNumber || user.roomNo || '',
      phone: user.phone || ''
    };

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: userPayload
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// ==================== USER PROFILE ====================
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone || '',
        rollNumber: user.rollNumber || '',
        employeeId: user.employeeId || user.staffId || '',
        hostel: user.hostel || '',
        roomNumber: user.roomNumber || user.roomNo || ''
      }
    });
  } catch (err) {
    console.error('Profile Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
});

module.exports = router;
