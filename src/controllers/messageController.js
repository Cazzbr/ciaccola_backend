import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, before } = req.query;
    
    const query = {
      chat_id: chatId,
      $or: [{ sender_id: req.user._id }, { recipient_id: req.user._id }],
      deleted: { $ne: true }
    };
    if (before) query.timestamp = { $lt: new Date(before) };

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('sender_id recipient_id', 'username role')
      .lean();

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { type = 'text', recipient_username, duration } = req.body;

    const recipient = await User.findOne({ username: recipient_username });
    if (!recipient) return res.status(404).json({ error: 'User not found' });

    // Check contact status
    const contact = req.user.contacts.find(c => c.contact_username === recipient_username);
    if (!contact || contact.status !== 'accepted') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const message = new Message({
      id: new mongoose.Types.ObjectId().toString(),
      chat_id: chatId,
      sender_id: req.user._id,
      recipient_id: recipient._id,
      type,
      duration: type === 'audio' ? duration : undefined
    });
    await message.save();

    const io = req.app.get('io');
    io.to(chatId).emit('new-message-metadata', {
      sender: { username: req.user.username },
      type,
      timestamp: message.timestamp,
      id: message.id
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { chatId, id } = req.params;

    const message = await Message.findOne({ id, chat_id: chatId, deleted: { $ne: true } });
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const isSender = message.sender_id.equals(req.user._id);
    const isRecipient = message.recipient_id.equals(req.user._id);
    if (!isSender && !isRecipient) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    message.deleted = true;
    await message.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
};
