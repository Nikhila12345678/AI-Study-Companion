import mongoose from 'mongoose';

const EVENT_TYPES = [
  'PROJECT_CREATED', 'MATERIAL_UPLOADED', 'MATERIAL_PROCESSING_STARTED',
  'MATERIAL_PROCESSING_COMPLETED', 'MATERIAL_PROCESSING_FAILED',
  'TUTOR_INTERACTION', 'QUIZ_STARTED', 'QUESTION_ANSWERED', 'QUIZ_COMPLETED',
  'ASSESSMENT_COMPLETED', 'MASTERY_UPDATED', 'RECOMMENDATION_GENERATED',
  'PROJECT_ACTIVITY', 'REPEATED_MISTAKE_DETECTED'
];

const learningEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    spaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
    type: { type: String, enum: EVENT_TYPES, required: true, index: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    idempotencyKey: { type: String, default: null }
  },
  { timestamps: true }
);

learningEventSchema.index({ projectId: 1, createdAt: -1 });
learningEventSchema.index({ userId: 1, createdAt: -1 });
learningEventSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

export const EVENT_TYPES_LIST = EVENT_TYPES;
export default mongoose.model('LearningEvent', learningEventSchema);
