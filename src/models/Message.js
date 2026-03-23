import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  chat_id: String,
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['text', 'audio'], default: 'text' },
  duration: Number,
  deleted: { type: Boolean, default: false }
}, { timestamps: true });

messageSchema.index({ chat_id: 1, timestamp: -1 });

export default mongoose.model('Message', messageSchema);
