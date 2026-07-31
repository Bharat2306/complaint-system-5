const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  url: String,
  type: String,
  originalName: String
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  studentId: { type: mongoose.Schema.Types.Mixed, default: '' },
  studentName: { type: String, default: '' },
  studentEmail: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Emergency'], default: 'Medium' },
  location: { type: String, default: '' },
  image: { type: String, default: '' },
  media: [mediaSchema],
  status: { 
    type: String, 
    enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'], 
    default: 'Pending' 
  },
  assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
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
const memoryComplaints = [];

module.exports = { MongoComplaint, memoryComplaints, Complaint: MongoComplaint };
