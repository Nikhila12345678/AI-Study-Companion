import mongoose from 'mongoose';

// AI treated as an engineering system: every model call is logged for
// observability (latency, tokens, cost, success/failure).
const aiUsageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
    feature: {
      type: String,
      enum: ['tutor', 'concept_extraction', 'mcq_generation', 'open_ended_grading', 'recommendation', 'embedding', 'evaluation'],
      required: true,
      index: true
    },
    model: { type: String, required: true },
    latencyMs: { type: Number, required: true },
    inputTokensEst: { type: Number, default: 0 },
    outputTokensEst: { type: Number, default: 0 },
    estimatedCostUsd: { type: Number, default: 0 },
    success: { type: Boolean, required: true },
    errorMessage: { type: String, default: null },
    retrievalChunkCount: { type: Number, default: null }
  },
  { timestamps: true }
);

aiUsageSchema.index({ createdAt: -1 });

export default mongoose.model('AIUsage', aiUsageSchema);
