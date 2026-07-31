require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getMongoStatus } = require('./config/db');
const { seedDefaultData } = require('./services/dataStore');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const staffRoutes = require('./routes/staffRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend and uploads
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/chat', chatRoutes);

// Health Check Endpoint
app.use('/api/health', (req, res) => {
  res.json({
    status: 'online',
    mongoConnected: getMongoStatus(),
    database: getMongoStatus() ? 'MongoDB Atlas' : 'In-Memory Fallback',
    timestamp: new Date()
  });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const startServer = async () => {
  await connectDB();
  await seedDefaultData();

  app.listen(PORT, () => {
    console.log(`
🚀 Smart Complaint Management System Backend is running!
--------------------------------------------------
📍 API Base URL : http://localhost:${PORT}/api
💾 Database     : ${getMongoStatus() ? 'MongoDB Atlas' : 'In-Memory'}
🔐 JWT Auth     : Enabled
--------------------------------------------------
    `);
  });
};

startServer();
