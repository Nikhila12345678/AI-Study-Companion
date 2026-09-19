import mongoose from 'mongoose';

// A condensed, continuously-updated summary per project — NOT a transcript.
// This is what "persistent but relevant" context means: small, current, and
// composed into AI prompts instead of replaying full history.
const learningContextSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    goal: { type: String, default: '' },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    repeatedMistakeConcepts: { type: [String], default: [] },
    recentTutorTopics: { type: [String], default: [] },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('LearningContext', learningContextSchema);
