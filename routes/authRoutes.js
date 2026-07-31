const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { findUserByEmail, createUser } = require('../services/dataStore');

// ==================== USER REGISTRATION ====================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, rollNumber, hostel, roomNo, phone } = req.body;

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
      staffId: userRole === 'staff' ? cleanEmail : '',
      password: hashedPassword,
      role: userRole,
      department: userRole === 'staff' ? 'Technician' : (department ? department.trim() : 'General'),
      rollNumber: rollNumber || '',
      hostel: hostel || '',
      roomNo: roomNo || '',
      phone: phone || ''
    });

    const userPayload = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      staffId: newUser.staffId || '',
      role: newUser.role,
      department: newUser.department,
      rollNumber: newUser.rollNumber || '',
      hostel: newUser.hostel || '',
      roomNo: newUser.roomNo || '',
      phone: newUser.phone || ''
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: userPayload
    });

  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// ==================== USER LOGIN ====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter Email/ID and Password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await findUserByEmail(cleanEmail);

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found. Please check your details or Register.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect password.' });
    }

    const userPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      staffId: user.staffId || '',
      role: user.role,
      department: user.department,
      rollNumber: user.rollNumber || '',
      hostel: user.hostel || '',
      roomNo: user.roomNo || '',
      phone: user.phone || ''
    };

    res.json({
      success: true,
      message: 'Logged in successfully!',
      user: userPayload
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

module.exports = router;
