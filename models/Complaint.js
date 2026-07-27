const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  url: String,
  type: String,
  originalName: String
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Emergency'], default: 'Medium' },
  location: { type: String, default: '' },
  description: { type: String, required: true },
  media: [mediaSchema],
  status: { 
    type: String, 
    enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'], 
    default: 'Pending' 
  },
  assignedTo: { type: String, default: 'Unassigned' },
  assignedStaffId: { type: String, default: '' },
  timeline: [{
    status: String,
    updatedBy: String,
    note: String,
    timestamp: { type: Date, default: Date.now }
  }],
  rating: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MongoComplaint = mongoose.model('Complaint', complaintSchema);

// In-Memory Storage Fallback
const memoryComplaints = [];

module.exports = { MongoComplaint, memoryComplaints };
