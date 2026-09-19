import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New conversation' },
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('Conversation', conversationSchema);
