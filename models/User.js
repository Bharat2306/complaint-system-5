const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: {
    type: String,
    enum: ['student', 'staff', 'admin'],
    default: 'student'
  },
  rollNumber: { type: String, default: '' },
  employeeId: { type: String, default: '' },
  staffId: { type: String, default: '' },
  department: { type: String, default: 'General' },
  year: { type: String, default: '' },
  hostel: { type: String, default: '' },
  roomNumber: { type: String, default: '' },
  roomNo: { type: String, default: '' },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'users' });

const MongoUser = mongoose.model('User', userSchema);
const memoryUsers = [];

module.exports = { MongoUser, memoryUsers, User: MongoUser };
