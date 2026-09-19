import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    conceptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Concept', required: true },
    conceptName: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'open_ended'], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    prompt: { type: String, required: true },
    options: { type: [String], default: [] }, // mcq only
    correctAnswer: { type: String, default: '' }, // mcq only
    explanation: { type: String, default: '' },
    sourceChunkIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeChunk' }],
    userAnswer: { type: String, default: null },
    isCorrect: { type: Boolean, default: null },
    evaluation: {
      score: { type: Number, default: null }, // 0-1 for open-ended
      understood: { type: [String], default: [] },
      missing: { type: [String], default: [] },
      feedback: { type: String, default: '' }
    },
    answeredAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);
