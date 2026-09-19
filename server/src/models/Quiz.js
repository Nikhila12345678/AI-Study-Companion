import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    selectedConceptId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Concept',
     default: null
    },
    currentIndex: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);
