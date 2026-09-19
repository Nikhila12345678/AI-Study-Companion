import mongoose from 'mongoose';

const citationSchema = new mongoose.Schema(
  {
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
    materialName: String,
    page: Number,
    chunkId: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeChunk' },
    excerpt: String
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    grounded: { type: Boolean, default: null }, // null = n/a (user msg), true/false for assistant msgs
    citations: { type: [citationSchema], default: [] },
    suggestedFollowUps: { type: [String], default: [] }
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);
