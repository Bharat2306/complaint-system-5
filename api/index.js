require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getMongoStatus } = require('../config/db');
const { seedDefaultData } = require('../services/dataStore');

const authRoutes = require('../routes/authRoutes');
const adminRoutes = require('../routes/adminRoutes');
const staffRoutes = require('../routes/staffRoutes');
const complaintRoutes = require('../routes/complaintRoutes');
const chatRoutes = require('../routes/chatRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serverless DB initialization
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await connectDB();
      await seedDefaultData();
      dbInitialized = true;
    } catch (e) {
      console.error('Serverless Init Error:', e);
    }
  }
  next();
});

// Serve static assets
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/chat', chatRoutes);

// Health check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    mongoConnected: getMongoStatus(),
    storageMode: getMongoStatus() ? 'MongoDB' : 'Memory-Fallback',
    timestamp: new Date()
  });
});

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
