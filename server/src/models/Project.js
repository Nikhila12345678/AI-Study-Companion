import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    spaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    learningGoal: { type: String, default: '' }
  },
  { timestamps: true }
);

projectSchema.index({ spaceId: 1, createdAt: -1 });
projectSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Project', projectSchema);
