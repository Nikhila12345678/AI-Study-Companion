import mongoose from 'mongoose';

// Rule-based / curated-case evaluation results, so AI quality is measurable
// rather than assumed. See docs/evaluation.md for the approach and cases.
const aiEvaluationSchema = new mongoose.Schema(
  {
    suite: { type: String, enum: ['tutor_groundedness', 'unsupported_handling', 'mcq_validity', 'recommendation_relevance'], required: true },
    caseName: { type: String, required: true },
    passed: { type: Boolean, required: true },
    details: { type: String, default: '' },
    runAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('AIEvaluation', aiEvaluationSchema);
