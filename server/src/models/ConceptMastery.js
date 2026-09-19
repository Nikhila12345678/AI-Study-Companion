import mongoose from 'mongoose';

const conceptMasterySchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    conceptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Concept', required: true, index: true },
    conceptName: { type: String, required: true },
    score: { type: Number, default: 0.3, min: 0, max: 1 }, // estimate, not a claim of precision
    evidenceCount: { type: Number, default: 0 },
    history: [
      {
        score: Number,
        delta: Number,
        reason: String, // 'quiz_mcq' | 'quiz_open_ended' | 'repeated_mistake_decay'
        at: { type: Date, default: Date.now }
      }
    ],
    consecutiveMistakes: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

conceptMasterySchema.index({ projectId: 1, conceptId: 1, userId: 1 }, { unique: true });

export default mongoose.model('ConceptMastery', conceptMasterySchema);
