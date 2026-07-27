const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  complaintId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MongoMessage = mongoose.model('Message', messageSchema);

// In-Memory Storage Fallback
const memoryMessages = [];

module.exports = { MongoMessage, memoryMessages };
