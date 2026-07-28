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

    console.log('✅ Clean setup complete! Database is 100% empty and ready for fresh user registration.');
    process.exit(0);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
    process.exit(1);
  }
};

cleanDatabase();
