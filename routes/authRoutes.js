const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { findUserByEmail, createUser } = require('../services/dataStore');

// Register Endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, staffId, password, role, department, roomNo, phone } = req.body;

    const userRole = role && ['student', 'admin', 'staff'].includes(role) ? role : 'student';
    const rawIdentifier = (userRole === 'staff' ? (staffId || email) : email) || '';
    const identifier = rawIdentifier.trim();

    if (!name || !identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please enter all required fields.' });
    }

    const existingUser = await findUserByEmail(identifier);
    if (existingUser) {
      return res.status(400).json({ success: false, message: `An account with this ${userRole === 'staff' ? 'Staff ID / Email' : 'Email'} already exists.` });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const userEmail = identifier.includes('@') 
      ? identifier.toLowerCase() 
      : `${identifier.toLowerCase()}@${userRole === 'staff' ? 'staff.' : ''}campus.edu`;

    const finalStaffId = staffId || (userRole === 'staff' ? identifier : '');

    const newUser = await createUser({
      name: name.trim(),
      email: userEmail,
      staffId: finalStaffId,
      password: hashedPassword,
      role: userRole,
      department: department || (userRole === 'staff' ? 'Maintenance & Staff' : userRole === 'admin' ? 'Administration' : 'General'),
      roomNo: roomNo || '',
      phone: phone || ''
    });

    const userPayload = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      staffId: newUser.staffId,
      role: newUser.role,
      department: newUser.department,
      roomNo: newUser.roomNo
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

// Login Endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/ID and password.' });
    }

    const inputIdentifier = email.trim();
    const user = await findUserByEmail(inputIdentifier);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email/ID or password.' });
    }

    const userPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      staffId: user.staffId || '',
      role: user.role,
      department: user.department,
      roomNo: user.roomNo
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
