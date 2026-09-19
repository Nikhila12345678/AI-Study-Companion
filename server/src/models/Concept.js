import mongoose from 'mongoose';

const conceptSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    importance: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    sourceMaterialIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }],
    sourceChunkIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeChunk' }],
    sourcePages: [{ materialName: String, page: Number }]
  },
  { timestamps: true }
);

conceptSchema.index({ projectId: 1, normalizedName: 1 }, { unique: true });

export default mongoose.model('Concept', conceptSchema);
