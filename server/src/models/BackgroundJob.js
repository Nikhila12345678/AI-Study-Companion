import mongoose from 'mongoose';

const backgroundJobSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['MATERIAL_PROCESSING', 'LEARNING_WORKFLOW'], required: true, index: true },
    status: { type: String, enum: ['queued', 'processing', 'completed', 'failed'], default: 'queued', index: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    idempotencyKey: { type: String, required: true, unique: true },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    error: { type: String, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

backgroundJobSchema.index({ status: 1, createdAt: 1 });

export default mongoose.model('BackgroundJob', backgroundJobSchema);
