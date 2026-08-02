const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');
const { MongoUser, memoryUsers } = require('../models/User');
const { getMongoStatus } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_smart_complaint_2026_jwt';

const normalizeRole = (role) => {
  if (['student', 'staff', 'admin'].includes(role)) return role;
  return 'student';
};

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  rollNumber: user.rollNumber || '',
  employeeId: user.employeeId || user.staffId || '',
  staffId: user.staffId || '',
  department: user.department || 'General',
  year: user.year || '',
  hostel: user.hostel || '',
  roomNumber: user.roomNumber || user.roomNo || ''
});

const createToken = (user) => jwt.sign(
  { id: user._id, email: user.email, role: user.role, name: user.name },
  JWT_SECRET,
  { expiresIn: '7d' }
);

const findUserByIdentity = async (identifier, role) => {
  const cleanId = String(identifier || '').trim().toLowerCase();
  if (!cleanId) return null;

  if (getMongoStatus()) {
    try {
      const user = await MongoUser.findOne({
        $or: [
          { email: cleanId },
          { staffId: cleanId },
          { employeeId: cleanId },
          { staffId: cleanId.toUpperCase() }
        ],
        ...(role ? { role } : {})
      });
      if (user) return user;
    } catch (err) {
      // Fallback to memory store below
    }
  }

  return memoryUsers.find((u) => {
    const email = String(u.email || '').trim().toLowerCase();
    const staffId = String(u.staffId || '').trim().toLowerCase();
    const employeeId = String(u.employeeId || '').trim().toLowerCase();
    const sameRole = !role || u.role === role;
    return sameRole && (email === cleanId || staffId === cleanId || employeeId === cleanId);
  }) || null;
};

const upsertMemoryUser = (userData) => {
  const existingIndex = memoryUsers.findIndex((u) => (u.email || '').toLowerCase() === (userData.email || '').toLowerCase());
  const normalizedUser = {
    _id: userData._id || `usr_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    ...userData,
    createdAt: userData.createdAt || new Date()
  };

  if (existingIndex >= 0) {
    memoryUsers[existingIndex] = normalizedUser;
  } else {
    memoryUsers.push(normalizedUser);
  }

  return normalizedUser;
};

router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      rollNumber,
      employeeId,
      department,
      year,
      hostel,
      roomNumber,
      roomNo
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter name, email, and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const userRole = normalizeRole(role);

    const existingUser = await findUserByIdentity(cleanEmail, userRole);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const staffId = userRole === 'staff' ? (employeeId || cleanEmail) : '';

    let user = null;
    if (getMongoStatus()) {
      try {
        user = await MongoUser.create({
          name: cleanName,
          email: cleanEmail,
          password: hashedPassword,
          phone: phone || '',
          role: userRole,
          rollNumber: rollNumber || '',
          employeeId: employeeId || '',
          staffId,
          department: department || 'General',
          year: year || '',
          hostel: hostel || '',
          roomNumber: roomNumber || roomNo || '',
          roomNo: roomNo || roomNumber || ''
        });
      } catch (error) {
        user = upsertMemoryUser({
          name: cleanName,
          email: cleanEmail,
          password: hashedPassword,
          phone: phone || '',
          role: userRole,
          rollNumber: rollNumber || '',
          employeeId: employeeId || '',
          staffId,
          department: department || 'General',
          year: year || '',
          hostel: hostel || '',
          roomNumber: roomNumber || roomNo || '',
          roomNo: roomNo || roomNumber || ''
        });
      }
    } else {
      user = upsertMemoryUser({
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        phone: phone || '',
        role: userRole,
        rollNumber: rollNumber || '',
        employeeId: employeeId || '',
        staffId,
        department: department || 'General',
        year: year || '',
        hostel: hostel || '',
        roomNumber: roomNumber || roomNo || '',
        roomNo: roomNo || roomNumber || ''
      });
    }

    const token = createToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: buildUserPayload(user)
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup.' });
  }
});

router.post('/register', async (req, res) => {
  return router.handle(req, res);
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const requestedRole = normalizeRole(role);

    let user = await findUserByIdentity(cleanEmail, requestedRole);
    if (!user) {
      user = await findUserByIdentity(cleanEmail);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (requestedRole && user.role !== requestedRole) {
      return res.status(401).json({ success: false, message: 'Selected role does not match this account.' });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = createToken(user);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: buildUserPayload(user)
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await MongoUser.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    res.json({
      success: true,
      user: buildUserPayload(user)
    });
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
});

module.exports = router;
