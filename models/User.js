const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  staffId: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin', 'staff'], default: 'student' },
  department: { type: String, default: 'General' },
  roomNo: { type: String, default: '' },
  phone: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const MongoUser = mongoose.model('User', userSchema);

// In-Memory Storage Fallback
const memoryUsers = [];

module.exports = { MongoUser, memoryUsers };
