import mongoose from 'mongoose';

// A rollup produced when a quiz completes — the durable record consumed by
// mastery/growth/recommendation services and by analytics.
const assessmentSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    conceptResults: [
      {
        conceptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Concept' },
        conceptName: String,
        correctCount: Number,
        totalCount: Number,
        avgScore: Number // 0-1, normalized across mcq(0/1) and open-ended(0-1)
      }
    ],
    overallScore: { type: Number, required: true } // 0-1
  },
  { timestamps: true }
);

export default mongoose.model('Assessment', assessmentSchema);
