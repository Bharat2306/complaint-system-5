const express = require('express');
const router = express.Router();
const { getMessagesByComplaint, createMessage } = require('../services/dataStore');

// GET all messages for a complaint ticket
router.get('/:ticketId', async (req, res) => {
  try {
    const messages = await getMessagesByComplaint(req.params.ticketId);
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
});

// POST send new chat message
router.post('/:ticketId', async (req, res) => {
  try {
    const { senderId, senderName, senderRole, text } = req.body;
    const { ticketId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty.' });
    }

    const newMsg = await createMessage({
      complaintId: ticketId,
      senderId: senderId || 'anonymous',
      senderName: senderName || 'User',
      senderRole: senderRole || 'student',
      text: text.trim()
    });

    res.status(201).json({
      success: true,
      message: newMsg
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

module.exports = router;
