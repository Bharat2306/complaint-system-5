const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/complaintDB';

const cleanDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB.');

    const db = mongoose.connection.db;

    // Delete all collections content
    console.log('🧹 Cleaning existing collections...');
    await db.collection('users').deleteMany({});
    await db.collection('complaints').deleteMany({});
    await db.collection('messages').deleteMany({});
    console.log('✨ All registered emails, users, complaints, and messages deleted.');

    // Clean uploads directory
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        if (file !== '.gitkeep') {
          fs.unlinkSync(path.join(uploadsDir, file));
        }
      }
      console.log('🧹 Uploads directory cleaned.');
    }

    // Seed default clean demo accounts
    console.log('🌱 Creating clean default demo accounts (Student, Admin, Staff)...');
    
    const defaultUsers = [
      {
        name: 'Aarav Sharma (Student)',
        email: 'student@campus.edu',
        password: await bcrypt.hash('password123', 10),
        role: 'student',
        department: 'Computer Science',
        roomNo: 'B-304',
        phone: '+91 9876543210',
        createdAt: new Date()
      },
      {
        name: 'Dr. Rajesh Verma (Admin)',
        email: 'admin@campus.edu',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        department: 'Campus Administration',
        roomNo: 'Admin Block 101',
        phone: '+91 9876500001',
        createdAt: new Date()
      },
      {
        name: 'Vikram Singh (Electrical Dept)',
        email: 'staff@campus.edu',
        staffId: 'STF-101',
        password: await bcrypt.hash('staff123', 10),
        role: 'staff',
        department: 'Maintenance & Electrical',
        roomNo: 'Workshop 02',
        phone: '+91 9876500002',
        createdAt: new Date()
      },
      {
        name: 'Priya Patel (IT Support Staff)',
        email: 'itstaff@campus.edu',
        staffId: 'STF-102',
        password: await bcrypt.hash('staff123', 10),
        role: 'staff',
        department: 'IT & Wi-Fi Support',
        roomNo: 'Server Room 12',
        phone: '+91 9876500003',
        createdAt: new Date()
      }
    ];

    await db.collection('users').insertMany(defaultUsers);
    console.log('✅ Clean setup complete! System is ready with fresh database.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
    process.exit(1);
  }
};

cleanDatabase();
