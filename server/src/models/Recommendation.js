import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    reason: { type: String, required: true },
    conceptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Concept', default: null },
    conceptName: { type: String, default: null },
    sourceMaterialName: { type: String, default: null },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    actionType: { type: String, enum: ['review_material', 'take_quiz', 'ask_tutor'], default: 'take_quiz' },
    status: { type: String, enum: ['active', 'dismissed', 'completed'], default: 'active' }
  },
  { timestamps: true }
);

recommendationSchema.index({ projectId: 1, status: 1, createdAt: -1 });

export default mongoose.model('Recommendation', recommendationSchema);
