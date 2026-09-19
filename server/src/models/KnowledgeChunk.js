import mongoose from 'mongoose';

const knowledgeChunkSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true, index: true },
    materialName: { type: String, required: true },
    pageNumber: { type: Number, required: true },
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    tokenEstimate: { type: Number, default: 0 }
  },
  { timestamps: true }
);

knowledgeChunkSchema.index({ projectId: 1, materialId: 1, chunkIndex: 1 });

export default mongoose.model('KnowledgeChunk', knowledgeChunkSchema);
