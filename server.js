const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getMongoStatus } = require('./config/db');
const { seedDefaultData } = require('./services/dataStore');

const authRoutes = require('./routes/authRoutes');
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/chat', chatRoutes);

// Status check API
app.use('/api/health', (req, res) => {
  res.json({
    status: 'online',
    mongoConnected: getMongoStatus(),
    storageMode: getMongoStatus() ? 'MongoDB' : 'Memory-Fallback'
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
🚀 Smart Complaint Management System is running!
--------------------------------------------------
📍 Local URL   : http://localhost:${PORT}
💾 Storage Mode: ${getMongoStatus() ? 'MongoDB (Mongoose)' : 'High-Speed In-Memory (Zero Config)'}
👤 Student Demo: student@campus.edu / password123
👑 Admin Demo  : admin@campus.edu / admin123
🛠 Staff Demo  : staff@campus.edu / staff123
--------------------------------------------------
    `);
  });
};

startServer();
